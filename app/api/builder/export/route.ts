import { consumeRateLimit } from "@/app/lib/rate-limit";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { projectStore } from "@/app/lib/builder-store";
import { getProjectDatabase } from "@/db/project-database";
import { validProjectId } from "@/app/lib/builder-http";
import { PRIVATE_HEADERS } from "@/app/lib/hosting-policy";
export async function GET(request:Request) {
 const user=await getChatGPTUser();if(!user?.subject)return Response.json({error:{code:"AUTHENTICATION_REQUIRED"}},{status:401,headers:PRIVATE_HEADERS});
 const id=new URL(request.url).searchParams.get("id")??"";if(!validProjectId(id))return new Response(null,{status:404,headers:PRIVATE_HEADERS});
 try{const rate=await consumeRateLimit(request,"builder:export",30,60);if(!rate.allowed)return new Response(null,{status:rate.reason==="RATE_LIMITED"?429:503,headers:PRIVATE_HEADERS});const backup=await projectStore(await getProjectDatabase()).exportProject(id,user.subject);return Response.json(backup,{headers:{...PRIVATE_HEADERS,"Content-Disposition":`attachment; filename="${id}-backup.json"`}});}catch(error){return Response.json({error:{code:"EXPORT_UNAVAILABLE"}},{status:error instanceof Error&&error.message==="NOT_FOUND"?404:503,headers:PRIVATE_HEADERS});}
}

import { getChatGPTUser } from "@/app/chatgpt-auth";
import { projectStore } from "@/app/lib/builder-store";
import { getProjectDatabase } from "@/db/project-database";
import { sameOriginMutation, PRIVATE_HEADERS } from "@/app/lib/hosting-policy";
import { consumeRateLimit } from "@/app/lib/rate-limit";
export async function POST(request:Request) {
 const user=await getChatGPTUser();if(!user?.subject)return Response.json({error:{code:"AUTHENTICATION_REQUIRED"}},{status:401,headers:PRIVATE_HEADERS});
 if(!sameOriginMutation(request))return new Response(null,{status:403,headers:PRIVATE_HEADERS});
 try{
 const rate=await consumeRateLimit(request,"builder:restore",5,60);if(!rate.allowed)return new Response(null,{status:429,headers:PRIVATE_HEADERS});
 if(!request.headers.get("content-type")?.includes("application/json"))return new Response(null,{status:415,headers:PRIVATE_HEADERS});
 const reader=request.body?.getReader();if(!reader)return new Response(null,{status:400,headers:PRIVATE_HEADERS});let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000){await reader.cancel();return new Response(null,{status:413,headers:PRIVATE_HEADERS});}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const project=await projectStore(await getProjectDatabase()).restoreProject(JSON.parse(new TextDecoder().decode(bytes)),user.subject);
 return Response.json({url:`/project/${project.id}`},{status:201,headers:PRIVATE_HEADERS});
 }catch{return Response.json({error:{code:"RESTORE_UNAVAILABLE",message:"Restore was not confirmed. Check saved projects before retrying; a partial copy may exist."}},{status:503,headers:PRIVATE_HEADERS});}
}

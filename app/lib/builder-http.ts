import { MAX_BUILDER_PROJECT_BYTES, validateDeviceProject, type projectStore } from "./builder-store";
import { sameOriginMutation, PRIVATE_HEADERS } from "./hosting-policy";
type Store = ReturnType<typeof projectStore>;
export const validProjectId = (id:string) => /^sd-[a-z0-9-]{6,80}$/i.test(id);
const reply = (value:unknown,status=200)=>Response.json(value,{status,headers:PRIVATE_HEADERS});
export async function builderRequest(request:Request, subject:string|null, store:()=>Promise<Store>, id?:string):Promise<Response> {
  if (!subject) return reply({error:{code:"AUTHENTICATION_REQUIRED",message:"Sign in to access saved projects."}},401);
  if (id && !validProjectId(id)) return reply({error:{code:"NOT_FOUND",message:"Project not found."}},404);
  if (!["GET","POST","PUT"].includes(request.method)) return reply({error:{code:"METHOD_NOT_ALLOWED"}},405);
  if (request.method!=="GET" && !sameOriginMutation(request)) return reply({error:{code:"ORIGIN_REJECTED"}},403);
  try {
    const storage = await store();
    if (request.method==="GET") {
      if (!id) return reply({projects:await storage.list(subject)});
      const project=await storage.read(id,subject);
      return project ? reply({project}) : reply({error:{code:"NOT_FOUND",message:"Project not found."}},404);
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return reply({error:{code:"CONTENT_TYPE"}},415);
    const reader=request.body?.getReader(); const chunks:Uint8Array[]=[]; let bytes=0;
    if (!reader) throw new Error("INVALID_PROJECT");
    while(true) { const {done,value}=await reader.read(); if(done) break; bytes+=value.byteLength; if(bytes>MAX_BUILDER_PROJECT_BYTES) { await reader.cancel(); return reply({error:{code:"PROJECT_TOO_LARGE"}},413); } chunks.push(value); }
    const raw=new Uint8Array(bytes); let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.length;}
    const project=validateDeviceProject(JSON.parse(new TextDecoder().decode(raw)));
    if (id && project.id !== id) return reply({error:{code:"PROJECT_ID_MISMATCH"}},400);
    const saved=await storage.save(project,subject,request.method==="PUT");
    return reply({project:saved,url:`/project/${saved.id}`},request.method==="POST"?201:200);
  } catch(error) {
    const code=error instanceof Error?error.message:"STORAGE_UNAVAILABLE";
    if(code==="RATE_LIMITED")return reply({error:{code,message:"Please wait before retrying."}},429);
    if(code==="NOT_FOUND")return reply({error:{code,message:"Project not found."}},404);
    if(code==="REVISION_CONFLICT" || code.includes("UNIQUE constraint"))return reply({error:{code:"REVISION_CONFLICT",message:"This revision changed or is stale. Reopen the saved project before editing."}},409);
    if(code.startsWith("INVALID_") || error instanceof SyntaxError)return reply({error:{code:"INVALID_PROJECT",message:"Invalid project."}},400);
    // No SQL/error payload is returned to clients or logged with project data.
    console.warn("builder_storage_unavailable");
    return reply({error:{code:"STORAGE_UNAVAILABLE",message:"Save was not confirmed. Keep your draft or export it, then retry."}},503);
  }
}

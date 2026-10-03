import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProjectDatabase } from "@/db/project-database";
import { projectStore } from "./builder-store";
import { builderRequest } from "./builder-http";
import { consumeRateLimit } from "./rate-limit";
import { PRIVATE_HEADERS } from "./hosting-policy";
export async function handleBuilderRequest(request:Request,id?:string) {
  const user=await getChatGPTUser();
  return builderRequest(request,user?.subject??null,async()=>{
    const rate=await consumeRateLimit(request,"builder:projects",120,60);
    if(!rate.allowed)throw new Error(rate.reason);
    return projectStore(await getProjectDatabase());
  },id);
}
export { PRIVATE_HEADERS };

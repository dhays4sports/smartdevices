import {parseMetric,type MetricEvent} from "./business-metrics";
import { PRIVATE_HEADERS,sameOriginMutation } from "./hosting-policy";
export async function metricsRequest(request:Request, write:(event:MetricEvent)=>Promise<void>) {
 const response=(status:number)=>new Response(null,{status,headers:PRIVATE_HEADERS});
 if(!sameOriginMutation(request))return response(403);
 if(request.headers.get("content-type")?.split(";")[0]!=="application/json")return response(415);
 // Bound streaming bodies even without Content-Length.
 const reader=request.body?.getReader();if(!reader)return response(400);
 let text="";const decoder=new TextDecoder();let bytes=0;
 while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>128){await reader.cancel();return response(413);}text+=decoder.decode(part.value,{stream:true});}
 let event;try{event=parseMetric(JSON.parse(text+decoder.decode()));}catch{return response(400);}
 if(!event)return response(400);
 try {
  await write(event);
  return response(204);
 }catch(error){return response(error instanceof Error && error.message==="RATE_LIMITED"?429:503);}
}

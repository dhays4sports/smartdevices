import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateProtectionRequest, validateChecklist, officialProtectionUrl, callProtectionBridge, type ProtectionChecklist } from '../app/lib/protection-bridge';
const token='a'.repeat(43);
function fixture():ProtectionChecklist { const today=new Date().toISOString().slice(0,10);return {bridgeVersion:2,activeTaskId:'fire',expiresAt:new Date(Date.now()+3600000).toISOString(),policy:{carrier:'Farmers',product:'Home'},tasks:[{id:'fire',label:'Fire monitoring',capability:'professionally-monitored-fire',jurisdiction:'CA',kind:'recommended',dueDate:'',current:true,canUpdate:true,version:0,progress:null,recommendation:{id:'ring-fire',version:1,provider:'ring',title:'Ring fire detection and monitoring',url:'https://ring.com/carbon-monoxide-smoke-monitoring',monitoringUrl:'https://ring.com/carbon-monoxide-smoke-monitoring',setup:'Confirm compatible equipment and activate monitoring.',documentation:'Ask about a monitoring certificate.',costNote:'Confirm current charges.',checkedAt:today,reviewDue:today}}]}; }
test('v2 requests bind updates to one protection, explicit consent and bounded literal state',()=>{
 const v={bridgeVersion:2,operation:'save',token,taskId:'fire',state:'monitoring-active-self-reported',deviceId:'',consent:true,expectedVersion:0,requestId:crypto.randomUUID(),privateNote:'never sent'};
 assert(!('privateNote' in validateProtectionRequest(v)));
 for(const change of [{taskId:'gas'},{state:'carrier-approved'},{consent:false},{expectedVersion:-1}])assert.throws(()=>validateProtectionRequest({...v,...change}));
});
test('provider URLs reject lookalike domains, credentials and local targets',()=>{
 for(const url of ['https://ring.com.evil.test/','https://ring.com@evil.test/','http://ring.com/','https://127.0.0.1/','https://ring.com:8443/'])assert.equal(officialProtectionUrl('ring',url),false);
 assert.equal(officialProtectionUrl('ring','https://ring.com/professional-monitoring'),true);
});
test('read validation enforces one recommendation per category and stops stale positive links',()=>{
 const good=fixture();assert.equal(validateChecklist(good).tasks[0].current,true);
 const stale=fixture();stale.tasks[0].recommendation!.reviewDue='2020-01-01';assert.equal(validateChecklist(stale).tasks[0].recommendation!.url,'');
 const duplicate=fixture();duplicate.tasks.push(duplicate.tasks[0]);assert.throws(()=>validateChecklist(duplicate));
 const bad=fixture();bad.tasks[0].recommendation!.url='https://evil.test';assert.throws(()=>validateChecklist(bad));
});
test('unconfigured v2 connection makes no outbound call and response size stays bounded',async()=>{
 const v=validateProtectionRequest({bridgeVersion:2,operation:'read',token});let called=false;
 await assert.rejects(()=>callProtectionBridge(v,{},async()=>{called=true;return Response.json({});}),/CONNECTION_NOT_CONFIGURED/);assert.equal(called,false);
 const env={COVERAGEFIT_DEVICE_BRIDGE_ENABLED:'true',COVERAGEFIT_ORIGIN:'https://coveragefit.test',SMARTDEVICES_BRIDGE_SECRET:'synthetic-test-secret-000000000000000'};
 await assert.rejects(()=>callProtectionBridge(v,env,async()=>new Response('x'.repeat(33000))),/INVALID_RESPONSE/);
});
test('save response cannot substitute another category or report carrier approval',async()=>{
 const v=validateProtectionRequest({bridgeVersion:2,operation:'save',token,taskId:'fire',state:'agent-help',deviceId:'',consent:true,expectedVersion:0,requestId:crypto.randomUUID()});
 const env={COVERAGEFIT_DEVICE_BRIDGE_ENABLED:'true',COVERAGEFIT_ORIGIN:'https://coveragefit.test',SMARTDEVICES_BRIDGE_SECRET:'synthetic-test-secret-000000000000000'};
 await assert.rejects(()=>callProtectionBridge(v,env,async()=>Response.json({ok:true,bridgeVersion:2,saved:true,taskId:'burglary',version:1,progress:{state:'agent-help',deviceId:''}})),/INVALID_RESPONSE/);
});
test('checklist keeps the home optional, category drafts separate and the v1 route available',()=>{
 const ui=readFileSync(new URL('../app/components/CoverageFitProtectionChecklist.tsx',import.meta.url),'utf8');
 for(const marker of ['<ol','aria-pressed','pending.current[id]','setDrafts(old=>','Save update to my insurance review','Explore these steps around a home','same provider for burglary and fire'])assert(ui.includes(marker));
 const entry=readFileSync(new URL('../app/components/CoverageFitTaskEntry.tsx',import.meta.url),'utf8');assert(entry.includes("p.get('v') !== '2'"));assert(entry.includes('CoverageFitDeviceTask'));assert(entry.includes('CoverageFitProtectionChecklist'));
});

import assert from 'node:assert/strict';
import test from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {parseMetric,metricIncrementSql,metricEvents} from '../app/lib/business-metrics';
import {metricsRequest} from '../app/lib/metrics-http';
import {hostingBoundary} from '../app/lib/hosting-policy';
import {compatibilityDimensions} from '../app/lib/compatibility-dimensions';
import {devices} from '../app/lib/data';
const request=(body:unknown,origin='https://test.invalid')=>new Request('https://test.invalid/api/metrics',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
test('metrics reject all unknown fields, identifiers, free text and invalid events',()=>{
 for(const event of metricEvents)assert.equal(parseMetric({event}),event);
 for(const value of [null,[],{event:'purchase'},{event:'discover_search',query:'address'},{event:'plan_save_hosted',subject:'a'}, {event:'outbound_product_click',url:'https://example.org'}])assert.equal(parseMetric(value),null);
});
test('counter persists only daily synthetic aggregates and increments atomically',()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync('drizzle/0013_business_metric_daily.sql','utf8'));
 for(let i=0;i<5;i++)db.prepare(metricIncrementSql).run('2026-10-03','builder_start');
 const row=db.prepare('SELECT * FROM business_metric_daily').get();assert.deepEqual({...row},{day:'2026-10-03',cohort:'synthetic',event:'builder_start',count:5});db.close();
});
test('metrics HTTP rejects CSRF, invalid payload, oversized body and fails truthfully on unavailable DB',async()=>{
 let writes=0;const write=async()=>{writes++;};
 assert.equal((await metricsRequest(request({event:'builder_start'}),write)).status,204);
 assert.equal((await metricsRequest(request({event:'builder_start'},'https://evil.invalid'),write)).status,403);
 assert.equal((await metricsRequest(request({event:'builder_start',email:'secret'}),write)).status,400);
 assert.equal((await metricsRequest(request({event:'x'.repeat(200)}),write)).status,413);
 const unavailable=await metricsRequest(request({event:'builder_start'}),async()=>{throw Error('DB unavailable');});assert.equal(unavailable.status,503);assert.match(unavailable.headers.get('cache-control')!,/no-store/);assert.equal(writes,1);
 assert.equal((await metricsRequest(request({event:'builder_start'}),async()=>{throw Error('RATE_LIMITED');})).status,429);
});
test('metrics endpoint does not open device operation, registration or commerce',()=>{
 assert.equal(hostingBoundary(request({event:'builder_start'})),null);
 for(const path of ['/api/builder/execute','/api/devices/register','/api/market/checkout'])assert.equal(hostingBoundary(new Request('https://test.invalid'+path,{method:'POST',headers:{origin:'https://test.invalid'}}))?.status,403);
 assert.equal(hostingBoundary(new Request('https://test.invalid/api/metrics'))?.status,403);
});
test('compatibility remains multidimensional and never asserts property fit',()=>{
 for(const device of devices){const dimensions=compatibilityDimensions(device);assert.equal(dimensions.length,7);assert.equal(dimensions.find(x=>x.dimension==='Platform / ecosystem')?.status,'Unknown');assert.match(dimensions.find(x=>x.dimension==='Installation')!.status,/unverified/);}
});

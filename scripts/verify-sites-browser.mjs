// Automated local production-build regression; never claims hosted SIWC authentication.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const { chromium }=await import(process.env.SD_PLAYWRIGHT_MODULE??'playwright');
const origin='http://127.0.0.1:43132';
const server=spawn('./node_modules/.bin/vinext',['start','--port','43132','--hostname','127.0.0.1'],{stdio:'ignore',env:{...process.env,SMARTDEVICES_DEMO_MODE:'false',WRANGLER_LOG_PATH:'.wrangler/browser-test.log'}});
let browser;
const results=[];
try {
 let ready=false;for(let i=0;i<100;i++){try{await fetch(origin);ready=true;break;}catch{}await new Promise(r=>setTimeout(r,200));}assert.ok(ready,'local production test runtime starts');
 browser=await chromium.launch({headless:true,executablePath:process.env.SD_CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--single-process']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:900});
  for(const route of ['/devices','/devices/moen-flo-smart-water-shutoff','/compare','/connect','/build','/operate','/farmers']) {
   const response=await page.goto(origin+route);assert.equal(response.status(),200,route);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${route}: overflow at ${width}`);assert.ok(await page.locator('h1').count());
  }
  await page.goto(origin+'/devices');await page.getByLabel('Capability',{exact:true}).selectOption('shutoff.water');assert.match(await page.locator('.library-status').innerText(),/2 reviewed devices/);
  if(width===375){await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Create',exact:true}).click();}else await page.goto(origin+'/build');
  await page.waitForURL('**/build');await page.getByRole('link',{name:'Sign in with ChatGPT to save projects'}).waitFor();
  await page.locator('#builder-idea').fill('SYNTHETIC TEST: Monitor freezer temperature and alert me when too warm');
  await page.getByRole('button',{name:/Research \+ plan this device/}).click();await page.getByRole('button',{name:/Create the build workspace/}).click();await page.waitForSelector('#builder-workspace');
  await page.getByRole('button',{name:'Save online',exact:true}).click();await page.getByRole('status').filter({hasText:/Sign in with ChatGPT/}).waitFor();
  await page.reload();assert.equal(await page.locator('#builder-workspace').count(),0);
  await page.goto(origin+'/connect');await page.getByLabel('Manufacturer',{exact:true}).fill('Synthetic Devices');await page.getByLabel('Model',{exact:true}).fill('Test temperature sensor');await page.getByRole('checkbox').first().check();await page.getByRole('button',{name:'Create sample record'}).click();await page.getByRole('status').filter({hasText:/Nothing was saved or connected/}).waitFor();await page.reload();assert.equal(await page.getByText('Synthetic Devices Test temperature sensor',{exact:true}).count(),0);
  await page.goto(origin+'/farmers');assert.match(await page.locator('body').innerText(),/California/i);const builderLink=page.locator('a[href="/build?source=farmers"]').first();await builderLink.click();await page.waitForURL('**/build?source=farmers');assert.match(await page.locator('body').innerText(),/custom build does not replace or satisfy/);
  results.push({width,routes:7,interactions:['capability filter','builder intake/workspace','signed-out save fails truthfully','real reload','Connect sample/reset','farmers Builder handoff']});
 }
 // Business continuation: real product interaction; intercepted transport checks payload, not DB persistence.
 const captured=[];await page.route('**/api/metrics',async route=>{captured.push(route.request().postDataJSON());await route.fulfill({status:204});});
 for(const width of [375,768,1440]) {
  await page.setViewportSize({width,height:900});await page.goto(origin+'/');
  await page.getByRole('checkbox',{name:/Help test SmartDevices/}).uncheck();
  await page.getByRole('link',{name:'Compare water-protection options',exact:true}).click();
  await page.getByRole('button',{name:'Add to comparison plan'}).first().waitFor();
  await page.waitForTimeout(100);const before=captured.length;await page.getByRole('button',{name:'Add to comparison plan'}).first().click();await page.waitForTimeout(100);assert.equal(captured.length,before,'no metrics before opt-in');
  await page.getByRole('checkbox',{name:/Help test SmartDevices/}).check();
  await page.getByRole('button',{name:'Save on this device & open',exact:true}).click();await page.waitForURL('**/plans/**');
  await page.reload();await page.getByRole('heading',{name:'Your next step, made clearer.',exact:true}).waitFor();
  await page.getByLabel('Which option are you considering?').selectOption({index:1});
  await page.getByRole('button',{name:'Download my next-step summary'}).click();
  // Count intent without navigating to external provider or making a purchase.
  await page.locator('a').filter({hasText:'Check manufacturer details'}).first().evaluate(el=>el.addEventListener('click',e=>e.preventDefault()));
  await page.locator('a').filter({hasText:'Check manufacturer details'}).first().click();
  await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 }
 assert.ok(captured.some(x=>x.event==='plan_save_local'));assert.ok(captured.some(x=>x.event==='plan_reopen_local'));assert.ok(captured.some(x=>x.event==='outbound_product_click'));
 assert.ok(captured.every(x=>Object.keys(x).join(',')==='event'));
 const beforePrivacy=captured.length;await page.evaluate(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true,configurable:true}));
 await page.getByRole('button',{name:'Download my next-step summary'}).click();await page.waitForTimeout(100);assert.equal(captured.length,beforePrivacy,'GPC suppresses telemetry');
 console.log('PASS business flow at 375/768/1440: opt-in boundary, local save/reload/reopen, export, manufacturer intent, GPC; payload contains only event. Transport intercepted; not hosted DB proof.');
 const denied=await page.request.get(origin+'/api/builder/projects');assert.equal(denied.status(),401);assert.match(denied.headers()['cache-control'],/private, no-store/);
 assert.deepEqual(errors,[]);fs.mkdirSync('outputs/qa',{recursive:true});fs.writeFileSync('outputs/qa/sites-local-browser.json',JSON.stringify({environment:'local production build; NOT hosted authentication',results,pageErrors:errors},null,2));
 console.log('PASS 21 route/viewport checks; 18 interactions at 375/768/1440; signed-out private API denied; 0 page errors. Hosted sign-in/persistence not tested.');
} finally {if(browser)await browser.close();server.kill('SIGTERM');}

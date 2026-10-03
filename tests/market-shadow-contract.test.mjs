import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('shadow pilot is post-qualification and scan logic remains market-free', () => {
  const scan = read('app/lib/scan.ts');
  const explorer = read('app/components/ProtectionExplorer.tsx');
  assert.doesNotMatch(scan, /MarketAdapter|CommercialIntent|submitWaterShutoffShadow|sponsored/i);
  assert.match(explorer, /submitWaterShutoffShadow\(result/);
  assert.match(explorer, /setScanResult\(result\)/);
});

test('shadow route is disabled by default and private signing remains server-side', () => {
  const route = read('app/api/market/shadow/route.ts');
  const env = read('.env.example');
  const explorer = read('app/components/ProtectionExplorer.tsx');
  assert.match(env, /SMARTDEVICES_MARKET_SHADOW_ENABLED=false/);
  assert.match(route, /MARKET_AD_PRIVATE_KEY_PEM_B64/);
  assert.match(route, /runtime = "nodejs"/);
  assert.doesNotMatch(explorer, /MARKET_AD_PRIVATE_KEY|x-market-signature|x-market-key-id/);
});

test('pilot is limited to home water automatic shutoff and no direct contact or personal sharing', () => {
  const pilot = read('app/lib/market/shadow-pilot.ts');
  const route = read('app/api/market/shadow/route.ts');
  assert.match(pilot, /scan\.domainId === "home"/);
  assert.match(pilot, /scan\.primaryConcernId === "water"/);
  assert.match(pilot, /automatic shutoff/i);
  assert.match(route, /directProviderContactAllowed/);
  assert.match(route, /personalDataSharingAllowed/);
  assert.match(route, /!intent\.commercialization\.directProviderContactAllowed/);
  assert.match(route, /!intent\.commercialization\.personalDataSharingAllowed/);
});

test('MARKET-0.7 request is signed over method path timestamp nonce and canonical body', () => {
  const runtime = read('app/lib/market/runtime07.ts');
  for (const token of ['x-market-identity-id','x-market-key-id','x-market-timestamp','x-market-nonce','x-market-signature']) assert.match(runtime, new RegExp(token));
  assert.match(runtime, /method\.toUpperCase\(\)/);
  assert.match(runtime, /sha256\(canonical\(body/);
  assert.match(runtime, /\/v1\/opportunities/);
  assert.match(runtime, /\/clear/);
});

test('shadow result is explicitly not consumer-visible and failures are non-blocking', () => {
  const route = read('app/api/market/shadow/route.ts');
  const pilot = read('app/lib/market/shadow-pilot.ts');
  assert.match(route, /visibleToConsumer: false/);
  assert.match(pilot, /Shadow-market failure must never alter or block SmartDevices recommendations/);
  assert.match(route, /shadow-error/);
});

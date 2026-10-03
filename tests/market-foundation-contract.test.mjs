import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('market foundation exists behind an adapter boundary', () => {
  const adapter = read('app/lib/market/adapter.ts');
  assert.match(adapter, /interface MarketAdapter/);
  assert.match(adapter, /class DisabledMarketAdapter/);
  assert.match(adapter, /class ShadowMarketAdapter/);
  assert.match(adapter, /class HttpMarketAdapter/);
});

test('market does not enter scan recommendation logic', () => {
  const scan = read('app/lib/scan.ts');
  assert.doesNotMatch(scan, /MarketAdapter|MarketOpportunity|CommercialIntent|ProviderOffer|sponsored/i);
});

test('commercial intent contains only bounded market fields', () => {
  const contract = read('app/lib/market/contract.ts');
  const intentBlock = contract.slice(contract.indexOf('export type CommercialIntentEnvelope'), contract.indexOf('export type ProviderRelationship'));
  assert.doesNotMatch(intentBlock, /name|email|phone|address|policy|claim|rawAnswers/i);
  assert.match(intentBlock, /eligibleDeviceIds/);
  assert.match(intentBlock, /requiredCapabilities/);
});

test('sponsorship disclosure preserves qualification independence', () => {
  const disclosure = read('app/lib/market/disclosure.ts');
  assert.match(disclosure, /qualificationInfluencedByPayment:\s*false/);
  assert.match(disclosure, /Payment did not determine qualification/);
});

test('market event names are appended to the existing event vocabulary', () => {
  const experience = read('app/lib/experience.ts');
  for (const event of ['market_opportunity_created','market_shadow_cleared','sponsored_offer_available','sponsored_offer_viewed','sponsored_offer_opened','provider_selected','market_outcome_recorded']) {
    assert.match(experience, new RegExp(`"${event}"`));
  }
});

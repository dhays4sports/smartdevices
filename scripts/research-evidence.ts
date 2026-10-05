import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { checkEvidenceSource, createSeedEvidenceBundle } from '../app/lib/evidence-refresh';
import type { EvidenceSource } from '../app/lib/carrier';

// No schedule and no publication credential. A fetch is an observation, not a
// claim review. Changed/baseline results need semantic research before a batch.
const seed = createSeedEvidenceBundle();
const extras = JSON.parse(await readFile('editorial/source-registry.json', 'utf8')) as { sources: Array<{ url: string; title: string; productIds: string[]; topics: string[] }> };
const sources = new Map<string, EvidenceSource>();
for (const source of seed.sources) if (source.url) sources.set(source.url, source);
for (const device of seed.catalog) for (const source of device.sources) {
  if (!sources.has(source.url)) sources.set(source.url, {
    id: `catalog-${createHash('sha256').update(source.url).digest('hex').slice(0, 20)}`, version: 1,
    owner: device.manufacturer, domain: new URL(source.url).hostname, title: source.title, url: source.url,
    jurisdictions: ['US'], checkedDate: device.lastReviewed, reviewDueDate: device.lastReviewed,
    status: 'stale', visibility: 'public', limitations: ['Discovery source: not renewed by retrieval; field-level review required.'],
  });
}
for (const source of extras.sources) if (!sources.has(source.url)) sources.set(source.url, {
  id: `research-${createHash('sha256').update(source.url).digest('hex').slice(0, 20)}`, version: 1,
  owner: new URL(source.url).hostname, domain: new URL(source.url).hostname, title: source.title, url: source.url,
  jurisdictions: ['US'], checkedDate: '2026-10-05', reviewDueDate: '2026-10-05', status: 'stale', visibility: 'public',
  limitations: ['Research-only source; does not substitute for approved evidence.'],
});
const previous = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')) : { checks: [] };
const now = new Date(), checks = [];
for (const source of sources.values()) {
  const prior = previous.checks.find((c: { sourceId: string }) => c.sourceId === source.id);
  checks.push(await checkEvidenceSource(source, prior?.observedHash ?? null, fetch, now));
}
const run = { schemaVersion: 1, id: `research-${now.toISOString().replace(/[:.]/g, '-')}`, baseSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), checkedAt: now.toISOString(), checks,
  products: seed.catalog.map(d => ({ productId: d.id, checks: checks.filter(c => d.sources.some(s => s.url === c.sourceUrl) || extras.sources.some(s => s.url === c.sourceUrl && s.productIds.includes(d.id))) })),
  publication: 'NONE', renewedEvidence: 0,
};
await mkdir('editorial/research', { recursive: true });
await writeFile(`editorial/research/${run.id}.json`, JSON.stringify(run, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ id: run.id, products: run.products.length, sources: checks.length, changed: checks.filter(c => c.outcome === 'changed').length, unavailable: checks.filter(c => ['invalid','unavailable'].includes(c.outcome)).length, published: false }));

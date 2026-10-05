import { readFile } from 'node:fs/promises';
import { validateBatch } from './lib/evidence-publication.mjs';
import { readdir } from 'node:fs/promises';

const catalog = JSON.parse(await readFile('content/catalog.json', 'utf8'));
const ids = new Set(catalog.map(d => d.id));
const document = JSON.parse(await readFile('content/editorial-observations.json', 'utf8'));
if (document.schemaVersion !== 1 || !Array.isArray(document.observations)) throw new Error('OBSERVATION_SCHEMA_INVALID');
const seen = new Set();
for (const o of document.observations) {
  if (seen.has(o.id) || !ids.has(o.productId) || !o.title) throw new Error('OBSERVATION_ID_INVALID');
  seen.add(o.id);
  if (!['active','conflict','unresolved','suppressed'].includes(o.status)) throw new Error('OBSERVATION_STATUS_INVALID');
  if (!['retail','farmers-bundle','subscription','accessory-safety'].includes(o.context)) throw new Error('OBSERVATION_CONTEXT_INVALID');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.observedOn) || !/^\d{4}-\d{2}-\d{2}$/.test(o.reviewDueDate) || o.observedOn > o.reviewDueDate) throw new Error('OBSERVATION_DATES_INVALID');
  if (o.status === 'active' ? typeof o.value !== 'string' || !o.value : o.value !== null) throw new Error('OBSERVATION_TRUTH_INVALID');
  if (o.status === 'conflict' && (!Array.isArray(o.alternatives) || o.alternatives.length < 2)) throw new Error('CONFLICT_ALTERNATIVES_REQUIRED');
  if (!Array.isArray(o.limitations) || !Array.isArray(o.sources) || !o.sources.length) throw new Error('OBSERVATION_PROVENANCE_REQUIRED');
  for (const source of o.sources) { const u = new URL(source.url); if (u.protocol !== 'https:' || u.username || u.password) throw new Error('OBSERVATION_URL_INVALID'); }
}
let batches = 0;
for (const name of await readdir('editorial/batches').catch(e => { if (e.code === 'ENOENT') return []; throw e; })) {
  if (!name.endsWith('.json')) continue;
  validateBatch(JSON.parse(await readFile(`editorial/batches/${name}`, 'utf8'))); batches++;
}
console.log(JSON.stringify({ valid: true, observations: seen.size, batches }));

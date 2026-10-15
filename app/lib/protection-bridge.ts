import { callCoverageFitTransport, taskKinds } from './coveragefit-device';
export const protectionLabels = { water: 'Water shutoff', burglary: 'Burglary monitoring', fire: 'Fire monitoring', gas: 'Gas shutoff' } as const;
export type ProtectionId = keyof typeof protectionLabels;
export const protectionStates = { considering: 'I’m considering the recommended setup', 'existing-system': 'I already have a system — please review it', 'purchased-self-reported': 'I purchased equipment — self-reported', 'installation-help': 'I need installation help', 'installation-scheduled-self-reported': 'I scheduled installation — self-reported', 'installed-self-reported': 'I installed a system — self-reported', 'monitoring-help': 'I need help activating professional monitoring', 'monitoring-active-self-reported': 'Professional monitoring is active — self-reported', 'documentation-ready': 'I have documentation ready for review', 'agent-help': 'I need my agent to confirm the next step' } as const;
export type ProtectionState = keyof typeof protectionStates;
export type ProtectionTask = { id: ProtectionId; label: string; capability: string; jurisdiction: 'CA'; kind: keyof typeof taskKinds; dueDate: string; current: boolean; canUpdate: boolean; version: number; progress: { state: ProtectionState; deviceId: string } | null; recommendation: { id: string; version: number; provider: string; title: string; url: string; monitoringUrl: string; setup: string; documentation: string; costNote: string; checkedAt: string; reviewDue: string } | null };
export type ProtectionChecklist = { bridgeVersion: 2; activeTaskId: ProtectionId; policy: { carrier: string; product: string }; tasks: ProtectionTask[]; expiresAt: string };
const providers: Record<string, string[]> = { moen: ['moen.com','www.moen.com','shop.moen.com'], adt: ['adt.com','www.adt.com','help.adt.com'], simplisafe: ['simplisafe.com','www.simplisafe.com','support.simplisafe.com'], ring: ['ring.com','www.ring.com','support.ring.com'], 'little-firefighter': ['littlefirefighter.com','www.littlefirefighter.com'] };
export function officialProtectionUrl(provider: string, value: string) { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.port && value.length <= 600 && !!providers[provider]?.includes(u.hostname); } catch { return false; } }
export function validateProtectionRequest(v: Record<string, unknown>) {
  if (v.bridgeVersion !== 2 || typeof v.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(v.token) || !['read','save'].includes(String(v.operation))) throw Error('INVALID_REQUEST');
  const base = { bridgeVersion: 2 as const, operation: v.operation as 'read' | 'save', token: v.token }; if (v.operation === 'read') return base;
  if (!Object.hasOwn(protectionLabels,String(v.taskId)) || !Object.hasOwn(protectionStates,String(v.state)) || (String(v.state).startsWith('monitoring-') && !['burglary','fire'].includes(String(v.taskId))) || v.consent !== true || !Number.isInteger(v.expectedVersion) || Number(v.expectedVersion) < 0 || typeof v.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v.requestId) || typeof v.deviceId !== 'string' || v.deviceId.length > 80 || (v.state === 'considering' && !v.deviceId)) throw Error('INVALID_UPDATE');
  return { ...base, taskId: v.taskId as ProtectionId, state: v.state as ProtectionState, deviceId: v.deviceId, expectedVersion: Number(v.expectedVersion), requestId: v.requestId, consent: true };
}
export function validateChecklist(data: ProtectionChecklist): ProtectionChecklist {
  if (data?.bridgeVersion !== 2 || !Array.isArray(data.tasks) || !data.tasks.length || data.tasks.length > 4 || new Set(data.tasks.map(t=>t.id)).size !== data.tasks.length || !data.tasks.some(t=>t.id===data.activeTaskId) || typeof data.policy?.carrier !== 'string' || typeof data.policy?.product !== 'string') throw Error('INVALID_RESPONSE');
  const today = new Date().toISOString().slice(0,10);
  for (const t of data.tasks) {
    if (!Object.hasOwn(protectionLabels,t.id) || t.jurisdiction !== 'CA' || !Object.hasOwn(taskKinds,t.kind) || !Number.isInteger(t.version) || t.version < 0 || typeof t.current !== 'boolean' || typeof t.canUpdate !== 'boolean' || (t.progress && !Object.hasOwn(protectionStates,t.progress.state))) throw Error('INVALID_RESPONSE');
    const r = t.recommendation;
    if (r) {
      if (!['id','provider','title','url','monitoringUrl','setup','documentation','costNote','checkedAt','reviewDue'].every(key=>typeof r[key as keyof typeof r]==='string') || (t.id==='water' && (r.id!=='moen-flo-shutoff'||r.provider!=='moen')) || (t.id==='gas' && r.provider!=='little-firefighter') || (['fire','burglary'].includes(t.id) && !['adt','simplisafe','ring'].includes(r.provider))) throw Error('INVALID_RESPONSE');
      if (t.current && (!officialProtectionUrl(r.provider,r.url) || (t.id==='water' && r.url!=='https://www.moen.com/farmers') || (r.monitoringUrl&&!officialProtectionUrl(r.provider,r.monitoringUrl)))) throw Error('INVALID_RESPONSE');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt)||!/^\d{4}-\d{2}-\d{2}$/.test(r.reviewDue)||r.checkedAt>today||r.reviewDue<today) { t.current=false; r.url=''; r.monitoringUrl=''; }
    } else t.current=false;
  }
  return data;
}
export async function callProtectionBridge(value: ReturnType<typeof validateProtectionRequest>, env: Record<string,string|undefined>, fetcher: typeof fetch = fetch) {
  const result = await callCoverageFitTransport(value,env,fetcher);
  if (value.operation === 'read') return validateChecklist(result);
  if (result.bridgeVersion !== 2 || result.saved !== true || !('taskId' in value) || result.taskId !== value.taskId || !Number.isInteger(result.version) || result.version < 1 || result.progress?.state !== value.state || result.progress?.deviceId !== value.deviceId) throw Error('INVALID_RESPONSE');
  return result;
}

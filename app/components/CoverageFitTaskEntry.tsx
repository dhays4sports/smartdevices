"use client";
import { useSyncExternalStore } from 'react';
import type { Device } from '@/app/lib/data';
import { CoverageFitDeviceTask } from './CoverageFitDeviceTask';
import { CoverageFitProtectionChecklist } from './CoverageFitProtectionChecklist';
export function connectedFlowVersion(hash: string) { const p = new URLSearchParams(hash.replace(/^#/, '')); return p.has('h') && p.get('v') !== '2' ? 1 : 2; }
const subscribe = (onChange: () => void) => { window.addEventListener('hashchange', onChange); return () => window.removeEventListener('hashchange', onChange); };
export function CoverageFitTaskEntry({options,returnOrigin}:{options:Device[];returnOrigin:string}) {
  const version=useSyncExternalStore(subscribe,()=>connectedFlowVersion(location.hash),()=>2);
  return version===1?<CoverageFitDeviceTask options={options} returnOrigin={returnOrigin}/>:<CoverageFitProtectionChecklist returnOrigin={returnOrigin}/>;
}

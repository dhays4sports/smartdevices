import type { Device } from './data';
import { canonicalCapabilitiesForDevice } from './device-capabilities';
/** A sourced product statement is not proof of fit for a particular home. */
export function compatibilityDimensions(device:Device) {
 return [
  {dimension:'Protocol',statement:device.connectivity,status:'Product statement; protocol interoperability unverified'},
  {dimension:'Platform / ecosystem',statement:'No normalized platform assertion in this record.',status:'Unknown'},
  {dimension:'Capability',statement:canonicalCapabilitiesForDevice(device).map(c=>c.id).join(', ') || 'No normalized capability recorded.',status:'Catalog mapping; not physical verification'},
  {dimension:'Installation',statement:device.installation,status:'Site-specific fit unverified'},
  {dimension:'Power',statement:'Check the exact model’s installation instructions for power and outage behavior.',status:'Unknown until checked'},
  {dimension:'Account / cloud',statement:device.subscription,status:'Current terms and cloud dependencies require confirmation'},
  {dimension:'Physical environment',statement:device.limitations.join(' '),status:'Property-specific fit unverified'},
 ];
}

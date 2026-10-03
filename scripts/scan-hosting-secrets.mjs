import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
const files=new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean));
function walk(dir){if(!existsSync(dir))return;for(const entry of readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(/\.(js|html|json)$/.test(p))files.add(p);}}
walk('dist/client');
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}\b/,/\bAKIA[A-Z0-9]{16}\b/,/NEXT_PUBLIC_[A-Z_]*(?:SECRET|PRIVATE_KEY|TOKEN)\s*[:=]\s*["'][^"']{8,}["']/];
const findings=[];let checked=0;
for(const file of files){if(!/\.(?:[cm]?[jt]sx?|json|md|html|ya?ml|env|example)$/.test(file))continue;const content=readFileSync(file,'utf8');checked++;if(patterns.some(pattern=>pattern.test(content)))findings.push(file);}
console.log(JSON.stringify({checkedFiles:checked,findings,scope:'tracked/untracked source + built client output; pattern scan, not external penetration testing'}));
if(findings.length)process.exitCode=1;

"""Read-only/denied-write hosting probes. Service access never substitutes for a user.
Credential is read from hidden stdin, stays in memory, and is never logged.
"""
import json,sys,termios,urllib.request,urllib.error
from pathlib import Path
if sys.stdin.isatty():
 settings=termios.tcgetattr(sys.stdin);settings[3]&=~termios.ECHO;termios.tcsetattr(sys.stdin,termios.TCSANOW,settings)
print('Ready for private probe credential on stdin (hidden).',flush=True)
config=json.loads(sys.stdin.readline())
origin='https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
results=[]
cases=[('/api/version','GET',200,False),('/build','GET',200,False),('/devices','GET',200,False),('/farmers','GET',200,False),('/connect','GET',200,False),('/operate','GET',200,False),('/api/builder/projects','GET',401,False),('/api/builder/projects','POST',401,False),('/api/builder/projects','GET',401,True),('/api/builder/export?id=sd-synthetic-missing','GET',401,False),('/api/builder/restore','POST',401,False),('/api/builder/execute','POST',403,False),('/api/devices/register','POST',403,False),('/api/integrations/handoff','POST',403,False)]
for path,method,expected,spoof in cases:
 headers={'OAI-Sites-Authorization':'Bearer '+config['credential'],'Origin':origin,'Content-Type':'application/json'}
 if spoof:headers.update({'oai-authenticated-user-id':'synthetic-forged-principal','oai-authenticated-user-email':'synthetic-forged@example.test'})
 request=urllib.request.Request(origin+path,headers=headers,method=method,data=b'{}' if method=='POST' else None)
 try:
  try: response=opener.open(request,timeout=20)
  except urllib.error.HTTPError as error:response=error
  body=response.read();record={'path':path,'method':method,'forgedHeaders':spoof,'status':response.status,'expected':expected,'cache':response.headers.get('Cache-Control'),'robots':response.headers.get('X-Robots-Tag')}
  if path=='/api/version' and response.status==200:record['version']=json.loads(body)
  record['pass']=response.status==expected and (not config.get('salt') or config['salt'].encode() not in body)
  results.append(record)
 except Exception as error:results.append({'path':path,'method':method,'error':type(error).__name__,'pass':False})
Path('outputs/qa').mkdir(parents=True,exist_ok=True)
Path('outputs/qa/sites-hosted-http.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
sys.exit(0 if all(row['pass'] for row in results) else 1)

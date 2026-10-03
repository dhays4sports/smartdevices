import json,sys,termios,urllib.request,urllib.error
if sys.stdin.isatty():
 s=termios.tcgetattr(sys.stdin);s[3]&=~termios.ECHO;termios.tcsetattr(sys.stdin,termios.TCSANOW,s)
print('Ready for private pilot probe credential (hidden).',flush=True)
c=json.loads(sys.stdin.readline());origin='https://smartdevices-persistence-test.noisy-skunk-4108.chatgpt.site'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
for body,request_origin,expected in [({'event':'outbound_product_click'},origin,204),({'event':'outbound_product_click','account':'synthetic-rejected'},origin,400),({'event':'builder_start'},'https://invalid.example',403)]:
 req=urllib.request.Request(origin+'/api/metrics',headers={'OAI-Sites-Authorization':'Bearer '+c['credential'],'Origin':request_origin,'Content-Type':'application/json'},data=json.dumps(body).encode(),method='POST')
 try:r=opener.open(req,timeout=20)
 except urllib.error.HTTPError as e:r=e
 print(json.dumps({'test':'synthetic metric / field rejection / origin boundary','status':r.status,'expected':expected}));assert r.status==expected

from pathlib import Path
import json, html
from PIL import Image, ImageDraw
src=Path('/private/tmp/build-home-review.py').read_text()
exec(src.split("save(setup('saving')")[0])
OUT=Path('/private/tmp/home-compact-review'); OUT.mkdir(exist_ok=True); entries=[]
def actionbar(c,label='Request a case',busy=False,end=True):
    c.box((0,700,390,844),C['white']); primary(c,label,708,busy)
    if end: c.centered_control(24,778,342,44,'End availability',16,C['muted'],600)
def home(title="You’re available for\nconsultations",sub='Request a case whenever you have a moment.',time='1 h 24 min',near=False):
    c=base(title,sub,time); actionbar(c)
    if near:
        c.box((24,376,366,432),C['white']); c.text(24,378,time,40,amber,600)
        c.box((24,460,366,580),amberbg,12)
        wrap(c,'Availability ends soon. You can still request a case.',40,476,width=310,size=14,color=amber,line=22)
        c.centered_control(40,526,124,44,'+ Add time',16,amber,600)
    else: c.centered_control(250,334,116,44,'+ Add time',14,C['blue'],600)
    return c
def record(c,id,title,note): save(c,id,title,'Core',note)
c=Canvas(); c.im=Image.open('/private/tmp/home-tap-15min.png').convert('RGB'); c.d=ImageDraw.Draw(c.im)
record(c,'01-setup','Choose availability','Shared inactive layout: first arrival, expiry and manual end. Existing wheel alternative remains approved for testing; stepper shown here for continuity.')
record(setup('saving'),'02-setting','Setting availability','Same setup; busy CTA locks duplicate submission. No success popup: transition to active Home.')
record(setup('error'),'03-setup-error','Setup error','Same setup; retain selected duration. Inline error and retry.')
record(home(),'04-ready','Available','Primary request, quiet End availability, Add time alongside countdown. No third footer CTA.')
c=home('Requesting a case','We’ll open your case when it’s ready.'); actionbar(c,'Requesting…',True)
record(c,'05-requesting','Requesting a case','Busy CTA. Unknown response uses this same layout with Checking request… and a short connection notice. Reconcile original request before retry.')
c=home('No cases right now','You’re still available. Check again shortly.'); actionbar(c,'Check again')
record(c,'06-empty','No cases available','Same active layout. Explicit retry; no automatic polling.')
c=home(); notice(c,'Couldn’t request a case. Please try again.',460,'error'); actionbar(c,'Try again')
record(c,'07-request-error','Request error','Retry only once server confirms no case assigned. Unknown outcome stays in requesting layout.')
c=home(); notice(c,'You’re offline. Reconnect to request a case.',460,'warning'); actionbar(c,'Request a case',True)
record(c,'08-offline','Offline','Availability continues. Mutations need connection; retain selections and reconcile when connection returns.')
record(home(time='5 min',near=True),'09-near-expiry','Ending soon','Promote Add time inside amber notice at 5 minutes; suppress duplicate timer link. Requests remain eligible until deadline.')

def add(mode='default'):
    c=sheet(home(),'Add availability','Choose how much time to add.',294)
    for r,labels in enumerate([['15 min','30 min','45 min'],['1 hour','2 hours','3 hours']]):
        for i,label in enumerate(labels):
            x=24+118*i; y=426+r*60; sel=label=='30 min'
            c.box((x,y,x+106,y+48),C['tint'] if sel else C['white'],12,C['blue'] if sel else C['border']); c.centered_control(x,y,106,48,label,14,C['blue'] if sel else C['text'])
    for x,label,value in [(24,'Hours','0'),(202,'Minutes','30')]:
        c.center(x,562,164,label,13,C['muted'],500); c.box((x,590,x+164,646),C['white'],12,C['border'])
        for off,w,t in [(0,44,'−'),(44,76,value),(120,44,'+')]: c.centered_control(x+off,590,w,56,t,24,C['text'] if off==44 else C['muted'] if x==24 and off==0 else C['blue'],500)
    if mode=='error': notice(c,'Couldn’t add time. Try again.',676,'error')
    else: c.text(24,676,'15-minute steps · Minimum 15 minutes',13,C['muted'])
    primary(c,'Adding time…' if mode=='saving' else 'Add 30 minutes',764,mode=='saving')
    return c
for mode,id,title in [('default','10-add','Add availability'),('saving','11-adding','Adding time'),('error','12-add-error','Add time error')]:
    record(add(mode),id,title,'Same picker and presets as initial setup. Expiry while open introduces no new UI or action. Add duration to max(server time, current deadline). Failure preserves selection; retry must be idempotent.')
c=home(time='1 h 54 min'); c.box((24,630,366,678),C['text'],12); c.centered_control(24,630,342,48,'30 minutes added',14,C['white'],500)
record(c,'13-toast','Added — transient toast','Not a separate screen. Return to current Home, update countdown and show toast about 4 seconds; respect native accessibility duration. Preserve previous Home context, including empty queue.')
c=sheet(home('Requesting a case','We’ll open your case when it’s ready.'),'End after this request?','Your current request will finish processing.',430)
wrap(c,'If a case is assigned, complete it normally. Availability ends afterward.',24,562,size=16,line=25)
c.box((24,708,366,764),C['white'],16,red); c.centered_control(24,708,342,56,'End after this request',18,red,600); c.centered_control(24,778,342,44,'Keep availability',16,C['muted'])
record(c,'14-end-pending','End during pending request','Conditional confirmation only. Idle End availability uses saving feedback then returns to setup with toast. Confirm schedules stop; dismissal changes nothing.')
c=home('We’ll stop after this request','Any case assigned will continue normally.'); c.box((250,334,366,378),C['white']); notice(c,'No further cases will be requested after this one.',460); actionbar(c,'Finishing request…',True,False)
record(c,'15-stop-pending','Stop scheduled','Persistent status, not toast. Request/case resolves then return to setup. No restart until request reconciled.')
c=home('Finishing your request','Your request was made before the window ended.','—'); c.box((24,334,366,440),C['white']); notice(c,'If a case is assigned, you can complete it normally.',354); actionbar(c,'Requesting…',True,False)
record(c,'16-expired-pending','Window ended with request pending','Same pending Home layout. No 0-minute hero or expiry popup. Honor request, then existing case or inactive setup.')

(OUT/'manifest.json').write_text(json.dumps(entries,indent=2))
body=['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Home — simplified review</title><style>body{font:16px Arial;background:#f5f6f8;color:#383a42;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,390px));gap:28px}img{width:100%;border-radius:16px}p{line-height:1.5}header{max-width:900px}</style><header><h1>Home · 16 representative states</h1><p>Two Home layouts, shared duration picker, conditional stop sheet. Loading/errors update existing layouts; toast is temporary feedback. Draft static references, not a working app.</p><p>Expiry during extension is handled silently. Expired and manually ended Home reuse inline setup. Existing approved wheel/tap alternatives remain unchanged.</p></header><main>']
for e in entries: body+=['<article><h2>'+html.escape(e['title'])+'</h2><a href="'+e['id']+'.png"><img src="'+e['id']+'.png"></a><p>'+html.escape(e['note'])+'</p></article>']
(OUT/'index.html').write_text(''.join(body)+'</main>')
for n in range(4):
    board=Image.new('RGB',(1656,910),C['soft']); d=ImageDraw.Draw(board)
    for col,e in enumerate(entries[n*4:n*4+4]):
        x=col*414+12; d.text((x,16),e['title'],font=f(8,600),fill=C['text']); board.paste(Image.open(OUT/(e['id']+'.png')).resize((390,844),Image.Resampling.LANCZOS),(x,54))
    board.save(OUT/('board-'+str(n+1)+'.png'))
print(len(entries),'renders',OUT)

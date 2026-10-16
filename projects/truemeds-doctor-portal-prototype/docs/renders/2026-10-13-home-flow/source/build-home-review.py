from pathlib import Path
import re, json, shutil, hashlib, html
from PIL import Image, ImageDraw, ImageFont

ROOT=Path('/Users/mac/src/pm-agent/projects/truemeds-doctor-portal-prototype')
OUT=Path('/private/tmp/home-flow-review'); OUT.mkdir(exist_ok=True)
S=2
css=Path('/Users/mac/src/pm-agent/design-system/truemeds.css').read_text()
tokens=dict(re.findall(r'(--tm-[\w-]+)\s*:\s*([^;{}]+);',css))
def token(name):
    value=tokens[name].strip()
    return token(value[4:-1]) if value.startswith('var(') else value
exec(Path('/private/tmp/render-home-continuity.py').read_text().split('idle=Canvas(); idle.header()')[0])
C.update(blue=token('--tm-content-brand'),tint=token('--tm-surface-brand-subtle'),text=token('--tm-content-primary'),muted=token('--tm-content-secondary'),border=token('--tm-border-default'))
amber=token('--tm-feedback-warning-content'); amberbg=token('--tm-feedback-warning-surface')
red=token('--tm-feedback-error-content'); redbg=token('--tm-feedback-error-surface')
entries=[]
def wrap(c,text,x,y,width=342,size=16,color=None,weight=400,line=25):
    for para in text.split('\n'):
        words=para.split(); row=''
        for word in words:
            test=(row+' '+word).strip()
            if c.d.textlength(test,font=f(size,weight))>width*S and row:
                c.text(x,y,row,size,color,weight); y+=line; row=word
            else: row=test
        if row: c.text(x,y,row,size,color,weight); y+=line
    return y
def notice(c,text,y=458,kind='info'):
    bg,fg=(amberbg,amber) if kind=='warning' else (redbg,red) if kind=='error' else (C['tint'],C['blue'])
    # Measure first, then draw panel and copy.
    lines=[]; row=''
    for w in text.split():
        t=(row+' '+w).strip()
        if c.d.textlength(t,font=f(14))>310*S: lines.append(row); row=w
        else: row=t
    lines.append(row); h=32+22*len(lines)
    c.box((24,y,366,y+h),bg,12)
    for i,t in enumerate(lines): c.text(40,y+16+22*i,t,14,fg)
def primary(c,label,y=708,disabled=False):
    busy=label.endswith('…')
    c.box((24,y,366,y+56),C['border'] if disabled and not busy else C['blue'],16)
    c.centered_control(24,y,342,56,label,18,C['muted'] if disabled and not busy else C['white'],600)
    if busy: c.d.arc((40*S,(y+21)*S,54*S,(y+35)*S),20,290,fill=C['white'],width=2*S)
def footer(c,label='Request a case',disabled=False,secondary=True):
    c.box((0,700,390,844),C['white'])
    primary(c,label,708,disabled)
    if secondary:
        c.centered_control(24,778,165,44,'+ Extend time',16,C['blue'],600)
        c.centered_control(201,778,165,44,'End availability',16,C['muted'],600)
def base(title="You’re available for\nconsultations",sub='Request a case whenever you have a moment.',time='1 h 24 min'):
    c=Canvas(); c.header(); wrap(c,title,24,102,size=24,weight=600,line=32)
    wrap(c,sub,24,174,size=16,color=C['muted'],line=24)
    c.panel(); c.icon('prescription',24,270,20); c.text(56,271,'Prescriptions today',16,C['muted'])
    c.centered_control(338,262,28,36,'3',20,weight=600)
    c.d.line((24*S,306*S,366*S,306*S),fill=C['border'],width=S)
    c.text(24,344,'Time remaining',14,C['muted']); c.text(24,378,time,40,weight=600)
    footer(c); return c
def save(c,id,title,group,note):
    c.im.save(OUT/(id+'.png')); entries.append(dict(id=id,title=title,group=group,note=note))
def sheet(c,title,sub='',top=330):
    c.im=Image.alpha_composite(c.im.convert('RGBA'),Image.new('RGBA',c.im.size,(0,0,0,80))).convert('RGB'); c.d=ImageDraw.Draw(c.im)
    c.box((0,top,390,870),C['white'],24); c.box((175,top+12,215,top+16),C['border'],2)
    c.text(24,top+40,title,22,weight=600)
    c.centered_control(326,top+24,44,44,'×',26,C['muted'],400)
    if sub: wrap(c,sub,24,top+82,size=14,color=C['muted'],line=22)
    return c
def setup(state):
    c=Canvas(); c.im=Image.open('/private/tmp/home-tap-15min.png').convert('RGB'); c.d=ImageDraw.Draw(c.im)
    if state=='saving': primary(c,'Setting availability…',764,True)
    else: notice(c,'Couldn’t set availability. Your selection is saved. Try again.',650,'error')
    return c
save(setup('saving'),'01-setting','Setting availability','Start','Prevent repeat submissions. Countdown begins only after server confirmation.')
save(setup('error'),'02-start-error','Couldn’t start','Start','Keep chosen duration. Retry uses same operation identifier or reconciles first if outcome is unknown.')
save(base(),'03-ready','Available','Home','Request pulls one case. No automatic polling or push offers.')
c=base('Requesting a case','We’ll open your case when it’s ready.'); footer(c,'Requesting…',True)
save(c,'04-requesting','Request in progress','Home','No duplicate request. Timer continues. End availability schedules stop after this request.')
c=base('No cases right now','You’re still available. Check again shortly.','1 h 21 min'); footer(c,'Check again')
save(c,'05-empty','No cases available','Home','Keep availability and countdown. Check again makes one new request.')
c=base('Couldn’t request a case','Please try again. You’re still available.'); notice(c,'Your request failed. No case was assigned.',458,'error'); footer(c,'Try again')
save(c,'06-request-failed','Confirmed request failure','Home','Use only after server confirms no assignment. An unknown outcome uses status-checking state.')
c=base('You’re offline','Reconnect to request your next case.'); notice(c,'No internet connection. Availability keeps counting down.',458,'warning'); footer(c,'Request a case',True)
save(c,'07-offline','Offline','Home','Local countdown reflects server deadline. Mutations require connection; retain selections. Reconcile status after reconnect.')
c=base('Checking your request','Connection interrupted. We’re checking whether a case was assigned.'); notice(c,'Please wait before requesting another case.',458); footer(c,'Checking request…',True)
save(c,'08-reconciling','Request outcome unknown','Home','Reconcile original request ID; do not create duplicate. Assigned case opens; otherwise resolve to empty or failed.')
c=base(time='5 min'); c.box((24,376,366,433),C['white']); c.text(24,378,'5 min',40,amber,600)
notice(c,'Availability ends in 5 minutes. You can still request a case.',458,'warning')
save(c,'09-ending-soon','Five minutes remaining','Home','Proposed warning threshold. Extend and End actions keep same positions.')
c=base('Your window has ended','Choose another duration whenever you’re ready.','0 min'); footer(c,'Set availability',False,False)
save(c,'10-expired','Window ended while idle','Home','Set availability returns to inline setup. No case request until new window confirmed.')
c=base('Availability ended','You’re still signed in. Start again whenever you’re ready.','—'); footer(c,'Set availability',False,False)
save(c,'11-ended','Manually ended','Home','After confirmed stop. Return to inline duration setup on CTA.')
c=base('Finishing your request','Your request was made before the window ended.','0 min'); notice(c,'If a case is assigned, you can complete it normally.',458); footer(c,'Requesting…',True,False)
save(c,'12-expired-pending','Expired with request pending','Home','Honor request sent before deadline. Assigned case opens; no assignment goes to ended state.')
c=base('We’ll stop after this request','Any case assigned will continue normally.'); notice(c,'No further cases will be requested after this one.',458); footer(c,'Finishing request…',True,False)
save(c,'13-stop-pending','Stop scheduled','Home','Stop intent survives reconnect. Assigned case completes normally; then availability ends. No assignment ends immediately.')

def extend(mode='default'):
    c=sheet(base(), 'Extend availability','Choose how much time to add.',330)
    c.text(24,462,'Time remaining',14,C['muted']); c.text(244,462,'1 h 24 min',16,weight=600)
    for i,label in enumerate(['15 min','30 min','1 hour']):
        x=24+118*i; c.box((x,500,x+106,548),C['tint'] if i==1 else C['white'],12,C['blue'] if i==1 else C['border']); c.centered_control(x,500,106,48,label,14,C['blue'] if i==1 else C['text'])
    c.text(24,572,'Time to add',14,C['muted']); c.box((24,604,366,660),C['white'],12,C['border'])
    for x,w,label in [(24,56,'−'),(80,230,'30 min'),(310,56,'+')]: c.centered_control(x,604,w,56,label,20,C['blue'] if w==56 else C['text'])
    c.text(24,686,'After adding: about 1 h 54 min',14,C['muted'])
    primary(c,'Adding time…' if mode=='saving' else 'Add 30 minutes',764,mode=='saving')
    if mode=='error':
        c.box((24,680,366,747),C['white']); notice(c,'Couldn’t add time. Try again.',680,'error')
    if mode=='expired':
        c.box((24,450,366,490),C['white']); c.text(24,462,'Current window ended',14,amber)
        c.box((24,680,366,747),C['white']); wrap(c,'Start a new 30-minute window.',24,686,size=14,color=C['muted']); primary(c,'Start 30 minutes',764)
    return c
for mode,id,title in [('default','14-extend','Extend time sheet'),('saving','15-extending','Adding time'),('error','16-extend-error','Extension failed'),('expired','17-expired-in-sheet','Expired while extending')]:
    save(extend(mode),id,title,'Extend','Add to latest server deadline on confirmation. Countdown continues behind sheet. Expired window requires explicit Start wording; do not silently restart. Retry is idempotent.')
c=base(time='1 h 54 min'); notice(c,'30 minutes added.',458)
save(c,'18-extended','Extension confirmed','Extend','Brief confirmation; authoritative new deadline. Remain on Home.')

for mode,id,title in [('confirm','19-end-confirm','End availability sheet'),('saving','20-ending','Ending availability'),('error','21-end-error','Couldn’t end availability'),('pending','22-end-pending-confirm','End during request')]:
    c=sheet(base(),'End availability?','1 h 24 min remaining',430)
    copy='You won’t be able to request new cases. You’ll stay signed in.' if mode!='pending' else 'We’ll finish your pending request. If a case is assigned, complete it normally. Availability ends after that.'
    wrap(c,copy,24,560,size=16,line=25)
    if mode=='error': notice(c,'Couldn’t end availability. Try again.',634,'error')
    c.box((24,708,366,764),C['white'],16,red)
    c.centered_control(24,708,342,56,'Ending…' if mode=='saving' else 'End after this request' if mode=='pending' else 'End availability',18,red,600)
    if mode!='saving': c.centered_control(24,778,342,44,'Keep availability',16,C['muted'],600)
    save(c,id,title,'End','Close or Keep dismisses without change. Server confirmation required. Unknown stop result reconciles before allowing new requests. Saving locks controls.')

def page(title,sub):
    c=Canvas(); c.header(); c.text(24,82,'‹  Back',14,C['muted']); c.text(24,120,title,24,weight=600); wrap(c,sub,24,164,size=16,color=C['muted']); c.panel(); return c
def row(c,y,title,sub='',label='›'):
    c.text(24,y,title,16,weight=600)
    if sub: wrap(c,sub,24,y+28,width=286,size=14,color=C['muted'],line=22)
    c.centered_control(322,y-8,44,44,label,22,C['muted']); c.d.line((24*S,(y+80)*S,366*S,(y+80)*S),fill=C['border'],width=S)
c=sheet(base(),'How can we help?',top=414)
row(c,510,'Message support','Continue on WhatsApp'); row(c,604,'Call Doctor Ops','Speak with our team'); row(c,698,'Report app issue','Share what went wrong')
save(c,'23-help','Help','Support','Message and call launch configured native destinations. Report requires explicit submission. In live case Call is hidden during patient call.')
c=page('Report app issue','Tell us what happened.'); c.text(24,270,'Issue details (optional)',14,weight=600); c.box((24,300,366,448),C['white'],12,C['border']); wrap(c,'Describe the issue…',40,320,width=310,size=14,color=C['muted']); notice(c,'App and device diagnostics will be included. Don’t add patient details or OTPs.',476); primary(c,'Send report',764)
save(c,'24-report','Report app issue','Support','Draft diagnostic disclosure; app team must finalize exact fields. Keyboard screen scrolls input and CTA into view.')
c=page('Report sent','Thank you. Our team can use this reference to investigate.'); c.text(24,282,'Reference',14,C['muted']); c.text(24,316,'DEMO-1042',24,weight=600); primary(c,'Back to Home',764)
save(c,'25-report-sent','Report submitted','Support','Reference is a mock, replaced by actual report ID. Send failure preserves description.')
c=page('Couldn’t send report','Your description is saved. Please try again.'); notice(c,'Check your connection and retry.',282,'error'); primary(c,'Try again',764)
save(c,'26-report-error','Report failed','Support','Retry same report to avoid duplicates. Preserve typed description.')
c=page('Notifications','Updates from the Truemeds team.'); c.text(24,294,'You’re all caught up',20,weight=600); wrap(c,'Announcements and updates will appear here.',24,334,size=16,color=C['muted']); primary(c,'Back to Home',764)
save(c,'27-notifications-empty','Notifications empty','Account','No push offers. Opening inbox does not end availability.')
c=page('Notifications','Updates from the Truemeds team.'); row(c,282,'App update available','Sample announcement · Today'); row(c,386,'A note from Doctor Ops','Sample announcement · Yesterday')
save(c,'28-notifications','Notifications list','Account','Illustrative content only. Unread state and list/detail navigation required.')
c=page('App update available','Sample announcement · Today'); wrap(c,'A new version of the app is available. Update when you’ve finished your consultation.',24,282,size=16,line=26); primary(c,'Back to notifications',764)
save(c,'29-notification-detail','Announcement detail','Account','Illustrative announcement; no forced update during live case.')
c=page('Notifications','Updates from the Truemeds team.'); notice(c,'Couldn’t load updates. Please try again.',282,'error'); primary(c,'Try again',764)
save(c,'30-notifications-error','Notifications failed','Account','Availability continues. Retain cached list when available.')
c=page('Your profile','Dr. Apurva'); row(c,282,'Registration','Shown from approved doctor record',label=''); row(c,384,'Faster sign-in','Manage device unlock'); row(c,486,'Wallet','Coming soon'); row(c,588,'Help','Contact support'); c.centered_control(24,754,342,56,'Log out',18,red)
save(c,'31-profile','Profile','Account','Read-only approved record; no invented registration number. Log out absent during case or request in flight.')
c=page('Wallet','Your earnings, in one place.'); c.text(24,282,'Coming soon',20,weight=600); wrap(c,'View earnings and manage payouts here when Wallet launches.',24,326,size=16,color=C['muted']); primary(c,'Back to profile',764)
save(c,'32-wallet','Wallet placeholder','Account','No balance, KYC, bank details, payout or withdrawal actions in current scope.')
c=page('Faster sign-in','Use your device to unlock the app.'); row(c,282,'Device unlock','Not set up on this device',label=''); wrap(c,'Set up faster access using your device’s available screen lock.',24,402,size=16,color=C['muted']); primary(c,'Set up',764)
save(c,'33-faster-signin','Faster sign-in settings','Account','Explicit tap invokes native credential setup. OS controls biometric/PIN UI. Cancellation stays here. Existing credential shows enabled and Turn off confirmation.')
c=sheet(base(),'Log out?','Logging out also ends your availability.',498); wrap(c,'You’ll need to sign in again to continue.',24,636,size=16,color=C['muted']); primary(c,'Log out',708); c.centered_control(24,778,342,44,'Stay signed in',16,C['muted'])
save(c,'34-logout','Log out confirmation','Account','Proposed: end window and revoke session atomically; no logout while request/case active. On failure remain signed in and reconcile.')

c=page('Notifications','Updates from the Truemeds team.'); c.text(24,282,'Loading updates…',16,C['muted'])
save(c,'35-notifications-loading','Loading notifications','Account','Show cached content if available; otherwise loading state. Back remains available.')
c=page('Report app issue','Sending your report.'); notice(c,'Please wait while we send your report.',282); primary(c,'Sending report…',764,True)
save(c,'36-report-sending','Sending report','Support','Prevent duplicate submission. Preserve description until server confirms receipt.')
c=sheet(base(),'Report the last issue?','The app closed unexpectedly last time.',490); wrap(c,'Send app diagnostics to help our team investigate.',24,628,size=16,color=C['muted']); primary(c,'Send report',708); c.centered_control(24,778,342,44,'Not now',16,C['muted'])
save(c,'37-crash-report','Post-crash report offer','Support','Proposed occasional prompt after state reconciliation. Never interrupt or obscure an active case on recovery. Automatic crash logging is separate.')
c=page('Faster sign-in','Use your device to unlock the app.'); row(c,282,'Device unlock','Enabled on this device',label=''); primary(c,'Turn off',764)
save(c,'38-faster-enabled','Faster sign-in enabled','Account','Turning off requires confirmation. Does not remove other accounts’ device credentials.')
c=page('Faster sign-in','Use your device to unlock the app.'); notice(c,'Setup wasn’t completed. You can try again or keep using OTP.',282); primary(c,'Try setup again',764)
save(c,'39-faster-error','Setup cancelled or failed','Account','OS cancellation is neutral. Native error may supply actionable reason. No repeat prompt without user action.')
c=sheet(base(),'Turn off faster sign-in?','You can use OTP the next time you sign in.',498); primary(c,'Turn off',708); c.centered_control(24,778,342,44,'Keep faster sign-in',16,C['muted'])
save(c,'40-faster-off','Disable faster sign-in','Account','After success return to settings off state. Failure preserves enabled state; server/device credential behavior requires app-team validation.')
c=page('Continue on this phone?','You’re signed in on another phone.'); wrap(c,'Continuing here signs you out on the other phone.',24,282,size=16,color=C['muted']); primary(c,'Continue here',708); c.centered_control(24,778,342,44,'Go back',16,C['muted'])
save(c,'41-device-switch','New-phone confirmation','Account','Proposed JTBD rule. Native session policy remains open; not an approved auth change.')
c=page('Finish your current case','A consultation is active on your other phone.'); notice(c,'Finish that case before continuing here.',282,'warning'); primary(c,'Check again',708); c.centered_control(24,778,342,44,'Get help',16,C['blue'])
save(c,'42-device-case','Live case on other phone','Account','Proposed device-switch guard; do not interrupt current doctor case.')
c=page('Signed out on this phone','You continued on another phone.'); primary(c,'Sign in',764)
save(c,'43-device-signed-out','Old phone signed out','Account','Proposed session-takeover result after server confirms no live case.')

(OUT/'manifest.json').write_text(json.dumps(entries,indent=2))
style='body{font-family:Arial,sans-serif;background:#f5f6f8;color:#383a42;margin:32px}header{max-width:960px}nav{position:sticky;top:0;background:white;padding:16px;z-index:1}nav a{margin-right:20px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,390px));gap:28px}article{max-width:390px}img{width:100%;border-radius:16px;border:1px solid #ddd}p{line-height:1.5}h2{margin-top:48px}small{color:#5b616e}'
parts=['<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Doctor Home — review</title><style>'+style+'</style></head><body><header><h1>Doctor Home · full flow review</h1><p>'+str(len(entries))+' draft states · 390 × 844 at 2×. Static design review, not a working app. Duration alternatives saved separately. New flow choices remain proposals until reviewed.</p></header><nav>']
groups=list(dict.fromkeys(e['group'] for e in entries))
parts+=['<a href="#'+g+'">'+g+'</a>' for g in groups]; parts+=['</nav>']
for g in groups:
    parts+=['<h2 id="'+g+'">'+g+'</h2><section>']
    for e in entries:
        parts+=['<article><h3>'+html.escape(e['title'])+'</h3><a href="'+e['id']+'.png"><img loading="lazy" src="'+e['id']+'.png" alt="'+html.escape(e['title'])+'"></a><p>'+html.escape(e['note'])+'</p></article>']
    parts+=['</section>']
parts+=['</body></html>']; (OUT/'index.html').write_text(''.join(parts))
for g in groups:
    items=[e for e in entries if e['group']==g]; cols=3; rows=(len(items)+2)//3
    board=Image.new('RGB',(cols*414,rows*900),C['soft']); d=ImageDraw.Draw(board)
    for i,e in enumerate(items):
        x=(i%3)*414+12; y=(i//3)*900
        d.text((x,y+12),e['title'],font=f(8,600),fill=C['text'])
        im=Image.open(OUT/(e['id']+'.png')).resize((390,844),Image.Resampling.LANCZOS); board.paste(im,(x,y+44))
    board.save(OUT/('board-'+g.lower()+'.png'))
board=Image.new('RGB',(1242,900),C['soft']); d=ImageDraw.Draw(board)
for i,(id,label) in enumerate([('03-ready','Available'),('14-extend','Extend time'),('05-empty','No cases')]):
    x=i*414+12; d.text((x,12),label,font=f(8,600),fill=C['text'])
    board.paste(Image.open(OUT/(id+'.png')).resize((390,844),Image.Resampling.LANCZOS),(x,44))
board.save(OUT/'overview.png')
print('Rendered',len(entries),'states into',OUT)

from pathlib import Path
import json, html
from PIL import Image,ImageDraw,ImageChops
exec(Path('/private/tmp/build-home-review.py').read_text().split("save(setup('saving')")[0])
OUT=Path('/private/tmp/home-happy-review'); OUT.mkdir(exist_ok=True); entries=[]
def footer_fixed(c,label,secondary=None):
    c.box((0,700,390,844),C['white']); primary(c,label,708)
    if secondary: c.centered_control(24,778,342,44,secondary,16,C['muted'],600)
def active(time):
    c=base(time=time); footer_fixed(c,'Request a case','End availability')
    c.centered_control(250,334,116,44,'+ Add time',14,C['blue'],600)
    return c
def picker(c,y):
    for r,labels in enumerate([['15 min','30 min','45 min'],['1 hour','2 hours','3 hours']]):
        for i,label in enumerate(labels):
            x=24+118*i; yy=y+r*60; selected=label=='30 min'
            c.box((x,yy,x+106,yy+48),C['tint'] if selected else C['white'],12,C['blue'] if selected else C['border'])
            c.centered_control(x,yy,106,48,label,14,C['blue'] if selected else C['text'],600 if selected else 500)
    c.text(24,y+142,'Adjust duration',16,weight=600)
    for x,label,value in [(24,'Hours','0'),(202,'Minutes','30')]:
        c.center(x,y+184,164,label,13,C['muted'],500)
        c.box((x,y+214,x+164,y+270),C['white'],12,C['border'])
        for off,w,t in [(0,44,'−'),(44,76,value),(120,44,'+')]:
            color=C['text'] if off==44 else C['muted'] if x==24 and off==0 else C['blue']
            c.centered_control(x+off,y+214,w,56,t,24,color,500)
    c.text(24,y+294,'15-minute steps · Minimum 15 minutes',13,C['muted'])
c=Canvas(); c.header(); c.text(24,102,'Consult on your schedule.',24,weight=600)
c.text(24,150,'Choose how long you’re available today.',14,C['muted']); c.panel()
c.icon('prescription',24,270,20); c.text(56,271,'Prescriptions today',16,C['muted']); c.centered_control(338,262,28,36,'3',20,weight=600)
c.d.line((24*S,306*S,366*S,306*S),fill=C['border'],width=S)
picker(c,334); footer_fixed(c,'Set availability')
save(c,'01-setup','1 · Set availability','Happy','30 minutes selected. Stepper shown for continuity; wheel remains testing alternative. Draft aligns primary action with active Home; saved alternatives remain unchanged.')
before=active('30 min'); save(before,'02-active','2 · Active Home','Happy','Same prescription count. Timer starts after confirmation. Add time stays beside timer in all active states, including near expiry.')
c=sheet(active('30 min'),'Add availability','Choose how much time to add.',254)
picker(c,374); footer_fixed(c,'Add 30 minutes','Cancel')
save(c,'03-add','3 · Add availability','Happy','Same picker geometry, presets, weights and step controls as setup. Adds selected duration; natural expiry while open changes no UI. CTA stays at same vertical position.')
after=active('1 h'); text='30 minutes added'
def px(name): return float(token(name).replace('px',''))
size=px('--tm-font-size-body-xs'); line=px('--tm-font-lineheight-xs'); hp=px('--tm-space-sm'); vp=px('--tm-space-xs'); radius=px('--tm-radius-xs')
tw=after.d.textlength(text,font=f(size,600))/S; width=tw+2*hp; height=line+2*vp; x=(390-width)/2; y=668
after.box((x,y,x+width,y+height),token('--tm-surface-inverse'),radius)
after.centered_control(x,y,width,height,text,size,token('--tm-content-inverse'),600)
save(after,'04-added','4 · Updated timer + toast','Happy','Toast uses shared 12/16 semibold, 4px vertical/8px horizontal padding, 4px radius and inverse surface. Compact content width; positioned above action bar to avoid covering controls. About 4 seconds; respect accessibility duration. Not a success page.')
# Audit: active → added may change timer and toast only.
diff=ImageChops.difference(before.im,after.im)
for bounds in [(24,374,366,434),(0,660,390,700)]:
    ImageDraw.Draw(diff).rectangle(tuple(int(v*S) for v in bounds),fill=(0,0,0))
assert diff.getbbox() is None,'Unexpected layout/content change outside timer/toast'
assert 374+294+16<708,'Sheet controls overlap CTA'
for e in entries: assert Image.open(OUT/(e['id']+'.png')).size==(780,1688)
(OUT/'manifest.json').write_text(json.dumps(entries,indent=2))
parts=['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Home happy flow review</title><style>body{font:16px Arial;background:#f5f6f8;color:#383a42;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,390px));gap:28px}img{width:100%;border-radius:16px}p{line-height:1.5}</style><h1>Home · happy flow</h1><p>Four draft snapshots. Review together; approve individually. Static references, not interactive app screens.</p><main>']
for e in entries: parts+=['<article><h2>'+html.escape(e['title'])+'</h2><a href="'+e['id']+'.png"><img src="'+e['id']+'.png"></a><p>'+html.escape(e['note'])+'</p></article>']
(OUT/'index.html').write_text(''.join(parts)+'</main>')
board=Image.new('RGB',(1656,910),C['soft']); d=ImageDraw.Draw(board)
for i,e in enumerate(entries):
    x=12+i*414; d.text((x,16),e['title'],font=f(8,600),fill=C['text']); board.paste(Image.open(OUT/(e['id']+'.png')).resize((390,844),Image.Resampling.LANCZOS),(x,54))
board.save(OUT/'happy-flow.png')
print('4 renders; primary CTA y=708 on all; active/success pixel-diff passed outside timer and toast.')

from pathlib import Path
import hashlib,json
from PIL import Image,ImageDraw,ImageChops
exec(Path('/private/tmp/render-happy-review.py').read_text().split('\nc=Canvas(); c.header()')[0])
OUT=Path('/private/tmp/home-approved-audit'); OUT.mkdir(exist_ok=True)
root=Path('/Users/mac/src/pm-agent/projects/truemeds-doctor-portal-prototype')
source=root/'docs/renders/2026-10-13-home-happy-review'
# Exact accepted screen 2 and screen 3 stepper: no re-render drift.
for src,dst in [('02-active.png','home_active.png'),('03-add.png','add-availability_tap.png')]:
    (OUT/dst).write_bytes((source/src).read_bytes())
# Wheel needs a taller sheet, keeping footer and background fixed.
c=sheet(active('30 min'),'Add availability','Choose how much time to add.',194)
for r,labels in enumerate([['15 min','30 min','45 min'],['1 hour','2 hours','3 hours']]):
    for i,label in enumerate(labels):
        x=24+i*118; y=314+r*60; sel=label=='30 min'
        c.box((x,y,x+106,y+48),C['tint'] if sel else C['white'],12,C['blue'] if sel else C['border'])
        c.centered_control(x,y,106,48,label,14,C['blue'] if sel else C['text'],600 if sel else 500)
c.text(24,456,'Adjust duration',16,weight=600)
for x,label in [(24,'Hours'),(202,'Minutes')]: c.center(x,498,164,label,13,C['muted'],500)
c.centered_control(202,526,164,32,'15',24,C['muted'],400)
c.box((24,560,366,616),C['tint'],12)
c.d.line((195*S,572*S,195*S,604*S),fill=C['border'],width=S)
for x,value in [(24,'0'),(202,'30')]: c.centered_control(x,560,164,56,value,32,C['blue'],600)
for x,value in [(24,'1'),(202,'45')]: c.centered_control(x,620,164,32,value,24,C['muted'],400)
c.text(24,668,'15-minute steps · Minimum 15 minutes',13,C['muted'])
footer_fixed(c,'Add 30 minutes','Cancel'); c.im.save(OUT/'add-availability_wheel.png')
tap=Image.open(OUT/'add-availability_tap.png'); wheel=c.im
assert ImageChops.difference(tap.crop((0,1400,780,1688)),wheel.crop((0,1400,780,1688))).getbbox() is None
assert ImageChops.difference(tap.crop((0,0,780,388)),wheel.crop((0,0,780,388))).getbbox() is None
for path in OUT.glob('*.png'): assert Image.open(path).size==(780,1688)
approved=root/'ui-screens/home'
existing={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [approved/'availability_tap.png',approved/'availability_wheel.png']}
(OUT/'setup-hashes.json').write_text(json.dumps(existing,indent=2))
board=Image.new('RGB',(1242,910),C['soft']); d=ImageDraw.Draw(board)
for i,(name,title) in enumerate([('home_active.png','2 · Active Home'),('add-availability_tap.png','3A · Add time — tap'),('add-availability_wheel.png','3B · Add time — wheel')]):
    x=i*414+12; d.text((x,16),title,font=f(8,600),fill=C['text']); board.paste(Image.open(OUT/name).resize((390,844),Image.Resampling.LANCZOS),(x,54))
board.save(OUT/'audit-preview.png')
print('PASS: 3 image sizes; identical sheet footers; unchanged upper backdrop; exact copies of accepted screens. Setup hashes captured.')

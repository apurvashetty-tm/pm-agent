"""Kit v1 (963c2b5) baseline and before/after pictures for handoff/CHANGES.md. Run from the project folder."""
import io, json, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont
V='963c2b5'; K=pathlib.Path('scripts/kit-changes'); F=ImageFont.load_default(size=16)
show=lambda f: subprocess.run(['git','show',f'{V}:./{f}'],capture_output=True).stdout
m=json.loads(show('scripts/build-handoff.manifest.json'))
(K/'v1.json').write_text(json.dumps({'commit':V,'date':'2026-11-10','snapshot':m['snapshot'],'messages':json.loads(show('ui-screens/feedback/messages.json'))},ensure_ascii=False,indent=1)+'\n')
for d in ('sign-in','otp','faster-signin-offer','returning-unlock','home','case','prescribe'):
    cells=[]
    for p in sorted(pathlib.Path('ui-screens',d).glob('*_w390.png')):
        o=show(str(p)); cells.append((p.stem[:-5],Image.open(io.BytesIO(o)).convert('RGB') if o else None,Image.open(p).convert('RGB')))
    tw,th,per=260,563,4; rows=-(-len(cells)//per); im=Image.new('RGB',(per*(2*tw+40),rows*(th+36)),(246,246,248)); g=ImageDraw.Draw(im)
    for i,(n,a,b) in enumerate(cells):
        x,y=(i%per)*(2*tw+40)+10,(i//per)*(th+36)
        for j,t in enumerate((a,b)):
            if t: im.paste(t.resize((tw,th),Image.LANCZOS),(x+j*(tw+8),y+6))
        g.text((x,y+th+10),n+'   v1 | now',fill=(60,60,70),font=F)
    im.save(K/'pictures'/f'{d}.jpg',quality=80,optimize=True); print(d,im.size,(K/'pictures'/f'{d}.jpg').stat().st_size//1024,'KB')

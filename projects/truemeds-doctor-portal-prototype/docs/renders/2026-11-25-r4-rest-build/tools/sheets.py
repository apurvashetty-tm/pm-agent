"""before/after sheets: last committed picture | new picture, 390. Run from the project folder."""
import io, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont
OUT = pathlib.Path('docs/renders/2026-11-25-r4-rest-build/before-after'); OUT.mkdir(exist_ok=True)
F = ImageFont.load_default(size=15)
def group(f, n):
    if f == 'prescribe': return 'prescribe'
    if f == 'home': return 'home' if any(k in n for k in ('profile', 'ended', 'expired', 'logout')) else None
    if f != 'case': return None
    return 'case-sheets' if n.startswith('c-') or 'sheet' in n else 'case-page' if n.startswith(('a-', 's-')) else 'case-calling'
G = {}
for f in ('case', 'prescribe', 'home'):
    for p in sorted(pathlib.Path('ui-screens', f).glob('*_w390.png')):
        g = group(f, p.stem)
        if g: G.setdefault(g, []).append(p)
for g, files in G.items():
    cells = []
    for p in files:
        old = subprocess.run(['git', 'show', f'HEAD:./{p}'], capture_output=True).stdout
        cells.append((p.stem[:-5], Image.open(io.BytesIO(old)).convert('RGB') if old else None, Image.open(p).convert('RGB')))
    tw, th, pad = 300, 650, 10; per = 4; rows = -(-len(cells) // per)
    im = Image.new('RGB', (per * (2 * tw + 4 * pad), rows * (th + 34)), (246, 246, 248)); d = ImageDraw.Draw(im)
    for i, (n, a, b) in enumerate(cells):
        x, y = (i % per) * (2 * tw + 4 * pad) + pad, (i // per) * (th + 34)
        for j, t in enumerate((a, b)):
            if t: im.paste(t.resize((tw, th), Image.LANCZOS), (x + j * (tw + pad), y + 6))
        d.text((x, y + th + 10), n + '   before | after', fill=(60, 60, 70), font=F)
    im.save(OUT / f'{g}.png', optimize=True); print(g, im.size, len(cells))

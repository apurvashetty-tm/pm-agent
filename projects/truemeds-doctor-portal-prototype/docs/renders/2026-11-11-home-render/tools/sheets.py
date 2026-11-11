"""Contact sheets: option-<x>.png (every state, 390 × 844 row + 360 × 640 row) and compare.png (setup + available across options).
  python3 tools/sheets.py <run folder>"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
RUN = pathlib.Path(sys.argv[1]).resolve(); S = RUN / 'shots'
NAMES = {'a': 'A · one card, divider', 'b': 'B · two separate cards', 'c': 'C · as A + setup in a card'}
BIG = ['setup-pick', 'setup-custom', 'setting', 'available', 'near-expiry', 'add-cap', 'stop-pending', 'ended', 'offline', 'ended-zero', 'setup-max']
SMALL = ['setup-pick', 'setup-custom', 'available', 'offline', 'ended', 'setting', 'near-expiry', 'add-cap', 'stop-pending', 'ended-zero']
SC = 0.42
def font(n):
    for f in ['/System/Library/Fonts/Supplemental/Arial.ttf', '/Library/Fonts/Arial.ttf']:
        try: return ImageFont.truetype(f, n)
        except OSError: pass
    return ImageFont.load_default()
F, FT = font(20), font(30)
def tile(path):
    im = Image.open(path).convert('RGB'); return im.resize((round(im.width * SC), round(im.height * SC)), Image.LANCZOS)
def grid(rows, title, out):
    pad, lab = 24, 34
    tiles = [[(t, tile(S / f'{f}.png')) for (t, f) in r if (S / f'{f}.png').exists()] for r in rows]
    W = max(sum(im.width + pad for _, im in r) for r in tiles) + pad
    H = 70 + sum(max(im.height for _, im in r) + lab + pad for r in tiles)
    sheet = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(sheet)
    d.text((pad, 20), title, fill='black', font=FT)
    y = 70
    for r in tiles:
        x = pad
        for t, im in r:
            d.text((x, y), t, fill=(60, 60, 60), font=F); sheet.paste(im, (x, y + lab))
            d.rectangle([x - 1, y + lab - 1, x + im.width, y + lab + im.height], outline=(200, 200, 200))
            x += im.width + pad
        y += max(im.height for _, im in r) + lab + pad
    sheet.save(RUN / out, optimize=True); print(out, sheet.size)
for o in 'abc':
    r1 = [(f'{s} · 390×844', f'{o}_{s}_w390x844') for s in BIG]
    r2 = []
    for s in SMALL:
        r2.append((f'{s} · 360×640', f'{o}_{s}_w360x640'))
        if (S / f'{o}_{s}_w360x640_end.png').exists(): r2.append((f'{s} · 360×640 scrolled to end', f'{o}_{s}_w360x640_end'))
    grid([r1, r2], f'Option {NAMES[o]} — Home render options 2026-11-11 (agreed blocks)', f'option-{o}.png')
rows = [[(f'{o.upper()} · {s} · {w}', f'{o}_{s}_w{w}') for s in ('setup-pick', 'available') for w in ('390x844', '360x640')] for o in 'abc']
grid(rows, 'Compare — setup (quick pick) and available, options A / B / C, 390×844 and 360×640', 'compare.png')

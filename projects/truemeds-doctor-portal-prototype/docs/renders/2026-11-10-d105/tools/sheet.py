"""D-105 before / after sheet: each unlock state, old picture | new picture, at 390 and 360.
Run from the project folder:  python3 docs/renders/2026-11-10-d105/tools/sheet.py
Writes before-after-390.png and before-after-360.png in docs/renders/2026-11-10-d105/."""
import pathlib
from PIL import Image, ImageDraw, ImageFont
D = pathlib.Path('docs/renders/2026-11-10-d105')
STATES = ['fingerprint', 'face', 'screen-lock', 'pending', 'cancelled', 'platform-retry', 'unavailable']
def font(size):
    for f in ['/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc']:
        try: return ImageFont.truetype(f, size)
        except OSError: pass
    return ImageFont.load_default()
F, FB = font(26), font(34)
for w in (390, 360):
    pics = [(s, Image.open(D / 'before' / f'unlock_{s}_w{w}.png'), Image.open(D / 'new' / f'unlock_{s}_w{w}.png')) for s in STATES]
    pw, ph = pics[0][1].size
    sc = 0.5; tw, th = int(pw * sc), int(ph * sc)
    gap, lab, cols = 24, 44, 4   # 4 pairs per row
    pair_w = tw * 2 + 12
    rows = (len(pics) + cols - 1) // cols
    W = gap + cols * (pair_w + gap); H = 90 + rows * (th + lab + gap)
    sheet = Image.new('RGB', (W, H), (244, 245, 247)); d = ImageDraw.Draw(sheet)
    d.text((gap, 24), f'D-105 returning unlock at {w}: before (left) | after (right). Only the action bar changes: "Not you? Switch account" removed.', fill=(31, 35, 40), font=FB)
    for k, (s, a, b) in enumerate(pics):
        x = gap + (k % cols) * (pair_w + gap); y = 90 + (k // cols) * (th + lab + gap)
        d.text((x, y + 6), f'unlock_{s}   before | after', fill=(31, 35, 40), font=F)
        sheet.paste(a.resize((tw, th), Image.LANCZOS), (x, y + lab))
        sheet.paste(b.resize((tw, th), Image.LANCZOS), (x + tw + 12, y + lab))
    sheet.save(D / f'before-after-{w}.png')
    print(D / f'before-after-{w}.png', sheet.size)

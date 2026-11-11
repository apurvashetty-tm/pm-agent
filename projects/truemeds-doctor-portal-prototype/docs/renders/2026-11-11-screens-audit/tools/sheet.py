"""Screens audit: one measure sheet per screen with every below-band block outlined and its gap to the block above drawn on.
  python3 tools/sheet.py <run folder> before   -> measure-<screen>.png
  python3 tools/sheet.py <run folder> after    -> after-<screen>.png
Row 1 = 390x844, row 2 = 360x640, every state, 1 CSS px = 1 px. Gap colours: green = 8 / 16 / 32 or a component's own
spec (0 inside a text pair, 4 wheel head, 24 sheet actions); amber = anything else. Blue outline = control, grey = text,
purple = notice, dashed red line = pinned bar top."""
import sys, json, pathlib
from PIL import Image, ImageDraw, ImageFont
RUN = pathlib.Path(sys.argv[1]).resolve(); MODE = sys.argv[2] if len(sys.argv) > 2 else 'before'
SRC = RUN / 'shots' / ('all' if MODE == 'before' else 'after')
M = json.loads((RUN / ('measure.json' if MODE == 'before' else 'after-measure.json')).read_text())
OK = {0, 4, 8, 16, 24, 32}
def font(sz, bold=False):
    for f in (['/System/Library/Fonts/Supplemental/Arial Bold.ttf'] if bold else []) + ['/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc']:
        try: return ImageFont.truetype(f, sz)
        except OSError: pass
    return ImageFont.load_default()
F, FB, FH = font(11), font(13, True), font(20, True)
GROUPS = {'sign-in': [('sign-in', None)], 'otp': [('otp', None)], 'faster-signin-offer': [('faster-signin-offer', None)],
          'returning-unlock': [('returning-unlock', None)], 'home': [('home-v3', None), ('home', None)]}
GAP = 16; HEAD = 40; LAB = 22
for name, parts in GROUPS.items():
    cols = [(scr, st) for scr, _ in parts for st in M.get(scr, {})]
    W = GAP + len(cols) * (390 + GAP); H = HEAD + 2 * (LAB + 844 + GAP) + GAP
    sheet = Image.new('RGB', (W, H), (246, 247, 249)); d = ImageDraw.Draw(sheet)
    d.text((GAP, 10), f"{name} — {'BEFORE (approved today)' if MODE == 'before' else 'AFTER (agreed changes applied)'} · every block below the band outlined, gap to the block above in px (green = 8/16/32 or component spec, amber = off-scale) · dashed red = bar top", fill=(17, 24, 39), font=FH)
    y0 = HEAD
    for size, w, h in [('390x844', 390, 844), ('360x640', 360, 640)]:
        x = GAP
        for scr, st in cols:
            m = M[scr][st].get(size)
            if not m: x += 390 + GAP; continue
            im = Image.open(SRC / f'{scr}_{st}_w{size}.png'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
            ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
            for b in m['blocks']:
                if b['cls'].startswith('tm-icon') and b['w'] <= 24: continue
                col = (37, 99, 235, 200) if b.get('interactive') else (147, 51, 234, 200) if b.get('notice') else (107, 114, 128, 150)
                od.rectangle((b['x'], b['y'], b['x'] + b['w'], b['y'] + b['h']), outline=col, width=1)
                g = b.get('gapAbove')
                if g is not None and g > 0.5 and b['x'] < 200:
                    gx = max(2, b['x'] - 6) if b['x'] > 8 else b['x'] + b['w'] - 30
                    gc = (22, 163, 74, 255) if round(g) in OK else (217, 119, 6, 255)
                    od.line((gx, b['y'] - g, gx, b['y']), fill=gc, width=2)
                    od.rectangle((gx + 2, b['y'] - g / 2 - 7, gx + 30, b['y'] - g / 2 + 7), fill=(255, 255, 255, 230))
                    od.text((gx + 4, b['y'] - g / 2 - 6), f"{g:g}", fill=gc, font=F)
            if m.get('barTop') is not None:
                for xx in range(0, im.width, 8): od.line((xx, m['barTop'], xx + 4, m['barTop']), fill=(220, 38, 38, 255), width=1)
            im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
            sheet.paste(im, (x, y0 + LAB)); d.rectangle((x - 1, y0 + LAB - 1, x + im.width, y0 + LAB + im.height), outline=(200, 204, 212))
            d.text((x, y0 + 4), f"{scr}/{st} · {size}" + (f" · content→bar {m['contentToBar']}" if m.get('contentToBar') is not None else ''), fill=(17, 24, 39), font=FB)
            x += 390 + GAP
        y0 += LAB + 844 + GAP
    out = RUN / (f'measure-{name}.png' if MODE == 'before' else f'after-{name}.png')
    sheet.save(out, optimize=True); print(out.name, sheet.size)

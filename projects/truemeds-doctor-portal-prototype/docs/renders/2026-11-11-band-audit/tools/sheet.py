"""Comparison sheet: the band of every in-scope screen side by side, same scale (1 CSS px = 1 px), numbers under each.
  python3 tools/sheet.py <run folder> before   -> bands.png  (+ shots/<screen>_<state>_w<size>.png, the Codex attachments)
  python3 tools/sheet.py <run folder> after    -> after.png
Row 1 = 390 x 844, row 2 = 360 x 640. A dashed guide marks y = 173 (panel top of a one-line title + one-line subtitle band at logo->title 16)."""
import sys, json, pathlib, shutil
from PIL import Image, ImageDraw, ImageFont
RUN = pathlib.Path(sys.argv[1]).resolve(); MODE = sys.argv[2] if len(sys.argv) > 2 else 'before'
SRC = RUN / 'shots' / ('all' if MODE == 'before' else 'after')
M = json.loads((RUN / ('measure.json' if MODE == 'before' else 'after-measure.json')).read_text())
COLS = [('sign-in', 'default', 'Sign-in'), ('otp', 'default', 'OTP'), ('faster-signin-offer', 'fingerprint', 'Faster sign-in offer'),
        ('returning-unlock', 'fingerprint', 'Returning unlock'), ('home', 'setup-wheel', 'Home setup (approved)'),
        ('home', 'active', 'Home active (approved)'), ('home', 'expired-pending', 'Home expired-pending (approved)'),
        ('home-v3', 'setup', 'Home v3 setup'), ('home-v3', 'available', 'Home v3 available')]
CROP = 330; GAP = 24; TXT = 250; HEAD = 40
def font(sz, bold=False):
    for f in (['/System/Library/Fonts/Supplemental/Arial Bold.ttf'] if bold else []) + ['/System/Library/Fonts/Supplemental/Arial.ttf', '/System/Library/Fonts/Helvetica.ttc']:
        try: return ImageFont.truetype(f, sz)
        except OSError: pass
    return ImageFont.load_default()
F, FB, FH = font(13), font(14, True), font(20, True)
W = GAP + sum(390 + GAP for _ in COLS)
rows = [('390x844', 390), ('360x640', 360)]
H = HEAD + len(rows) * (CROP + TXT + GAP + 24) + GAP
sheet = Image.new('RGB', (W, H), (246, 247, 249)); d = ImageDraw.Draw(sheet)
d.text((GAP, 10), f"Band audit — {'BEFORE (approved today)' if MODE == 'before' else 'AFTER (one band spec applied)'} · 1 CSS px = 1 px · dashed line = y 173", fill=(17, 24, 39), font=FH)
y0 = HEAD
for size, w in rows:
    d.text((GAP, y0), f'{size}', fill=(17, 24, 39), font=FB); y0 += 24
    x = GAP
    for screen, state, label in COLS:
        if screen == 'home-v3' and False: pass
        o = M[screen][state][size]
        im = Image.open(SRC / f'{screen}_{state}_w{size}.png')
        im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS).crop((0, 0, w, CROP))
        sheet.paste(im, (x, y0))
        d.rectangle((x - 1, y0 - 1, x + w, y0 + CROP), outline=(200, 204, 212))
        for xx in range(x, x + w, 8): d.line((xx, y0 + 173, xx + 4, y0 + 173), fill=(220, 38, 38), width=1)
        t, s = o['title'], o['sub'] or {}
        lines = [label,
                 f"logo top {o['logo']['top']} · w {o['logo']['w']} · h {o['logo']['h']}",
                 f"header icons: {o['headerIcons']['n']} × {o['headerIcons']['size']}, glyph {o['headerIcons']['glyphRight']} from edge" if o['headerIcons'] else 'header icons: none',
                 f"logo → title {o['logoToTitle']}",
                 f"title {t['size']}/{t['lh']} {t['weight']} · {t['lines']} line{'s' if t['lines'] > 1 else ''} · text {t['textW']} / {t['boxW']}",
                 f"title → sub {o['titleToSub']}",
                 f"sub {s.get('size')}/{s.get('lh')} grey · box {s.get('h')} tall" if s else 'no subtitle',
                 f"sub → panel {o['subToPanel']}",
                 f"panel top {o['panel']['top']} = {o['bandPct']} % of screen",
                 f"panel radius {o['panel']['radius']} · top pad {o['panel']['padTop']}",
                 f"“{t['text']}”", f"“{s.get('text', '')}”"]
        yy = y0 + CROP + 8
        for i, ln in enumerate(lines):
            col = (17, 24, 39) if i == 0 else (55, 65, 81)
            if i in (3, 4, 7, 8) and MODE == 'before':
                ref = {3: 16, 7: 32}.get(i)
                if i == 3 and o['logoToTitle'] != 16: col = (180, 83, 9)
                if i == 4 and t['lines'] > 1: col = (180, 83, 9)
                if i == 8 and o['panel']['top'] != 173: col = (180, 83, 9)
            d.text((x, yy), ln, fill=col, font=FB if i == 0 else F); yy += 19
        x += 390 + GAP
    y0 += CROP + TXT + GAP
sheet.save(RUN / ('bands.png' if MODE == 'before' else 'after.png'))
if MODE == 'before':   # one picture per screen and size for the Codex review
    for screen, state, _ in COLS:
        for size, _ in rows:
            shutil.copy(SRC / f'{screen}_{state}_w{size}.png', RUN / 'shots' / f'{screen}_{state}_w{size}.png')
print('ok', sheet.size)

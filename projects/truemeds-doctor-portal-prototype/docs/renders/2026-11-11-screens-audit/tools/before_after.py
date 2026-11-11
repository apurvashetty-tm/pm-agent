"""Screens audit: one overview, before (top) vs after (bottom) for the states the agreed changes touch.
  python3 tools/before_after.py <run>  -> before-after.png"""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
RUN = pathlib.Path(sys.argv[1]).resolve()
def font(sz, bold=False):
    for f in (['/System/Library/Fonts/Supplemental/Arial Bold.ttf'] if bold else []) + ['/System/Library/Fonts/Supplemental/Arial.ttf']:
        try: return ImageFont.truetype(f, sz)
        except OSError: pass
    return ImageFont.load_default()
F, FB, FH = font(13), font(14, True), font(22, True)
COLS = [('sign-in', 'default', '390x844', 'Sign-in: band 16 + "an OTP by SMS"'),
        ('sign-in', 'couldnt-send', '390x844', 'Sign-in: "Couldn’t send the OTP."'),
        ('otp', 'default', '390x844', 'OTP: consent → Verify 16'),
        ('otp', 'locked', '390x844', 'OTP: code → notice 16, notice → Verify 16'),
        ('otp', 'new-code-sent', '390x844', 'OTP: "New code sent."'),
        ('faster-signin-offer', 'fingerprint', '390x844', 'Offer: point 1 + semibold titles'),
        ('faster-signin-offer', 'enable-failed', '360x640', 'Offer 360: band fix, scroll cue'),
        ('returning-unlock', 'fingerprint', '390x844', 'Unlock: no change'),
        ('home-v3', 'setup', '390x844', 'Home v3 setup: Minimum 15 minutes'),
        ('home', 'add-wheel', '390x844', 'Add-time sheet: title, picker, subtitle 8'),
        ('home', 'add-failed', '360x640', 'Add-time sheet 360: error above Add'),
        ('home', 'end-confirmation', '390x844', 'End sheet: subtitle 8, "get"')]
GAP, HEAD, LAB = 16, 44, 40
W = GAP + len(COLS) * (390 + GAP); H = HEAD + 2 * (LAB + 844 + GAP) + GAP
s = Image.new('RGB', (W, H), (246, 247, 249)); d = ImageDraw.Draw(s)
d.text((GAP, 10), 'Screens audit — BEFORE (row 1, approved today) vs AFTER (row 2: band spec + agreed below-band changes, injected at capture time)', fill=(17, 24, 39), font=FH)
for r, mode in enumerate(['all', 'after']):
    y = HEAD + r * (LAB + 844 + GAP); x = GAP
    for scr, st, size, label in COLS:
        im = Image.open(RUN / 'shots' / mode / f'{scr}_{st}_w{size}.png'); im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        d.text((x, y + 4), ('BEFORE · ' if r == 0 else 'AFTER · ') + f'{scr}/{st} · {size}', fill=(17, 24, 39), font=FB)
        d.text((x, y + 22), label, fill=(55, 65, 81), font=F)
        s.paste(im, (x, y + LAB)); d.rectangle((x - 1, y + LAB - 1, x + im.width, y + LAB + im.height), outline=(200, 204, 212))
        x += 390 + GAP
s.save(RUN / 'before-after.png', optimize=True); print('before-after.png', s.size)

"""Session 4 contact sheet: what session 4 built — the review panel (1280 x 800, Story and Call simulator open), the phone drawer
(390, on sign-in and after the transition to OTP), the decoded QR — then every step-1 state at 390 from the compare harness
(approved | built | heatmap, regions boxed: orange = anti-aliasing (old Mac), blue = listed, grey = spinner mask).
Usage: python3 build-sheet.py   (reads session-4/panel/ and compare/; writes session-4/sheet.png)"""
import pathlib
from PIL import Image, ImageDraw
HERE = pathlib.Path(__file__).resolve().parent.parent
REC = HERE.parent
panel = HERE / 'panel'; cmp_ = REC / 'compare'
W = 2400
tops = [Image.open(panel / f) for f in ['panel-1280-story.png', 'panel-1280-call.png']]
drw = [Image.open(panel / f) for f in ['drawer-390-sign-in.png', 'drawer-390-otp.png']]
sheets = sorted(cmp_.glob('*_w390.png'))
cols, tw = 4, (W - 5 * 20) // 4
th = int(tw * Image.open(sheets[0]).height / Image.open(sheets[0]).width)
rows = (len(sheets) + cols - 1) // cols
top_h = int(tops[0].height * (W / 2 - 30) / tops[0].width)
drw_h = 700
H = 60 + top_h + 40 + drw_h + 60 + rows * (th + 40) + 40
out = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(out)
d.text((20, 20), 'Session 4 (2026-11-09): review panel at 1280 x 800 (Story open | Call simulator open) - drawer at 390 (sign-in | after the move to OTP) - QR at 160 px - 42 step-1 states at 390: approved | built | heatmap', fill='black')
for i, im in enumerate(tops):
    out.paste(im.resize((W // 2 - 30, top_h)), (20 + i * (W // 2), 60))
y = 60 + top_h + 40
x = 20
for im in drw:
    s = drw_h / im.height; r = im.resize((int(im.width * s), drw_h)); out.paste(r, (x, y)); x += r.width + 20
qr = Image.open(panel / 'qr-160.png'); out.paste(qr.resize((320, 320)), (x + 20, y)); d.text((x + 20, y + 330), 'QR as shown (160 px), decoded back by test P7', fill='black')
y += drw_h + 60
for i, f in enumerate(sheets):
    r, c = divmod(i, cols)
    im = Image.open(f).resize((tw, th)); px, py = 20 + c * (tw + 20), y + r * (th + 40)
    d.text((px, py), f.stem, fill='black'); out.paste(im, (px, py + 16))
out.save(HERE / 'sheet.png', optimize=True)
print('sheet', out.size, len(sheets), 'states')

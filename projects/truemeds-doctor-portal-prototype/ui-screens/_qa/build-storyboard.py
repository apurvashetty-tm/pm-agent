from PIL import Image, ImageDraw, ImageFont
import pathlib
R7 = pathlib.Path('docs/renders/2026-10-22-calling/round-7')
R8 = pathlib.Path('docs/renders/2026-10-26-margin-16/round-1/calling')

def src(rid):
    return pathlib.Path('ui-screens/case') / f'{rid}_w390.png'   # close-out / status-line round: promoted pictures
GROUPS = [
 ('A. Start and live call', [('t01-ready','1 Ready'),('t02-calling','2 Calling'),('s7a-calling','7a Calling'),('t03-not-through','3 Not through'),('t04-doctor-missed','4 Doctor missed'),('t05-result-wait','5 Result wait'),('t06-ended-early','6 Too short')]),
 ('B. State 7 (no call result)', [('s7b-still-on-call','7b Still on call?'),('s7c-checking','7c Checking'),('s7d-result-missing','7d Result missing'), ('s7d-unavailable-sheet','7d Unavailable sheet'),('s7e-leave-sheet','7e Leave sheet'),('s7f-submitted','7f Submitted')]),
 ('C. Valid, closed, unavailable', [('t08a-valid-cat4','8a Valid Cat4'),('t08b-valid-forward','8b Valid forward'),('t08c-confirm-blocked','8c Confirm blocked'),('t09-patient-unavailable','9 Unavailable'),('t10a-confirmed','10a Confirmed'),('t10b-forwarded','10b Forwarded')]),
 ('D. Transfer', [('t11-calling-transfer','11 Calling transfer'),('t12-transfer-ready','12 Transfer ready'),('t13-connecting-ha','13 Transferring'),('t14-transferred','14 Transferred'),('t15-ha-no-join','15 HA unavailable'),('t15b-end-call-first','15b End call first'),('t16-transfer-missed','16 Missed (doctor)'),('t16b-transfer-missed-patient','16b Missed (patient)'),('t16c-transfer-missed-unknown','16c Missed (unknown)'),('t17-skip-ha-wait','17 Skip HA wait')]),
 ('E. Fallback B', [('g1-generic-confirm','g1 Generic confirm'),('g2-checking-ha','g2 Checking HA'),('g3b-forwarded','g3b Forwarded')]),
]
W, H = 390, 844
SCALE = 0.5          # thumbnails at half of the 2x render (390 css px wide)
TW, TH = int(W * 2 * SCALE), int(H * 2 * SCALE)
PAD, LAB, HEAD = 16, 28, 44
font = ImageFont.load_default(size=22)
hfont = ImageFont.load_default(size=30)
ncols = 9
rows = []
for title, items in GROUPS:
    nrows = (len(items) + ncols - 1) // ncols
    rows.append((title, items, nrows))
total_rows = sum(r[2] for r in rows)
board_w = PAD + ncols * (TW + PAD)
board_h = PAD + sum(HEAD + r[2] * (TH + LAB + PAD) for r in rows)
board = Image.new('RGB', (board_w, board_h), (244, 246, 248))
d = ImageDraw.Draw(board)
y = PAD
for title, items, nrows in rows:
    d.text((PAD, y), title, fill=(20, 24, 31), font=hfont)
    y += HEAD
    for i, (rid, label) in enumerate(items):
        c, r = i % ncols, i // ncols
        x = PAD + c * (TW + PAD)
        yy = y + r * (TH + LAB + PAD)
        im = Image.open(src(rid)).convert('RGB').resize((TW, TH), Image.LANCZOS)
        board.paste(im, (x, yy))
        d.rectangle([x - 1, yy - 1, x + TW, yy + TH], outline=(200, 205, 212))
        d.text((x, yy + TH + 4), label, fill=(60, 66, 76), font=font)
    y += nrows * (TH + LAB + PAD)
out = pathlib.Path('docs/renders/2026-10-22-calling/storyboard-final.png')
board.save(out)
print(out, board.size)

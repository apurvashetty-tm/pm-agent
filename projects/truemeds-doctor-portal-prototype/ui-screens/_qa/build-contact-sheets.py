"""Rebuild the folder contact sheets in ui-screens/ from the 390 pictures (Round 3, 2026-10-31).

Run from the project folder:  python3 ui-screens/_qa/build-contact-sheets.py
Each sheet lists every 390 picture in its folder, sorted by file name, nine to a row, labelled with the state id.
Also copies the calling storyboard (built by build-storyboard.py) to case/contact-call.png.
"""
import pathlib
import shutil

from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[2]         # project folder
UI = ROOT / 'ui-screens'
SHEETS = {  # folder -> (picture prefix, sheet name)
    'sign-in': ('sign-in_', 'contact-sign-in.png'),
    'otp': ('otp_', 'contact-otp.png'),
    'returning-unlock': ('unlock_', 'contact-returning-unlock.png'),
    'faster-signin-offer': ('offer_', 'contact-faster-signin-offer.png'),
    'home': ('home_', 'contact-home.png'),
    'prescribe': ('', 'contact-prescribe.png'),
    'case': ('', 'contact-case.png'),
}
COLS, TW, PAD, LAB = 9, 130, 8, 22
FONT = ImageFont.load_default(size=16)


def sheet(files, out):
    th = int(TW * 1688 / 780)
    rows = (len(files) + COLS - 1) // COLS
    im = Image.new('RGB', (COLS * (TW + PAD) + PAD, rows * (th + LAB + PAD) + PAD), (246, 246, 248))
    draw = ImageDraw.Draw(im)
    for i, f in enumerate(files):
        r, c = divmod(i, COLS)
        x, y = PAD + c * (TW + PAD), PAD + r * (th + LAB + PAD)
        im.paste(Image.open(f).convert('RGB').resize((TW, th), Image.LANCZOS), (x, y + LAB))
        draw.text((x, y + 2), f.name[:-len('_w390.png')], fill=(40, 40, 50), font=FONT)
    im.save(out)
    print(out.relative_to(ROOT), len(files), 'states')


def main():
    for folder, (prefix, name) in SHEETS.items():
        files = sorted((UI / folder).glob(f'{prefix}*_w390.png'))
        if prefix == '':
            files = [f for f in files if not f.name.startswith(('home_', 'sign-in_', 'otp_', 'unlock_', 'offer_', 'contact'))]
        sheet(files, UI / folder / name)
    storyboard = ROOT / 'docs/renders/2026-10-22-calling/storyboard-final.png'
    if storyboard.exists():
        shutil.copy(storyboard, UI / 'case/contact-call.png')
        print('case/contact-call.png <- storyboard-final.png')


if __name__ == '__main__':
    main()

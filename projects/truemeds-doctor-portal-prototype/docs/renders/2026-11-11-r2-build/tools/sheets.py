"""F1 + U2 review sheets. Run from the project folder: python3 docs/renders/2026-11-11-r2-build/tools/sheets.py
- all-screens.png: every in-scope screen and state at 390 wide, one scale (half size), in flow order:
  sign-in → OTP → offer → Home setup → Home available (+ sheets) ; returning unlock → Home ; the case-page sheets whose
  subtitle moved (ruling 2026-11-11 10:32).
- before-after-<screen>-<w>.png: the committed picture (git HEAD) | the new picture, per state, at 390 and 360.
"""
import io, pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path('.')
OUT = ROOT / 'docs/renders/2026-11-11-r2-build'
FONT = ImageFont.load_default(size=18)
SMALL = ImageFont.load_default(size=15)
SCALE = 0.5

ROWS = [
    ('Sign-in', 'sign-in', ['default', 'keyboard-open', 'empty-tap', 'too-short', 'wrong-first-digit', 'pasted-cleaned', 'sending', 'not-registered', 'offline', 'couldnt-send', 'too-many-tries', 'inactive'], 'sign-in'),
    ('OTP', 'otp', ['default', 'empty-tap', 'too-short', 'verifying', 'wrong-code', 'two-tries-left', 'resend-available', 'new-code-sent', 'code-expired', 'couldnt-verify', 'too-many-resends', 'locked', 'resending', 'resend-failed', 'offline', 'cooldown-reconciling', 'expired-and-resend-limited'], 'otp'),
    ('Faster sign-in offer', 'faster-signin-offer', ['fingerprint', 'face-id', 'screen-lock', 'enabling', 'enable-failed', 'offline', 'unavailable'], 'offer'),
    ('Home · setup', 'home', ['setup-wheel', 'setting', 'setup-failed', 'idle-expired', 'manually-ended'], 'home'),
    ('Home · available and sheets', 'home', ['active', 'requesting', 'no-cases', 'request-failed', 'unknown-result', 'offline', 'near-expiry', 'add-wheel', 'adding', 'add-failed', 'added', 'end-confirmation', 'stop-pending', 'expired-pending', 'logout-confirm'], 'home'),
    ('Returning unlock → Home', 'returning-unlock', ['fingerprint', 'face', 'screen-lock', 'pending', 'cancelled', 'platform-retry', 'unavailable'], 'unlock'),
    ('Case page sheets (subtitle in the header only)', None, [('case', 'a-leave-sheet'), ('case', 's7e-leave-sheet'), ('case', 'a-releasing'), ('prescribe', 'd-discard-sheet')], None),
]


def files(row, w):
    title, folder, states, prefix = row
    if folder is None:
        return [(f'{fo}/{s}_w{w}.png', s) for fo, s in states]
    return [(f'{folder}/{prefix}_{s}_w{w}.png', f'{prefix}_{s}') for s in states]


def thumb(im):
    return im.resize((int(im.width * SCALE / 2 * 2 // 2), int(im.height * SCALE)), Image.LANCZOS) if SCALE != 1 else im


def all_screens():
    PAD, LAB, HEAD = 16, 26, 34
    tw, th = int(780 * SCALE), int(1688 * SCALE)
    cols = max(len(r[2]) for r in ROWS)
    W = PAD + cols * (tw + PAD)
    H = PAD + sum(HEAD + th + LAB + PAD for _ in ROWS)
    sheet = Image.new('RGB', (W, H), (246, 246, 248)); d = ImageDraw.Draw(sheet)
    y = PAD
    for row in ROWS:
        d.text((PAD, y + 6), row[0], fill=(30, 30, 40), font=FONT); y += HEAD
        for i, (rel, label) in enumerate(files(row, 390)):
            im = Image.open(ROOT / 'ui-screens' / rel).convert('RGB').resize((tw, th), Image.LANCZOS)
            x = PAD + i * (tw + PAD); sheet.paste(im, (x, y)); d.text((x, y + th + 4), label, fill=(60, 60, 70), font=SMALL)
        y += th + LAB + PAD
    sheet.save(OUT / 'all-screens.png', optimize=True)
    print('all-screens.png', sheet.size)


def head(rel):
    try:
        b = subprocess.run(['git', 'show', f'HEAD:./ui-screens/{rel}'], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(b)).convert('RGB')
    except subprocess.CalledProcessError:
        return None


def before_after():
    PAD, LAB = 12, 24
    for row in ROWS:
        key = {'Sign-in': 'sign-in', 'OTP': 'otp', 'Faster sign-in offer': 'offer', 'Home · setup': 'home-setup', 'Home · available and sheets': 'home-available',
               'Returning unlock → Home': 'unlock'}.get(row[0], 'case-sheets')
        for w in (390, 360):
            pairs = []
            for rel, label in files(row, w):
                a, b = head(rel), Image.open(ROOT / 'ui-screens' / rel).convert('RGB')
                pairs.append((label, a, b))
            tw = int(w * 2 * SCALE)
            th = max(int(p[2].height * SCALE) for p in pairs)
            per = 4   # pairs per row
            nrow = (len(pairs) + per - 1) // per
            W = PAD + per * (2 * tw + 3 * PAD)
            H = PAD + nrow * (th + LAB + PAD)
            sheet = Image.new('RGB', (W, H), (246, 246, 248)); d = ImageDraw.Draw(sheet)
            for i, (label, a, b) in enumerate(pairs):
                x = PAD + (i % per) * (2 * tw + 3 * PAD); y = PAD + (i // per) * (th + LAB + PAD)
                for j, im in enumerate((a, b)):
                    if im is None: continue
                    t = im.resize((tw, int(im.height * SCALE)), Image.LANCZOS)
                    sheet.paste(t, (x + j * (tw + PAD), y))
                d.text((x, y + th + 4), f'{label}  (before | after)', fill=(60, 60, 70), font=SMALL)
            name = f'before-after-{key}-{w}.png'
            sheet.save(OUT / 'before-after' / name, optimize=True)
            print(name, sheet.size)


(OUT / 'before-after').mkdir(exist_ok=True)
all_screens()
before_after()

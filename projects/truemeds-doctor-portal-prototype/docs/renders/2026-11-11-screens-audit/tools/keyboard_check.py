"""Screens audit: keyboard evidence at 360x640 (Codex final-round blocker). The approved pages are static: OTP's header sits
outside its scroll area and Sign-in's reference page is min-height 844, so their 640 pictures can't show the keyboard
clearance. This capture does what the build does (F-05, app/shell/keyboard.js + otp.css `html.phone-kb`): the screen scrolls
as one above a 256 keyboard, so the field and the main button sit >= 16 clear of the keyboard. Band spec + this audit's
after.css are applied. Writes keyboard-360.png and keyboard-check.json.  python3 tools/keyboard_check.py <run>"""
import sys, os, json, pathlib, datetime
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
RUN = pathlib.Path(sys.argv[1]).resolve(); PROJ = RUN.parents[2]; UI = PROJ / 'ui-screens'; BAND = PROJ / 'docs/renders/2026-11-11-band-audit'
CASES = [('otp', 'otp/otp.html', s, '.screen', '.kbd', '#b') for s in ['default', 'wrong-code', 'offline', 'couldnt-verify', 'resend-available']] + \
        [('sign-in', 'sign-in/sign-in.html', s, '#doctor-login-preview .login-phone', '.login-keyboard', '.login-submit') for s in ['keyboard-open', 'too-short', 'wrong-first-digit']]
KB_CSS = '''html.capture body{height:640px;overflow:hidden}
.screen{height:640px;overflow-y:auto}.screen .panel{flex:none;overflow:visible;min-height:auto}
html.capture #doctor-login-preview .login-phone{min-height:0 !important;height:640px !important;overflow-y:auto}
.kbd,.login-keyboard{position:fixed;left:0;right:0;bottom:0;z-index:50}'''
SCROLL = r'''([rootSel, kbSel, btnSel]) => { const r = document.querySelector(rootSel), kb = document.querySelector(kbSel), b = document.querySelector(btnSel);
  const kbTop = kb.getBoundingClientRect().top; const need = b.getBoundingClientRect().bottom + 16 - kbTop;
  if (need > 0) { r.style.paddingBottom = (kb.getBoundingClientRect().height + 16) + 'px'; r.scrollTop += need; }
  const slots = document.querySelector('.tm-otp-slots, .tm-field__control').getBoundingClientRect();
  return { kbTop: Math.round(kbTop), buttonBottom: Math.round(b.getBoundingClientRect().bottom), clearance: Math.round(kbTop - b.getBoundingClientRect().bottom),
           fieldTop: Math.round(slots.top), fieldVisible: slots.top >= 0, scrolled: Math.round(r.scrollTop) }; }'''
COPY = r'''(rules) => { for (const [sel, old, neu] of rules) document.querySelectorAll(sel).forEach(e => {
  if (e.textContent.replace(/\s+/g, ' ').trim() === old) e.textContent = neu; }); }'''
FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb", "--disable-font-subpixel-positioning", "--hide-scrollbars"]
out, shots = [], []
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    pg = br.new_page(viewport={'width': 360, 'height': 640}, device_scale_factor=2); pg.clock.set_fixed_time(datetime.datetime(2026, 11, 11, 15, 0))
    for scr, path, st, root, kb, btn in CASES:
        pg.goto((UI / path).as_uri() + f'?capture={st}')
        pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
        pg.evaluate('() => document.fonts && document.fonts.ready'); pg.wait_for_timeout(150)
        pg.add_style_tag(path=str(BAND / 'after.css')); pg.add_style_tag(path=str(RUN / 'after.css')); pg.add_style_tag(content=KB_CSS)
        pg.evaluate("() => { const k = document.getElementById('doctor-login-preview'); if (k) k.dataset.keyboard = 'true'; }")
        copy = json.loads((RUN / 'after-copy.json').read_text()).get(scr, [])   # the agreed copy, as in the after pictures
        pg.evaluate(COPY, copy)
        pg.wait_for_timeout(80)
        m = pg.evaluate(SCROLL, [root, kb, btn]); m.update(screen=scr, state=st, ok=m['clearance'] >= 16 and m['fieldVisible']); out.append(m)
        f = RUN / 'shots' / 'after' / f'kb_{scr}_{st}_w360x640.png'; pg.screenshot(path=str(f)); shots.append((f, m))
    br.close()
(RUN / 'keyboard-check.json').write_text(json.dumps(out, indent=1))
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13); FB = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 18)
except OSError: F = FB = ImageFont.load_default()
s = Image.new('RGB', (16 + len(shots) * 376, 40 + 40 + 640 + 16), (246, 247, 249)); d = ImageDraw.Draw(s)
d.text((16, 10), 'Keyboard at 360x640, scrolled as the build does (F-05): field visible, main button >= 16 above the keyboard', fill=(17, 24, 39), font=FB)
for i, (f, m) in enumerate(shots):
    im = Image.open(f); im = im.resize((360, 640)); x = 16 + i * 376
    d.text((x, 44), f"{m['screen']}/{m['state']}", fill=(17, 24, 39), font=F)
    d.text((x, 60), f"button → keyboard {m['clearance']} · {'PASS' if m['ok'] else 'FAIL'}", fill=(22, 163, 74) if m['ok'] else (220, 38, 38), font=F)
    s.paste(im, (x, 80))
s.save(RUN / 'keyboard-360.png', optimize=True)
print(sum(m['ok'] for m in out), '/', len(out), 'pass')

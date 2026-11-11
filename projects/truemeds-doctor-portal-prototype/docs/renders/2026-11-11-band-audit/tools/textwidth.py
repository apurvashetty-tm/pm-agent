"""Measure candidate titles (L1 32/40 semibold) and subtitles (L3 14/20) in the design-system font, same Chrome flags.
  python3 tools/textwidth.py <run folder>   -> prints width per string and whether it fits one line at 390 (358) and 360 (328)."""
import sys, os, pathlib, json
from playwright.sync_api import sync_playwright
RUN = pathlib.Path(sys.argv[1]).resolve()
DS = RUN.parents[4] / 'design-system' / 'truemeds.css'
TITLES = ["Welcome, Doctor", "Verify your number", "Skip the OTP next time", "Skip OTPs next time", "Skip the OTP from now", "Hello, Dr. Kunal",
          "Start taking cases", "You're available", "You can take cases now", "You can take cases", "You're taking cases",
          "Taking cases now", "Cases are open now", "You're on for cases", "Ready for cases now", "Consult on your schedule",
          "Ending availability", "Your availability has ended", "Availability ended", "Hello, Dr. Raghavendra"]
SUBS = ["Request a case whenever you have a moment.", "Request one now, or whenever you're ready.", "Request a case now, or whenever you're ready.",
        "Request a case now or whenever you're free.", "You can request a case right now.", "Request a case now. Add time or stop anytime.",
        "You can add time or stop anytime.", "Choose how long you're available today.", "Your partner in thoughtful, affordable care.",
        "Sent to +91 98765 43210 · Change", "Use your fingerprint instead of waiting for an OTP.", "Let's check in on your patients today.",
        "You won't get new cases."]
FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
         "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"]
html = f'<link rel="stylesheet" href="{DS.as_uri()}"><body class="tm">' + ''.join(
    f'<div><span class="t tm-text-title-lg" style="white-space:nowrap">{t.replace(chr(39), "&rsquo;")}</span></div>' for t in TITLES) + ''.join(
    f'<div><span class="s" style="white-space:nowrap;font-size:var(--tm-font-size-body-md);line-height:var(--tm-font-lineheight-sm)">{s.replace(chr(39), "&rsquo;")}</span></div>' for s in SUBS)
(RUN / 'tools' / '_tw.html').write_text(html)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args=FLAGS)
    pg = br.new_page(viewport={'width': 1200, 'height': 900}); pg.goto((RUN / 'tools' / '_tw.html').as_uri())
    pg.evaluate('() => document.fonts.ready'); pg.wait_for_timeout(300)
    out = pg.evaluate('() => [...document.querySelectorAll(".t,.s")].map(e => [e.className[0], e.textContent, Math.round(e.getBoundingClientRect().width*10)/10])')
    br.close()
(RUN / 'tools' / '_tw.html').unlink()
res = [{'kind': 'title' if k == 't' else 'subtitle', 'text': t, 'w': w, 'fits390': w <= 358, 'fits360': w <= 328} for k, t, w in out]
(RUN / 'text-widths.json').write_text(json.dumps(res, indent=1, ensure_ascii=False))
for r in res: print(f"{r['kind']:8} {r['w']:6} 390:{'Y' if r['fits390'] else 'N'} 360:{'Y' if r['fits360'] else 'N'}  {r['text']}")

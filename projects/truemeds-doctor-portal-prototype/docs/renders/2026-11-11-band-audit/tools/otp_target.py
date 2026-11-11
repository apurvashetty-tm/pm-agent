"""Verify the after.css OTP 'Change' link at 390x844: hit-area box, subtitle line box, hit-test at its edges, focus outline.
  python3 tools/otp_target.py <run folder>  -> otp-target-check.json"""
import pathlib, json, sys
from playwright.sync_api import sync_playwright
RUN = pathlib.Path(sys.argv[1]).resolve(); UI = RUN.parents[2] / 'ui-screens'
JS = '''() => { const a = document.querySelector('.head a.lk'), p = a.parentElement, h = document.querySelector('.head h1');
  const A = a.getBoundingClientRect(), P = p.getBoundingClientRect(), H = h.getBoundingClientRect(); const x = A.left + A.width / 2;
  const hit = y => { const e = document.elementFromPoint(x, y); return !!(e && e.closest('a.lk')); };
  a.focus(); const c = getComputedStyle(a);
  return { linkBox: [Math.round(A.width), Math.round(A.height)], linkTop: Math.round(A.top), linkBottom: Math.round(A.bottom),
    subLineTop: Math.round(P.top), subLineH: Math.round(P.height), titleBottom: Math.round(H.bottom),
    hitTopEdge: hit(A.top + 1), hitBottomEdge: hit(A.bottom - 1), hitAbove: hit(A.top - 2),
    centreY: Math.round((A.top + A.bottom) / 2), hitCentreMinus23: hit((A.top + A.bottom) / 2 - 23), hitCentrePlus23: hit((A.top + A.bottom) / 2 + 23),
    hitCentreMinus26: hit((A.top + A.bottom) / 2 - 26), hitCentrePlus26: hit((A.top + A.bottom) / 2 + 26),
    focusOutline: c.outlineStyle + ' ' + c.outlineWidth, focusVisibleMatches: a.matches(':focus-visible') }; }'''
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    pg = br.new_page(viewport={'width': 390, 'height': 844})
    pg.goto((UI / 'otp/otp.html').as_uri() + '?capture=default')
    pg.add_style_tag(path=str(RUN / 'after.css')); pg.wait_for_timeout(200)
    pg.keyboard.press('Tab')   # make focus keyboard-originated so :focus-visible styling can apply
    r = pg.evaluate(JS)
    pg.query_selector('.top').screenshot(path=str(RUN / 'shots' / 'otp-change-target-after.png'))
    br.close()
(RUN / 'otp-target-check.json').write_text(json.dumps(r, indent=1))
print(json.dumps(r))

"""Probe: geometry and markup of the Home add-time sheet (read-only). python3 tools/probe_sheet.py <state>"""
import sys, pathlib
from playwright.sync_api import sync_playwright
u = (pathlib.Path(__file__).resolve().parents[4] / 'ui-screens/home/home.html').as_uri() + '?capture&state=' + (sys.argv[1] if len(sys.argv) > 1 else 'add-failed')
JS = r'''() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); const c = getComputedStyle(e);
  return [s, Math.round(b.top), Math.round(b.bottom), c.paddingTop, c.paddingBottom, c.marginTop, c.marginBottom]; };
  return ['.tm-sheet', '.tm-sheet__header', '.tm-sheet__title', '.tm-sheet__body', '.tm-sheet__subtitle', '.sheet-feedback', '.tm-sheet__actions', '.picker', '.adjust-row', '.presets'].map(r); }'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.goto(u); pg.wait_for_timeout(300)
    for row in pg.evaluate(JS): print(row)
    html = pg.evaluate("() => document.querySelector('.tm-sheet').outerHTML")
    import re; print(re.sub(r'<svg.*?</svg>', '', html)[:2600])
    b.close()

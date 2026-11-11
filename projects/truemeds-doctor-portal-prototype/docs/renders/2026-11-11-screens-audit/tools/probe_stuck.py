"""Probe (read-only): is .is-stuck set on the add-time sheet's actions at 360x640, and what does it draw?"""
import pathlib
from playwright.sync_api import sync_playwright
base = (pathlib.Path(__file__).resolve().parents[4] / 'ui-screens/home/home.html').as_uri()
JS = r'''() => { const s = document.querySelector('.tm-sheet'), a = s && s.querySelector(':scope > .tm-sheet__actions');
  return { sheetScroll: s && [s.scrollHeight, s.clientHeight, getComputedStyle(s).overflowY], direct: !!a,
           anyActions: !!document.querySelector('.tm-sheet__actions'), parent: document.querySelector('.tm-sheet__actions').parentElement.className,
           stuck: document.querySelector('.tm-sheet__actions').className, shadow: getComputedStyle(document.querySelector('.tm-sheet__actions')).boxShadow }; }'''
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    for st in ['add-wheel', 'add-failed']:
        pg = b.new_page(viewport={'width': 360, 'height': 640}); pg.goto(base + '?capture&state=' + st); pg.wait_for_timeout(400)
        print(st, pg.evaluate(JS)); pg.close()
    b.close()

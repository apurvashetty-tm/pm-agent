"""Scratch probe: visible pinned-bar contents per case state at 390. bar.py [regex]"""
import sys, re, importlib.util, pathlib, json
from playwright.sync_api import sync_playwright
import os
ROOT = pathlib.Path(os.environ.get('TMROOT', '/Users/mac/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype'))
spec = importlib.util.spec_from_file_location('guard', ROOT/'ui-screens/feedback/check-locked-specs.py'); guard = importlib.util.module_from_spec(spec); spec.loader.exec_module(guard)
flt = re.compile(sys.argv[1]) if len(sys.argv) > 1 else None
JS = r"""() => {
  const bar = document.getElementById('case-actionbar'); const out = [];
  const vis = el => el && el.getClientRects().length && getComputedStyle(el).display !== 'none' && !el.hidden;
  const walk = (el, depth) => { [...el.children].forEach(c => { if (!vis(c)) return;
     if (c.matches('button')) out.push((depth ? 'pair:' : '') + 'BTN[' + c.textContent.trim().replace(/\s+/g,' ') + ']' + (c.disabled ? '(dis)' : '') + ' w' + Math.round(c.getBoundingClientRect().width));
     else if (c.classList.contains('tm-btn-pair')) { out.push('ROW'); walk(c, 1); }
     else if (c.matches('.tm-notice')) out.push('NOTICE[' + c.textContent.trim().replace(/\s+/g,' ').slice(0,70) + ']');
     else if (c.matches('.tm-status-line')) out.push('STATUS[' + c.textContent.trim().slice(0,60) + ']');
     else out.push('EL:' + c.tagName + '.' + (c.className||'').toString().slice(0,30) + '[' + c.textContent.trim().replace(/\s+/g,' ').slice(0,50) + ']'); }); };
  walk(bar, 0);
  const script = document.getElementById('pcb-text'); const pcb = document.getElementById('pre-call-brief');
  return { bar: Math.round(bar.getBoundingClientRect().height), items: out, script: vis(pcb) ? script.textContent.slice(0,50) : null, back: getComputedStyle(document.getElementById('ch-back')||document.body).display };
}"""
states = [s for s in guard.D_STATES if not s.startswith('d-')]
if flt: states = [s for s in states if flt.search(s)]
extra = [s for s in (sys.argv[2].split(',') if len(sys.argv) > 2 else [])]
with sync_playwright() as p:
    br = p.chromium.launch()
    for st in states + extra:
        pg = br.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        pg.goto(guard.std_url('case', st, 390)); pg.add_style_tag(content='.review,.review-controls,#demo-bar{display:none !important}')
        try: pg.wait_for_function("() => document.body.dataset.ready === '1'", timeout=8000)
        except Exception: print(st, 'NOT READY')
        pg.wait_for_timeout(300)
        print(st, json.dumps(pg.evaluate(JS), ensure_ascii=False))
        pg.close()
    br.close()

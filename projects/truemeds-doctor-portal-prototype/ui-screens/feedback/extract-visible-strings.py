"""Writes ui-screens/feedback/visible-strings.json: every visible text node, aria-label, placeholder and title in the
149 approved states at 390 px, deduplicated. Excludes the printed Rx paper (rx-* classes) and the dev demo bar.
Used by check-sources.mjs (copy rules 4, 5, 11, 13, 14, 19, 21, 22, 23). Run: python3 extract-visible-strings.py"""
import json, pathlib, importlib.util, datetime
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('guard', HERE / 'check-locked-specs.py')
guard = importlib.util.module_from_spec(spec); spec.loader.exec_module(guard)
JS = r"""() => {
  const out = [];
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const skip = e => e.closest('script,style,.review,.review-controls,#demo-bar,[class*="rx-"],#rx-doc-wrapper');
  const cls = e => String(e.getAttribute('class') || '').slice(0, 120);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const t = n.textContent.replace(/\s+/g, ' ').trim(); const el = n.parentElement;
    if (!t || !el || !vis(el) || skip(el)) continue;
    out.push({kind: 'text', text: t, cls: cls(el), tag: el.tagName.toLowerCase()});
  }
  for (const el of document.querySelectorAll('[aria-label],[placeholder],[title]')) {
    if (!vis(el) || skip(el)) continue;
    for (const a of ['aria-label', 'placeholder', 'title']) {
      const v = el.getAttribute(a); if (v && v.trim()) out.push({kind: a, text: v.trim(), cls: cls(el), tag: el.tagName.toLowerCase()});
    }
  }
  return out;
}"""
seen = {}
with sync_playwright() as p:
    br = p.chromium.launch()
    for ph in ['A', 'B', 'C', 'D']:
        for sub, state in guard.EXPECTED[ph]:
            pg = br.new_page(viewport={'width': 390, 'height': 844})
            pg.clock.set_fixed_time(datetime.datetime(2026, 10, 28, 15, 0))
            pg.goto(guard.std_url(sub, state, 390))
            pg.add_style_tag(content='*,*::before,*::after{animation:none !important;transition:none !important}')
            if sub == 'case':
                pg.wait_for_function("() => document.body.dataset.ready === '1'", timeout=15000)
            pg.wait_for_timeout(250)
            for item in pg.evaluate(JS):
                key = (item['kind'], item['text'], item['cls'])
                seen.setdefault(key, {**item, 'states': []})['states'].append(f'{sub}/{state}')
            pg.close()
    br.close()
rows = [{k: v for k, v in r.items()} | {'states': sorted(set(r['states']))} for r in seen.values()]
rows.sort(key=lambda r: (r['kind'], r['text']))
(HERE / 'visible-strings.json').write_text(json.dumps(rows, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
print('visible strings', len(rows))

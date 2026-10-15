"""Standards-pass capture (2026-10-15). Headless Chromium on the real files, fonts loaded.

Usage (from the project root):
    python3 docs/renders/2026-10-15-standards/capture.py --round 1 [--phases A,B,C,D]
    python3 docs/renders/2026-10-15-standards/capture.py --round 0 --out-dir promotion-check   (promotion QA)

Writes, per phase, into docs/renders/2026-10-15-standards/<phase>/round-N/:
    <state>_w390.png, <state>_w360.png   (390 and 360 wide, 2x, reviewed)
    metrics.json                         (per capture: file, size, console errors)
    guard.json                           (guard results: state x viewport x checklist line)
The 430 wide pass is guards only (checklist 8.3): no PNG.
"""
import argparse, json, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs' / 'renders' / '2026-10-15-standards'
GUARD = ROOT / 'ui-screens' / 'feedback' / 'check-locked-specs.py'
PY = sys.executable
sys.path.insert(0, str(GUARD.parent))
import importlib.util
spec = importlib.util.spec_from_file_location('guard', GUARD)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)

HIDE_CHROME = '.review,.review-controls,#demo-bar{display:none !important}'

def shoot(browser, phase, sub, state, vw, path):
    page = browser.new_page(viewport={'width': vw, 'height': 844}, device_scale_factor=2)
    console = []
    page.on('console', lambda m: console.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: console.append('page error: ' + str(e)))
    page.goto(guard.std_url(sub, state, vw))
    page.add_style_tag(content=HIDE_CHROME)
    page.evaluate('() => document.fonts && document.fonts.ready')
    if phase == 'D':
        page.wait_for_function("() => document.body.dataset.ready === '1'", timeout=15000)
    page.wait_for_timeout(350)
    page.screenshot(path=str(path))
    page.close()
    return console

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--round', type=int, required=True)
    ap.add_argument('--phases', default='A,B,C,D')
    ap.add_argument('--out-dir', default='', help='write into OUT/<dir>/<phase>/ instead of round-N (promotion checks)')
    a = ap.parse_args()
    phases = a.phases.split(',')
    base = OUT / a.out_dir if a.out_dir else None
    metrics = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for phase in phases:
            d = (base / phase) if base else (OUT / phase / f'round-{a.round}')
            d.mkdir(parents=True, exist_ok=True)
            metrics[phase] = []
            for sub, state in guard.EXPECTED[phase]:
                for vw in (390, 360):
                    stem = state if phase == 'D' else f'{sub}_{state}'   # A-C states repeat names across sub-screens
                    fn = d / f'{stem}_w{vw}.png'
                    console = shoot(browser, phase, sub, state, vw, fn)
                    metrics[phase].append({'state': f'{sub}/{state}', 'viewport': vw, 'file': fn.name,
                                           'bytes': fn.stat().st_size, 'console_errors': console})
            (d / 'metrics.json').write_text(json.dumps(metrics[phase], indent=2, ensure_ascii=False))
        browser.close()
    # Guards: every state at 390, 360 and 430 (430 = guards only, checklist 8.3).
    gpath = (base / 'guard.json') if base else (OUT / f'guard-round-{a.round}.json')
    if base: base.mkdir(parents=True, exist_ok=True)
    res = subprocess.run([PY, str(GUARD), '--phases', a.phases, '--viewports', '390,360,430', '--out', str(gpath)],
                         capture_output=True, text=True)
    print(res.stdout[-4000:])
    if res.stderr.strip(): print(res.stderr[-2000:])
    return res.returncode

if __name__ == '__main__':
    sys.exit(main())

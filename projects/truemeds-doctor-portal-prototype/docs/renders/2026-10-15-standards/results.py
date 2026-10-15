"""Writes round-N/checklist-results.md from the guard output (auto lines), state x viewport x checklist line.
Eye lines are not machine-checked; they are listed as 'eye: see contact sheets and changes.md'."""
import argparse, json, pathlib, collections, re
OUT = pathlib.Path(__file__).resolve().parent
AUTO = ['1.1','1.3','1.4','2.1','2.2','2.3','2.4','2.6','2.7','3.1','3.2','3.4','3.5','3.6','3.7','4.1','4.2','4.3','4.5','4.6','4.7','5.1','5.3','5.4','5.5','5.6','5.8','5.11','5.12','6.1','6.2','6.3','6.4','6.5','6.6','6.7','8.1','8.2']
EXCEPT = {'5.11': 'D-40 wheel (checked in check_home)'}
ap = argparse.ArgumentParser(); ap.add_argument('--round', type=int, required=True); a = ap.parse_args()
g = json.loads((OUT / f'guard-round-{a.round}.json').read_text())
fails = g['failures']
by = collections.defaultdict(lambda: collections.defaultdict(set))
for f in fails:
    key = f"{f['phase']}|{f['state']}"
    by[key][f['vw']].add(f['line'])
lines = [f'# Checklist results: round {a.round}', '',
 'Source: `guard-round-%d.json` (check-locked-specs.py at 390, 360, 430) plus the 8.1 coverage check. Auto lines are machine-checked on every state. **Eye lines** (1.2, 1.5–1.6, 2.5, 2.8, 3.3, 3.8, 4.4, 4.8, 5.2, 5.7, 5.9, 5.10, 5.13, 5.14, 7.x, 7b.x, 8.3 guards only) are judged on the contact sheets and in `changes.md`; they are not marked here.' % a.round, '',
 '`pass` = no failure on that line at that width. `FAIL` lists the failing lines. 430 runs guards only (8.3).', '']
lines += ['| Phase · state | 390 | 360 | 430 |', '|---|---|---|---|']
keys = []
for ph in ['A','B','C','D']:
    for k in sorted({k for k in by if k.startswith(ph+'|')}): keys.append(k)
allstates = sorted({f"{f['phase']}|{f['state']}" for f in fails}) if False else None
import importlib.util
spec = importlib.util.spec_from_file_location('guard', OUT.parents[2] / 'ui-screens/feedback/check-locked-specs.py')
guard = importlib.util.module_from_spec(spec); spec.loader.exec_module(guard)
for ph in ['A','B','C','D']:
    for sub, st in guard.EXPECTED[ph]:
        key = f"{ph}|{sub}/{st}"
        cells = []
        for vw in (390, 360, 430):
            bad = sorted(by[key][vw], key=lambda x: [float(t) for t in x.split('.')]) if key in by else []
            cells.append('pass' if not bad else 'FAIL ' + ' '.join(bad))
        lines.append(f"| {ph} · {sub}/{st} | " + ' | '.join(cells) + ' |')
lines += ['', '## Failing lines in total', '']
tot = collections.Counter(f['line'] for f in fails)
for l in sorted(tot, key=lambda x: [float(t) if t[0].isdigit() else 99 for t in x.split('.')]):
    lines.append(f'- {l}: {tot[l]}')
(OUT / f'{ph}' if False else OUT / 'checklist-results-tmp.md').write_text('\n'.join(lines) + '\n')
for ph in ['A','B','C','D']:
    d = OUT / ph / f'round-{a.round}'
    if d.exists():
        sub = [l for l in lines if l.startswith(f'| {ph} ·') or l.startswith('|---') or l.startswith('| Phase')]
        head = lines[:lines.index('| Phase · state | 390 | 360 | 430 |')]
        tail_start = lines.index('## Failing lines in total')
        body = [l for l in lines if l.startswith(f'| {ph} ·')]
        out = [f'# {ph} · checklist results, round {a.round}', ''] + head[2:] + ['| Phase · state | 390 | 360 | 430 |', '|---|---|---|---|'] + body + ['']
        (d / 'checklist-results.md').write_text('\n'.join(out) + '\n')
(OUT / 'checklist-results-tmp.md').unlink()
print('written per phase for round', a.round, 'fails', len(fails))

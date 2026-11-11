"""Screens audit: check that after-measure.json meets the agreed standard. python3 tools/check_after.py <run> -> after-check.json + summary."""
import sys, json, pathlib
RUN = pathlib.Path(sys.argv[1]); A = json.loads((RUN / 'after-measure.json').read_text())
def find(scr, st, size, key):
    for b in A[scr][st][size]['blocks']:
        if key in b['text'] or key in b['cls']: return b
def gap_between(scr, st, size, upper, lower):
    u, l = find(scr, st, size, upper), find(scr, st, size, lower)
    return round(l['y'] - (u['y'] + u['h']), 1) if u and l else None
checks = []
def ck(name, got, want):
    ok = got is not None and abs(got - want) <= 0.6
    checks.append({'check': name, 'got': got, 'want': want, 'ok': ok})
for size in ['390x844', '360x640']:
    for st in ['default', 'wrong-code', 'new-code-sent', 'offline', 'couldnt-verify']:
        ck(f'otp {st} {size}: consent -> Verify 16', gap_between('otp', st, size, 'consent', 'tm-btn--primary'), 16)
    for st in ['locked', 'offline', 'couldnt-verify', 'resend-failed', 'too-many-resends', 'expired-and-resend-limited']:
        ck(f'otp {st} {size}: code -> notice 16', gap_between('otp', st, size, 'tm-otp-slots', 'tm-notice'), 16)
    ck(f'otp locked {size}: notice -> Verify 8', gap_between('otp', 'locked', size, 'tm-notice', 'tm-btn--primary'), 8)
    for st in ['add-wheel', 'end-confirmation']:
        ck(f'home {st} {size}: sheet title -> subtitle 8', gap_between('home', st, size, 'tm-sheet__title', 'tm-sheet__subtitle'), 8)
    ck(f'home logout-confirm {size}: sheet title -> subtitle 8', gap_between('home', 'logout-confirm', size, 'tm-sheet__title', 'tm-sheet__subtitle'), 8)
    ck(f'home add-failed {size}: notice -> Add 16', gap_between('home', 'add-failed', size, 'Couldn', 'Add 30'), 16)
    ck(f'home add-wheel {size}: chips -> Custom 32', gap_between('home', 'add-wheel', size, '3 hours', 'Custom'), 32)
    ck(f'home add-wheel {size}: Quick picks -> chips 8', gap_between('home', 'add-wheel', size, 'Quick picks', '15 min'), 8)
    ck(f'sign-in not-registered {size}: field -> notice 16', gap_between('sign-in', 'not-registered', size, 'tm-field__control', 'tm-notice'), 16)
    ck(f'sign-in not-registered {size}: notice -> Send OTP 8', gap_between('sign-in', 'not-registered', size, 'tm-notice', 'Send OTP'), 8)
    for st in ['fingerprint', 'enable-failed', 'unavailable']:
        ck(f'offer {st} {size}: panel top 173', A['faster-signin-offer'][st][size]['panelTop'], 173)
    m = A['home']['add-failed'][size]; fb = find('home', 'add-failed', size, 'Couldn'); bar = find('home', 'add-failed', size, 'Add 30')
    ck(f'home add-failed {size}: error fully visible above Add (bottom <= Add top)', 1 if fb and bar and fb['y'] + fb['h'] <= bar['y'] else 0, 1)
(RUN / 'after-check.json').write_text(json.dumps(checks, indent=1))
bad = [c for c in checks if not c['ok']]
print(f"{len(checks) - len(bad)} / {len(checks)} on spec"); [print('  FAIL', c) for c in bad]

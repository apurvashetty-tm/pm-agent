"""Regression guard for the LOCKED layout specs (D-46, L1–L6).

Reads computed styles from the real HTML (file://) in every state and exits 1 on any violation.
A failed guard = open blocker. Run from the project root:
    python3 ui-screens/feedback/check-locked-specs.py
Needs Playwright with Chromium (install outside the project, e.g. in a scratch venv).

Harness-only: nothing here changes source or styles.
"""
import pathlib
import re
import sys
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
SCREENS = HERE.parent
OTP = SCREENS / 'otp' / 'otp.html'
SIGN = SCREENS / 'sign-in' / 'sign-in.html'
OTP_STATES = ['default', 'empty-tap', 'too-short', 'verifying', 'wrong-code', 'two-tries-left', 'resend-available',
              'new-code-sent', 'code-expired', 'couldnt-verify', 'too-many-resends', 'locked', 'resending',
              'resend-failed', 'offline', 'cooldown-reconciling', 'expired-and-resend-limited']
SIGN_STATES = ['default', 'keyboard-open', 'empty-tap', 'too-short', 'wrong-first-digit', 'pasted-cleaned', 'sending',
               'not-registered', 'offline', 'couldnt-send', 'too-many-tries', 'inactive']

PX = lambda v: round(float(str(v).replace('px', '')), 1)

OTP_JS = r"""() => {
  const cs = el => getComputedStyle(el);
  const slots = [...document.querySelectorAll('.tm-otp-slots__slot')];
  const group = cs(document.querySelector('.tm-otp-slots'));
  const kbd = document.querySelector('.kbd');
  const kbdVisible = cs(kbd).display !== 'none';
  const btn = document.getElementById('b');
  const bcs = cs(btn);
  const spinner = btn.querySelector('.tm-spinner');
  const helper = document.getElementById('h');
  const note = document.getElementById('n');
  const input = document.getElementById('c');
  const rect = btn.getBoundingClientRect();
  return {
    slots: slots.map(s => ({ w: cs(s).width, h: cs(s).height, fs: cs(s).fontSize })),
    gap: group.columnGap,
    kbdVisible, kbdTop: kbdVisible ? kbd.getBoundingClientRect().top : null,
    btnClass: btn.className, btnBg: bcs.backgroundColor, btnColor: bcs.color, btnDisabled: btn.disabled,
    spinnerVisible: !!spinner && cs(spinner).display !== 'none',
    inputDisabled: input.disabled, inputReadOnly: input.readOnly,
    helperFs: helper.hidden ? null : cs(helper).fontSize,
    helperAlign: helper.hidden ? null : cs(helper).textAlign,
    noteFs: note.classList.contains('show') ? cs(note.querySelector('#nt')).fontSize : null,
    btnBottom: rect.bottom,
    brandVar: getComputedStyle(document.documentElement).getPropertyValue('--tm-surface-brand-default').trim(),
  };
}"""

SIGN_JS = r"""() => {
  const cs = el => getComputedStyle(el);
  const root = document.getElementById('doctor-login-preview');
  const submit = root.querySelector('.login-submit');
  const spinner = root.querySelector('.tm-spinner');
  const content = root.querySelector('.login-content');
  const logo = root.querySelector('.login-logo').getBoundingClientRect();
  const h1 = root.querySelector('h1').getBoundingClientRect();
  const helper = root.querySelector('.tm-field__helper');
  const notices = [...root.querySelectorAll('.tm-notice')].filter(n => !n.hidden);
  const kbd = root.querySelector('.login-keyboard');
  const kbdVisible = cs(kbd).display !== 'none';
  const sbcs = cs(submit);
  const r = submit.getBoundingClientRect();
  return {
    btnClass: submit.className, btnBg: sbcs.backgroundColor, btnColor: sbcs.color, btnDisabled: submit.disabled,
    spinnerVisible: cs(spinner).display !== 'none' && !spinner.hidden,
    heroPad: cs(content).paddingTop,
    logoToTitle: Math.round(h1.top - logo.bottom),
    helperFs: cs(helper).fontSize,
    noticeFs: notices.length ? cs(notices[0]).fontSize : null,
    kbdVisible, kbdTop: kbdVisible ? kbd.getBoundingClientRect().top : null,
    btnBottom: r.bottom,
    brandVar: getComputedStyle(document.documentElement).getPropertyValue('--tm-surface-brand-default').trim(),
  };
}"""

def rgb(v):
    m = re.findall(r'[\d.]+', v or '')
    return [float(x) for x in m[:3]] if len(m) >= 3 else None


TITLE_JS = r"""() => {
  const out = {};
  const els = [...document.querySelectorAll('h1, .tm-text-title-lg, .tm-text-h1')].filter(e => e.getClientRects().length);
  out.titles = els.map(e => {
    const words = e.textContent.trim().split(/\s+/);
    const rects = [];
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const re = /\S+/g; let m;
      while ((m = re.exec(node.textContent))) {
        const r = document.createRange(); r.setStart(node, m.index); r.setEnd(node, m.index + m[0].length);
        const b = r.getClientRects()[0]; if (b) rects.push({ word: m[0], top: Math.round(b.top) });
      }
    }
    const lineTops = [...new Set(rects.map(r => r.top))].sort((a, b) => a - b);
    const lastTop = lineTops[lineTops.length - 1];
    const lastLine = rects.filter(r => r.top === lastTop);
    return { text: e.textContent.trim(), lines: lineTops.length, lastLineWords: lastLine.length, endsWithStop: /\.$/.test(e.textContent.trim()), words: words.length };
  });
  return out;
}"""

CLIP_JS = r"""() => {
  // Helper text and notices must be fully visible inside the scroll area (no clipping under a notice).
  const bad = [];
  document.querySelectorAll('.scroll').forEach(sc => {
    const r = sc.getBoundingClientRect();
    document.querySelectorAll('.scroll .helper, .scroll .sub').forEach(h => {
      if (!h.getClientRects().length) return;
      const hr = h.getBoundingClientRect();
      if (hr.bottom > r.bottom + 1) bad.push(h.textContent.trim().slice(0, 40));
    });
  });
  return bad;
}"""

def check_titles(page, tag, errs):
    t = page.evaluate(TITLE_JS)
    for x in t['titles']:
        if x['lines'] > 1 and x['lastLineWords'] == 1:
            errs.append(f"{tag}: L8 title '{x['text']}' leaves one word on the last line")
        if x['endsWithStop']:
            errs.append(f"{tag}: title '{x['text']}' ends with a full stop (RULES §8.10)")

def check_clip(page, tag, errs):
    bad = page.evaluate(CLIP_JS)
    for b in bad:
        errs.append(f"{tag}: helper text clipped by the scroll area: '{b}'")

def check_otp(page, state, errs):
    page.goto(OTP.as_uri() + f'?capture={state}')
    page.wait_for_timeout(120)
    m = page.evaluate(OTP_JS)
    tag = f'otp/{state}'
    check_titles(page, tag, errs)
    if m['helperFs'] is not None: pass
    for i, s in enumerate(m['slots']):
        if PX(s['w']) != 56 or PX(s['h']) != 56: errs.append(f'{tag}: L1 slot {i} size {s["w"]}x{s["h"]} != 56x56')
        if PX(s['fs']) != 24: errs.append(f'{tag}: L1 slot {i} digit {s["fs"]} != 24px')
    if PX(m['gap']) != 8: errs.append(f'{tag}: L1 slot gap {m["gap"]} != 8px')
    if m['helperAlign'] is not None and m['helperAlign'] != 'center': errs.append(f'{tag}: L7 OTP helper aligned {m["helperAlign"]}, must be centred under the boxes')
    if m['helperFs'] is not None and PX(m['helperFs']) != 14: errs.append(f'{tag}: L4 helper {m["helperFs"]} != 14px')
    if m['noteFs'] is not None and PX(m['noteFs']) != 14: errs.append(f'{tag}: L5 notice {m["noteFs"]} != 14px')
    if state == 'verifying':
        if 'tm-btn--busy' not in m['btnClass']: errs.append(f'{tag}: L2 busy class missing')
        if rgb(m['btnColor']) != [255.0, 255.0, 255.0]: errs.append(f'{tag}: L2 label {m["btnColor"]} not white')
        if not m['spinnerVisible']: errs.append(f'{tag}: L2 spinner not visible')
        if not m['kbdVisible']: errs.append(f'{tag}: L3 keyboard closed during verifying (D-44)')
    if state in ('locked', 'expired-and-resend-limited') and m['kbdVisible']:
        errs.append(f'{tag}: L3 keyboard open in a locked state')
    if m['kbdVisible'] and m['kbdTop'] is not None and m['btnBottom'] > m['kbdTop'] - 16 and state not in ('verifying',):
        errs.append(f'{tag}: button less than 16px above keyboard ({m["btnBottom"]} vs {m["kbdTop"]})')
    return m

def check_sign(page, state, errs):
    page.goto(SIGN.as_uri() + f'?capture={state}')
    page.wait_for_timeout(120)
    m = page.evaluate(SIGN_JS)
    tag = f'sign-in/{state}'
    check_titles(page, tag, errs)
    if m['logoToTitle'] != 48: errs.append(f'{tag}: L6 logo-to-title gap {m["logoToTitle"]}px != 48px (padding {m["heroPad"]})')
    if PX(m['helperFs']) != 14: errs.append(f'{tag}: L4 helper {m["helperFs"]} != 14px')
    if m['noticeFs'] is not None and PX(m['noticeFs']) != 14: errs.append(f'{tag}: L5 notice {m["noticeFs"]} != 14px')
    if state == 'sending':
        if 'tm-btn--busy' not in m['btnClass']: errs.append(f'{tag}: L2 busy class missing')
        if rgb(m['btnColor']) != [255.0, 255.0, 255.0]: errs.append(f'{tag}: L2 label {m["btnColor"]} not white')
        if not m['spinnerVisible']: errs.append(f'{tag}: L2 spinner not visible')
    if m['kbdVisible'] and m['kbdTop'] is not None and m['btnBottom'] > m['kbdTop'] - 16:
        errs.append(f'{tag}: button less than 16px above keyboard')
    return m

HOME = SCREENS / 'home' / 'home.html'
HOME_STATES = ['setup-wheel', 'setting', 'setup-failed', 'active', 'requesting', 'no-cases', 'request-failed', 'offline',
               'near-expiry', 'add-wheel', 'adding', 'add-failed', 'added', 'end-confirmation', 'stop-pending', 'expired-pending',
               'idle-expired', 'manually-ended', 'unknown-result',
               'profile', 'profile-case-open', 'logout-confirm']   # Round 3: Profile pages (D-70)

WHEEL_JS = r"""() => {
  const band = document.querySelector('.wheel-band');
  if (!band) return null;
  const probe = (cssVar) => { const d = document.createElement('div'); d.style.color = cssVar; d.style.backgroundColor = cssVar; document.body.appendChild(d);
    const c = getComputedStyle(d).color, bg = getComputedStyle(d).backgroundColor; d.remove(); return { c, bg }; };
  const brandSubtle = probe('var(--tm-surface-brand-subtle)').bg;
  const brandText = probe('var(--tm-content-brand)').c;
  const sel = document.querySelector('.wheel-item.is-selected');
  const wheels = [...document.querySelectorAll('.wheel')];
  return {
    bandBg: getComputedStyle(band).backgroundColor, brandSubtle,
    selColor: sel ? getComputedStyle(sel).color : null, brandText,
    selSize: sel ? getComputedStyle(sel).fontSize : null,
    greyBoxes: wheels.filter(w => { const bg = getComputedStyle(w).backgroundColor; return bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'; }).length,
  };
}"""

def check_home(page, state, errs):
    page.goto(HOME.as_uri() + f'?state={state}')
    page.wait_for_timeout(120)
    gap = page.evaluate("""() => {
      // Round 3: Profile is a task page with no logo (D-70), so the logo gap is measured only where both exist
      const logoEl = document.querySelector('.logo'); const h1El = document.querySelector('.band h1');
      const logo = logoEl ? logoEl.getBoundingClientRect() : null; const h1 = h1El ? h1El.getBoundingClientRect() : null;
      const ph = document.querySelector('.phone').getBoundingClientRect();
      // D-75: unknown-result has no footer (the status line carries the wait), so the footer check runs only where one exists
      const fe = document.querySelector('.footer');
      const f = fe ? fe.getBoundingClientRect() : null;
      const t = document.querySelector('.time');
      const tcs = t ? getComputedStyle(t) : null;
      return { logoToTitle: logo && h1 ? Math.round(h1.top - logo.bottom) : null, footerInside: f ? f.bottom - ph.top <= ph.height - 16 : null,
               valueFs: tcs ? tcs.fontSize : null, valueFw: tcs ? tcs.fontWeight : null, valueNum: tcs ? tcs.fontVariantNumeric : null };
    }""")
    if gap.get('valueFs') is not None and (PX(gap['valueFs']) != 32 or gap['valueFw'] != '600' or 'tabular' not in (gap['valueNum'] or '')):
        errs.append(f"home/{state}: L9 value display {gap['valueFs']} w{gap['valueFw']} numerals {gap['valueNum']} (need 32px, 600, tabular)")
    tag = f'home/{state}'
    check_titles(page, tag, errs)
    check_clip(page, tag, errs)
    w = page.evaluate(WHEEL_JS)
    if w is not None:
        if w['bandBg'] != w['brandSubtle']: errs.append(f"{tag}: wheel band {w['bandBg']} is not the brand-subtle token {w['brandSubtle']} (D-40 approved wheel)")
        if w['selColor'] != w['brandText']: errs.append(f"{tag}: wheel selected value {w['selColor']} is not the brand text token {w['brandText']}")
        if w['greyBoxes']: errs.append(f"{tag}: {w['greyBoxes']} grey column box(es) behind the wheel (approved wheel has none)")
    if gap['logoToTitle'] is not None and gap['logoToTitle'] != 48: errs.append(f'{tag}: L6 logo-to-title gap {gap["logoToTitle"]}px != 48px (home-base hero gap)')
    if gap['footerInside'] is False: errs.append(f'{tag}: pinned footer outside the frame')

UNLOCK = SCREENS / 'returning-unlock' / 'returning-unlock.html'
OFFER = SCREENS / 'faster-signin-offer' / 'faster-signin-offer.html'
UNLOCK_STATES = ['fingerprint', 'face', 'screen-lock', 'pending', 'cancelled', 'platform-retry', 'unavailable']
OFFER_STATES = ['fingerprint', 'face-id', 'enabling', 'screen-lock', 'enable-failed', 'offline']   # Round 3: every offer picture

def check_unlock_offer(page, errs):
    for state in UNLOCK_STATES:
        page.goto(UNLOCK.as_uri() + f'?capture={state}'); page.wait_for_timeout(120)
        tag = f'unlock/{state}'
        check_titles(page, tag, errs)
        if page.evaluate("() => !!document.querySelector('.back')"): errs.append(f'{tag}: Back present; returning unlock has no Back (D-47)')
        if state == 'pending' and 'tm-btn--busy' not in page.evaluate("() => document.getElementById('unlock-action').className"):
            errs.append(f'{tag}: L2 loading primary missing busy class')
    for state in OFFER_STATES:
        page.goto(OFFER.as_uri() + f'?capture={state}'); page.wait_for_timeout(120)
        tag = f'offer/{state}'
        check_titles(page, tag, errs)
        if page.evaluate("() => !!document.querySelector('.back')"): errs.append(f'{tag}: Back present; offer has no Back (D-47)')
        icon_col = page.evaluate("() => getComputedStyle(document.querySelector('.points .tm-icon')).color")
        if icon_col.startswith('rgb(37') or icon_col.startswith('rgb(38'): errs.append(f'{tag}: reassurance icons are blue (RULES §8.11, neutral grey required)')

def check_sources(errs):
    # Timer format: m:ss with no leading zero on minutes (9:42, never 09:42), in the screens and the copy registry.
    for path in (OTP, SIGN, SCREENS / 'feedback' / 'messages.json'):
        text = path.read_text()
        if re.search(r'\b0\d:\d{2}\b', text):
            errs.append(f'{path.name}: timer with leading zero (use 9:42, not 09:42)')


# ---------------------------------------------------------------------------
# STANDARDS PASS (2026-10-15): every checklist line marked auto in
# docs/reviews/2026-10-15-standards-checklist.md, on every captured state.
# Each failure is tagged with its checklist line number (e.g. "3.4").
# ---------------------------------------------------------------------------
PHASE_D = SCREENS / 'case' / 'case.html'   # promoted 2026-10-15 (moved from docs/concepts/2026-10-14-case-page/v2)
D_STATES = [
    # case page (ui-screens/case/): ready and chrome, calling, call outcomes, sheets, closed, stress (Round 3: current set)
    'a-back-blocked', 'a-confirm-busy', 'a-confirm-failed', 'a-leave-sheet', 'a-load-failed', 'a-loading',
    'a-long-content', 'a-no-medicines', 'a-notes-typing', 'a-offline', 'a-offline-action', 'a-order-details',
    'a-release-failed', 'a-releasing', 'a-rx-viewer', 'a-scrolled', 'a-top', 'c-callback',
    'c-callback-error', 'c-callback-failed', 'c-skip-ha', 'e-availability-ended', 'e-callback-scheduled', 'g1-generic-confirm',
    'g2-checking-ha', 'g3b-forwarded', 's-10-medicines', 's-medicine-disabled', 's-optional-empty', 's7a-calling',
    's7b-still-on-call', 's7c-checking', 's7d-result-missing', 's7d-unavailable-sheet', 's7e-leave-sheet', 's7f-submitted',
    't01-ready', 't02-calling', 't03-not-through', 't04-doctor-missed', 't05-result-wait', 't06-ended-early',
    't08a-valid-cat4', 't08b-valid-forward', 't08c-confirm-blocked', 't09-patient-unavailable', 't10a-confirmed', 't10b-forwarded',
    't11-calling-transfer', 't12-transfer-ready', 't13-connecting-ha', 't14-transferred', 't15-ha-no-join', 't15b-end-call-first',
    't16-transfer-missed', 't16b-transfer-missed-patient', 't16c-transfer-missed-unknown', 't17-skip-ha-wait',
    # prescribe (ui-screens/prescribe/): one medicine, opened through the case page
    'd-alt-days', 'd-cream', 'd-default', 'd-disable-sheet', 'd-discard-sheet', 'd-drops',
    'd-duration-picker', 'd-error-dose', 'd-error-other', 'd-every-x-hours', 'd-food-selected', 'd-header-white',
    'd-inhaler', 'd-injection-default', 'd-monthly', 'd-notes-keyboard', 'd-rx-failed', 'd-scrolled',
    'd-sos-on', 'd-sos-only', 'd-syrup', 'd-weekly',
]
A_SIGN = SIGN_STATES
A_OTP = OTP_STATES
B_OFFER = OFFER_STATES
B_UNLOCK = UNLOCK_STATES
C_HOME = HOME_STATES  # includes 'active' (default)


# Stress and new states are added to D_STATES as the concept gains them.
# Geometry + style checks run in the page. Returns [{line, msg}].
STD_JS = r"""(exemptSel) => {
  const out = [];
  const add = (line, msg) => out.push({ line, msg });
  const SKIP = '.review-controls,.review,#demo-bar,.kbd,.login-keyboard,#rx-doc-wrapper,.rx-paper,[data-mock-kbd]';
  const inSkip = el => !!el.closest(SKIP);
  const vis = el => {
    if (!el || inSkip(el)) return false;
    if (!el.getClientRects().length) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const PX = v => parseFloat(v) || 0;
  const rgba = s => { const m = (s || '').match(/[\d.]+/g); if (!m) return null; const a = m.length > 3 ? parseFloat(m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const over = (top, bot) => [0, 1, 2].map(i => top[i] * top[3] + bot[i] * (1 - top[3])).concat([1]);
  const effBg = el => {
    const stack = []; let e = el;
    while (e && e.nodeType === 1) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } e = e.parentElement; }
    let bg = [255, 255, 255, 1];
    for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
    return bg;
  };
  const textLeaves = [...document.querySelectorAll('body *')].filter(el => {
    if (!vis(el)) return false;
    return [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
  });

  // --- 2.1 / 2.2 type sizes; 4.2 contrast
  const SIZES = [12, 14, 16, 18, 20, 24, 32];
  for (const el of textLeaves) {
    const cs = getComputedStyle(el);
    const fs = PX(cs.fontSize);
    const txt = el.textContent.trim().slice(0, 40);
    if (!SIZES.includes(Math.round(fs))) add('2.1', `font ${cs.fontSize} on "${txt}"`);
    if (fs < 14 && !el.closest('.tm-tag,.tm-text-body-sm,.tm-tag--md')) add('2.2', `text ${cs.fontSize} on "${txt}" (only tags and L4 fine print may be under 14px)`);
    if (el.closest(exemptSel)) continue;
    const disabled = el.closest(':disabled,[aria-disabled="true"]') || el.matches(':disabled');
    if (disabled) continue;
    const fg = rgba(cs.color); if (!fg) continue;
    const bg = effBg(el);
    const fgc = fg[3] < 1 ? over(fg, bg) : fg;
    const bold = PX(cs.fontWeight) >= 600;
    const large = fs >= 24 || (fs >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    const r = ratio(fgc, bg);
    if (r < need) add('4.2', `contrast ${r.toFixed(2)}:1 < ${need} on "${txt}" (${cs.color} on ${bg.slice(0,3).map(Math.round).join(',')})`);
  }

  // --- 1.3 horizontal overflow; 1.4 clipped text
  if (document.documentElement.scrollWidth > window.innerWidth + 1) add('1.3', `page scrolls sideways: ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
  for (const el of document.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    if (['hidden', 'clip'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && el.textContent.trim()) add('1.3', `sideways overflow in .${(el.className || el.tagName).toString().split(' ')[0]}`);
    if (['hidden', 'clip'].includes(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && el.clientHeight > 0 && el.childElementCount === 0 && el.textContent.trim()) add('1.4', `text clipped in "${el.textContent.trim().slice(0, 40)}"`);
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && el.textContent.trim()) add('1.4', `text truncated with ellipsis: "${el.textContent.trim().slice(0, 40)}"`);
  }

  // --- 1.1 side margin on every top-level block (screen root = .screen, #mobile-column or the sign-in phone). D-67: page margin is 16 (was 24).
  const root = [...document.querySelectorAll('#mobile-column,.screen,#doctor-login-preview .login-phone')].find(vis) || document.body;
  const rr = root.getBoundingClientRect();
  const BLOCK = '.tm-field,.tm-notice,.tm-card,.tm-status-card,.tm-row,.tm-chip-group,.tm-chip-grid,.chip-grid,.tm-btn--block,.tm-btn-pair,#ab-secondary';
  for (const el of document.querySelectorAll(BLOCK)) {
    if (!vis(el)) continue;
    { let a = el.parentElement, inset = false;   // inside a padded container (card, section, sheet) the inset is that container's, not the screen's
      while (a && a !== root && !a.matches('#main-scroll,.scroll,.panel,.auth-panel,.screen,#mobile-column,#case-actionbar,#ps-body,#ps-actionbar,#doctor-login-preview,.login-fields,.login-phone')) {
        if (PX(getComputedStyle(a).paddingLeft) > 0 || a.matches(BLOCK + ',.tm-card,.tm-sheet,.bottom-sheet,.cl-sheet,.tm-status-card')) { inset = true; break; }
        a = a.parentElement; }
      if (inset) continue; }
    const r = el.getBoundingClientRect();
    if (Math.abs(r.left - rr.left - 16) > 0.6 || Math.abs(rr.right - r.right - 16) > 0.6) add('1.1', `${el.className.toString().split(' ')[0] || el.tagName} margins ${Math.round(r.left - rr.left)}/${Math.round(rr.right - r.right)} (need 24/24)`);
  }

  // --- 2.4 sentence case on buttons and titles; 2.6 "case" not "order"; 2.7 retired labels
  const names = new Set(['Home','Rx','HA','OTP','Doctor','Ops','Truemeds','Dr','Face','ID','Apurva','Order','Help','Help','Call','Wait','Health','Advisor']);   // 'Health Advisor' is a proper noun (D-58 pt 23, D-70 pt 3)
  const data = [...document.querySelectorAll('#ch-name,.ch-name,#ps-title,.tm-row .tm-text-body-lg,.tm-row .tm-text-body-strong,.tm-row strong')].map(e => e.textContent).join(' ');
  data.split(/\s+/).forEach(w => names.add(w.replace(/[^A-Za-z]/g, '')));
  const RETIRED = ['Confirm Order', 'Confirm & Transfer', 'Confirm & Forward', 'Skip HA Call', 'Next Order', 'Order Confirmed', 'Call Patient', 'Retry Call', 'Mark as Unavailable', 'Mark Unavailable', 'Schedule Callback', 'End Call', 'Customer unavailable', 'Request Next Case'];
  const TEXTS = [...document.querySelectorAll('button,.tm-btn,.tm-sheet__title,.sheet-title span,h1,h2,.tm-section-title,.ch-name')].filter(vis).map(el => ({ el, t: el.textContent.replace(/\s+/g, ' ').trim() })).filter(x => x.t);
  for (const { el, t } of TEXTS) {
    if (el.closest('.ch-name,.tm-header-task__title')) continue;
    if (RETIRED.some(r => t.includes(r))) add('2.7', `retired label "${t}"`);
    if (el.closest('.tm-option')) continue;   // clinical options are the doctor's choice; only their look is checked (checklist exceptions)
    if (/\border\b/i.test(t) && !/^Order details/i.test(t) && !/^Order\s+\S/.test(t) && !el.closest('#pdb-order-expand,#ct-details')) add('2.6', `"order" used for doctor's unit of work: "${t}"`);
    if (el.closest('.tm-chip,.tm-tag')) continue;
    const words = t.split(' ');
    while (words.length > 1 && !/[A-Za-z0-9]/.test(words[0])) words.shift();   // leading symbol such as '+'
    if (!/^[A-Z0-9“"(]/.test(words[0]) && !el.matches('h1,h2') && !/^[0-9]/.test(words[0])) add('2.4', `not sentence case: "${t}"`);
    for (let i = 1; i < words.length; i++) {
      if (/[.?!:]$/.test(words[i - 1])) continue;   // a new sentence may start with a capital
      const w = words[i].replace(/[^A-Za-z]/g, '');
      if (!w || /\d/.test(words[i])) continue;
      if (/^[A-Z]/.test(w) && w.length > 1 && !names.has(w) && !/^[A-Z]{2,}$/.test(w)) { add('2.4', `Title Case word "${w}" in "${t}"`); break; }
    }
    if (/[.]$/.test(t) && el.matches('h1,h2,.tm-sheet__title,.sheet-title span,.ch-name')) add('2.3', `title ends with a full stop: "${t}"`);
  }

  // --- 3.1 button roles; 3.2 one primary per screen or sheet; 3.4 heights; 3.6 destructive; 3.7 busy primary
  const ROLE = /tm-btn--(primary|secondary|quiet|destructive|call-end|link|on-dark)\b/;
  const btns = [...document.querySelectorAll('button.tm-btn,a.tm-btn,.tm-btn')].filter(vis);
  for (const b of btns) {
    const c = b.className.toString();
    const label = b.textContent.replace(/\s+/g, ' ').trim() || b.getAttribute('aria-label') || '(icon)';
    if (!ROLE.test(c)) add('3.1', `button without a role: "${label}"`);
    if (/tm-btn--(tertiary|ghost)\b/.test(c)) add('3.1', `retired role on "${label}"`);
    const h = b.getBoundingClientRect().height;
    const isLink = /tm-btn--link\b/.test(c) || b.closest('p,.tm-field__helper,.tm-notice,.otp-help,.tm-sheet__subtitle,.sheet-subtitle');
    if (!isLink && !/tm-btn--icon\b/.test(c) && ![48, 56].includes(Math.round(h))) add('3.4', `button "${label}" is ${Math.round(h)}px (need 48 or 56)`);
    if (/tm-btn--icon\b/.test(c) && Math.round(h) < 48 && !isLink) add('4.1', `icon button "${label}" is ${Math.round(h)}px`);
    if (/tm-btn--destructive\b/.test(c)) {
      const bg = rgba(getComputedStyle(b).backgroundColor);
      if (bg && bg[3] > 0.5 && !(bg[0] > 240 && bg[1] > 240 && bg[2] > 240)) add('3.6', `destructive "${label}" is solid, must be a red outline`);
    }
    if (/tm-btn--primary\b/.test(c) && !/tm-btn--call-end/.test(c)) {
      const bg = rgba(getComputedStyle(b).backgroundColor);
      if (bg && bg[0] > 180 && bg[1] < 80 && bg[2] < 80) add('3.6', `solid red on "${label}" (solid red is End call only)`);
    }
    if (/tm-btn--call-end\b/.test(c) && !b.closest('#call-initiate-btn,#call-initiate-btn')) { /* allowed: End call only */ }
    if (/tm-btn--busy\b/.test(c)) {
      if (!/tm-btn--primary\b/.test(c)) add('3.7', `busy button "${label}" must be the primary role (L2)`);
      const bg = rgba(getComputedStyle(b).backgroundColor), fg = rgba(getComputedStyle(b).color);
      if (fg && (fg[0] < 250 || fg[1] < 250 || fg[2] < 250)) add('3.7', `busy label not white on "${label}"`);
      const sp = b.querySelector('.tm-spinner');
      if (!sp || !sp.getClientRects().length) add('3.7', `busy primary "${label}" has no visible spinner (L2)`);
    }
    if (/tm-btn--sm\b|tm-btn--xs\b/.test(c)) add('3.4', `retired 40/32 button size on "${label}"`);
  }
  // one primary per screen or sheet
  // Topmost overlay decides the scope: a sheet, the Prescribe screen or the Rx viewer (RULES §9.4, §8.5).
  const sheet = [...document.querySelectorAll('.tm-sheet,.bottom-sheet,#prescribe-screen,#rx-overlay')].find(s => vis(s) || (s.classList.contains('open') && s.getClientRects().length));
  const scope = sheet && sheet.getClientRects().length ? sheet : document;
  const prim = [...scope.querySelectorAll('.tm-btn--primary')].filter(vis);
  if (prim.length > 1) add('3.2', `${prim.length} primary buttons on one ${sheet ? 'sheet' : 'screen'}: ${prim.map(b => '"' + b.textContent.trim() + '"').join(', ')}`);

  // --- 3.5 side-by-side pairs: equal width, no icons, labels on one line
  for (const pair of document.querySelectorAll('.tm-btn-pair,#ab-secondary')) {
    if (!vis(pair)) continue;
    const kids = [...pair.children].filter(vis);
    const ws = kids.map(k => Math.round(k.getBoundingClientRect().width));
    if (ws.length && Math.max(...ws) - Math.min(...ws) > 1) add('3.5', `pair widths unequal ${ws.join('/')}`);
    for (const k of kids) {
      const ic = k.querySelector('.tm-icon');
      let labW = 0; const tw = document.createTreeWalker(k, NodeFilter.SHOW_TEXT); let tn;
      while ((tn = tw.nextNode())) { if (!tn.textContent.trim()) continue; const tr = document.createRange(); tr.selectNodeContents(tn); labW += tr.getBoundingClientRect().width; }
      const need = labW + (ic && ic.getClientRects().length ? ic.getBoundingClientRect().width + 8 : 0) + 32;
      if (need > k.getBoundingClientRect().width + 0.5) add('R5', `side-by-side label + icon need ${Math.round(need)}px, button is ${Math.round(k.getBoundingClientRect().width)}px: "${k.textContent.trim()}"`);
      const rg = document.createRange(); rg.selectNodeContents(k);
      const tops = [...rg.getClientRects()].map(r => r.top).sort((a, b) => a - b);
      const lines = tops.filter((t, i) => i === 0 || t - tops[i - 1] > 6).length;
      if (lines > 1 || k.scrollWidth > k.clientWidth + 1) add('3.5', `pair label wraps: "${k.textContent.trim()}"`);
    }
  }

  // --- 4.1 tap targets (inline links inside a sentence are exempt, WCAG 2.5.8)
  const TAP = 'button,a[href],[role="button"],input:not([type="hidden"]),select,textarea,.tm-chip,.tm-check,.tm-toggle,[data-tap]';
  for (const el of document.querySelectorAll(TAP)) {
    if (!vis(el)) continue;
    if (el.matches('a') && el.closest('p,li,.tm-notice,.tm-field__helper,.tm-sheet__subtitle,.sheet-subtitle,.tm-text-body-md,.tm-text-body-sm,.tm-text-body-lg')) continue;
    const row = el.parentElement && el.parentElement.closest('label,.tm-check,.tm-toggle');
    if (el.matches('input[type="checkbox"],input[type="radio"]') && row && row.getBoundingClientRect().height >= 47.5) continue;   // the label row is the tap target
    if (el.matches('.tm-otp input,#c,input.otp-input,input.tm-otp')) continue;
    if (el.matches('input') && el.closest('.tm-field__control') && el.closest('.tm-field__control').getBoundingClientRect().height >= 47.5) continue;   // central: the whole control is the tap target (beyond-salt, 2026-10-15)
    const r = el.getBoundingClientRect();
    if (r.width < 47.5 || r.height < 47.5) add('4.1', `tap target ${Math.round(r.width)}×${Math.round(r.height)} "${(el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30)}"`);
  }

  // --- 4.3 icon-only buttons have an accessible name
  for (const b of document.querySelectorAll('button')) {
    if (!vis(b)) continue;
    if (!b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby') && !b.getAttribute('title')) add('4.3', `icon-only button with no accessible name (${b.className.toString().slice(0, 40)})`);
  }

  // --- 4.5 field errors linked to their field
  for (const f of document.querySelectorAll('input,textarea,select')) {
    if (!vis(f)) continue;
    const fieldErr = f.closest('.tm-field,.tm-otp') && (f.closest('.tm-field--error,.tm-otp--error') || f.getAttribute('aria-invalid') === 'true');
    if (!fieldErr) continue;
    const ids = (f.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    const linked = ids.some(id => { const e = document.getElementById(id); return e && e.textContent.trim(); });
    if (f.getAttribute('aria-invalid') !== 'true' || !linked) add('4.5', `field error not linked (aria-invalid + aria-describedby) on ${f.id || f.name || f.type}`);
  }

  // --- 4.6 notices, toasts and status changes announced; 4.7 sheets are modal with focus inside
  for (const el of document.querySelectorAll('.tm-notice,.tm-toast,.tm-status-card,#success-toast,#concept-toast .tm-notice')) {
    if (!vis(el)) continue;
    if (!el.closest('[role="status"],[role="alert"],[aria-live]')) add('4.6', `notice not announced (no role/aria-live): "${el.textContent.trim().slice(0, 40)}"`);
  }
  for (const s of document.querySelectorAll('.tm-sheet,.bottom-sheet,.cl-sheet')) {
    if (!vis(s) || !s.classList.contains('open') && s.classList.length && !s.matches('.tm-sheet') && !s.getClientRects().length) continue;
    if (s.getAttribute('aria-modal') !== 'true') add('4.7', `open sheet "${s.id || s.className}" is not aria-modal`);
    if (!s.contains(document.activeElement)) add('4.7', `focus not inside open sheet "${s.id || s.className}"`);
  }

  // --- 5.1 sheet template: title + close, no handle, no divider, 16 side margins (D-67; was 24), 16 header→content
  for (const s of document.querySelectorAll('.tm-sheet,.bottom-sheet,.cl-sheet')) {
    if (!vis(s)) continue;
    const id = s.id || s.className.toString().split(' ')[0];
    if (!s.querySelector('.tm-sheet__header,.tm-sheet__title,.cl-head')) add('5.1', `sheet "${id}" has no central header (.tm-sheet__header)`);
    if (s.querySelector('.sheet-title,.cl-head,.sheet-close,.cl-x')) add('5.1', `sheet "${id}" uses local header classes (.sheet-title / .cl-head): move to .tm-sheet__header`);
    if (!s.querySelector('.tm-sheet__close')) add('5.1', `sheet "${id}" has no .tm-sheet__close`);
    if (s.querySelector('.tm-sheet__handle,.drag-handle,.sheet-handle,.handle')) add('5.1', `sheet "${id}" has a drag handle`);
    const cs = getComputedStyle(s);
    const body = s.querySelector('.tm-sheet__body,.sheet-body') || s;
    const bcs = getComputedStyle(body);
    if (PX(bcs.paddingLeft) + (body === s ? 0 : 0) !== 16 && Math.abs(s.getBoundingClientRect().left - document.querySelector('#mobile-column')?.getBoundingClientRect().left || 0) < 999) {
      const sheetLeft = s.getBoundingClientRect().left;
      const cLeft = (s.querySelector('.tm-sheet__title,.sheet-title span,.cl-head h2') || body).getBoundingClientRect().left;
      if (Math.abs(cLeft - sheetLeft - 16) > 0.6) add('5.1', `sheet "${id}" content inset ${Math.round(cLeft - sheetLeft)}px (need 16, D-67)`);
    }
    const hdr = s.querySelector('.tm-sheet__header,.sheet-title,.cl-head');
    if (hdr && PX(getComputedStyle(hdr).borderBottomWidth) > 0) add('5.1', `sheet "${id}" header has a divider`);
  }

  // --- 5.3 free chips wrap (never squeezed or clipped); 5.4 grid chips share one size per screen
  const chips = [...document.querySelectorAll('.tm-chip')].filter(vis);
  for (const c of chips) {
    if (c.scrollWidth > c.clientWidth + 1) add('5.3', `chip text clipped "${c.textContent.trim()}"`);
    const p = c.parentElement, pcs = getComputedStyle(p);
    if (!p.matches('.chip-grid,.tm-chip-grid,.ps-grid') && pcs.flexWrap !== 'wrap' && p.scrollWidth > p.clientWidth + 1) add('5.3', `chip row does not wrap: "${c.textContent.trim()}"`);
  }
  const gridChips = [...document.querySelectorAll('.chip-grid .tm-chip,.tm-chip-grid .tm-chip,.ps-grid .tm-chip')].filter(vis);
  const sizes = new Set(gridChips.map(c => { const r = c.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); }));
  if (sizes.size > 1) add('5.4', `grid chips use ${sizes.size} sizes on one screen: ${[...sizes].join(' ')}`);

  // --- 5.5 status tags; reserved width
  const TAGS = [['Prescribed', 'tm-tag--success'], ['Pending', 'tm-tag--warning'], ['Disabled', 'tm-tag--neutral']];
  for (const t of document.querySelectorAll('.tm-tag')) {
    if (!vis(t)) continue;
    const txt = t.textContent.trim();
    const m = TAGS.find(([w]) => txt === w);
    if (m && !t.classList.contains(m[1])) add('5.5', `tag "${txt}" must be ${m[1].replace('tm-tag--', '')}`);
    if (!m && !/tm-tag--(info|critical|dark|success|warning|neutral|fixed)/.test(t.className)) add('5.5', `tag "${txt}" has no status tone`);
    if (m && (PX(getComputedStyle(t).minWidth) === 0)) add('5.5', `tag "${txt}" has no reserved width (min-width)`);
  }

  // --- 5.6 rows: chevron only when tappable; read-only rows muted, no chevron
  for (const r of document.querySelectorAll('.tm-row')) {
    if (!vis(r)) continue;
    // chevron = the row's trailing icon (icons.js replaces data-icon with an svg, so the name is not in the DOM)
    const trail = r.lastElementChild && r.lastElementChild.classList.contains('tm-icon') ? r.lastElementChild : null;
    const chevEl = (trail && trail.getClientRects().length && getComputedStyle(trail).display !== 'none') ? trail : null;
    const chev = !!chevEl;   // a hidden chevron does not count
    const live = el => !el.disabled && el.tabIndex >= 0;
    const tappable = (!!r.closest('button,a[href]') && live(r.closest('button,a[href]'))) || (r.matches('button,a[href],[role="button"]') && live(r)) || r.hasAttribute('onclick') || r.hasAttribute('data-tap');
    const ro = r.classList.contains('tm-row--readonly');
    if (chev && !tappable) add('5.6', `chevron on a row that does not open anything: "${r.textContent.trim().slice(0, 30)}"`);
    if (ro && (chev || tappable)) add('5.6', `read-only row is tappable or has a chevron: "${r.textContent.trim().slice(0, 30)}"`);
  }

  // --- 5.8 toast: dark, 14/20, one line, above the bottom bar, only the two approved messages
  const TOAST_OK = ['Time added', 'Finish this case first. Then you can go back to Home.'];
  for (const t of document.querySelectorAll('.tm-toast,#success-toast.tm-toast')) {
    if (!vis(t)) continue;
    const txt = t.textContent.replace(/\s+/g, ' ').trim();
    if (!TOAST_OK.includes(txt)) add('5.8', `toast text not on the approved list: "${txt}"`);
    if (PX(getComputedStyle(t).fontSize) !== 14) add('5.8', `toast font not 14px`);
  }
  for (const t of document.querySelectorAll('#concept-toast .tm-notice,#home-toast:not(.tm-toast)')) {
    if (vis(t)) add('5.8', `phone-back toast is a light notice, must be the dark .tm-toast (D-52): "${t.textContent.trim().slice(0, 40)}"`);
  }

  // --- D-54 automatic checks (round 15): R1 focus outline; R2 toast; R3 side margin on every top-level block (16, D-67; was 24); R4 Help never disabled; R6 busy labels; R7 no placeholder dash.
  const ae = document.activeElement;
  if (ae && ae !== document.body && ae.matches('input,textarea,[tabindex="-1"]') && vis(ae)) {
    const fcs = getComputedStyle(ae);
    if (fcs.outlineStyle !== 'none' && PX(fcs.outlineWidth) > 0) add('R1', `focused ${ae.tagName.toLowerCase()} has an outline (${fcs.outlineStyle} ${fcs.outlineWidth})`);
  }
  for (const t of document.querySelectorAll('.tm-toast')) {
    if (!vis(t)) continue;
    const r = t.getBoundingClientRect(), rr2 = root.getBoundingClientRect();
    if (r.left - rr2.left < 23.5 || rr2.right - r.right < 23.5) add('R2', `toast is ${Math.round(r.left - rr2.left)}px / ${Math.round(rr2.right - r.right)}px from the screen edges (need 24)`);
    const rg = document.createRange(); rg.selectNodeContents(t);
    const tops = [...rg.getClientRects()].map(x => x.top).sort((a, b) => a - b);
    const lines = tops.filter((x, i) => i === 0 || x - tops[i - 1] > 6).length;
    if (lines > 2) add('R2', `toast runs to ${lines} lines (max 2)`);
  }
  for (const el of document.querySelectorAll('h1,h2,p,.tm-field,.tm-notice,.tm-btn--block')) {
    // approved exemptions (D-55): text after a leading icon (the icon is the left edge); right-aligned helper text; centred titles
    if (el.previousElementSibling && el.previousElementSibling.matches('.tm-icon,svg') || el.parentElement && el.parentElement.previousElementSibling && el.parentElement.previousElementSibling.matches('.tm-icon')) continue;
    if (['right','center'].includes(getComputedStyle(el).textAlign)) continue;
    if (!vis(el) || el.closest('.tm-header-task--compact,.tm-header-task,.tm-header-edit,.tm-header-viewer,.tm-empty,.tm-card,.tm-sheet,.bottom-sheet,.cl-sheet,.tm-status-card,.tm-row,.tm-actionbar,#case-actionbar,.tm-btn-pair,#ab-secondary,.tm-field,.tm-notice,.tm-toast,#concept-toast,#success-toast,.tm-field__helper,.tm-tag,.tm-option,.tm-chip-group,.tm-chip-grid,.tm-chip-grid--3')) continue;
    { let a = el.parentElement, inset = false;   // a padded ancestor (card, section, sheet) sets its own inset
      while (a && a !== root && !a.matches('#main-scroll,.scroll,.panel,.auth-panel,.screen,#mobile-column,#case-actionbar,#ps-body,#ps-actionbar,#doctor-login-preview,.login-fields,.login-phone,#doctor-login-preview .login-content,.login-content,.auth-panel')) {
        if (PX(getComputedStyle(a).paddingLeft) > 0 || a.matches('.tm-card,.tm-sheet,.bottom-sheet,.cl-sheet,.tm-status-card,.tm-row,.tm-field,.tm-notice,.tm-actionbar,.tm-btn-pair,.tm-toast')) { inset = true; break; }
        a = a.parentElement; }
      if (inset) continue; }
    const rr3 = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (Math.abs(r.left - rr3.left - 16) > 0.6 && r.width > 0) add('R3', `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} starts at ${Math.round(r.left - rr3.left)}px (need 24)`);
  }
  const help = document.getElementById('ch-help');
  if (help && vis(help) && help.disabled) add('R4', 'Help button is disabled on the case page');
  for (const b of document.querySelectorAll('.tm-btn--busy')) {
    if (!vis(b)) continue;
    if (!b.textContent.trim().endsWith('…')) add('R6', `busy label does not end with "…": "${b.textContent.trim()}"`);
  }
  const pt = document.getElementById('ps-prints-text');
  if (pt && vis(pt) && pt.textContent.includes('—')) add('R7', `placeholder dash in On prescription line: "${pt.textContent.trim()}"`);

  // --- 6 locked specs and 5.10 are guarded by check_* (python); 5.11 wheel is in check_home.
  return out;
}"""


SUB = {  # sub-phase -> (file, url builder)
}
EXPECTED = {
    'A': [('sign-in', s) for s in A_SIGN] + [('otp', s) for s in A_OTP],
    'B': [('offer', s) for s in B_OFFER] + [('unlock', s) for s in B_UNLOCK],
    'C': [('home', s) for s in C_HOME],
    'D': [('case', s) for s in D_STATES],
}
EXEMPT_CONTRAST = '.rx-paper,#rx-doc-wrapper'

def std_url(sub, state, vw):
    if sub == 'sign-in': return SIGN.as_uri() + f'?capture={state}'
    if sub == 'otp': return OTP.as_uri() + f'?capture={state}'
    if sub == 'offer': return OFFER.as_uri() + f'?capture={state}'
    if sub == 'unlock': return UNLOCK.as_uri() + f'?capture={state}'
    if sub == 'home': return HOME.as_uri() + f'?state={state}'
    q = f's={state}&start=case' + ('&w=360' if vw == 360 else '') + ('&capture=1' if vw != 430 else '')
    return PHASE_D.as_uri() + '?' + q

def run_std_all(phases, viewports, errs, results):
    """Runs STD_JS on every state of each phase at each viewport. 430 has no capture flag (guards only)."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for phase in phases:
            for sub, state in EXPECTED[phase]:
                for vw in viewports:
                    page = browser.new_page(viewport={'width': vw, 'height': 844})
                    console = []
                    page.on('console', lambda m: console.append(m.text) if m.type == 'error' else None)
                    page.on('pageerror', lambda e: console.append('page error: ' + str(e)))
                    page.on('requestfailed', lambda r: console.append('missing/failed request: ' + r.url))
                    page.goto(std_url(sub, state, vw))
                    page.wait_for_timeout(250)
                    items = page.evaluate(STD_JS, EXEMPT_CONTRAST)
                    for it in items + [{'line': '8.2', 'msg': c} for c in console]:
                        errs.append({'phase': phase, 'state': f'{sub}/{state}', 'vw': vw, 'line': it['line'], 'msg': it['msg']})
                    results.setdefault(f'{phase}|{sub}/{state}', {})[vw] = sum(1 for e in errs if e['phase'] == phase and e['state'] == f'{sub}/{state}' and e['vw'] == vw)
                    page.close()
        browser.close()


LOCKED_LINE = {'L1': '6.1', 'L2': '6.2', 'L3': '6.3', 'L4': '6.4', 'L5': '6.4', 'L6': '6.5', 'L7': '6.6', 'L8': '6.7', 'L9': '6.7'}

def _line_for(msg):
    """Maps a locked-spec message to its checklist line (6.x), or 2.3 for title wrapping and stops."""
    m = re.search(r'\b(L[1-9])\b', msg)
    if m: return LOCKED_LINE[m.group(1)]
    return '2.3' if ('title' in msg or 'L8' in msg) else '6.x'

def check_coverage(errs, phases):
    """8.1: every expected state has a recipe (case page) and a 390 and 360 picture in ui-screens.
    Round 3: replaces the 2026-10-15 coverage matrix, which lists retired ids and so passed without checking the current set."""
    case_src = (SCREENS / 'case' / 'case.html').read_text()
    folders = {'sign-in': (SCREENS / 'sign-in', 'sign-in_'), 'otp': (SCREENS / 'otp', 'otp_'),
               'unlock': (SCREENS / 'returning-unlock', 'unlock_'), 'offer': (SCREENS / 'faster-signin-offer', 'offer_'),
               'home': (SCREENS / 'home', 'home_')}
    for ph in phases:
        for sub, st in EXPECTED[ph]:
            key = f'{sub}/{st}'
            if sub == 'case':
                if not re.search(r"'%s'\s*:" % re.escape(st), case_src):
                    errs.append({'phase': ph, 'state': key, 'vw': 0, 'line': '8.1', 'msg': 'no recipe in case.html'})
                folder, pre = ((SCREENS / 'prescribe'), '') if st.startswith('d-') else ((SCREENS / 'case'), '')
            else:
                folder, pre = folders[sub]
            for vw in (390, 360):
                if not (folder / f'{pre}{st}_w{vw}.png').exists():
                    errs.append({'phase': ph, 'state': key, 'vw': vw, 'line': '8.1', 'msg': f'picture missing: {folder.name}/{pre}{st}_w{vw}.png'})


# 5.12 (auto): no local restyling of a central component. Source scan of each phase's files:
# any rule that sets a visual property on a central .tm-* component class, and any style= attribute on one.
RESTYLE_FILES = {
    'A': ['ui-screens/sign-in/sign-in.html', 'ui-screens/otp/otp.html'],
    'B': ['ui-screens/returning-unlock/returning-unlock.html', 'ui-screens/faster-signin-offer/faster-signin-offer.html'],
    'C': ['ui-screens/home/home-reference.css', 'ui-screens/home/home-reference.js'],
    'D': ['ui-screens/case/case.html', 'ui-screens/case/case-styles.css'],
}
TM_COMPONENT = re.compile(r'\.tm-(btn|sheet|toast|chip|tag|row|notice|field|card|otp|status-card|header|appbar|actionbar|check|toggle|spinner|empty|overlay|btn-pair)\b')
VISUAL = re.compile(r'^\s*(background|background-color|border|border-[a-z-]+|box-shadow|color|font[a-z-]*|line-height|padding[a-z-]*|margin[a-z-]*|height|min-height|max-height|width|min-width|max-width|border-radius|opacity|letter-spacing|gap)\s*:', re.I)

def check_local_restyle(errs, phases):
    root = pathlib.Path(__file__).resolve().parents[2]
    for ph in phases:
        for rel in RESTYLE_FILES.get(ph, []):
            path = root / rel
            if not path.exists(): continue
            text = path.read_text(errors='ignore')
            text_nc = re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group(0)), text, flags=re.S)   # comments never count
            for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', text_nc):
                sel, body = m.group(1).strip(), m.group(2)
                if sel.startswith('@') or not TM_COMPONENT.search(sel): continue
                props = [l for l in body.split(';') if VISUAL.match(l)]
                if props:
                    line = text[:m.start()].count('\n') + 1
                    errs.append({'phase': ph, 'state': f'source:{rel}:{line}', 'vw': 0, 'line': '5.12',
                                 'msg': f'local rule restyles central component: {sel[:60]} {{{";".join(p.strip() for p in props)[:80]}}}'})
            for m in re.finditer(r'<[^>]*class="[^"]*\btm-(btn|sheet|toast|chip|tag|row|notice|field|card|otp|status-card|header|appbar|actionbar|check|toggle|spinner|empty|overlay|btn-pair)\b[^"]*"[^>]*\bstyle="', text):
                line = text[:m.start()].count('\n') + 1
                errs.append({'phase': ph, 'state': f'source:{rel}:{line}', 'vw': 0, 'line': '5.12', 'msg': 'inline style on a central component'})

def main():
    import argparse, json
    ap = argparse.ArgumentParser()
    ap.add_argument('--phases', default='A,B,C,D')
    ap.add_argument('--viewports', default='390,360,430')
    ap.add_argument('--out', default='')
    ap.add_argument('--skip-locked', action='store_true')
    a = ap.parse_args()
    phases = a.phases.split(',')
    vws = [int(v) for v in a.viewports.split(',')]
    errs, results = [], {}
    if not a.skip_locked:
        locked = []
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={'width': 390, 'height': 844})
            if 'A' in phases:
                for st in OTP_STATES: check_otp(page, st, locked)
                for st in SIGN_STATES: check_sign(page, st, locked)
            if 'C' in phases:
                for st in HOME_STATES: check_home(page, st, locked)
            if 'B' in phases:
                check_unlock_offer(page, locked)
            browser.close()
        check_sources(locked)
        for msg in locked:
            errs.append({'phase': '-', 'state': 'locked', 'vw': 390, 'line': _line_for(msg), 'msg': msg})
    run_std_all(phases, vws, errs, results)
    check_coverage(errs, phases)
    check_local_restyle(errs, phases)
    fails = [e for e in errs]
    by_line = {}
    for e in fails: by_line[e['line']] = by_line.get(e['line'], 0) + 1
    print(f'STANDARDS GUARD: {"FAIL" if fails else "PASS"} — {len(fails)} failure(s) across {sum(len(EXPECTED[p]) for p in phases)} states × {len(vws)} viewport(s)')
    for line in sorted(by_line, key=lambda x: [float(t) if t.replace('.','').isdigit() else 0 for t in x.split('.')]):
        print(f'  line {line}: {by_line[line]}')
    for e in fails[:400]:
        print(f"  - [{e['line']}] {e['phase']} {e['state']} @{e['vw']}: {e['msg']}")
    if a.out:
        out = pathlib.Path(a.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps({'failures': fails, 'counts': by_line}, indent=2, ensure_ascii=False))
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(main())

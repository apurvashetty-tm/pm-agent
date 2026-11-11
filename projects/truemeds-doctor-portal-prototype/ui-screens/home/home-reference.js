// Home reference (v3, D-106; band D-107; visible gaps D-108; sheet subtitle D-109). Design reference only: no simulated server.
// 2026-11-11 (run r2-build): rebuilt to draw the same DOM as the app (app/screens/home.js) with the app's own styles
// (app/screens/band.css + home.css), so the approved pictures and the app can't drift. Copy from the feedback registry.
const $ = (s) => document.querySelector(s);
const M = window.TMFeedback.msg;
const STATES = ['setup-wheel', 'setting', 'setup-failed', 'active', 'requesting', 'no-cases', 'request-failed', 'offline',
  'near-expiry', 'add-wheel', 'adding', 'add-failed', 'added', 'end-confirmation', 'stop-pending', 'expired-pending',
  'idle-expired', 'manually-ended', 'unknown-result', 'profile', 'profile-case-open', 'logout-confirm'];
// The picture moments (app/screens/home.js FIXTURES). left: minutes remaining; rx: Prescriptions written today.
const FIX = {
  'setup-wheel': { setup: true, rx: 0 }, setting: { setup: true, rx: 0, busy: 'setting' }, 'setup-failed': { setup: true, rx: 0, bar: 'setup-failed' },
  active: { left: 30 }, requesting: { left: 30, busy: 'requesting' }, 'no-cases': { left: 30, bar: 'no-cases' },
  'request-failed': { left: 30, bar: 'request-failed' }, offline: { left: 30, offline: true }, 'near-expiry': { left: 5 },
  'add-wheel': { left: 5, sheet: 'add' }, adding: { left: 5, sheet: 'add', busy: 'adding' }, 'add-failed': { left: 5, sheet: 'add', addFailed: true },
  added: { left: 35, toast: true }, 'end-confirmation': { left: 30, sheet: 'end' }, 'stop-pending': { left: 30, stopping: true },
  'expired-pending': { left: 0, expired: true }, 'idle-expired': { setup: true, ended: 'idle' }, 'manually-ended': { setup: true, ended: 'manual' },
  'unknown-result': { left: 30, unknown: true }, profile: { left: 30, page: 'profile' }, 'profile-case-open': { left: 30, page: 'profile', caseOpen: true },
  'logout-confirm': { left: 30, page: 'profile', sheet: 'logout' },
};
const capture = document.documentElement.classList.contains('capture');
const NOW = capture ? Date.UTC(2026, 10, 6, 3, 30) : Date.now();   // the app's capture clock (app/core/clock.js)
const CAP = 600, MIN_LEN = 15, STEP = 15, PRESETS = [15, 30, 45, 60, 120, 180];
let state = new URLSearchParams(location.search).get('state') || new URLSearchParams(location.search).get('capture') || document.body.dataset.initial;
if (!STATES.includes(state)) state = 'active';
let duration = 30, addDuration = 30;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const icon = (n, cls = '') => `<span class="tm-icon${cls ? ' ' + cls : ''}" data-icon="${n}" aria-hidden="true"></span>`;
const presetLabel = (n) => n < 60 ? M('home.presetMinutes', { n }) : n === 60 ? M('home.presetHour') : M('home.presetHours', { n: n / 60 });
const durationLabel = (n) => n < 60 ? M('home.durMinutes', { m: n }) : n % 60 ? M('home.durHoursMinutes', { h: Math.floor(n / 60), m: n % 60 }) : M('home.durHours', { h: n / 60 });
const clockTime = (t) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const formatLeft = (min) => { const s = min * 60, hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60, p = (n) => String(n).padStart(2, '0'); return hh ? `${hh}:${p(mm)}:${p(ss)}` : `${mm}:${p(ss)}`; };
const hoursFor = (max) => Array.from({ length: Math.floor(max / 60) + 1 }, (_, n) => n);
const minutesFor = (hh, max) => [0, 15, 30, 45].filter((m) => (hh > 0 || m >= MIN_LEN) && hh * 60 + m <= max);
const clampLen = (n, max) => Math.max(MIN_LEN, Math.min(Math.floor(max / STEP) * STEP, n));
const fx = () => FIX[state];
const kind = () => { const f = fx(); return f.setup ? 'none' : f.stopping ? 'stopping' : f.expired ? 'expired-pending' : f.left <= 5 ? 'near' : 'active'; };
const busy = () => fx().busy === 'setting' || fx().busy === 'adding';
const btn = (label, cls, attrs = '') => `<button type="button" class="tm-btn ${cls}"${attrs}>${label}</button>`;
const busyBtn = (label, cls) => `<button type="button" class="tm-btn ${cls} tm-btn--busy" disabled="" aria-busy="true"><span class="tm-spinner" aria-hidden="true"></span>${label}</button>`;
const notice = (k, text, cls = '', ic) => `<div class="tm-notice tm-notice--${k}${cls ? ' ' + cls : ''}" role="${k === 'error' ? 'alert' : 'status'}">${icon(ic || { error: 'alert-circle', warning: 'alert-triangle', neutral: 'info-circle' }[k])}<span>${esc(text)}</span></div>`;

// The wheel: three rows around the band (previous · selected · next), as the app's scrolled column shows them (D-40).
function wheel(name, col, values, current) {
  const i = Math.max(0, values.indexOf(current));
  const rows = [i - 1, i, i + 1].map((j) => (j >= 0 && j < values.length ? values[j] : null));
  return `<div class="wheel${busy() ? ' is-busy' : ''}" role="listbox" aria-label="${name}" data-col="${col}">${rows.map((v, k) => v === null ? '<span class="wheel-item wheel-item--empty" aria-hidden="true"></span>'
    : `<button type="button" class="wheel-item${k === 1 ? ' is-selected' : ''}" role="option" aria-selected="${k === 1}" data-col="${col}" data-value="${v}"${busy() ? ' disabled=""' : ''}>${v}</button>`).join('')}</div>`;
}
function maxFor(target) { return target === 'duration' ? CAP : Math.max(0, Math.floor((CAP - fx().left) / STEP) * STEP); }
// One duration picker (D-106): "Quick picks" → 32 → "Custom" → column heads 4 → wheel; the add sheet's hint on the Custom line.
function picker(target) {
  const max = maxFor(target);
  const d = clampLen(target === 'duration' ? duration : addDuration, max);
  const hours = Math.floor(d / 60), minutes = d % 60, qp = `qp-${target}`;
  return `<div class="picker"><div class="group"><p class="lbl" id="${qp}">${M('home.quickPicks')}</p><div class="presets" role="group" aria-labelledby="${qp}">${PRESETS.map((n) =>
    `<button type="button" class="tm-chip tm-chip--lg" aria-pressed="${d === n}" data-minutes="${n}"${busy() || n > max ? ' disabled=""' : ''}>${presetLabel(n)}</button>`).join('')}</div></div>`
    + `<div class="group"><div class="lbl-row"><p class="lbl">${M('home.custom')}</p>${target === 'addDuration' ? `<p class="hint" id="add-hint">${M('home.addHint')}</p>` : ''}</div>`
    + `<div class="col-heads" aria-hidden="true"><span>${M('home.hours')}</span><span>${M('home.minutes')}</span></div>`
    + `<div class="columns"><div class="wheel-band" aria-hidden="true"></div>${wheel(M('home.hours'), 'h', hoursFor(max), hours)}${wheel(M('home.minutes'), 'm', minutesFor(hours, max), minutes)}</div></div></div>`;
}
function rxRow(rx) {
  return `<button class="srow srow--link" id="home-rx" type="button">${icon('prescription', 'srow__icon')}<span class="srow__txt"><span class="srow__label">${M('home.rxToday')}</span><span class="srow__line"><span class="tm-value-display srow__value">${rx}</span></span></span>${icon('chevron-right', 'srow__chev')}</button>`;
}
// Available: one tm-card, two rows (Time remaining + Add time, always shown; Prescriptions written today → Profile).
function statusCard() {
  const timed = kind() === 'active' || kind() === 'near' || kind() === 'expired-pending';   // stop-pending: no time row (D-47); ran out with a request: 0:00, no Add time
  const canAdd = maxFor('addDuration') >= MIN_LEN;
  return `<div class="tm-card home-card">${timed ? `<div class="srow">${icon('clock', 'srow__icon')}<div class="srow__txt"><p class="srow__label">${M('home.timeRemaining')}</p><div class="srow__line"><p class="tm-value-display srow__value time" id="home-time" aria-live="off">${formatLeft(fx().left)}</p>${kind() === 'expired-pending' ? '' : `<button id="add" class="tm-btn tm-btn--secondary add-time" type="button"${fx().offline || !canAdd ? ' disabled=""' : ''}>${icon('plus', 'tm-icon--16')}${M('home.addTime')}</button>`}</div></div></div>` : ''}${rxRow(3)}</div>`;
}
function topNotice() {
  const f = fx();
  if (f.stopping) return notice('neutral', M('home.stopPending'), 'status');
  if (f.expired) return notice('neutral', M('home.expiredPending'), 'status');
  if (f.ended === 'idle') return notice('neutral', M('home.idleExpired'), 'status');
  if (f.ended === 'manual') return notice('neutral', M('home.manuallyEnded'), 'status');
  return '';
}
function barNotice() {
  const f = fx();
  if (f.offline && kind() !== 'none') return notice('warning', M('home.offline'), 'status');
  if (f.bar === 'setup-failed') return notice('error', M('home.setupFailed'), 'status');
  if (f.bar === 'request-failed') return notice('error', M('home.requestFailed'), 'status');
  if (f.bar === 'no-cases') return notice('neutral', M('home.noCases'), 'status');
  if (kind() === 'near' && !f.sheet) return notice('warning', M('home.endingSoon'), 'status', 'clock');
  return '';
}
function footer() {
  const f = fx(), lg = 'tm-btn--lg tm-btn--block', setup = kind() === 'none';
  const toast = f.toast ? `<div class="tm-toast home-toast" role="status">${M('home.added')}</div>` : '';
  if (f.unknown) return `<div class="tm-actionbar footer"><div class="tm-status-line" role="status"><span class="tm-spinner" aria-hidden="true"></span>${M('home.unknownResult')}</div>${toast}</div>`;
  const waiting = kind() === 'stopping' || kind() === 'expired-pending';
  const label = { setting: 'home.setting', requesting: 'home.requesting' }[f.busy];
  const primary = label && !waiting ? busyBtn(M(label), `tm-btn--primary ${lg}`)
    : setup ? btn(M('home.setAvailability'), `tm-btn--primary ${lg}`, ' data-confirm=""')
    : btn(M('home.requestCase'), `tm-btn--primary ${lg}`, ` data-confirm=""${f.offline || waiting || f.busy ? ' disabled=""' : ''}`);
  // Setup: "Available until {time}", 8 above Set availability (D-106).
  const until = setup ? `<p class="until" id="home-until">${esc(M('home.availableUntil', { time: '\u0001' })).replace('\u0001', `<b>${clockTime(NOW + duration * 60000)}</b>`)}</p>` : '';
  const secondary = !setup && !f.sheet && kind() !== 'expired-pending'
    ? (kind() === 'stopping' ? btn(M('home.ending'), `tm-btn--quiet ${lg}`, ' data-secondary=""') : btn(M('home.endAvailability'), `tm-btn--quiet ${lg}`, ` data-secondary=""${f.offline ? ' disabled=""' : ''}`)) : '';
  return `<div class="tm-actionbar footer">${barNotice()}${until}${primary}${secondary}${toast}</div>`;
}
function sheet(title, subtitle, body, actions, closeDisabled = false) {
  const head = subtitle ? `<div class="tm-sheet__heading"><h2 class="tm-sheet__title" id="sheet-title">${title}</h2><p class="tm-sheet__subtitle">${esc(subtitle)}</p></div>` : `<h2 class="tm-sheet__title" id="sheet-title">${title}</h2>`;
  return `<div class="tm-overlay app-overlay"><section class="tm-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1"><header class="tm-sheet__header">${head}<button type="button" id="close" class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="${M('common.close')}"${closeDisabled ? ' disabled=""' : ''}>${icon('x')}</button></header>${body ? `<div class="tm-sheet__body">${body}</div>` : ''}<div class="tm-sheet__actions">${actions}</div></section></div>`;
}
function overlay() {
  const f = fx(), lg = 'tm-btn--lg tm-btn--block';
  if (f.sheet === 'add') {
    const b = f.busy === 'adding';
    // D-106: the error sits in the pinned actions, 16 above Add.
    return sheet(M('home.addTitle'), M('home.addSub'), picker('addDuration'),
      (f.addFailed ? notice('error', M('home.addFailed'), 'sheet-feedback') : '')
      + (b ? busyBtn(M('home.adding'), `tm-btn--primary ${lg}`) : btn(M('home.addConfirm', { duration: durationLabel(clampLen(addDuration, maxFor('addDuration'))) }), `tm-btn--primary ${lg}`, ' data-confirm=""'))
      + btn(M('home.cancel'), `tm-btn--quiet ${lg}`, ` data-secondary=""${b ? ' disabled=""' : ''}`), b);
  }
  if (f.sheet === 'end') return sheet(M('home.endTitle'), M('home.endSub'), '', btn(M('home.endAvailability'), `tm-btn--destructive ${lg}`, ' data-confirm=""') + btn(M('home.keepAvailable'), `tm-btn--quiet ${lg}`, ' data-secondary=""'));
  if (f.sheet === 'logout') return sheet(M('profile.logoutTitle'), M('profile.logoutConfirm'), '', btn(M('profile.logout'), `tm-btn--destructive ${lg}`, ' data-confirm=""') + btn(M('profile.staySignedIn'), `tm-btn--quiet ${lg}`, ' data-secondary=""'));
  return '';
}
function homePage() {
  const f = fx(), k = kind(), setup = k === 'none';
  const title = setup ? 'home.titleSetup' : k === 'expired-pending' ? 'home.titleEnded' : k === 'stopping' ? 'home.titleStopping' : 'home.titleActive';
  const sub = setup ? 'home.subSetup' : k === 'expired-pending' || k === 'stopping' ? 'home.subNoNewCases' : 'home.subActive';
  const rx = f.rx ?? 3;
  const actions = [['bell', 'home.notifications'], ['help-circle', 'common.help'], ['user-circle', 'home.profile']].map(([i, l]) => `<button class="tm-btn tm-btn--quiet tm-btn--icon" type="button" aria-label="${M(l)}">${icon(i)}</button>`).join('');
  return `<div class="home-bg"${f.sheet ? ' inert=""' : ''}><div class="entry-band band"><div class="entry-band__row"><img class="entry-band__logo login-logo logo" src="../../brand/truemeds-for-doctors.svg" alt="${M('signin.logoAlt')}"><div class="entry-band__actions">${actions}</div></div>`
    + `<h1 class="entry-band__title">${M(title)}</h1><p class="entry-band__sub sub">${M(sub)}</p></div>`
    + `<div class="entry-panel panel">${topNotice()}<div class="scroll">${setup ? (f.ended && rx > 0 ? `<div class="tm-card home-card">${rxRow(rx)}</div>` : '') + picker('duration') : statusCard()}</div>${footer()}</div></div>`;
}
// D-70 Profile page (out of this round's redesign; kept as approved). The log-out sheet opens over it.
function profilePage() {
  const f = fx();
  const logout = f.caseOpen ? notice('neutral', M('profile.logoutBlocked')) : btn(M('profile.logout'), 'tm-btn--destructive tm-btn--lg tm-btn--block', ' data-logout=""');
  return `<div class="profile-page"${f.sheet ? ' inert=""' : ''}><header class="tm-header-task profile-header"><div class="tm-header-task__row"><button class="tm-btn tm-btn--quiet tm-btn--icon" id="profile-back" type="button" aria-label="${M('common.back')}">${icon('arrow-left')}</button><h1 class="tm-header-task__title">${M('profile.title')}</h1></div></header>`
    + `<div class="profile-body"><div class="tm-card profile-identity"><div class="profile-avatar" aria-hidden="true">KW</div><div><p class="pt-t">${M('profile.doctorName', { name: 'Kunal Wani' })}</p><p class="pt-d">General Physician</p></div></div>`
    + `<div class="tm-card profile-earnings"><p class="profile-label">${M('profile.earnings')}</p><div class="profile-earnings-row"><div><p class="pt-d">${M('profile.earned')}</p><p class="pt-t">${M('profile.amount', { amount: (3 * 20).toFixed(2) })}</p></div><div><p class="pt-d">${M('profile.incentive')}</p><p class="pt-t">${M('profile.amount', { amount: (0).toFixed(2) })}</p></div></div></div>`
    + `<div class="tm-card profile-rows"><button class="profile-row" type="button"><span class="profile-row-label">${icon('book')}${M('profile.userManual')}</span>${icon('chevron-right')}</button><label class="profile-row"><span class="profile-row-label">${icon('fingerprint')}${M('profile.fasterSignIn')}</span><input class="tm-toggle" type="checkbox" role="switch" aria-checked="true" aria-label="${M('profile.fasterSignIn')}" checked=""></label></div>`
    + `<div class="profile-logout">${logout}</div></div></div>`;
}
function render() {
  const f = fx();
  const phone = $('#phone');
  phone.className = `phone home-screen tm${f.page ? ' is-profile' : ''}`;
  phone.innerHTML = (f.page ? profilePage() : homePage()) + overlay();
  window.TMIcons?.render(phone);
  phone.querySelectorAll('[data-minutes]').forEach((b) => b.onclick = () => { if (f.sheet) addDuration = Number(b.dataset.minutes); else duration = Number(b.dataset.minutes); render(); });
  phone.querySelectorAll('.wheel-item[data-value]').forEach((b) => b.onclick = () => {
    const target = f.sheet ? 'addDuration' : 'duration', max = maxFor(target), d = target === 'duration' ? duration : addDuration;
    let hh = Math.floor(d / 60), mm = d % 60; if (b.dataset.col === 'h') hh = Number(b.dataset.value); else mm = Number(b.dataset.value);
    const mins = minutesFor(hh, max); if (!mins.includes(mm)) mm = mm > mins[mins.length - 1] ? mins[mins.length - 1] : mins[0];
    if (target === 'duration') duration = clampLen(hh * 60 + mm, max); else addDuration = clampLen(hh * 60 + mm, max); render(); });
  const go = (s) => { state = s; render(); $('#state').value = state; };
  if ($('#add')) $('#add').onclick = () => go('add-wheel');
  if ($('#home-rx')) $('#home-rx').onclick = () => go('profile');
  const prof = phone.querySelector('.entry-band__actions [aria-label="' + M('home.profile') + '"]'); if (prof) prof.onclick = () => go('profile');
  if ($('#profile-back')) $('#profile-back').onclick = () => go('active');
  const lo = phone.querySelector('[data-logout]'); if (lo) lo.onclick = () => go('logout-confirm');
  if (f.sheet) { const close = () => go(f.page ? 'profile' : f.sheet === 'add' ? 'near-expiry' : 'active'); if ($('#close')) $('#close').onclick = close; const sec = phone.querySelector('.tm-sheet [data-secondary]'); if (sec) sec.onclick = close; if (!capture) phone.querySelector('.tm-sheet').focus({ preventScroll: true }); }
  phone.querySelectorAll('[data-confirm]').forEach((b) => b.onclick = () => { $('#review-status').textContent = 'Reference only: connect this action to native app state and server confirmation.'; });
  $('#state').value = state;
}
$('#state').onchange = (e) => { state = e.target.value; duration = 30; addDuration = 30; render(); };
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && fx().sheet) { state = fx().page ? 'profile' : 'active'; render(); } });
render();

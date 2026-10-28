// Design reference only (layout v2, phase C). No simulated server success or real network requests.
// Every state reads its copy from ../feedback/messages.json (via TMFeedback.msg) or a labelled screen string.
const $ = s => document.querySelector(s);
const STATES = ['setup-wheel','setting','setup-failed','active','requesting','no-cases','request-failed','offline',
  'near-expiry','add-wheel','adding','add-failed','added','end-confirmation','stop-pending','expired-pending',
  'idle-expired','manually-ended','unknown-result','profile','profile-case-open','logout-confirm'];   // D-69: Profile ported from index.html (fix round G-profile)
const M = window.TMFeedback.msg;
let state = new URLSearchParams(location.search).get('state') || document.body.dataset.initial;
if (!STATES.includes(state)) state = 'active';
let duration = 30, previous = 'active', hourRange = 24;
const icon = n => `<span class="tm-icon" data-icon="${n}" aria-hidden="true"></span>`;
const isSetup = () => /^(setup|setting|idle-expired|manually-ended)/.test(state) || state === 'setup-wheel';
const isProfile = () => state === 'profile' || state === 'profile-case-open';
const isSheet = () => state === 'add-wheel' || state === 'adding' || state === 'add-failed' || state === 'end-confirmation' || state === 'logout-confirm';
const onProfilePage = () => isProfile() || state === 'logout-confirm';   // D-70: Profile is a page; Log out? stays a sheet over it

// Centred selection wheel: previous / selected / next rows around one shaded band (approved anatomy).
function wheel(name, values, current) {
  const i = Math.max(0, values.indexOf(current));
  const rows = [i - 1, i, i + 1].map(j => j >= 0 && j < values.length ? values[j] : null);
  return `<div class="wheel" role="listbox" aria-label="${name}">${rows.map((v, k) => v === null ? '<span class="wheel-item wheel-item--empty"></span>' : `<button type="button" class="wheel-item${k === 1 ? ' is-selected' : ''}" role="option" aria-selected="${k === 1}" data-col="${name}" data-value="${v}">${v}</button>`).join('')}</div>`;
}
function picker() {
  const hours = Math.floor(duration / 60), minutes = duration % 60;
  return `<div class="picker"><div class="presets">${[15,30,45,60,120,180].map(n => `<button type="button" class="tm-chip tm-chip--lg" data-minutes="${n}" aria-pressed="${duration === n}">${n < 60 ? n + ' min' : n / 60 + (n === 60 ? ' hour' : ' hours')}</button>`).join('')}</div><div class="adjust-row"><p class="adjust">Adjust duration</p>${state === 'setup-wheel' || state === 'setup-failed' || state === 'setting' || state === 'idle-expired' || state === 'manually-ended' ? '<p class="helper">Minimum 15 minutes</p>' : ''}</div><div class="col-heads"><span>Hours</span><span>Minutes</span></div><div class="columns"><div class="wheel-band" aria-hidden="true"></div>${['Hours','Minutes'].map((name, i) => wheel(name, i ? (hours === 0 ? [15,30,45] : [0,15,30,45]) : Array.from({length: Math.max(hourRange + 1, hours + 12)}, (_, v) => v), i ? minutes : hours)).join('')}</div>`;
}
// Status slot: one notice above the footer. Copy from the registry or a labelled screen string.
function statusNotice() {
  const map = {
    'setup-failed': ['tm-notice--error', 'alert-circle', M('home.setupFailed')],
    'request-failed': ['tm-notice--error', 'alert-circle', M('home.requestFailed')],
    'offline': ['tm-notice--warning', 'alert-triangle', M('home.offline')],
    'no-cases': ['tm-notice--neutral', 'info-circle', M('home.noCases')],
    'stop-pending': ['tm-notice--neutral', 'info-circle', M('home.stopPending')],
    'expired-pending': ['tm-notice--neutral', 'info-circle', M('home.expiredPending')],
    'idle-expired': ['tm-notice--neutral', 'info-circle', M('home.idleExpired')],
    'manually-ended': ['tm-notice--neutral', 'info-circle', M('home.manuallyEnded')],
    'unknown-result': ['tm-notice--neutral', 'info-circle', M('home.unknownResult')],
    'near-expiry': ['tm-notice--warning', 'clock', M('home.endingSoon')],
  };
  const n = map[state];
  const failed = state==='request-failed';
  return n ? `<div class="tm-notice ${n[0]} status" role="${failed || n[0] === 'tm-notice--error' ? 'alert' : 'status'}">${icon(n[1])}<span>${n[2]}</span></div>` : '';
}
// Footer (pinned, RULES §8.4). Loading primary = brand fill, white label and spinner (LOCKED L2).
function footer() {
  const busyLabel = { setting: 'Setting…', requesting: 'Requesting…', adding: 'Adding…', 'unknown-result': 'Checking…' }[state];
  let primary = isSetup() ? 'Set availability' : 'Request a case';
  let disabled = state === 'offline' || state === 'expired-pending' || state === 'stop-pending' || state === 'unknown-result';
  let busy = !!busyLabel;
  if (busy) primary = busyLabel;
  const secondary = isSetup() || isSheet() || state === 'expired-pending' || state === 'unknown-result' ? '' : (state === 'stop-pending' ? 'Ending…' : 'End availability');
  const primaryHtml = busy
    ? `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block tm-btn--busy" aria-busy="true" disabled><span class="tm-spinner" aria-hidden="true"></span>${primary}</button>`
    : `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block" data-confirm ${disabled ? 'disabled' : ''}>${primary}</button>`;
  return `<div class="footer">${primaryHtml}${secondary ? `<button class="tm-btn tm-btn--quiet tm-btn--lg tm-btn--block" data-secondary>${secondary}</button>` : ''}</div>`;
}
function timeBlock() {
  // Ending availability (stop-pending) has no time row: the title and notice already explain (D-47).
  if (state === 'stop-pending') return '';
  const near=state==='near-expiry';
  // Availability timer: m:ss below an hour, h:mm:ss from one hour up (D-53). 30:00, 5:00, 1:00:00 after adding 30 min, 0:00 when ended.
  const value = near ? '5:00' : state === 'added' ? '1:00:00' : state === 'expired-pending' || state === 'stop-pending' ? '0:00' : '30:00';
  return `<div class="timer-row"><span class="timer-label">Time remaining</span>${near ? '<button id="add" class="tm-btn tm-btn--secondary add-link" type="button">+ Add time</button>' : ''}</div><p class="tm-value-display time${near ? ' time--warning' : ''}">${value}</p>`;
}
function sheetContent() {
  const busy = state === 'adding';
  const err = state==='add-failed' ? `<div class="tm-notice tm-notice--error sheet-feedback" role="alert">${icon('alert-circle')}<span>${M('home.addFailed')}</span></div>` : '';
  const primary = busy
    ? `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block tm-btn--busy" aria-busy="true" disabled><span class="tm-spinner" aria-hidden="true"></span>Adding…</button>`
    : `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block" data-confirm>Add ${duration} minutes</button>`;
  return `<section role="dialog" aria-modal="true" aria-labelledby="sheet-title" class="tm-sheet"><header class="tm-sheet__header"><h2 id="sheet-title" class="tm-sheet__title">Add availability</h2><button id="close" class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="Close" type="button">${icon('x')}</button></header><div class="tm-sheet__body"><p class="tm-sheet__subtitle">Choose how much time to add.</p>${picker()}${err}</div><div class="tm-sheet__actions">${primary}<button class="tm-btn tm-btn--quiet tm-btn--lg tm-btn--block" data-secondary>Cancel</button></div></section>`;
}
function endConfirmContent() {
  return `<section role="dialog" aria-modal="true" aria-labelledby="sheet-title" class="tm-sheet"><header class="tm-sheet__header"><h2 id="sheet-title" class="tm-sheet__title">End availability?</h2><button id="close" class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="Close" type="button">${icon('x')}</button></header><div class="tm-sheet__body"><p class="tm-sheet__subtitle">You won’t receive new cases after this. A case already assigned to you stays with you.</p></div><div class="tm-sheet__actions"><button class="tm-btn tm-btn--destructive tm-btn--lg tm-btn--block" data-confirm>End availability</button><button class="tm-btn tm-btn--quiet tm-btn--lg tm-btn--block" data-secondary>Keep available</button></div></section>`;
}
// D-70: Profile is a page (task header with Back, no logo). Ported content (D-69): identity, today's earnings, User manual, Faster sign-in, Log out last in the content.
function profilePage() {
  const blocked = state === 'profile-case-open';
  const logout = blocked
    ? `<div class="tm-notice tm-notice--neutral" role="status">${icon('info-circle')}<span>${M('profile.logoutBlocked')}</span></div>`
    : `<button class="tm-btn tm-btn--destructive tm-btn--lg tm-btn--block" data-logout type="button">Log out</button>`;   // §9.1: no icon (finalising action)
  return `<div class="profile-page">
    <header class="tm-header-task profile-header"><div class="tm-header-task__row"><button class="tm-btn tm-btn--quiet tm-btn--icon" id="profile-back" type="button" aria-label="Back">${icon('arrow-left')}</button><h1 class="tm-header-task__title">Profile</h1></div></header>
    <div class="profile-body">
      <div class="tm-card profile-identity"><div class="profile-avatar" aria-hidden="true">AS</div><div><p class="pt-t">Dr. Apurva Shetty</p><p class="pt-d">General Physician</p></div></div>
      <div class="tm-card profile-earnings"><p class="profile-label">Today’s earnings</p><div class="profile-earnings-row"><div><p class="pt-d">Earned</p><p class="pt-t">₹0.00</p></div><div><p class="pt-d">Incentive</p><p class="pt-t">₹0.00</p></div></div></div>
      <div class="tm-card profile-rows">
        <button class="profile-row" type="button"><span class="profile-row-label">${icon('book')}User manual</span>${icon('chevron-right')}</button>
        <label class="profile-row"><span class="profile-row-label">${icon('fingerprint')}Faster sign-in</span><input class="tm-toggle" type="checkbox" checked aria-label="Faster sign-in"></label>
      </div>
      <div class="profile-logout">${logout}</div>
    </div>
  </div>`;
}
function logoutContent() {
  return `<section role="dialog" aria-modal="true" aria-labelledby="sheet-title" class="tm-sheet"><header class="tm-sheet__header"><h2 id="sheet-title" class="tm-sheet__title">Log out?</h2><button id="close" class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="Close" type="button">${icon('x')}</button></header><div class="tm-sheet__body"><p class="tm-sheet__subtitle">${M('profile.logoutConfirm')}</p><div class="tm-sheet__actions"><button class="tm-btn tm-btn--destructive tm-btn--lg tm-btn--block" data-confirm>Log out</button><button class="tm-btn tm-btn--secondary tm-btn--lg tm-btn--block" data-secondary>Stay signed in</button></div></div></section>`;
}
function render() {
  const setup = isSetup();
  const ended = state === 'expired-pending', stopping = state === 'stop-pending';
  const heroTitle = setup ? 'Consult on your schedule' : ended ? 'Your availability has ended' : stopping ? 'Ending availability' : 'You’re available for consultations';
  const heroSub = setup ? 'Choose how long you’re available today.' : ended ? 'You won’t get new cases.' : stopping ? 'You won’t get new cases.' : 'Request a case whenever you have a moment.';
  const toast = state === 'added' ? `<div class="tm-toast home-toast" role="status">${M('home.added')}</div>` : '';
  const overlay = isSheet() ? `<div class="tm-overlay overlay">${state === 'end-confirmation' ? endConfirmContent() : state === 'logout-confirm' ? logoutContent() : sheetContent()}</div>` : '';
  $('#phone').className = 'phone ' + state;
  if (onProfilePage()) {
    $('#phone').innerHTML = `<div id="background" ${isSheet() ? 'inert' : ''}>${profilePage()}</div>${overlay}`;
    window.TMIcons?.render(document.querySelector('#phone'));
    $('#profile-back').onclick = () => { state = previous; render(); };
    const lo = document.querySelector('[data-logout]'); if (lo) lo.onclick = () => { state = 'logout-confirm'; render(); $('#close')?.focus(); };
    if (isSheet()) { $('#close').onclick = () => { state = 'profile'; render(); }; const sec = document.querySelector('.tm-sheet [data-secondary]'); if (sec) sec.onclick = () => { state = 'profile'; render(); }; }
    $('#state').value = state;
    return;
  }
  $('#phone').innerHTML = `<div id="background" ${isSheet() ? 'inert' : ''}>
    <header class="header"><img class="logo" src="../../../../brand/truemeds-for-doctors.svg" alt="Truemeds for doctors"><div class="header-actions">${[['bell','Notifications'],['help-circle','Help'],['user-circle','Profile']].map(([i,l]) => `<button class="tm-btn tm-btn--quiet tm-btn--icon" aria-label="${l}" type="button">${icon(i)}</button>`).join('')}</div></header>
    <section class="band"><h1 class="tm-text-title-lg">${heroTitle}</h1><p class="sub">${heroSub}</p></section>
    <div class="panel">
      <div class="scroll">
        <div class="rx"><span>Prescriptions today</span><strong>${['setup-wheel', 'setting', 'setup-failed'].includes(state) ? '0' : '3'}</strong></div>
        ${setup ? picker() : timeBlock()}
      </div>
      <div class="status-slot">${statusNotice()}</div>
      ${footer()}
    </div>
    ${toast}
  </div>${overlay}`;
  // Toast sits above the whole footer, never over the CTA (feedback rules §5): bottom = footer height + 16.
  const t = document.querySelector('.home-toast');
  if (t) { const ph = $('#phone').getBoundingClientRect(), fr = document.querySelector('.footer').getBoundingClientRect(); t.style.bottom = (ph.bottom - fr.top + 16) + 'px'; }
  window.TMIcons?.render(document.querySelector('#phone'));
  document.querySelectorAll('[data-minutes]').forEach(b => b.onclick = () => { duration = Number(b.dataset.minutes); render(); });
  document.querySelectorAll('.wheel-item[data-value]').forEach(b => b.onclick = () => { const v = Number(b.dataset.value); let h = Math.floor(duration / 60), m = duration % 60; if (b.dataset.col === 'Hours') h = v; else m = v; if (h >= hourRange - 2) hourRange += 24; duration = Math.max(15, h * 60 + m); render(); });
  if ($('#add')) $('#add').onclick = () => { previous = state; state = 'add-wheel'; duration = 30; render(); $('#close').focus(); };
  const close = () => { state = previous; render(); $('#add')?.focus(); };
  const profileBtn = document.querySelector('.header-actions [aria-label="Profile"]'); if (profileBtn) profileBtn.onclick = () => { if (!isSheet()) { previous = state; } state = (state === 'profile-case-open') ? 'profile-case-open' : 'profile'; render(); $('#profile-back')?.focus(); };
  const logoutBtn = document.querySelector('[data-logout]'); if (logoutBtn) logoutBtn.onclick = () => { state = 'logout-confirm'; render(); $('#close')?.focus(); };
  if (isSheet()) { const sh = document.querySelector('.tm-sheet'); sh.setAttribute('tabindex', '-1'); sh.focus({ preventScroll: true }); if ($('#close')) $('#close').onclick = close; const sec = document.querySelector('.tm-sheet [data-secondary]'); if (sec) sec.onclick = state==='logout-confirm' ? () => { state = 'profile'; render(); } : state==='end-confirmation' ? () => { state = previous; render(); } : close; }
  document.querySelectorAll('[data-confirm]').forEach(b => b.onclick = () => { $('#review-status').textContent = 'Reference only: connect this action to native app state and server confirmation.'; });
  $('#state').value = state;
}
$('#state').onchange = e => { state = e.target.value; duration = 30; render(); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isSheet()) { state = previous; render(); $('#add')?.focus(); }
  if (e.key === 'Tab' && isSheet()) {
    const f = [...document.querySelectorAll('.tm-sheet button:not(:disabled)')];
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  }
});
render();

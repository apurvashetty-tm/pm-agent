// Home render options (2026-11-11 agreed blocks). Reference pictures only: no app state, no network.
// Approved copy from ../../../ui-screens/feedback/messages.json (TMFeedback.msg); NEW copy is marked NEW below.
// Options differ in one way: A = one card, two rows, divider · B = two separate cards · C = as A, and setup's duration choice in a card too.
const $ = (s) => document.querySelector(s);
const M = (k, p) => window.TMFeedback.msg(k, p);
const NEW = {   // NEW copy agreed 2026-11-11 (brief §1)
  duration: 'Availability duration', range: '15 minutes to 10 hours', quick: 'Quick picks', custom: 'Custom',
  rxWritten: 'Prescriptions written today', capHint: 'Up to 10 hours in total',
};
const STATES = {
  'setup-pick':   { label: 'Setup · quick pick chosen', setup: true, duration: 60, count: 0 },
  'setup-custom': { label: 'Setup · custom, no chip', setup: true, duration: 75, count: 0 },
  'setting':      { label: 'Setting…', setup: true, duration: 60, count: 0, busy: 'home.setting' },
  'available':    { label: 'Available', time: '30:00', count: 3 },
  'available-long': { label: 'Available · longest timer (boundary)', time: '9:59:59', count: 3 },
  'near-expiry':  { label: 'Near expiry + Add time', time: '5:00', count: 3, near: true, bar: ['tm-notice--warning', 'clock', 'home.endingSoon'] },
  'add-cap':      { label: 'Add time sheet at the 10-hour cap', time: '5:00', count: 3, near: true, bar: ['tm-notice--warning', 'clock', 'home.endingSoon'], sheet: 585, left: 5 },
  'stop-pending': { label: 'Stop pending (count row only)', count: 3, stopping: true, top: ['tm-notice--neutral', 'info-circle', 'home.stopPending'] },
  'ended':        { label: 'Ended Home with count', setup: true, duration: 30, count: 3, top: ['tm-notice--neutral', 'info-circle', 'home.manuallyEnded'] },
  'ended-zero':   { label: 'Ended Home, count 0 (no row)', setup: true, duration: 30, count: 0, top: ['tm-notice--neutral', 'info-circle', 'home.idleExpired'] },
  'setup-max':    { label: 'Setup · wheel at 10 h (minutes 00 only)', setup: true, duration: 600, count: 0 },
  'offline':      { label: 'Offline (bar notice)', time: '30:00', count: 3, offline: true, bar: ['tm-notice--warning', 'alert-triangle', 'home.offline'] },
};
const q = new URLSearchParams(location.search);
let option = ['a', 'b', 'c'].includes(q.get('option')) ? q.get('option') : 'a';
let state = STATES[q.get('state')] ? q.get('state') : 'available';
const icon = (n, cls = '') => `<span class="tm-icon ${cls}" data-icon="${n}" aria-hidden="true"></span>`;
const chipLabel = (n) => n < 60 ? M('home.presetMinutes', { n }) : n === 60 ? M('home.presetHour') : M('home.presetHours', { n: n / 60 });
const notice = ([tone, ic, key], cls = '') => `<div class="tm-notice ${tone} status ${cls}" role="status">${icon(ic)}<span>${M(key)}</span></div>`;

// Agreed 4: setup wheel 0–10 h (at 10 h minutes 00 only; at 0 h minutes 15/30/45). The add wheel tops out at what is left.
function minutesFor(h, maxMin) { const all = h === 0 ? [15, 30, 45] : [0, 15, 30, 45]; return all.filter((m) => h * 60 + m <= maxMin); }
function column(name, values, current, busy) {
  const i = Math.max(0, values.indexOf(current));
  const rows = [i - 1, i, i + 1].map((j) => (j >= 0 && j < values.length ? values[j] : null));
  // Agreed a11y: each column is a spinbutton (name, value, min/max; arrows step it). Rows are visual only.
  return `<div class="wheel" role="spinbutton" tabindex="0" aria-label="${name}" aria-valuenow="${current}" aria-valuemin="${values[0]}" aria-valuemax="${values.at(-1)}"${busy ? ' aria-disabled="true"' : ''}>${rows.map((v, k) => `<span class="wheel-item${k === 1 ? ' is-selected' : ''}" aria-hidden="true">${v === null ? '' : v}</span>`).join('')}</div>`;
}
function picker(duration, maxMin, busy) {
  const h = Math.floor(duration / 60), m = duration % 60;
  const hours = Array.from({ length: Math.floor(maxMin / 60) + 1 }, (_, v) => v).filter((v) => minutesFor(v, maxMin).length);
  const chips = [15, 30, 45, 60, 120, 180].filter((n) => n <= maxMin);
  return `<p class="sublabel">${NEW.quick}</p>
    <div class="presets">${chips.map((n) => `<button type="button" class="tm-chip tm-chip--lg" aria-pressed="${duration === n}"${busy ? ' disabled' : ''}>${chipLabel(n)}</button>`).join('')}</div>
    <p class="sublabel">${NEW.custom}</p>
    <div class="col-heads"><span>${M('home.hours')}</span><span>${M('home.minutes')}</span></div>
    <div class="columns${busy ? ' is-busy' : ''}"><div class="wheel-band" aria-hidden="true"></div>${column(M('home.hours'), hours, h, busy)}${column(M('home.minutes'), minutesFor(h, maxMin), m, busy)}</div>`;
}
const timeRow = (s) => `<div class="stat">${icon('clock')}<div class="stat-main"><p class="stat-label">${M('home.timeRemaining')}</p><div class="stat-value"><p class="tm-value-display" role="timer" aria-live="off">${s.time}</p><span class="slot${s.near ? '' : ' is-empty'}"><button id="add" class="tm-btn tm-btn--secondary" type="button"${s.near ? '' : ' tabindex="-1" aria-hidden="true"'}${s.offline ? ' disabled' : ''}>${M('home.addTime')}</button></span></div></div></div>`;
const countRow = (s) => `<div class="stat">${icon('clipboard-text')}<div class="stat-main"><p class="stat-label">${NEW.rxWritten}</p><div class="stat-value"><p class="tm-value-display">${s.count}</p></div></div></div>`;
function stats(s) {
  if (s.stopping) return `<div class="tm-card stats">${countRow(s)}</div>`;   // Agreed: stop-pending shows only the count row (D-47)
  if (option === 'b') return `<div class="stats-stack"><div class="tm-card">${timeRow(s)}</div><div class="tm-card">${countRow(s)}</div></div>`;
  return `<div class="tm-card stats">${timeRow(s)}<hr class="tm-divider">${countRow(s)}</div>`;
}
function setupBody(s) {
  const count = s.count > 0 ? `<div class="tm-card ended-count">${countRow(s)}</div>` : '';   // Agreed 3: only when above 0
  const block = `<h2 class="section-title">${NEW.duration}</h2><p class="hint">${NEW.range}</p>${picker(s.duration, 600, !!s.busy)}`;
  return count + (option === 'c' ? `<div class="tm-card">${block}</div>` : block);
}
function footer(s) {
  const bar = s.bar ? notice(s.bar) : '';
  if (s.setup) {
    const p = s.busy ? `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block tm-btn--busy" aria-busy="true" disabled><span class="tm-spinner" aria-hidden="true"></span>${M(s.busy)}</button>`
      : `<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block">${M('home.setAvailability')}</button>`;
    return `<div class="tm-actionbar footer">${bar}${p}</div>`;
  }
  const dis = s.offline || s.stopping;
  return `<div class="tm-actionbar footer">${bar}<button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block"${dis ? ' disabled' : ''}>${M('home.requestCase')}</button><button class="tm-btn tm-btn--quiet tm-btn--lg tm-btn--block"${s.offline ? ' disabled' : ''}>${M(s.stopping ? 'home.ending' : 'home.endAvailability')}</button></div>`;
}
function sheet(s) {
  const maxMin = 600 - s.left;   // Agreed 4: remaining + added never above 10 hours
  return `<div class="tm-overlay overlay"><section role="dialog" aria-modal="true" aria-labelledby="sheet-title" class="tm-sheet"><header class="tm-sheet__header"><h2 id="sheet-title" class="tm-sheet__title">${M('home.addTitle')}</h2><button class="tm-btn tm-btn--quiet tm-btn--icon tm-sheet__close" aria-label="Close" type="button">${icon('x')}</button></header><div class="tm-sheet__body"><p class="tm-sheet__subtitle">${M('home.addSub')}</p><p class="hint">${NEW.capHint}</p><div class="sheet-picker">${picker(s.sheet, maxMin, false)}</div></div><div class="tm-sheet__actions"><button class="tm-btn tm-btn--primary tm-btn--lg tm-btn--block">${M('home.addConfirm', { n: s.sheet })}</button><button class="tm-btn tm-btn--quiet tm-btn--lg tm-btn--block">${M('home.cancel')}</button></div></section></div>`;
}
function render() {
  const s = STATES[state];
  const title = s.setup ? M('home.titleSetup') : s.stopping ? M('home.titleStopping') : M('home.titleActive');
  const sub = s.setup ? M('home.subSetup') : s.stopping ? M('home.subNoNewCases') : M('home.subActive');
  $('#phone').className = `phone opt-${option} st-${state}`;
  $('#phone').innerHTML = `<div id="background"${s.sheet ? ' inert' : ''}>
    <header class="header"><img class="logo" src="../../../brand/truemeds-for-doctors.svg" alt="Truemeds for doctors"><div class="header-actions">${[['bell', 'home.notifications'], ['help-circle', null], ['user-circle', 'home.profile']].map(([i, k]) => `<button class="tm-btn tm-btn--quiet tm-btn--icon" aria-label="${k ? M(k) : 'Help'}" type="button">${icon(i)}</button>`).join('')}</div></header>
    <section class="band"><h1 class="band-title">${title}</h1><p class="sub">${sub}</p></section>
    <div class="panel">${s.top ? notice(s.top) : ''}<div class="scroll">${s.setup ? setupBody(s) : stats(s)}</div>${footer(s)}</div>
  </div>${s.sheet ? sheet(s) : ''}`;
  window.TMIcons?.render($('#phone'));
  $('#opt').value = option; $('#st').value = state;
}
$('#st').innerHTML = Object.entries(STATES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
$('#opt').onchange = (e) => { option = e.target.value; render(); };
$('#st').onchange = (e) => { state = e.target.value; render(); };
render();

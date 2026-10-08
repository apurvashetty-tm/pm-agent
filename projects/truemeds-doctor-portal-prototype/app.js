
// ================================================================
// DOCTOR PROFILE — [MOCK ASSUMPTION] Logged-in doctor details
// ================================================================
const DOCTOR_PROFILE = {
  name:            'Dr. Apurva Shetty',
  role:            'General Physician',
  initials:        'AS',
  earnings_today:  0.00,
  incentive_today: 0.00,
};

// ================================================================
// MOCK SCENARIO DATA — new medicine format per session_handoff Section 2.4
// [MOCK ASSUMPTION] All patient data and order IDs are fictional.
// prescription_attached is MOCK_ONLY — set true for all scenarios.
// ================================================================

const SCENARIOS = {

  cat4: {
    case_type: 'cat4', ha_status: 'not_applicable', meds_type: 'not_applicable',
    doctor_name: 'Dr. Priya Sharma',
    patient_name: 'Ramesh Gupta', patient_age: 54, patient_gender: 'Male',
    patient_phone: '+91 98765 XXXXX',
    order_id: 'TM-ORD-20240812', case_id: 'C-CAT4-00431', order_value: 1240,
    order_created: '12 Aug 2024', order_delivery: '16 Aug 2024', payment_mode: 'Online',
    assignment_status: 'assigned',
    prescription_attached: true,
    medicines: [
      { id:1, name:'Metformin',          strength:'500mg',   m:1, a:0, n:1, qty:60, price:28,  form:'tablet',    interval:'daily',   duration:'ongoing', food:null,            validation_status:'prescribed',     disabled:false },
      { id:2, name:'Amlodipine',         strength:'5mg',     m:1, a:0, n:0, qty:30, price:52,  form:'tablet',    interval:'daily',   duration:'ongoing', food:null,            validation_status:'not_prescribed', disabled:false },
      { id:3, name:'Atorvastatin',       strength:'10mg',    m:0, a:0, n:1, qty:30, price:45,  form:'capsule',   interval:'daily',   duration:'ongoing', food:null,            validation_status:'not_prescribed', disabled:false },
      { id:4, name:'Vitamin B12',        strength:'1000mcg', m:0, a:0, n:0, qty:4,  price:120, form:'injection', interval:'monthly', duration:'3m',      dose:1,      food:null,               validation_status:'not_prescribed', disabled:false },
      { id:5, name:'Antacid Suspension', strength:'10ml',    m:0, a:10, n:10, qty:1, price:85, form:'syrup',     interval:'daily',   duration:'7d',      rx_line:'0-1-1 · Qty 1',      food:null,            validation_status:'not_prescribed', disabled:false },
    ]
  },

  pilot_value_meds_ha: {
    case_type: 'pilot', ha_status: 'required', meds_type: 'value',
    doctor_name: 'Dr. Priya Sharma',
    patient_name: 'Sunita Patel', patient_age: 38, patient_gender: 'Female',
    patient_phone: '+91 77654 XXXXX',
    order_id: 'TM-ORD-20240891', case_id: 'C-PLT-00874', order_value: 890,
    order_created: '21 Aug 2024', order_delivery: '25 Aug 2024', payment_mode: 'Online',
    assignment_status: 'assigned',
    prescription_attached: true,
    medicines: [
      { id:1, name:'Levothyroxine',            strength:'50mcg', m:1, a:0, n:0, qty:30, price:38, form:'tablet',  interval:'daily', duration:'ongoing', food:null,           validation_status:'not_prescribed', disabled:false },
      { id:2, name:'Calcium + Vit D3',         strength:'500mg', m:1, a:0, n:1, qty:60, price:65, form:'capsule', interval:'daily', duration:'ongoing', food:null,             validation_status:'prescribed',     disabled:false },
      { id:3, name:'Sodium Chloride Eye Drops', strength:'0.9%', m:0, a:1, n:1, qty:1,  price:55, form:'drops',   interval:'daily', duration:'7d',      food:null,                validation_status:'not_prescribed', disabled:false },
    ]
  },

  pilot_nonvalue_meds_ha: {
    case_type: 'pilot', ha_status: 'required', meds_type: 'non_value',
    doctor_name: 'Dr. Priya Sharma',
    patient_name: 'Vikram Nair', patient_age: 62, patient_gender: 'Male',
    patient_phone: '+91 90321 XXXXX',
    order_id: 'TM-ORD-20240953', case_id: 'C-PLT-00912', order_value: 560,
    order_created: '03 Sep 2024', order_delivery: '07 Sep 2024', payment_mode: 'COD',
    assignment_status: 'assigned',
    prescription_attached: true,
    medicines: [
      { id:1, name:'Losartan',            strength:'50mg',   m:1, a:0, n:0, qty:30, price:42, form:'tablet', interval:'daily', duration:'ongoing', food:null,           validation_status:'not_prescribed', disabled:false },
      { id:2, name:'Hydrochlorothiazide', strength:'12.5mg', m:1, a:0, n:0, qty:30, price:18, form:'tablet', interval:'daily', duration:'ongoing', food:null,           validation_status:'not_prescribed', disabled:false },
      { id:3, name:'Aspirin',             strength:'75mg',   m:0, a:0, n:1, qty:30, price:12, form:'tablet', interval:'daily', duration:'ongoing', food:null,           validation_status:'prescribed',     disabled:false },
      { id:4, name:'Betamethasone Cream', strength:'0.1%',   m:0, a:1, n:1, qty:1,  price:95, form:'cream',  interval:'daily', duration:'7d',      food:null,              validation_status:'not_prescribed', disabled:false },
    ]
  },

  pilot_ha_skipped_customer: {
    case_type: 'pilot', ha_status: 'skipped_customer', meds_type: 'value',
    doctor_name: 'Dr. Priya Sharma',
    patient_name: 'Ananya Krishnan', patient_age: 29, patient_gender: 'Female',
    patient_phone: '+91 81234 XXXXX',
    order_id: 'TM-ORD-20241034', case_id: 'C-PLT-01021', order_value: 430,
    order_created: '14 Sep 2024', order_delivery: '18 Sep 2024', payment_mode: 'Online',
    assignment_status: 'assigned',
    prescription_attached: true,
    medicines: [
      { id:1, name:'Ferrous Sulphate',   strength:'200mg',  m:0, a:0, n:1, qty:30, price:35,  form:'tablet',  interval:'daily', duration:'3m', food:null,           validation_status:'prescribed',     disabled:false },
      { id:2, name:'Folic Acid',         strength:'5mg',    m:1, a:0, n:0, qty:30, price:22,  form:'tablet',  interval:'daily', duration:'3m', food:null,           validation_status:'prescribed',     disabled:false },
      { id:3, name:'Salbutamol Inhaler', strength:'100mcg', m:0, a:0, n:0, qty:1,  price:185, form:'inhaler', interval:'sos',   duration:'ongoing', dose:2, sosMax:4, food:null,              validation_status:'not_prescribed', disabled:false },
    ]
  },

  pilot_ha_skipped_system: {
    case_type: 'pilot', ha_status: 'skipped_system', meds_type: 'value',
    doctor_name: 'Dr. Priya Sharma',
    patient_name: 'Mohan Reddy', patient_age: 47, patient_gender: 'Male',
    patient_phone: '+91 98001 XXXXX',
    order_id: 'TM-ORD-20241112', case_id: 'C-PLT-01088', order_value: 310,
    order_created: '22 Sep 2024', order_delivery: '26 Sep 2024', payment_mode: 'Online',
    assignment_status: 'assigned',
    prescription_attached: true,
    medicines: [
      { id:1, name:'Pantoprazole', strength:'40mg', m:1, a:0, n:0, qty:30, price:44, form:'capsule', interval:'daily', duration:'1m', food:null,           validation_status:'prescribed', disabled:false },
    ]
  }
};

// ================================================================
// DOCTOR STATE
// ================================================================
const DOCTOR_STATE = {
  activeScenario:    'cat4',
  consultationState: 'assigned',
  callTimer:         0,
  gatePassedAt:      null,
  currentCase:       null,
  timerInterval:     null,
  haSkippedInSession:false,
  holdReason:        null,
  callbackDay:       null,
  callbackTime:      null,
  editingMedId:      null,
  endedEarly:        false,   // doctor hung up before 50s gate
};

// Ephemeral callback picker state
const CALLBACK_STATE = { day: null, time: null };

// ================================================================
// ICONS — Tabler outline via the central design system (icons.js → TMIcons).
// Markup: <span class="tm-icon" data-icon="name"></span> (rendered by icons.js).
// State changes in JS call icon('name'). Never inline SVG in this file.
// ================================================================
const icon = (name) => TMIcons.svg(name);                       // bare <svg> (put inside a .tm-icon span)
const iconEl = (name, size) =>                                  // ready-made sized icon element
  `<span class="tm-icon${size ? ' tm-icon--' + size : ''}">${TMIcons.svg(name)}</span>`;
function initIcons() { TMIcons.render(); }

// ================================================================
// PRESCRIBE SCREEN — model + text (agreed 2026-10-07, see docs/context/session_handoff.md)
// ================================================================
// Customer Rx (View Rx) is source material: freeze each medicine's Rx line before any doctor edit can touch it.
Object.values(SCENARIOS).forEach(sc => sc.medicines.forEach(med => {
  if (!med.rx_line) med.rx_line = `${formatMAN(med.m, med.a, med.n)} · Qty ${med.qty}`;
}));

const EDIT_STATE = {};   // filled by openMedEdit()

const INTERVALS = [
  ['daily', 'Daily'], ['every_x_hours', 'Every X hours'], ['alt_days', 'Alt days'],
  ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['sos', 'SOS only'],
];
const HOURS = [4, 6, 8, 12];
const SOS_MAX = [1, 2, 3, 4];
const DUR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 15];
const DUR_UNITS = [['d', 'Days'], ['w', 'Weeks'], ['m', 'Months']];
const FOODS = [['after_food', 'After food'], ['before_food', 'Before food'], ['empty_stomach', 'Empty stomach']];
const ONGOING_DEFAULT = '6 months';   // backend default for Ongoing [MOCK ASSUMPTION — configured in backend]

// Dose choices and units follow the medicine's form. `other` = the "Other" number entry (unit shown beside it).
// showUnit: the Dose heading shows the unit only when the form under the name doesn't already say it (ml, puffs) — agreed 2026-10-08.
const FORM_DOSE = {
  tablet:    { one: 'tablet',  many: 'tablets',  slot: [0, 0.5, 1, 2], each: [0.5, 1, 2] },
  capsule:   { one: 'capsule', many: 'capsules', slot: [0, 0.5, 1, 2], each: [0.5, 1, 2] },
  syrup:     { one: 'ml',      many: 'ml',       slot: [0, 2.5, 5, 10], each: [2.5, 5, 10], other: 'ml', showUnit: true },
  drops:     { one: 'drop',    many: 'drops',    slot: [0, 1, 2, 3],   each: [1, 2, 3] },
  inhaler:   { one: 'puff',    many: 'puffs',    slot: [0, 1, 2],      each: [1, 2], showUnit: true },
  injection: { one: 'dose',    many: 'doses',    slot: [0, 1],         each: [1], other: 'units' },
  cream:     { one: 'apply',   many: 'apply',    slot: [0, 1],         each: [1], apply: true },
};
const formDose = f => FORM_DOSE[f] || FORM_DOSE.tablet;
const defaultSosDose = f => { const e = formDose(f).each; return e.includes(1) ? 1 : e[0]; };   // SOS dose starts at 1 unit where that exists
const FORM_LABEL = { tablet:'Tablet', capsule:'Capsule', syrup:'Syrup', drops:'Drops', inhaler:'Inhaler', injection:'Injection', cream:'Cream' };

const numLabel = v => v === 0.5 ? '½' : String(v);
function chipLabel(form, v) {
  if (formDose(form).apply) return v === 1 ? 'Apply' : '—';   // creams: Apply / — (none), never "0"
  return numLabel(v);
}
function doseText(form, v, isOther) {
  const fd = formDose(form);
  if (fd.apply) return 'Apply';
  if (isOther) return `${v} ${fd.other}`;
  if (fd.one === 'ml') return `${numLabel(v)} ml`;
  return `${numLabel(v)} ${v > 1 ? fd.many : fd.one}`;
}
// On screen "Ongoing" shows its period; on the printed prescription only the period is printed (agreed 2026-10-08).
function durationText(code, forPrint = false) {
  if (!code) return '';
  if (code === 'ongoing') return forPrint ? ONGOING_DEFAULT : `Ongoing (${ONGOING_DEFAULT})`;
  const n = parseInt(code, 10), u = code.slice(-1);
  const word = { d: 'day', w: 'week', m: 'month' }[u];
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
// Schedule part of the printed line, e.g. "1-0-1 + SOS 1 tablet (max 2/day)", "5 ml every 8 hours", "2 puffs as needed (max 4/day)".
function scheduleText(x) {
  const fd = formDose(x.form);
  let t;
  switch (x.interval) {
    case 'daily': {
      const man = formatMAN(x.m, x.a, x.n);
      t = fd.apply ? `Apply ${man}` : (['tablet', 'capsule'].includes(x.form) ? man : `${man} ${fd.many}`);
      break;
    }
    case 'every_x_hours': t = `${doseText(x.form, x.dose, x.doseOther)} every ${x.hours} hours`; break;
    case 'alt_days':      t = `${doseText(x.form, x.dose, x.doseOther)} on alternate days`; break;
    case 'weekly':        t = `${doseText(x.form, x.dose, x.doseOther)} once a week`; break;
    case 'monthly':       t = `${doseText(x.form, x.dose, x.doseOther)} once a month`; break;
    case 'sos':           return `${doseText(x.form, x.dose, x.doseOther)} as needed (max ${x.sosMax}/day)`;
    default:              t = '';
  }
  return x.sos ? `${t} + SOS ${doseText(x.form, x.sosDose ?? defaultSosDose(x.form))} (max ${x.sosMax}/day)` : t;
}
// Full printed line: schedule · duration · food (only if chosen) · note (only if written)
function printLine(x) {
  const food = FOODS.find(f => f[0] === x.food);
  return [scheduleText(x), durationText(x.duration, true), food ? food[1] : '', (x.note || '').trim()].filter(Boolean).join(' · ');
}

// ================================================================
// CTA ROUTING — [LOCKED] project_truth.md Section 5
// ================================================================
function resolveCTA(scenario) {
  const { case_type, ha_status, meds_type } = scenario;
  if (case_type === 'cat4') return { label:'Confirm Order',       icon:'', type:'confirm_order'    };
  if (ha_status === 'skipped_customer' || ha_status === 'skipped_system')
                           return { label:'Confirm Order',       icon:'', type:'confirm_order'    };
  if (ha_status === 'required') {
    if (meds_type === 'value')     return { label:'Confirm & Transfer', icon:'', type:'confirm_transfer' };
    if (meds_type === 'non_value') return { label:'Confirm & Forward',  icon:'', type:'confirm_forward'  };
  }
  return { label:'Confirm Order', icon:'', type:'confirm_order' };
}

function haSkipApplicable(scenario) {
  return scenario.case_type === 'pilot' && scenario.ha_status === 'required';
}

// ================================================================
// MEDICINE FORM ICONS — one outline glyph per dosage form
// ================================================================
function getMedIcon(form) {
  // One outline glyph per dosage form (Tabler + [PROPOSED] custom glyphs in build-icons.mjs, D-29). Tablet is drawn at an angle
  // so it can't read as a "no entry" / minus sign, and it must look different from the capsule.
  const byForm = { tablet:'tablet', capsule:'pill', injection:'vaccine', syrup:'syrup',
                   drops:'eye-drops', cream:'ointment-tube', inhaler:'inhaler' };   // custom glyphs: D-29
  return iconEl(byForm[form] || 'tablet', 24);
}

// ================================================================
// FORMAT HELPERS
// ================================================================
function formatMAN(m, a, n) {
  const f = v => v === 0.5 ? '½' : String(v);
  return `${f(m)}-${f(a)}-${f(n)}`;
}

function formatTimer(s) {
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

// ================================================================
// RENDER — drives all UI from DOCTOR_STATE
// ================================================================
function render() {
  const c = DOCTOR_STATE.currentCase;
  if (!c) return;

  // --- Patient detail block ---
  document.getElementById('patient-full-name').textContent = c.patient_name;
  document.getElementById('patient-details-row').textContent = `${c.patient_age} years · ${c.patient_gender}`;
  document.getElementById('pdb-view-rx-btn').classList.toggle('hidden', !c.prescription_attached);

  document.getElementById('display-order-id').textContent    = c.order_id;
  document.getElementById('display-order-value').textContent = `₹${c.order_value.toLocaleString('en-IN')}`;

  // Order expand fields
  document.getElementById('display-order-created').textContent  = c.order_created  || '—';
  document.getElementById('display-order-delivery').textContent = c.order_delivery || '—';
  document.getElementById('display-payment-mode').textContent   = c.payment_mode   || '—';

  // --- Compact strip content ---
  updateCompactStrip();

  // --- Populate Rx doc with patient data ---
  document.getElementById('rx-patient-name-display').textContent = c.patient_name;
  document.getElementById('rx-age-display').textContent = `${c.patient_age} / ${c.patient_gender}`;
  document.getElementById('rx-date-display').textContent = formatDate(new Date());
  renderRxMedicines(c.medicines);

  // --- Medicines list ---
  renderMedicines(c.medicines);

  renderCallPhase();
  renderPostCall();
  syncCaseActionBar();
  renderSidePanel();
  updateCompactStripVisibility();

  document.getElementById('demo-state-label').textContent =
    `State: ${DOCTOR_STATE.consultationState} | ${formatTimer(DOCTOR_STATE.callTimer)}`;
}

function updateCompactStrip() {
  const c = DOCTOR_STATE.currentCase;
  if (!c) return;
  document.getElementById('cs-patient-name').textContent = c.patient_name;
  document.getElementById('cs-patient-meta').textContent =
    `${c.patient_age}y · ${c.patient_gender}`;
  document.getElementById('cs-order-value').textContent = `₹${c.order_value.toLocaleString('en-IN')}`;
  document.getElementById('cs-view-rx-btn').classList.toggle('hidden', !c.prescription_attached);

  const state = DOCTOR_STATE.consultationState;
}

function renderRxMedicines(meds) {
  const list = document.getElementById('rx-medicines-list');
  list.innerHTML = '';
  if (!meds || meds.length === 0) {
    list.innerHTML = '<p class="rx-empty">No medicines listed</p>';
    return;
  }
  meds.forEach((med, i) => {
    const div = document.createElement('div');
    div.className = 'rx-med-item';
    div.innerHTML = `
      <div class="rx-med-number">Medicine ${i + 1}</div>
      <div class="rx-med-name">${med.name} ${med.strength}</div>
      <div class="rx-med-details">${med.rx_line}</div>
      <div class="rx-med-note">As directed. Complete full course.</div>
    `;
    list.appendChild(div);
  });
}

function renderMedicines(meds) {
  const list  = document.getElementById('medicines-list');
  const empty = document.getElementById('medicines-empty');
  const count = document.getElementById('medicines-count');
  list.innerHTML = '';
  if (!meds || meds.length === 0) {
    empty.style.display = 'block';
    count.textContent = '0 medicines';
    return;
  }
  empty.style.display = 'none';
  count.textContent = `${meds.length} medicine${meds.length !== 1 ? 's' : ''}`;
  meds.forEach(med => {
    const isDisabled = !!med.disabled;
    const statusMap = {
      not_prescribed: { cls:'tm-tag--warning', label:'Pending'    },
      prescribed:     { cls:'tm-tag--success', label:'Prescribed' },
      disabled:       { cls:'',                label:'Disabled'   },
    };
    const st = isDisabled ? 'disabled' : (med.validation_status || 'not_prescribed');
    const { cls: sc, label: sl } = statusMap[st] || statusMap.not_prescribed;

    // Dosage detail line
    const sched   = [scheduleText(med), durationText(med.duration)].filter(Boolean).join(' · ');

    const el = document.createElement('div');
    el.className = `tm-row medicine-item${isDisabled ? ' disabled' : ''}`;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `Edit ${med.name}`);
    el.onclick = () => openMedEdit(med.id);
    el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') openMedEdit(med.id); };
    el.innerHTML = `
      <div class="tm-thumb med-icon">${getMedIcon(med.form || 'tablet')}</div>
      <div class="tm-row__main med-info">
        <div class="tm-row__title med-name">${med.name} ${med.strength}</div>
        <div class="tm-row__meta med-detail">
          <span>${sched}</span><span>Qty ${med.qty}</span>
        </div>
      </div>
      <span class="tm-tag tm-tag--md ${sc}">${sl}</span>
      ${iconEl('chevron-right', 16)}
    `;
    list.appendChild(el);
  });
}

function renderCallPhase() {
  const state   = DOCTOR_STATE.consultationState;
  const callBtn = document.getElementById('call-initiate-btn');
  const callBtnIcon = document.getElementById('call-btn-icon');
  const callBtnLbl  = document.getElementById('call-btn-label');
  const statusLbl   = document.getElementById('az-status-label');
  const phase1      = document.getElementById('az-phase1');
  const c = DOCTOR_STATE.currentCase;

  // ── Briefing strip — all scenarios, persists above both phases ──
  const brief   = document.getElementById('pre-call-brief');
  const pcbText = document.getElementById('pcb-text');
  const pcbLabel = document.getElementById('pcb-label');
  // Hide briefing after an early hang-up or a call that didn't connect — closing script is irrelevant
  // until the doctor re-dials
  const missed = state === 'no_answer' || state === 'hold';
  const endedEarly = state === 'assigned' && DOCTOR_STATE.endedEarly;
  document.getElementById('az-missed').hidden = !(missed || endedEarly);
  if (endedEarly) document.getElementById('az-missed-text').textContent = 'Call ended before 50 seconds — call again or schedule a callback.';
  document.getElementById('az-unavail-btn').hidden = !missed;
  if (missed) document.getElementById('az-missed-text').textContent =
    state === 'hold' ? 'Call didn\'t connect.' : 'Patient didn\'t pick up.';
  if (c && !DOCTOR_STATE.endedEarly && !missed) {
    const isHA = c.case_type === 'pilot' && c.ha_status === 'required';
    const isValue = c.meds_type === 'value';
    brief.classList.add('visible');
    if (isHA && isValue) {
      pcbText.textContent  = '"Please stay on the line — I\'ll connect you to our Health Advisor"';
    } else if (isHA && !isValue) {
      pcbText.textContent  = '"Our Health Advisor will call you shortly after this consultation"';
    } else {
      pcbText.textContent  = '"I\'m confirming your order now — you can track delivery and updates on the Truemeds app"';
    }
  } else {
    brief.classList.remove('visible');
  }

  // ── Demo call simulator visibility (mobile + desktop) ──
  const simDiv = document.getElementById('demo-call-sim');
  simDiv.style.display = state === 'calling' ? 'flex' : 'none';
  const sideSimDiv = document.getElementById('side-demo-call-sim');
  if (sideSimDiv) sideSimDiv.style.display = state === 'calling' ? 'flex' : 'none';

  // ── Phase 1 visibility ──
  const gateOpen = ['gate_passed', 'completed', 'unavailable'].includes(state);
  phase1.style.display = gateOpen ? 'none' : 'flex';
  callBtn.hidden = gateOpen;            // pinned bar: Call Patient lives there until the gate passes
  // Closed case: the card says what happened (never a stale script); unavailable gets Next Order in the pinned bar
  const closed = ['completed', 'unavailable'].includes(state);
  const closedBox = document.getElementById('az-closed');
  closedBox.hidden = !closed;
  if (closed) {
    brief.classList.remove('visible');
    document.getElementById('az-closed-text').textContent = state === 'unavailable'
      ? 'Patient unavailable — case returned to the queue.'
      : (DOCTOR_STATE.closedNote || 'Case closed.');
    closedBox.querySelector('.tm-icon').innerHTML = icon(state === 'unavailable' ? 'phone-off' : 'circle-check');
  }
  document.getElementById('next-order-btn').hidden = state !== 'unavailable';
  if (gateOpen) { document.getElementById('pre-gate-callback-btn').classList.add('hidden'); return; }

  // ── Reset button defaults — all cosmetics via design-system .tm-btn classes ──
  callBtn.disabled  = false;
  callBtn.className = 'tm-btn tm-btn--lg tm-btn--primary tm-btn--block';
  statusLbl.classList.add('hidden');
  statusLbl.textContent = '';

  if (state === 'calling') {
    const name = c ? c.patient_name.split(' ')[0] : 'Patient';
    callBtnIcon.innerHTML  = icon('phone');
    callBtnLbl.textContent = `Calling ${name}…`;
    callBtn.disabled       = true;
    callBtn.className      = 'tm-btn tm-btn--lg tm-btn--primary tm-btn--block tm-btn--busy pulsing';
    return;
  }
  const preGateCb = document.getElementById('pre-gate-callback-btn');
  if (state === 'connected') {
    callBtnIcon.innerHTML  = icon('phone-x');
    callBtnLbl.textContent = 'End Call';
    callBtn.className      = 'tm-btn tm-btn--lg tm-btn--destructive tm-btn--block';
    // Pre-gate schedule callback as quiet escape hatch during live call
    if (preGateCb) preGateCb.className = 'tm-btn tm-btn--sm tm-btn--secondary tm-btn--block';
    return;
  }
  // assigned / no_answer / hold — show Call Patient
  if (DOCTOR_STATE.endedEarly) {
    // Early hang-up: escape routes = retry OR schedule callback (ghost button)
    callBtnIcon.innerHTML  = icon('phone');
    callBtnLbl.textContent = 'Call Again';
    if (preGateCb) preGateCb.className = 'tm-btn tm-btn--sm tm-btn--secondary tm-btn--block';
    return;
  }
  if (preGateCb) preGateCb.className = 'tm-btn tm-btn--sm tm-btn--secondary tm-btn--block hidden';
  callBtnIcon.innerHTML  = icon('phone');
  callBtnLbl.textContent = missed ? 'Call Again' : 'Call Patient';
}

function renderPostCall() {
  const skipBtn = document.getElementById('skip-ha-btn');
  const ctaBtn  = document.getElementById('main-cta-btn');
  const scBtn   = document.getElementById('schedule-callback-btn');

  // Only gate_passed shows post-call actions. On 'completed' the success
  // toast owns the screen exit — hiding phase2 prevents re-submitting.
  const gateOpen = DOCTOR_STATE.consultationState === 'gate_passed';

  ctaBtn.hidden = !gateOpen;            // pinned bar: the post-call CTA appears once the gate passes
  scBtn.hidden = !gateOpen;
  skipBtn.hidden = true;
  if (!gateOpen) return;

  // Restore button structure if innerHTML was replaced during submit
  if (!document.getElementById('main-cta-icon')) {
    ctaBtn.innerHTML = '<span id="main-cta-icon"></span><span id="main-cta-label">Confirm Order</span>';
  }
  ctaBtn.disabled = false;
  ctaBtn.classList.remove('submitting');
  const ctaIcon = document.getElementById('main-cta-icon');
  const ctaLbl  = document.getElementById('main-cta-label');

  const c = DOCTOR_STATE.currentCase;
  const haApplicable = haSkipApplicable(c) && !DOCTOR_STATE.haSkippedInSession;

  // Skip HA — only Pilot + HA required + not yet skipped [LOCKED]
  skipBtn.hidden = !haApplicable;

  const effectiveScenario = DOCTOR_STATE.haSkippedInSession
    ? Object.assign({}, c, { ha_status:'skipped_customer' }) : c;
  const cta = resolveCTA(effectiveScenario);
  ctaIcon.textContent = cta.icon;
  ctaLbl.textContent  = cta.label;


  console.log(`[MOCK] cta-routing | scenario=${DOCTOR_STATE.activeScenario} | ha_skip_session=${DOCTOR_STATE.haSkippedInSession} | resolved=${cta.type}`);
}

// Pinned action bar: hidden when it has nothing to show (completed / unavailable); its height feeds --ab-h so the
// page can scroll its last content clear of it and toasts can sit above it.
function syncCaseActionBar() {
  const bar = document.getElementById('case-actionbar');
  const off = b => b.hidden || b.classList.contains('hidden');
  const sec = document.getElementById('ab-secondary');
  sec.hidden = [...sec.querySelectorAll('button')].every(off);
  bar.hidden = [...bar.querySelectorAll('button')].every(off);
  document.documentElement.style.setProperty('--ab-h', bar.hidden ? '0px' : bar.offsetHeight + 'px');
}
window.addEventListener('resize', syncCaseActionBar);
new ResizeObserver(syncCaseActionBar).observe(document.getElementById('case-actionbar'));   // fonts / label changes alter its height

function renderSidePanel() {
  const c = DOCTOR_STATE.currentCase;
  if (!c) return;

  document.getElementById('side-patient-name').textContent = c.patient_name;
  document.getElementById('side-order-id').textContent = `${c.order_id} · ${c.case_id}`;

  // Side badges
  const sideRow = document.getElementById('side-badge-row');
  sideRow.innerHTML = '';
  const addSideBadge = (text) => {
    const b = document.createElement('span');
    b.className = 'tm-tag tm-tag--md';
    b.textContent = text;
    sideRow.appendChild(b);
  };
  addSideBadge(c.case_type === 'cat4' ? 'Cat4' : 'Pilot');
  if (c.case_type !== 'cat4') {
    const hs = DOCTOR_STATE.haSkippedInSession ? 'skipped_session' : c.ha_status;
    const haMap = {
      required:         ['HA Required'],
      skipped_customer: ['HA Skipped'],
      skipped_system:   ['HA Skipped (Sys)'],
      skipped_session:  ['HA Skipped'],
    };
    if (haMap[hs]) addSideBadge(haMap[hs][0]);
  }

  // Side state
  const stateIcons  = { assigned:'phone', calling:'phone-call', connected:'phone-call', gate_passed:'circle-check', no_answer:'phone-off', hold:'phone-pause', unavailable:'circle-x', completed:'circle-check' };
  const stateLabels = { assigned:'Ready to call', calling:'Dialling…', connected:'In call — live', gate_passed:'Call complete', no_answer:'No answer', hold:'On hold (timeout)', unavailable:'Customer unavailable', completed:'Completed' };
  document.getElementById('side-state-icon').innerHTML = icon(stateIcons[DOCTOR_STATE.consultationState] || 'phone');
  document.getElementById('side-state-text').textContent = stateLabels[DOCTOR_STATE.consultationState] || '—';
  document.getElementById('side-timer-text').textContent = DOCTOR_STATE.callTimer > 0
    ? `Timer: ${formatTimer(DOCTOR_STATE.callTimer)}` : 'Timer not started';

  // Side CTA
  const gateOpen = DOCTOR_STATE.consultationState === 'gate_passed';
  document.getElementById('side-cta-section').classList.toggle('visible', gateOpen);
  const sideLocked = document.getElementById('side-cta-locked');
  sideLocked.style.display = gateOpen ? 'none' : 'block';
  sideLocked.textContent = DOCTOR_STATE.consultationState === 'completed'
    ? 'Consultation completed' : 'Waiting for valid call (50s)';

  if (gateOpen) {
    document.getElementById('side-ha-banner').classList.toggle('visible', c.case_type === 'pilot' && c.ha_status === 'required' && !DOCTOR_STATE.haSkippedInSession);
    document.getElementById('side-skip-ha-btn').classList.toggle('visible', haSkipApplicable(c) && !DOCTOR_STATE.haSkippedInSession);
    const effectiveScenario = DOCTOR_STATE.haSkippedInSession ? Object.assign({}, c, { ha_status:'skipped_customer' }) : c;
    const cta = resolveCTA(effectiveScenario);
    document.getElementById('side-cta-icon').textContent  = cta.icon;
    document.getElementById('side-cta-label').textContent = cta.label;
  }

  // Side scenario buttons sync
  document.querySelectorAll('.side-scenario-btn[data-scenario]').forEach(b => {
    b.classList.toggle('active', b.dataset.scenario === DOCTOR_STATE.activeScenario);
    b.setAttribute('aria-pressed', b.dataset.scenario === DOCTOR_STATE.activeScenario);
  });
}

// ================================================================
// COMPACT STRIP — scroll-based visibility
// ================================================================
function updateCompactStripVisibility() {
  const wrapper = document.getElementById('sticky-top-wrapper');
  const pdb     = document.getElementById('patient-detail-block');
  const strip   = document.getElementById('compact-strip');
  if (!wrapper || !pdb || !strip) return;
  const wrapperBottom = wrapper.getBoundingClientRect().bottom;
  const pdbBottom     = pdb.getBoundingClientRect().bottom;
  strip.classList.toggle('visible', pdbBottom <= wrapperBottom);
}
window.addEventListener('scroll', updateCompactStripVisibility, { passive: true });
document.getElementById('main-scroll')?.addEventListener('scroll', updateCompactStripVisibility, { passive: true });   // desktop phone frame scrolls #main-scroll

// ================================================================
// ORDER EXPAND TOGGLE
// ================================================================
function toggleOrderExpand() {
  const expand = document.getElementById('pdb-order-expand');
  const btn    = document.getElementById('pdb-info-btn');
  const isOpen = !expand.classList.contains('hidden');
  expand.classList.toggle('hidden', isOpen);
  btn.classList.toggle('active', !isOpen);
  btn.setAttribute('aria-expanded', !isOpen);
}

// ================================================================
// PROFILE / LOGOUT
// ================================================================
function handleLogout() {
  closeSheet();
  console.log('[MOCK] auth.logout | user=' + DOCTOR_PROFILE.name);
}

// ================================================================
// CALL FLOW
// ================================================================
function handleCallAction() {
  const s = DOCTOR_STATE.consultationState;
  if (['assigned', 'hold', 'no_answer'].includes(s)) { initiateCall(); }
  else if (s === 'connected') {
    clearInterval(DOCTOR_STATE.timerInterval);
    DOCTOR_STATE.timerInterval = null;
    DOCTOR_STATE.consultationState = 'assigned';
    DOCTOR_STATE.callTimer = 0;
    DOCTOR_STATE.endedEarly = true;
    render();
    console.log(`[MOCK] call-service.callEnded | gate=NOT_PASSED | escape=retry_or_callback`);
  }
}

function initiateCall() {
  DOCTOR_STATE.consultationState = 'calling';
  DOCTOR_STATE.callTimer = 0;
  DOCTOR_STATE.endedEarly = false;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  console.log(`[MOCK] call-service.initiateCall | scenario=${DOCTOR_STATE.activeScenario}`);
}

// ── Demo control webhook simulators ─────────────────────────────
function simCallConnected() {
  document.getElementById('demo-call-sim').style.display = 'none';
  document.getElementById('demo-sim-calling').style.display = 'flex';
  document.getElementById('demo-sim-webhook').style.display = 'none';
  const s = document.getElementById('side-demo-call-sim');
  if (s) { s.style.display = 'none'; document.getElementById('side-sim-calling').style.display = 'flex'; document.getElementById('side-sim-webhook').style.display = 'none'; }
  DOCTOR_STATE.consultationState = 'connected';
  render();
  startCallTimer();
  console.log(`[MOCK] webhook.connected | scenario=${DOCTOR_STATE.activeScenario}`);
}

function simShowWebhookOptions() {
  document.getElementById('demo-sim-calling').style.display = 'none';
  document.getElementById('demo-sim-webhook').style.display = 'flex';
  const sc = document.getElementById('side-sim-calling');
  const sw = document.getElementById('side-sim-webhook');
  if (sc) sc.style.display = 'none';
  if (sw) sw.style.display = 'flex';
}

function simWebhook(reason) {
  document.getElementById('demo-call-sim').style.display = 'none';
  document.getElementById('demo-sim-calling').style.display = 'flex';
  document.getElementById('demo-sim-webhook').style.display = 'none';
  const s = document.getElementById('side-demo-call-sim');
  if (s) { s.style.display = 'none'; document.getElementById('side-sim-calling').style.display = 'flex'; document.getElementById('side-sim-webhook').style.display = 'none'; }

  if (reason === 'no_answer' || reason === 'timeout') {
    DOCTOR_STATE.consultationState = reason === 'timeout' ? 'hold' : 'no_answer';
    document.getElementById('sheet-retry-title').textContent =
      reason === 'timeout' ? 'Call didn\'t connect' : 'Patient didn\'t pick up';
    render();
    openSheet('sheet-retry');
  } else {
    // switched_off or wrong_number — no retry makes sense
    const label = reason === 'switched_off' ? 'phone appears switched off' : 'number appears invalid';
    DOCTOR_STATE.consultationState = 'unavailable';
    document.getElementById('unavail-desc').textContent =
      `${DOCTOR_STATE.currentCase.patient_name}'s ${label}. Case will be reassigned to the queue.`;
    render();
    openSheet('sheet-unavailable');
  }
  console.log(`[MOCK] webhook.received | reason=${reason} | scenario=${DOCTOR_STATE.activeScenario}`);
}

function retryCall() {
  closeSheet();
  DOCTOR_STATE.consultationState = 'assigned';
  render();
  console.log('[MOCK] call.retry');
}

function markCustomerUnavailable() {
  clearInterval(DOCTOR_STATE.timerInterval);
  DOCTOR_STATE.timerInterval = null;
  DOCTOR_STATE.consultationState = 'unavailable';
  document.getElementById('unavail-desc').textContent =
    `${DOCTOR_STATE.currentCase.patient_name} could not be reached. Case will be reassigned to the queue.`;
  render();
  openSheet('sheet-unavailable');
  console.log(`[MOCK] case.customerUnavailable | scenario=${DOCTOR_STATE.activeScenario}`);
}

// ── Schedule Callback (post-gate) ────────────────────────────────
function selectCallbackDay(day) {
  CALLBACK_STATE.day = day;
  document.getElementById('callback-error').hidden = true;
  document.querySelectorAll('#callback-day-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.day === day);
  });
}

function selectCallbackTime(time) {
  CALLBACK_STATE.time = time;
  document.getElementById('callback-error').hidden = true;
  document.querySelectorAll('#callback-time-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.time === time);
  });
}

function confirmScheduleCallback() {
  const err = document.getElementById('callback-error');
  if (!CALLBACK_STATE.day || !CALLBACK_STATE.time) {
    err.textContent = !CALLBACK_STATE.day && !CALLBACK_STATE.time ? 'Pick a date and a time.'
                    : !CALLBACK_STATE.day ? 'Pick a date.' : 'Pick a time.';
    err.hidden = false;
    return;
  }
  err.hidden = true;
  const dayLabel = CALLBACK_STATE.day === 'today' ? 'Today' : 'Tomorrow';
  const [h, m] = CALLBACK_STATE.time.split(':');
  const hr = parseInt(h);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const displayHr = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
  const timeLabel = `${displayHr}:${m} ${ampm}`;
  closeSheet();
  // [MOCK ASSUMPTION] Scheduling a callback is terminal for this session:
  // order moves to the callback queue and the doctor proceeds to the next order.
  clearInterval(DOCTOR_STATE.timerInterval);
  DOCTOR_STATE.timerInterval = null;
  DOCTOR_STATE.consultationState = 'completed';
  DOCTOR_STATE.closedNote = `Callback scheduled — ${dayLabel} at ${timeLabel}.`;
  render();
  showSuccessToast('Callback Scheduled', `${DOCTOR_STATE.currentCase.patient_name} — ${dayLabel} at ${timeLabel}. Order moved to callback queue.`);
  console.log(`[MOCK] case.callbackScheduled | day=${CALLBACK_STATE.day} | time=${CALLBACK_STATE.time} | session=COMPLETED`);
}

function startCallTimer() {
  if (DOCTOR_STATE.timerInterval) clearInterval(DOCTOR_STATE.timerInterval);
  DOCTOR_STATE.timerInterval = setInterval(() => {
    DOCTOR_STATE.callTimer++;


    if (DOCTOR_STATE.callTimer >= 50 && DOCTOR_STATE.consultationState !== 'gate_passed') {
      clearInterval(DOCTOR_STATE.timerInterval);
      DOCTOR_STATE.timerInterval = null;
      DOCTOR_STATE.consultationState = 'gate_passed';
      DOCTOR_STATE.gatePassedAt = Date.now();
      render();
      console.log(`[MOCK] call-timer.gateCheck | elapsed=50s | gate=PASSED | cta=${resolveCTA(DOCTOR_STATE.currentCase).type}`);
      /* no auto-scroll (D-28): every call action is in the pinned bar */
    }

    document.getElementById('demo-state-label').textContent =
      `State: ${DOCTOR_STATE.consultationState} | ${formatTimer(DOCTOR_STATE.callTimer)}`;
    renderSidePanel();
  }, 1000);
}

// Fast-forward — demo controls [LOCKED]
function doFastForward() {
  const s = DOCTOR_STATE.consultationState;
  if (s === 'connected') {
    clearInterval(DOCTOR_STATE.timerInterval);
    DOCTOR_STATE.timerInterval = null;
    DOCTOR_STATE.callTimer = 50;
    DOCTOR_STATE.consultationState = 'gate_passed';
    DOCTOR_STATE.gatePassedAt = Date.now();
    render();
    /* no auto-scroll (D-28): every call action is in the pinned bar */
  } else if (['assigned', 'hold', 'no_answer', 'calling'].includes(s)) {
    // Hide sim panel if showing
    document.getElementById('demo-call-sim').style.display = 'none';
    document.getElementById('demo-sim-calling').style.display = 'flex';
    document.getElementById('demo-sim-webhook').style.display = 'none';
    DOCTOR_STATE.callTimer = 50;
    DOCTOR_STATE.consultationState = 'gate_passed';
    DOCTOR_STATE.gatePassedAt = Date.now();
    render();
    /* no auto-scroll (D-28): every call action is in the pinned bar */
  } else {
  }
}

document.getElementById('demo-ff-btn-mobile').addEventListener('click', doFastForward);
document.getElementById('side-ff-btn').addEventListener('click', doFastForward);

// ================================================================
// POST-CALL CTA
// ================================================================
function handleMainCTA() {
  if (DOCTOR_STATE.consultationState !== 'gate_passed') return;
  const btn = document.getElementById('main-cta-btn');
  btn.disabled = true;
  // Update label in-place — don't replace innerHTML (destroys child spans needed by render)
  const lbl = document.getElementById('main-cta-label');
  const icon = document.getElementById('main-cta-icon');
  if (lbl) lbl.textContent = 'Submitting…';
  if (icon) icon.textContent = '';
  console.log(`[MOCK] cta-action.submit | scenario=${DOCTOR_STATE.activeScenario} | delay=800ms`);
  setTimeout(() => {
    DOCTOR_STATE.consultationState = 'completed';
    const effectiveScenario = DOCTOR_STATE.haSkippedInSession
      ? Object.assign({}, DOCTOR_STATE.currentCase, { ha_status:'skipped_customer' }) : DOCTOR_STATE.currentCase;
    const cta = resolveCTA(effectiveScenario);
    const titles = { confirm_order:'Order Confirmed', confirm_transfer:'Transferred to HA', confirm_forward:'Forwarded for Review' };
    DOCTOR_STATE.closedNote = `${titles[cta.type] || 'Done'}.`;
    render();
    showSuccessToast(titles[cta.type] || 'Done', `${DOCTOR_STATE.currentCase.patient_name} — "${cta.label}" submitted.`);
    console.log(`[MOCK] cta-action.success | cta=${cta.type}`);
  }, 800);
}

// ── Success toast — non-blocking completion card anchored to mobile column ──
function showSuccessToast(title, desc) {
  const st  = document.getElementById('success-toast');
  const col = document.getElementById('mobile-column');
  const r   = col.getBoundingClientRect();
  const w = Math.min(r.width - 32, 480);
  st.style.left  = (r.left + (r.width - w) / 2) + 'px';
  st.style.width = w + 'px';
  document.getElementById('success-toast-title').textContent = title;
  document.getElementById('success-toast-desc').textContent  = desc;
  st.classList.add('show');
}

function hideSuccessToast() {
  document.getElementById('success-toast').classList.remove('show');
}

// ================================================================
// SHEET HANDLERS
// ================================================================
let activeSheet = null;

function openSheet(sheetId) {
  const overlay = document.getElementById('sheet-overlay');
  const col = document.getElementById('mobile-column');
  const rect = col.getBoundingClientRect();
  overlay.style.left  = rect.left + 'px';
  overlay.style.width = rect.width + 'px';
  if (activeSheet) document.getElementById(activeSheet)?.classList.remove('open');
  overlay.classList.add('open');
  const sheetEl = document.getElementById(sheetId);
  sheetEl?.classList.add('open');
  if (!activeSheet) sheetReturnFocus = document.activeElement;
  activeSheet = sheetId;
  // Accessibility: dialog semantics + focus management (visual/a11y only)
  if (sheetEl) {
    const title = sheetEl.querySelector('.sheet-title');
    if (title && !title.id) title.id = sheetId + '-heading';   // not '-title': #sheet-retry-title is the retry sheet's text span
    sheetEl.setAttribute('role', 'dialog');
    sheetEl.setAttribute('aria-modal', 'true');
    if (title) sheetEl.setAttribute('aria-labelledby', title.id);
    sheetEl.setAttribute('tabindex', '-1');
    sheetEl.focus({ preventScroll: true });
  }
}
let sheetReturnFocus = null;
document.addEventListener('keydown', (e) => {
  if (!activeSheet) return;
  if (e.key === 'Escape') { closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const sheetEl = document.getElementById(activeSheet);
  const f = [...sheetEl.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetEl)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

function closeSheet() {
  if (activeSheet) document.getElementById(activeSheet)?.classList.remove('open');
  document.getElementById('sheet-overlay').classList.remove('open');
  activeSheet = null;
  if (sheetReturnFocus && document.contains(sheetReturnFocus)) sheetReturnFocus.focus({ preventScroll: true });
  sheetReturnFocus = null;
}

function handleSheetOverlayClick(e) {
  if (e.target === document.getElementById('sheet-overlay')) closeSheet();
}

function confirmSkipHA(reason) {
  DOCTOR_STATE.haSkippedInSession = true;
  closeSheet(); render();
  console.log(`[MOCK] ha.skip | reason="${reason}" | new_cta=confirm_order`);
}

// ================================================================
// MEDICINE EDIT — full-screen Prescribe view (#prescribe-screen)
// ================================================================
let psReturnFocus = null;
let psSnapshot = '';   // edit state at open, to know whether closing would lose changes

function openMedEdit(medId) {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === medId);
  if (!med) return;
  if (med.default_duration === undefined) med.default_duration = med.duration || 'ongoing';   // backend default, kept for "Changed from default"
  const fd = formDose(med.form);
  const dur = med.duration || 'ongoing';
  const dose = med.dose ?? fd.each[Math.min(1, fd.each.length - 1)];
  Object.assign(EDIT_STATE, {
    medId, form: med.form || 'tablet',
    interval: med.interval || 'daily',
    m: med.m ?? 0, a: med.a ?? 0, n: med.n ?? 0,
    hours: med.hours || 8,
    dose, doseOther: !!med.doseOther, doseOtherVal: med.doseOther ? String(med.dose) : '',
    sos: !!med.sos, sosDose: med.sosDose ?? defaultSosDose(med.form), sosMax: med.sosMax || 1,
    durOngoing: dur === 'ongoing', durN: dur === 'ongoing' ? 1 : parseInt(dur, 10), durU: dur === 'ongoing' ? 'd' : dur.slice(-1),
    durOpen: false, defaultDuration: med.default_duration,
    food: med.food || null, note: med.note || '', err: null,
    disabled: !!med.disabled, disableReason: med.disable_reason || '',
  });
  document.getElementById('ps-title').textContent = `${med.name} ${med.strength}`;
  document.getElementById('ps-form').textContent = FORM_LABEL[EDIT_STATE.form] || 'Medicine';
  document.getElementById('ps-disable-btn').hidden = EDIT_STATE.disabled;
  const dn = document.getElementById('ps-disabled-note');
  dn.hidden = !EDIT_STATE.disabled;
  document.getElementById('ps-disabled-text').textContent =
    `Disabled${EDIT_STATE.disableReason ? ': ' + EDIT_STATE.disableReason : ''}. Prescribing it will enable it again.`;
  document.getElementById('ps-note').value = EDIT_STATE.note;
  renderPrescribe();
  psSnapshot = JSON.stringify(editModel());
  const scr = document.getElementById('prescribe-screen');
  psReturnFocus = document.activeElement;
  scr.classList.add('open');
  scr.setAttribute('aria-hidden', 'false');
  document.getElementById('ps-body').scrollTop = 0;
  scr.focus({ preventScroll: true });
}

const psChanged = () => JSON.stringify(editModel()) !== psSnapshot;

// Close (cross / Escape): instant when nothing changed; otherwise ask before throwing edits away.
function requestClosePrescribe() {
  if (psChanged()) openSheet('sheet-discard');
  else closePrescribe();
}
function discardPrescribe() { closeSheet(); closePrescribe(); }

function closePrescribe() {
  const scr = document.getElementById('prescribe-screen');
  scr.classList.remove('open');
  scr.setAttribute('aria-hidden', 'true');
  if (psReturnFocus && document.contains(psReturnFocus)) psReturnFocus.focus({ preventScroll: true });
  psReturnFocus = null;
}
// Keyboard: Escape = close request; Tab stays inside the screen (it is modal). Capture phase: runs before the
// sheet handler, so when a sheet is open over the screen the sheet handles the key instead.
document.addEventListener('keydown', (e) => {
  const scr = document.getElementById('prescribe-screen');
  if (activeSheet || !scr.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); requestClosePrescribe(); return; }   // stop: the sheet handler must not see this key and close the sheet it just opened
  if (e.key !== 'Tab') return;
  const f = [...scr.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (!scr.contains(document.activeElement)) { e.preventDefault(); first.focus(); return; }
  if (e.shiftKey && (document.activeElement === first || document.activeElement === scr)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}, { capture: true });

const durationCode = () => EDIT_STATE.durOngoing ? 'ongoing' : `${EDIT_STATE.durN}${EDIT_STATE.durU}`;
function currentDose() {
  if (!EDIT_STATE.doseOther) return EDIT_STATE.dose;
  const v = parseFloat(EDIT_STATE.doseOtherVal);
  return isFinite(v) ? v : '—';
}
const editModel = () => {
  const { err, durOpen, disabled, disableReason, ...rest } = EDIT_STATE;   // UI-only fields are not part of the prescription
  return { ...rest, dose: currentDose(), duration: durationCode() };
};

function chip(key, label, pressed, aria = '') {
  return `<button type="button" class="tm-chip tm-chip--lg" data-k="${key}" aria-pressed="${pressed}"${aria ? ` aria-label="${aria}"` : ''}>${label}</button>`;
}
// A labelled group of chips (role=group so screen readers say which question the chip answers).
function group(label, inner, { cls = 'ps-chips', hint = '', id = '', cols = 0 } = {}) {
  const lid = `psl-${label.replace(/\W+/g, '-').toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`;
  const style = cols ? ` style="--cols:${cols}"` : '';
  return `<div class="ps-section"${id ? ` id="${id}"` : ''}><div class="tm-field__label ps-label" id="${lid}">${label}${hint ? ` <span class="tm-muted">${hint}</span>` : ''}</div>` +
         `<div class="${cls}" role="group" aria-labelledby="${lid}"${style}>${inner}</div></div>`;
}
const unitHint = (fd, unit) => unit ? `(${unit})` : (fd.showUnit ? `(${fd.many})` : '');   // unit = the "Other" entry's unit when chosen

// Re-renders everything between "Prints as" and the note. The note field is never re-rendered (keeps typing focus).
function renderPrescribe() {
  const x = EDIT_STATE, fd = formDose(x.form);
  const focusKey = document.activeElement?.dataset?.k;
  let h = '';
  // Cards, like the case page (agreed 2026-10-08): Schedule · SOS · Duration · Food · (note card is static in index.html)
  h += `<div class="tm-card ps-card" id="ps-card-schedule">`;
  h += group('How often', INTERVALS.map(([v, l]) => chip(`int:${v}`, l, x.interval === v)).join(''));

  // Dose — one heading for every schedule: "Dose (unit)". Daily shows the M / A / N rows under it.
  const errDose = x.err === 'dose' ? `<div class="tm-notice tm-notice--error ps-gap" role="alert"><span class="tm-icon" data-icon="alert-circle"></span><span>Choose a dose for at least one time of day.</span></div>` : '';
  if (x.interval === 'daily') {
    const rows = [['m', 'M', 'Morning'], ['a', 'A', 'Afternoon'], ['n', 'N', 'Night']].map(([k, key, name]) =>
      `<div class="ps-slot"><span class="ps-slot-key" aria-hidden="true">${key}</span><div class="ps-grid" role="group" aria-label="${name}" style="--cols:${fd.slot.length}">${
        fd.slot.map(v => chip(`slot:${k}:${v}`, chipLabel(x.form, v), x[k] === v, `${name}: ${v === 0 ? 'none' : doseText(x.form, v)}`)).join('')}</div></div>`).join('');
    h += `<div class="ps-section" id="ps-dose-section"><div class="tm-field__label ps-label">Dose <span class="tm-muted">${unitHint(fd)}</span></div><div class="ps-slots">${rows}</div>${errDose}</div>`;
  } else {
    if (x.interval === 'every_x_hours') {
      h += `<div class="ps-section"><div class="tm-field__label ps-label" id="psl-every">Every</div><div class="ps-grid" role="group" aria-labelledby="psl-every" style="--cols:4">${
             HOURS.map(v => chip(`hrs:${v}`, `${v} h`, x.hours === v, `Every ${v} hours`)).join('')}</div>
             <div class="ps-helper">${24 / x.hours} times a day, round the clock</div></div>`;
    }
    const opts = fd.each.map(v => chip(`dose:${v}`, chipLabel(x.form, v), !x.doseOther && x.dose === v));
    if (fd.other) opts.push(chip('dose:other', 'Other', x.doseOther));
    const other = x.doseOther ? `<div class="tm-field ps-gap${x.err === 'other' ? ' tm-field--error' : ''}" id="ps-other-field"><label class="tm-field__label" for="ps-other">Dose in ${fd.other}</label>
        <div class="tm-field__control"><input id="ps-other" type="text" inputmode="decimal" placeholder="e.g. 7.5" value="${x.doseOtherVal}"><span class="ps-unit">${fd.other}</span></div>
        ${x.err === 'other' ? `<div class="tm-field__helper" role="alert">Enter the dose in ${fd.other}.</div>` : ''}</div>` : '';
    const lid = 'psl-dose-each';
    h += `<div class="ps-section" id="ps-dose-section"><div class="tm-field__label ps-label" id="${lid}">Dose <span class="tm-muted">${unitHint(fd, x.doseOther ? fd.other : '')}</span></div>` +
         `<div class="ps-grid" role="group" aria-labelledby="${lid}" style="--cols:${opts.length}">${opts.join('')}</div>${other}</div>`;
    if (x.interval === 'sos') {
      h += `<div class="ps-section"><div class="tm-field__label ps-label" id="psl-max-only">Max doses a day</div><div class="ps-grid" role="group" aria-labelledby="psl-max-only" style="--cols:4">${SOS_MAX.map(v => chip(`max:${v}`, v, x.sosMax === v)).join('')}</div></div>`;
    }
  }

  h += `</div>`;   // end Schedule card

  // SOS add-on: explained in place, with its own dose and a daily cap (both drive quantity and the print line).
  if (x.interval !== 'sos') {
    h += `<div class="ps-section tm-card ps-card"><div><label class="tm-check"><input type="checkbox" class="tm-toggle" id="ps-sos" ${x.sos ? 'checked' : ''} aria-describedby="ps-sos-help"> Also as needed (SOS)</label>
          <div class="ps-helper" id="ps-sos-help">Extra doses only when needed, on top of the schedule above.</div></div>`;
    if (x.sos) {
      h += `<div class="ps-sub">` +
           group('Dose', fd.each.map(v => chip(`sosdose:${v}`, chipLabel(x.form, v), x.sosDose === v)).join(''), { cls: 'ps-grid', cols: fd.each.length, hint: unitHint(fd) }) +
           `<div class="ps-section ps-gap"><div class="tm-field__label ps-label" id="psl-max-extra">Max extra doses a day</div><div class="ps-grid" role="group" aria-labelledby="psl-max-extra" style="--cols:4">${SOS_MAX.map(v => chip(`max:${v}`, v, x.sosMax === v)).join('')}</div></div>` +
           `</div>`;
    }
    h += `</div>`;
  }

  // Duration — a dropdown-style field: one tap target (value + chevron) that opens the picker in place and closes
  // again on the same row. Looks like the other form fields so it reads as "fill in", not "information".
  const code = durationCode();
  const sub = code !== x.defaultDuration ? 'Changed from default' : 'Default';
  h += `<div class="ps-section tm-card ps-card"><div class="tm-field__label ps-label" id="psl-duration">Duration</div>
        <div class="ps-dur-field${x.durOpen ? ' is-open' : ''}">
          <button type="button" class="ps-dur-toggle" data-k="dur:toggle" aria-expanded="${x.durOpen}" aria-controls="ps-dur-panel" aria-labelledby="psl-duration ps-dur-value">
            <span class="ps-dur-val" id="ps-dur-value">${durationText(code)}<span>${sub}</span></span>
            ${iconEl(x.durOpen ? 'chevron-up' : 'chevron-down', 24)}
          </button>${x.durOpen ? `
          <div class="ps-dur-panel" id="ps-dur-panel">
            <div class="ps-grid" role="group" aria-label="Duration number" style="--cols:5">${DUR_NUMBERS.map(v => chip(`durn:${v}`, v, !x.durOngoing && x.durN === v)).join('')}</div>
            <div class="ps-grid ps-gap" role="group" aria-label="Duration unit" style="--cols:4">${DUR_UNITS.map(([u, l]) => chip(`duru:${u}`, l, !x.durOngoing && x.durU === u)).join('')}${chip('dur:ongoing', 'Ongoing', x.durOngoing, `Ongoing, ${ONGOING_DEFAULT}`)}</div>
          </div>` : ''}
        </div></div>`;

  h += `<div class="tm-card ps-card">` + group('Food', FOODS.map(([v, l]) => chip(`food:${v}`, l, x.food === v)).join(''), { cls: 'ps-chips ps-chips-fill', hint: '(optional)' }) + `</div>`;

  const dyn = document.getElementById('ps-dynamic');
  dyn.innerHTML = h;
  initIcons();
  setPrintLine();
  if (focusKey) dyn.querySelector(`[data-k="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
}

// The pinned "On prescription" line (D-25). Briefly tints when the text changes so the doctor sees the effect of a tap.
let _printFlash = null;
function setPrintLine() {
  const el = document.getElementById('ps-prints-text');
  const next = printLine(editModel());
  const changed = el.textContent !== next && el.textContent !== '—' && document.getElementById('prescribe-screen').classList.contains('open');
  el.textContent = next;
  if (!changed) return;
  const box = document.getElementById('ps-rx');
  box.classList.add('is-updated');
  clearTimeout(_printFlash);
  _printFlash = setTimeout(() => box.classList.remove('is-updated'), 600);
}

// One delegated handler for every chip / button in the screen.
document.getElementById('ps-dynamic').addEventListener('click', (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  const [kind, p1, p2] = b.dataset.k.split(':');
  const x = EDIT_STATE;
  switch (kind) {
    case 'int':
      x.interval = p1;
      if (p1 === 'sos') x.sos = false;
      if (p1 !== 'daily' && x.err === 'dose') x.err = null;
      break;
    case 'slot': x[p1] = parseFloat(p2); if (x.err === 'dose') x.err = null; break;
    case 'hrs':  x.hours = parseInt(p1, 10); break;
    case 'dose':
      if (p1 === 'other') { x.doseOther = true; }
      else { x.doseOther = false; x.dose = parseFloat(p1); if (x.err === 'other') x.err = null; }
      break;
    case 'sosdose': x.sosDose = parseFloat(p1); break;
    case 'max':  x.sosMax = parseInt(p1, 10); break;
    case 'durn': x.durN = parseInt(p1, 10); x.durOngoing = false; break;
    case 'duru': x.durU = p1; x.durOngoing = false; break;
    case 'dur':
      if (p1 === 'toggle') x.durOpen = !x.durOpen;
      else if (p1 === 'ongoing') x.durOngoing = true;
      break;
    case 'food': x.food = x.food === p1 ? null : p1; break;   // optional: tap again to clear
    default: return;
  }
  renderPrescribe();
  if (b.dataset.k === 'dose:other') document.getElementById('ps-other')?.focus();
});
document.getElementById('ps-dynamic').addEventListener('change', (e) => {
  if (e.target.id === 'ps-sos') { EDIT_STATE.sos = e.target.checked; renderPrescribe(); document.getElementById('ps-sos')?.focus(); }
});
document.getElementById('ps-dynamic').addEventListener('input', (e) => {
  if (e.target.id !== 'ps-other') return;
  EDIT_STATE.doseOtherVal = e.target.value;
  if (EDIT_STATE.err === 'other' && parseFloat(e.target.value) > 0) {
    EDIT_STATE.err = null;
    const f = document.getElementById('ps-other-field');
    f.classList.remove('tm-field--error'); f.querySelector('.tm-field__helper')?.remove();
  }
  setPrintLine();
});
document.getElementById('ps-note').addEventListener('input', (e) => {
  EDIT_STATE.note = e.target.value;
  setPrintLine();
});

// Only two invalid states can exist (every required choice always keeps a value): no dose at all on a daily
// schedule, and "Other" picked with no valid number. Show the error in place, scroll to it, save nothing.
function validatePrescribe() {
  const x = EDIT_STATE;
  if (x.interval === 'daily' && x.m + x.a + x.n === 0) return 'dose';
  if (x.interval !== 'daily' && x.doseOther && !(parseFloat(x.doseOtherVal) > 0)) return 'other';
  return null;
}

function confirmMedEdit() {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  const err = validatePrescribe();
  if (err) {
    EDIT_STATE.err = err;
    renderPrescribe();
    const target = document.getElementById(err === 'dose' ? 'ps-dose-section' : 'ps-other-field');
    if (target) {   // scroll only the screen's own scroll area (scrollIntoView could also move the desktop frame)
      const body = document.getElementById('ps-body');
      body.scrollBy({ top: target.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight / 3 });
    }
    if (err === 'other') document.getElementById('ps-other')?.focus({ preventScroll: true });
    console.log(`[MOCK] medicine.prescribe.blocked | id=${med.id} | reason=${err}`);
    return;
  }
  const x = editModel();
  Object.assign(med, {
    interval: x.interval, m: x.m, a: x.a, n: x.n, hours: x.hours,
    dose: x.dose, doseOther: x.doseOther,
    sos: x.interval === 'sos' ? false : x.sos, sosDose: x.sosDose, sosMax: x.sosMax,
    duration: x.duration, food: x.food, note: x.note.trim(),
    validation_status: 'prescribed', disabled: false, disable_reason: undefined,
  });
  closePrescribe(); render();
  console.log(`[MOCK] medicine.prescribe | id=${med.id} | name=${med.name} | prints="${printLine(med)}"`);
}

function openDisableSheet() {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  document.getElementById('sheet-disable-med-label').textContent = `Disable: ${med.name} ${med.strength}`;
  openSheet('sheet-disable-reason');   // opens over the Prescribe screen; cancelling returns to it
}

function confirmDisable(reason) {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  med.disabled = true;
  med.validation_status = 'disabled';
  med.disable_reason = reason;
  closeSheet(); closePrescribe(); render();
  console.log(`[MOCK] medicine.disable | id=${med.id} | name=${med.name} | reason="${reason}"`);
}

// ================================================================
// RX VIEWER — Zoom, Rotate, Pan, Pinch [LOCKED]
// ================================================================
let rxState = { zoom:1, rotation:0, panX:0, panY:0 };
let rxPinchDist = null;
let rxDragStart = null;

function applyRxTransform() {
  const wrapper = document.getElementById('rx-doc-wrapper');
  wrapper.style.transform =
    `translate(${rxState.panX}px, ${rxState.panY}px) rotate(${rxState.rotation}deg) scale(${rxState.zoom})`;
  document.getElementById('rx-zoom-label').textContent = Math.round(rxState.zoom * 100) + '%';
}

function rxZoomIn()  { rxState.zoom = Math.min(rxState.zoom + 0.25, 4); applyRxTransform(); }
function rxZoomOut() { rxState.zoom = Math.max(rxState.zoom - 0.25, 0.5); applyRxTransform(); }
function rxRotate()  { rxState.rotation = (rxState.rotation + 90) % 360; applyRxTransform(); }
function rxReset()   { rxState = {zoom:1,rotation:0,panX:0,panY:0}; applyRxTransform(); }

function openRxOverlay() {
  rxReset();
  document.getElementById('rx-overlay').classList.add('open');
}
function closeRxOverlay() { document.getElementById('rx-overlay').classList.remove('open'); }

// Double-tap to zoom
let lastTap = 0;
document.getElementById('rx-overlay-body').addEventListener('click', (e) => {
  const now = Date.now();
  if (now - lastTap < 320) {
    rxState.zoom = rxState.zoom > 1.2 ? 1 : 2;
    applyRxTransform();
  }
  lastTap = now;
});

// Pinch to zoom (touch)
document.getElementById('rx-overlay-body').addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    rxPinchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  } else if (e.touches.length === 1) {
    rxDragStart = { x: e.touches[0].clientX - rxState.panX, y: e.touches[0].clientY - rxState.panY };
  }
}, { passive:true });

document.getElementById('rx-overlay-body').addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && rxPinchDist !== null) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    rxState.zoom = Math.min(Math.max(rxState.zoom * (dist / rxPinchDist), 0.5), 4);
    rxPinchDist = dist;
    applyRxTransform();
  } else if (e.touches.length === 1 && rxDragStart) {
    rxState.panX = e.touches[0].clientX - rxDragStart.x;
    rxState.panY = e.touches[0].clientY - rxDragStart.y;
    applyRxTransform();
  }
  e.preventDefault();
}, { passive:false });

document.getElementById('rx-overlay-body').addEventListener('touchend', () => {
  rxPinchDist = null;
  rxDragStart = null;
}, { passive:true });

// Mouse drag (desktop)
let mouseDragStart = null;
document.getElementById('rx-overlay-body').addEventListener('mousedown', (e) => {
  mouseDragStart = { x: e.clientX - rxState.panX, y: e.clientY - rxState.panY };
});
document.addEventListener('mousemove', (e) => {
  if (!mouseDragStart) return;
  rxState.panX = e.clientX - mouseDragStart.x;
  rxState.panY = e.clientY - mouseDragStart.y;
  applyRxTransform();
});
document.addEventListener('mouseup', () => { mouseDragStart = null; });

// Mouse wheel zoom
document.getElementById('rx-overlay-body').addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  rxState.zoom = Math.min(Math.max(rxState.zoom + delta, 0.5), 4);
  applyRxTransform();
}, { passive:false });

// ================================================================
// SCENARIO SWITCHING [LOCKED structure]
// ================================================================
function switchScenario(scenarioId) {
  clearInterval(DOCTOR_STATE.timerInterval);
  DOCTOR_STATE.timerInterval     = null;
  DOCTOR_STATE.activeScenario    = scenarioId;
  DOCTOR_STATE.consultationState = 'assigned';
  DOCTOR_STATE.callTimer         = 0;
  DOCTOR_STATE.gatePassedAt      = null;
  DOCTOR_STATE.haSkippedInSession= false;
  DOCTOR_STATE.holdReason        = null;
  DOCTOR_STATE.callbackDay       = null;
  DOCTOR_STATE.callbackTime      = null;
  DOCTOR_STATE.editingMedId      = null;
  DOCTOR_STATE.endedEarly        = false;
  DOCTOR_STATE.closedNote        = null;
  CALLBACK_STATE.day  = null;
  CALLBACK_STATE.time = null;
  document.getElementById('callback-error').hidden = true;
  hideSuccessToast();
  const ps = document.getElementById('prescribe-screen');   // a scenario switch discards an open Prescribe screen
  ps.classList.remove('open'); ps.setAttribute('aria-hidden', 'true');
  // Reset demo call sim panel
  const simDiv = document.getElementById('demo-call-sim');
  if (simDiv) {
    simDiv.style.display = 'none';
    document.getElementById('demo-sim-calling').style.display = 'flex';
    document.getElementById('demo-sim-webhook').style.display = 'none';
  }
  DOCTOR_STATE.currentCase = JSON.parse(JSON.stringify(SCENARIOS[scenarioId]));


  // Restore main CTA button structure in case submit flow destroyed innerHTML
  const ctaBtn = document.getElementById('main-cta-btn');
  ctaBtn.disabled = false;
  if (!document.getElementById('main-cta-icon')) {
    ctaBtn.innerHTML = '<span id="main-cta-icon"></span><span id="main-cta-label">Confirm Order</span>';
  }

  // Reset order expand
  document.getElementById('pdb-order-expand').classList.add('hidden');
  document.getElementById('pdb-info-btn').classList.remove('active');

  document.getElementById('symptoms-input').value      = '';
  document.getElementById('doctor-notes-input').value  = '';

  // Sync both scenario button sets
  document.querySelectorAll('.scenario-btn[data-scenario], .side-scenario-btn[data-scenario]').forEach(b => {
    b.classList.toggle('active', b.dataset.scenario === scenarioId);
    b.setAttribute('aria-pressed', b.dataset.scenario === scenarioId);
  });

  render();
  console.log(`[MOCK] scenario.switch | active=${scenarioId} | case_type=${SCENARIOS[scenarioId].case_type} | ha_status=${SCENARIOS[scenarioId].ha_status}`);
}

// Wire up all scenario buttons (both bars)
document.querySelectorAll('[data-scenario]').forEach(btn => {
  btn.addEventListener('click', () => switchScenario(btn.dataset.scenario));
});

function resetToDemo() {
  hideSuccessToast();
  closeSheet();
  switchScenario(DOCTOR_STATE.activeScenario);
}

// ================================================================
// No black toasts (Apurva 2026-10-08, decision log D-27): every outcome is shown where it happens —
// the row tag, the Call card, the pinned button, or an inline error. Only the white confirmation card
// (showSuccessToast, with Next Order) remains.
// ================================================================

// ================================================================
// INIT
// ================================================================
initIcons();
switchScenario('cat4');

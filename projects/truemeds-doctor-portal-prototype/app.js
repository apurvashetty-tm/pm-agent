
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
      { id:1, name:'Metformin',          strength:'500mg',   m:1, a:0, n:1, qty:60, price:28,  form:'tablet',    interval:'daily',   duration:'ongoing', advice:['after_food'],   validation_status:'prescribed',     disabled:false },
      { id:2, name:'Amlodipine',         strength:'5mg',     m:1, a:0, n:0, qty:30, price:52,  form:'tablet',    interval:'daily',   duration:'ongoing', advice:['after_food'],   validation_status:'not_prescribed', disabled:false },
      { id:3, name:'Atorvastatin',       strength:'10mg',    m:0, a:0, n:1, qty:30, price:45,  form:'capsule',   interval:'daily',   duration:'ongoing', advice:['after_food'],   validation_status:'not_prescribed', disabled:false },
      { id:4, name:'Vitamin B12',        strength:'1000mcg', m:0, a:0, n:0, qty:4,  price:120, form:'injection', interval:'monthly', duration:'3m',      advice:[],               validation_status:'not_prescribed', disabled:false },
      { id:5, name:'Antacid Suspension', strength:'10ml',    m:0, a:1, n:1, qty:1,  price:85,  form:'syrup',     interval:'daily',   duration:'7d',      advice:['after_food'],   validation_status:'not_prescribed', disabled:false },
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
      { id:1, name:'Levothyroxine',            strength:'50mcg', m:1, a:0, n:0, qty:30, price:38, form:'tablet',  interval:'daily', duration:'ongoing', advice:['empty_stomach'], validation_status:'not_prescribed', disabled:false },
      { id:2, name:'Calcium + Vit D3',         strength:'500mg', m:1, a:0, n:1, qty:60, price:65, form:'capsule', interval:'daily', duration:'ongoing', advice:['after_food'],    validation_status:'prescribed',     disabled:false },
      { id:3, name:'Sodium Chloride Eye Drops', strength:'0.9%', m:0, a:1, n:1, qty:1,  price:55, form:'drops',   interval:'daily', duration:'7d',      advice:[],                validation_status:'not_prescribed', disabled:false },
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
      { id:1, name:'Losartan',            strength:'50mg',   m:1, a:0, n:0, qty:30, price:42, form:'tablet', interval:'daily', duration:'ongoing', advice:['after_food'],  validation_status:'not_prescribed', disabled:false },
      { id:2, name:'Hydrochlorothiazide', strength:'12.5mg', m:1, a:0, n:0, qty:30, price:18, form:'tablet', interval:'daily', duration:'ongoing', advice:['after_food'],  validation_status:'not_prescribed', disabled:false },
      { id:3, name:'Aspirin',             strength:'75mg',   m:0, a:0, n:1, qty:30, price:12, form:'tablet', interval:'daily', duration:'ongoing', advice:['after_food'],  validation_status:'prescribed',     disabled:false },
      { id:4, name:'Betamethasone Cream', strength:'0.1%',   m:0, a:1, n:1, qty:1,  price:95, form:'cream',  interval:'daily', duration:'7d',      advice:[],              validation_status:'not_prescribed', disabled:false },
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
      { id:1, name:'Ferrous Sulphate',   strength:'200mg',  m:0, a:0, n:1, qty:30, price:35,  form:'tablet',  interval:'daily', duration:'3m', advice:['after_food'],  validation_status:'prescribed',     disabled:false },
      { id:2, name:'Folic Acid',         strength:'5mg',    m:1, a:0, n:0, qty:30, price:22,  form:'tablet',  interval:'daily', duration:'3m', advice:['after_food'],  validation_status:'prescribed',     disabled:false },
      { id:3, name:'Salbutamol Inhaler', strength:'100mcg', m:0, a:0, n:0, qty:1,  price:185, form:'inhaler', interval:'sos',   duration:null, advice:[],              validation_status:'not_prescribed', disabled:false },
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
      { id:1, name:'Pantoprazole', strength:'40mg', m:1, a:0, n:0, qty:30, price:44, form:'capsule', interval:'daily', duration:'1m', advice:['empty_stomach'], validation_status:'prescribed', disabled:false },
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
// EDIT STATE — for medicine edit sheet
// ================================================================
const EDIT_STATE = {
  medId:    null,
  m: 1, a: 0, n: 1,
  qty:      30,
  interval: 'daily',
  duration: null,
  advice:   [],
};

const DURATION_LABELS = { '3d':'3 days', '7d':'7 days', '2w':'2 weeks', '1m':'1 month', '3m':'3 months', 'ongoing':'Ongoing' };
const INTERVAL_LABELS = { 'daily':'Daily', 'alt_days':'Alt days', 'weekly':'Weekly', 'monthly':'Monthly', 'sos':'SOS' };

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
// MEDICINE FORM ICONS — Tabler outline per dosage form
// ================================================================
function getMedIcon(form) {
  // Tabler outline, monochrome — one glyph per dosage form
  const byForm = { tablet:'pill', capsule:'capsule-horizontal', injection:'vaccine', syrup:'medicine-syrup',
                   drops:'droplet', cream:'test-pipe', inhaler:'wind' };
  return iconEl(byForm[form] || 'pill', 24);
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
    `${c.patient_age}y · ${c.patient_gender} · ${c.order_id}`;
  document.getElementById('cs-order-value').textContent = `₹${c.order_value.toLocaleString('en-IN')}`;
  document.getElementById('cs-view-rx-btn').classList.toggle('hidden', !c.prescription_attached);

  const state = DOCTOR_STATE.consultationState;
  const showTimer = state === 'connected' || state === 'gate_passed';
  const timerBadge = document.getElementById('cs-timer-badge');
  timerBadge.classList.toggle('hidden', !showTimer);
  if (showTimer) document.getElementById('cs-timer-text').textContent = formatTimer(DOCTOR_STATE.callTimer);
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
      <div class="rx-med-details">${formatMAN(med.m, med.a, med.n)} · Qty ${med.qty}</div>
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
    const isDaily = !med.interval || med.interval === 'daily';
    const dosage  = isDaily ? formatMAN(med.m, med.a, med.n) : (INTERVAL_LABELS[med.interval] || med.interval);
    const dur     = med.duration ? ` · ${DURATION_LABELS[med.duration] || med.duration}` : '';
    const priceHtml = med.price != null ? `<span class="med-price">₹${med.price}</span>` : '';

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
          <span>${dosage}${dur}</span><span>Qty ${med.qty}</span>${priceHtml}
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
  // Hide briefing after an early hang-up — closing script is irrelevant
  // until the doctor re-dials
  if (c && !DOCTOR_STATE.endedEarly) {
    const isHA = c.case_type === 'pilot' && c.ha_status === 'required';
    const isValue = c.meds_type === 'value';
    brief.classList.add('visible');
    if (isHA && isValue) {
      pcbLabel.innerHTML = iconEl('arrow-up-right', 16) + '<span>Live HA Transfer</span>';
      pcbText.textContent  = '"Please stay on the line — I\'ll connect you to our Health Advisor"';
    } else if (isHA && !isValue) {
      pcbLabel.innerHTML = iconEl('clipboard-text', 16) + '<span>HA Follow-up</span>';
      pcbText.textContent  = '"Our Health Advisor will call you shortly after this consultation"';
    } else {
      pcbLabel.innerHTML = iconEl('package', 16) + '<span>Closing Script</span>';
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
  if (gateOpen) return;

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
    if (preGateCb) preGateCb.className = 'tm-btn tm-btn--sm tm-btn--ghost tm-btn--block';
    return;
  }
  // assigned / no_answer / hold — show Call Patient
  if (DOCTOR_STATE.endedEarly) {
    // Early hang-up: escape routes = retry OR schedule callback (ghost button)
    callBtnIcon.innerHTML  = icon('phone');
    callBtnLbl.textContent = 'Call Again';
    if (preGateCb) preGateCb.className = 'tm-btn tm-btn--secondary tm-btn--block';
    return;
  }
  if (preGateCb) preGateCb.className = 'tm-btn tm-btn--sm tm-btn--ghost tm-btn--block hidden';
  callBtnIcon.innerHTML  = icon('phone');
  callBtnLbl.textContent = 'Call Patient';
}

function renderPostCall() {
  const pc     = document.getElementById('az-phase2');
  const skipBtn = document.getElementById('skip-ha-btn');
  const ctaBtn  = document.getElementById('main-cta-btn');
  const scBtn   = document.getElementById('schedule-callback-btn');

  // Only gate_passed shows post-call actions. On 'completed' the success
  // toast owns the screen exit — hiding phase2 prevents re-submitting.
  const gateOpen = DOCTOR_STATE.consultationState === 'gate_passed';

  if (!gateOpen) {
    pc.classList.remove('visible','revealed');
    return;
  }

  pc.classList.add('visible');
  requestAnimationFrame(() => requestAnimationFrame(() => pc.classList.add('revealed')));

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
  skipBtn.classList.toggle('visible', haApplicable);

  const effectiveScenario = DOCTOR_STATE.haSkippedInSession
    ? Object.assign({}, c, { ha_status:'skipped_customer' }) : c;
  const cta = resolveCTA(effectiveScenario);
  ctaIcon.textContent = cta.icon;
  ctaLbl.textContent  = cta.label;

  // Secondary chip row: Schedule always present; label shortens to fit
  // when Skip HA shares the row
  const scLbl = document.getElementById('schedule-callback-label');
  if (scLbl) scLbl.textContent = haApplicable ? 'Schedule' : 'Schedule Callback';

  console.log(`[MOCK] cta-routing | scenario=${DOCTOR_STATE.activeScenario} | ha_skip_session=${DOCTOR_STATE.haSkippedInSession} | resolved=${cta.type}`);
}

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
  showToast('[MOCK] Logout — not implemented in prototype');
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
    showToast('Call ended before 50s — call again or schedule a callback');
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
      reason === 'timeout' ? 'Webhook timed out' : 'Patient didn\'t pick up';
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
  document.querySelectorAll('#callback-day-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.day === day);
  });
}

function selectCallbackTime(time) {
  CALLBACK_STATE.time = time;
  document.querySelectorAll('#callback-time-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.time === time);
  });
}

function confirmScheduleCallback() {
  if (!CALLBACK_STATE.day || !CALLBACK_STATE.time) {
    showToast('Pick a date and time');
    return;
  }
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
  render();
  showSuccessToast('Callback Scheduled', `${DOCTOR_STATE.currentCase.patient_name} — ${dayLabel} at ${timeLabel}. Order moved to callback queue.`);
  console.log(`[MOCK] case.callbackScheduled | day=${CALLBACK_STATE.day} | time=${CALLBACK_STATE.time} | session=COMPLETED`);
}

function startCallTimer() {
  if (DOCTOR_STATE.timerInterval) clearInterval(DOCTOR_STATE.timerInterval);
  DOCTOR_STATE.timerInterval = setInterval(() => {
    DOCTOR_STATE.callTimer++;

    // Update compact strip timer badge
    const timerBadge = document.getElementById('cs-timer-badge');
    timerBadge.classList.remove('hidden');
    document.getElementById('cs-timer-text').textContent = formatTimer(DOCTOR_STATE.callTimer);

    if (DOCTOR_STATE.callTimer >= 50 && DOCTOR_STATE.consultationState !== 'gate_passed') {
      clearInterval(DOCTOR_STATE.timerInterval);
      DOCTOR_STATE.timerInterval = null;
      DOCTOR_STATE.consultationState = 'gate_passed';
      DOCTOR_STATE.gatePassedAt = Date.now();
      render();
      console.log(`[MOCK] call-timer.gateCheck | elapsed=50s | gate=PASSED | cta=${resolveCTA(DOCTOR_STATE.currentCase).type}`);
      showToast('Valid call complete — post-call action unlocked');
      setTimeout(() => document.getElementById('action-zone').scrollIntoView({ behavior:'smooth', block:'start' }), 300);
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
    showToast('Fast-forwarded to 50s — gate passed');
    setTimeout(() => document.getElementById('action-zone').scrollIntoView({ behavior:'smooth', block:'start' }), 300);
  } else if (['assigned', 'hold', 'no_answer', 'calling'].includes(s)) {
    // Hide sim panel if showing
    document.getElementById('demo-call-sim').style.display = 'none';
    document.getElementById('demo-sim-calling').style.display = 'flex';
    document.getElementById('demo-sim-webhook').style.display = 'none';
    DOCTOR_STATE.callTimer = 50;
    DOCTOR_STATE.consultationState = 'gate_passed';
    DOCTOR_STATE.gatePassedAt = Date.now();
    render();
    showToast('Fast-forwarded — gate passed');
    setTimeout(() => document.getElementById('action-zone').scrollIntoView({ behavior:'smooth', block:'start' }), 300);
  } else {
    showToast('Fast-forward only works before gate is passed');
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
    if (title && !title.id) title.id = sheetId + '-title';
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
  showToast(`HA skipped: ${reason}. CTA updated to Confirm Order`);
  console.log(`[MOCK] ha.skip | reason="${reason}" | new_cta=confirm_order`);
}

// ================================================================
// MEDICINE EDIT
// ================================================================
function selectMAN(row, val) {
  EDIT_STATE[row] = val;
  document.querySelectorAll(`.man-btns[data-man="${row}"] .man-btn`).forEach(btn => {
    btn.setAttribute('aria-pressed', parseFloat(btn.dataset.val) === val);
  });
}

function adjustQty(delta) {
  EDIT_STATE.qty = Math.max(1, EDIT_STATE.qty + delta);
  document.getElementById('sheet-qty-display').textContent = EDIT_STATE.qty;
}

function selectInterval(val) {
  EDIT_STATE.interval = val;
  document.querySelectorAll('#interval-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.interval === val);
  });
  // Grey out M-A-N for non-daily intervals
  const manGroup = document.getElementById('man-picker-group');
  const nonDaily = ['weekly','monthly','sos'].includes(val);
  manGroup.classList.toggle('man-disabled', nonDaily);
}

function selectDuration(val) {
  // Toggle off if already selected
  if (EDIT_STATE.duration === val) {
    EDIT_STATE.duration = null;
    document.querySelectorAll('#duration-chips .tm-chip').forEach(b => b.setAttribute('aria-pressed', false));
  } else {
    EDIT_STATE.duration = val;
    document.querySelectorAll('#duration-chips .tm-chip').forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.dur === val);
    });
  }
}

function toggleAdvice(val) {
  const idx = EDIT_STATE.advice.indexOf(val);
  if (idx > -1) {
    EDIT_STATE.advice.splice(idx, 1);
  } else {
    EDIT_STATE.advice.push(val);
  }
  document.querySelectorAll('#advice-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', EDIT_STATE.advice.includes(b.dataset.advice));
  });
}

function openMedEdit(medId) {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === medId);
  if (!med) return;

  EDIT_STATE.medId    = medId;
  EDIT_STATE.m        = med.m;
  EDIT_STATE.a        = med.a;
  EDIT_STATE.n        = med.n;
  EDIT_STATE.qty      = med.qty;
  EDIT_STATE.interval = med.interval || 'daily';
  EDIT_STATE.duration = med.duration || null;
  EDIT_STATE.advice   = Array.isArray(med.advice) ? [...med.advice] : [];

  document.getElementById('sheet-med-name').textContent = `${med.name} ${med.strength}`;
  document.getElementById('sheet-qty-display').textContent = med.qty;

  // Sync interval chips
  document.querySelectorAll('#interval-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.interval === EDIT_STATE.interval);
  });
  // Sync M-A-N
  ['m','a','n'].forEach(row => {
    document.querySelectorAll(`.man-btns[data-man="${row}"] .man-btn`).forEach(btn => {
      btn.setAttribute('aria-pressed', parseFloat(btn.dataset.val) === med[row]);
    });
  });
  // Sync M-A-N disabled state
  const nonDaily = ['weekly','monthly','sos'].includes(EDIT_STATE.interval);
  document.getElementById('man-picker-group').classList.toggle('man-disabled', nonDaily);
  // Sync duration chips
  document.querySelectorAll('#duration-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', b.dataset.dur === EDIT_STATE.duration);
  });
  // Sync advice chips
  document.querySelectorAll('#advice-chips .tm-chip').forEach(b => {
    b.setAttribute('aria-pressed', EDIT_STATE.advice.includes(b.dataset.advice));
  });

  openSheet('sheet-edit-med');
}

function confirmMedEdit() {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  med.m        = EDIT_STATE.m;
  med.a        = EDIT_STATE.a;
  med.n        = EDIT_STATE.n;
  med.qty      = EDIT_STATE.qty;
  med.interval = EDIT_STATE.interval;
  med.duration = EDIT_STATE.duration;
  med.advice   = [...EDIT_STATE.advice];
  med.validation_status = 'prescribed';
  med.disabled = false;
  closeSheet(); render();
  showToast(`${med.name} prescribed`);
  console.log(`[MOCK] medicine.prescribe | id=${med.id} | name=${med.name} | interval=${med.interval} | duration=${med.duration}`);
}

function openDisableSheet() {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  document.getElementById('sheet-disable-med-label').textContent = `Disable: ${med.name} ${med.strength}`;
  closeSheet();
  setTimeout(() => openSheet('sheet-disable-reason'), 150);
}

function confirmDisable(reason) {
  const med = DOCTOR_STATE.currentCase.medicines.find(m => m.id === EDIT_STATE.medId);
  if (!med) return;
  med.disabled = true;
  med.validation_status = 'disabled';
  med.disable_reason = reason;
  closeSheet(); render();
  showToast(`Medicine disabled: ${reason}`);
  console.log(`[MOCK] medicine.disable | id=${med.id} | name=${med.name} | reason="${reason}"`);
}

// ================================================================
// ADD MEDICINE
// ================================================================
document.getElementById('add-medicine-btn').addEventListener('click', () => {
  document.getElementById('sheet-add-med-name').value     = '';
  document.getElementById('sheet-add-med-strength').value = '';
  openSheet('sheet-add-med');
});

function confirmAddMedicine() {
  const name     = document.getElementById('sheet-add-med-name').value.trim();
  const strength = document.getElementById('sheet-add-med-strength').value.trim();
  if (!name) { showToast('Enter medicine name'); return; }
  const newMed = {
    id: Date.now(),
    name,
    strength: strength || '',
    m: 1, a: 0, n: 1,
    qty: 30,
    validation_status: 'pending',
    disabled: false,
  };
  DOCTOR_STATE.currentCase.medicines.push(newMed);
  closeSheet(); render();
  showToast('[MOCK ASSUMPTION] Medicine added — not persisted to backend');
  console.log(`[MOCK] medicine.add | name=${name} | strength=${strength}`);
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
  CALLBACK_STATE.day  = null;
  CALLBACK_STATE.time = null;
  hideSuccessToast();
  // Reset demo call sim panel
  const simDiv = document.getElementById('demo-call-sim');
  if (simDiv) {
    simDiv.style.display = 'none';
    document.getElementById('demo-sim-calling').style.display = 'flex';
    document.getElementById('demo-sim-webhook').style.display = 'none';
  }
  DOCTOR_STATE.currentCase = JSON.parse(JSON.stringify(SCENARIOS[scenarioId]));

  const phase2 = document.getElementById('az-phase2');
  phase2.classList.remove('visible','revealed');

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
// TOAST [LOCKED]
// ================================================================
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  // Anchor to mobile column centre — viewport centre is wrong on desktop (side panel offsets column)
  const r = document.getElementById('mobile-column').getBoundingClientRect();
  t.style.left = (r.left + r.width / 2) + 'px';
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ================================================================
// INIT
// ================================================================
initIcons();
switchScenario('cat4');

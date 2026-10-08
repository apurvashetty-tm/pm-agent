/* ==========================================================================
   Acom Agent Portal — My Statistics
   Prototype behaviour, vanilla JS, no build step. Reference implementation
   of the state machine and the derived-metric formulas — port the logic,
   not necessarily the DOM plumbing.
   ========================================================================== */

/* Sample payload. Shape matches data.sample.json — replace with the real API.
   Raw numbers only: all formatting happens at render time. */
const DATA = {
  today: { callsInitiated: 142,  callsConnected: 98,   ordersPlaced: 31,  orderValue: 48260,   ordersOnHold: 5,  ordersScheduled: 12,  delivered: 24,  inTransit: 4,  cancelled: 3,  rto: 1,  otcOrders: 9,   otcValueMrp: 14820,  otcValueSale: 11240,  convDeltaPts: 2.4,  valueDeltaPct: 11 },
  w0:    { callsInitiated: 684,  callsConnected: 471,  ordersPlaced: 152, orderValue: 241180,  ordersOnHold: 18, ordersScheduled: 46,  delivered: 121, inTransit: 17, cancelled: 9,  rto: 4,  otcOrders: 41,  otcValueMrp: 71400,  otcValueSale: 54180,  convDeltaPts: 1.8,  valueDeltaPct: 7  },
  w1:    { callsInitiated: 651,  callsConnected: 438,  ordersPlaced: 139, orderValue: 218940,  ordersOnHold: 14, ordersScheduled: 39,  delivered: 128, inTransit: 3,  cancelled: 6,  rto: 2,  otcOrders: 37,  otcValueMrp: 64120,  otcValueSale: 48760,  convDeltaPts: -0.6, valueDeltaPct: 3  },
  w2:    { callsInitiated: 702,  callsConnected: 462,  ordersPlaced: 148, orderValue: 229510,  ordersOnHold: 11, ordersScheduled: 34,  delivered: 141, inTransit: 0,  cancelled: 5,  rto: 2,  otcOrders: 44,  otcValueMrp: 78300,  otcValueSale: 59020,  convDeltaPts: 3.1,  valueDeltaPct: 14 },
  m0:    { callsInitiated: 2918, callsConnected: 2004, ordersPlaced: 638, orderValue: 1042540, ordersOnHold: 27, ordersScheduled: 184, delivered: 512, inTransit: 61, cancelled: 38, rto: 15, otcOrders: 168, otcValueMrp: 304600, otcValueSale: 229480, convDeltaPts: 1.2,  valueDeltaPct: 9  },
  m1:    { callsInitiated: 3104, callsConnected: 2118, ordersPlaced: 671, orderValue: 1088920, ordersOnHold: 31, ordersScheduled: 196, delivered: 604, inTransit: 12, cancelled: 41, rto: 18, otcOrders: 181, otcValueMrp: 326400, otcValueSale: 246100, convDeltaPts: 0.4,  valueDeltaPct: 5  },
  m2:    { callsInitiated: 2841, callsConnected: 1902, ordersPlaced: 592, orderValue: 941260,  ordersOnHold: 22, ordersScheduled: 171, delivered: 561, inTransit: 0,  cancelled: 34, rto: 12, otcOrders: 154, otcValueMrp: 281900, otcValueSale: 212700, convDeltaPts: 2.0,  valueDeltaPct: 6  }
};

/* Period options per view. Month is capped at the last three months —
   build this list server-side or from the clock; never let the user type dates. */
const PERIODS = {
  day:   [{ id: 'today', label: 'Today' }],
  week:  [{ id: 'w0', label: 'This Week' }, { id: 'w1', label: 'Last Week' }, { id: 'w2', label: 'Two Weeks Ago' }],
  month: [{ id: 'm2', label: 'July' }, { id: 'm1', label: 'August' }, { id: 'm0', label: 'September' }]
};

const previewQuery = new URLSearchParams(window.location.search);
const validViews = new Set(['day', 'week', 'month']);
const validStates = new Set(['ready', 'loading', 'empty', 'error']);
const queryView = validViews.has(previewQuery.get('view')) ? previewQuery.get('view') : 'day';
const queryState = validStates.has(previewQuery.get('state')) ? previewQuery.get('state') : 'ready';
const queryOpen = new Set((previewQuery.get('open') || '').split(',').filter(Boolean));

const state = {
  view: queryView,
  period: { day: 'today', week: 'w0', month: 'm0' },
  dataState: queryState,
  open: { fulfilment: queryOpen.has('fulfilment'), otc: queryOpen.has('otc') }
};

/* ---------- formatting ---------- */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IN');
const pct = (a, b) => (b === 0 ? '0.0%' : (Math.round((a / b) * 1000) / 10).toFixed(1) + '%');

/* ---------- derived metrics — the four formulas the info icons document ---------- */
function derive(d) {
  return {
    callsInit: num.format(d.callsInitiated),
    callsConn: num.format(d.callsConnected),
    orders: num.format(d.ordersPlaced),

    /* End-to-end conversion. Deliberately measured from calls INITIATED, not
       connected, so dial quality counts. Drives the funnel's third bar width. */
    convPct: pct(d.ordersPlaced, d.callsInitiated),

    /* Answer rate — funnel step 1 to step 2. Drives the second bar width. */
    connPct: pct(d.callsConnected, d.callsInitiated),

    /* Close rate once the customer picks up. Shown as a step rate, not as
       "conversion", to avoid two numbers competing for the same name. */
    closePct: pct(d.ordersPlaced, d.callsConnected),

    /* In-transit excluded from both sides — those orders have no outcome yet. */
    successRate: pct(d.delivered, d.delivered + d.cancelled + d.rto),

    orderValue: inr.format(d.orderValue),
    aov: inr.format(Math.round(d.orderValue / Math.max(1, d.ordersPlaced))),
    hold: num.format(d.ordersOnHold),
    sched: num.format(d.ordersScheduled),
    delivered: num.format(d.delivered),
    transit: num.format(d.inTransit),
    cancelled: num.format(d.cancelled),
    rto: num.format(d.rto),
    otcOrders: num.format(d.otcOrders),
    otcMrp: inr.format(d.otcValueMrp),
    otcSale: inr.format(d.otcValueSale),

    convDelta: (d.convDeltaPts >= 0 ? '+' : '−') + Math.abs(d.convDeltaPts).toFixed(1) + ' pts',
    valueDelta: (d.valueDeltaPct >= 0 ? '+' : '−') + Math.abs(d.valueDeltaPct) + '%',
    convDown: d.convDeltaPts < 0,
    valueDown: d.valueDeltaPct < 0
  };
}

/* ---------- render ---------- */
function render() {
  const list = PERIODS[state.view];
  const pid = state.period[state.view];
  const m = derive(DATA[pid] || DATA.today);
  const periodLabel = (list.find(p => p.id === pid) || list[0]).label;

  const values = Object.assign({}, m, {
    periodLabel: periodLabel,
    viewWord: state.view,
    updated: 'Last updated today 09:41 AM'
  });

  document.querySelectorAll('[data-bind]').forEach(el => {
    const v = values[el.getAttribute('data-bind')];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-width]').forEach(el => {
    el.style.width = values[el.getAttribute('data-width')];
  });

  document.querySelector('[data-delta="conv"]').classList.toggle('tm-delta--down', m.convDown);
  document.querySelector('[data-delta="value"]').classList.toggle('tm-delta--down', m.valueDown);

  document.querySelectorAll('[data-view]').forEach(b => {
    b.setAttribute('aria-selected', String(b.getAttribute('data-view') === state.view));
  });

  const chips = document.getElementById('chips');
  chips.innerHTML = '';
  list.forEach(p => {
    const b = document.createElement('button');
    b.className = 'tm-chip';
    b.textContent = p.label;
    b.setAttribute('aria-pressed', String(p.id === pid));
    b.addEventListener('click', () => { state.period[state.view] = p.id; state.dataState = 'ready'; render(); });
    chips.appendChild(b);
  });

  document.querySelectorAll('[data-state-panel]').forEach(el => {
    el.classList.toggle('is-active', el.getAttribute('data-state-panel') === state.dataState);
  });

  document.querySelectorAll('[data-acc]').forEach(acc => {
    const key = acc.getAttribute('data-acc');
    const open = state.open[key];
    acc.setAttribute('data-open', String(open));
    acc.querySelector('.tm-acc__head').setAttribute('aria-expanded', String(open));
    const count = acc.querySelectorAll('.tm-tile').length;
    acc.querySelector('[data-toggle-label]').textContent = open ? 'Hide' : 'Show ' + count + ' metrics';
  });
}

/* ---------- events ---------- */
document.querySelectorAll('[data-view]').forEach(b => {
  b.addEventListener('click', () => {
    state.view = b.getAttribute('data-view');
    state.open.fulfilment = false;
    state.open.otc = false;
    render();
  });
});

document.querySelectorAll('[data-acc] .tm-acc__head').forEach(head => {
  head.addEventListener('click', () => {
    const key = head.closest('[data-acc]').getAttribute('data-acc');
    state.open[key] = !state.open[key];
    render();
  });
});

function refresh() {
  state.dataState = 'loading';
  render();
  setTimeout(() => { state.dataState = 'ready'; render(); }, 1100);
}
document.getElementById('refresh').addEventListener('click', refresh);
document.getElementById('retry').addEventListener('click', refresh);

document.querySelector('[data-period="prev"]').addEventListener('click', () => {
  const ids = PERIODS[state.view].map(p => p.id);
  const i = ids.indexOf(state.period[state.view]);
  state.period[state.view] = ids[Math.max(0, i - 1)];
  state.dataState = 'ready';
  render();
});

render();

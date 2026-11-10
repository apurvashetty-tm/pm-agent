// Mock cases (plan B11): synthetic only, the same made-up patients and orders the approved case and Prescribe pictures show
// (ui-screens/case/case.html, from the old app.js scenarios with the D-53 / D-54 patches). No real patient, phone or doctor data.
// The backend sends these in the real app; the doctor never sets quantity (D-04, D-06). [MOCK ASSUMPTION] values throughout.
// Medicine fields: form (dose choices, app-logic §8) · interval / m a n / dose / hours / sosMax / duration = the backend's
// default schedule · status pending | prescribed | disabled · rxLine = the customer's Rx line on View Rx.

const CAT4_MEDS = [
  { id: 1, name: "Metformin", strength: "500mg", form: "tablet", qty: 60, interval: "daily", m: 1, a: 0, n: 1, duration: "ongoing", status: "prescribed", rxLine: "1-0-1 · Qty 60" },
  { id: 2, name: "Amlodipine", strength: "5mg", form: "tablet", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "ongoing", status: "pending", rxLine: "1-0-0 · Qty 30" },
  { id: 3, name: "Atorvastatin", strength: "10mg", form: "capsule", qty: 30, interval: "daily", m: 0, a: 0, n: 1, duration: "ongoing", status: "pending", rxLine: "0-0-1 · Qty 30" },
  { id: 4, name: "Vitamin B12", strength: "1000mcg", form: "injection", qty: 4, interval: "monthly", m: 0, a: 0, n: 0, dose: 1, duration: "3m", status: "pending", rxLine: "1 dose once a month · Qty 4" },
  { id: 5, name: "Antacid Suspension", strength: "10ml", form: "syrup", qty: 1, interval: "daily", m: 0, a: 10, n: 10, duration: "7d", status: "pending", rxLine: "0-1-1 · Qty 1" },
];

const BASE = {
  patient: "Ramesh Gupta", age: 54, gender: "Male", order: "TM-ORD-20240812", total: "₹1,240",
  created: "14 Oct 2026", delivery: "17 Oct 2026", payment: "Online",
  rx: { clinic: "Sunrise Medical Centre", doctor: "Dr. Meenakshi Iyer", quals: "MBBS, MD (General Medicine) · Reg. No. MH-12847",
    address: ["402, Lotus Tower, Andheri West, Mumbai – 400053", "Mon–Sat: 10am–1pm, 5pm–8pm · Tel: 022-4567-8901"],
    note: "As directed. Complete full course.", advice: ["Take medicines as prescribed.", "Drink plenty of water. Follow-up in 2 weeks."],
    stamp: "TRUEMEDS VERIFIED", reg: "MH-12847", labels: { patient: "Patient", date: "Date", ageGender: "Age / Gender", medicine: "Medicine {n}", advice: "General Advice" } },
};

// Launch scenarios (app-logic §11, Fallback B). caseType / ha decide the final buttons in step 5 (from the backend, never invented here).
export const CASES = {
  cat4: { ...BASE, caseType: "cat4", ha: "none", medicines: CAT4_MEDS },
  pilot_ha_free: { ...BASE, caseType: "pilot", ha: "required", patient: "Sunita Patel", age: 38, gender: "Female", order: "TM-ORD-20240891", total: "₹890",
    created: "21 Oct 2026", delivery: "25 Oct 2026", payment: "Online", medicines: [
      { id: 1, name: "Levothyroxine", strength: "50mcg", form: "tablet", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "ongoing", status: "pending", rxLine: "1-0-0 · Qty 30" },
      { id: 2, name: "Calcium + Vit D3", strength: "500mg", form: "capsule", qty: 60, interval: "daily", m: 1, a: 0, n: 1, duration: "ongoing", status: "prescribed", rxLine: "1-0-1 · Qty 60" },
      { id: 3, name: "Sodium Chloride Eye Drops", strength: "0.9%", form: "drops", qty: 1, interval: "daily", m: 0, a: 1, n: 1, duration: "7d", status: "pending", rxLine: "0-1-1 · Qty 1" },
    ] },
  pilot_no_ha_free: { ...BASE, caseType: "pilot", ha: "required", patient: "Vikram Nair", age: 62, gender: "Male", order: "TM-ORD-20240953", total: "₹560",
    created: "03 Nov 2026", delivery: "07 Nov 2026", payment: "COD", medicines: [
      { id: 1, name: "Losartan", strength: "50mg", form: "tablet", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "ongoing", status: "pending", rxLine: "1-0-0 · Qty 30" },
      { id: 2, name: "Hydrochlorothiazide", strength: "12.5mg", form: "tablet", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "ongoing", status: "pending", rxLine: "1-0-0 · Qty 30" },
      { id: 3, name: "Aspirin", strength: "75mg", form: "tablet", qty: 30, interval: "daily", m: 0, a: 0, n: 1, duration: "ongoing", status: "prescribed", rxLine: "0-0-1 · Qty 30" },
      { id: 4, name: "Betamethasone Cream", strength: "0.1%", form: "cream", qty: 1, interval: "daily", m: 0, a: 1, n: 1, duration: "7d", status: "pending", rxLine: "0-1-1 · Qty 1" },
    ] },
  pilot_ha_skipped_customer: { ...BASE, caseType: "pilot", ha: "skipped-customer", patient: "Ananya Krishnan", age: 29, gender: "Female", order: "TM-ORD-20241034", total: "₹430",
    created: "14 Oct 2026", delivery: "18 Oct 2026", payment: "Online", medicines: [
      { id: 1, name: "Ferrous Sulphate", strength: "200mg", form: "tablet", qty: 30, interval: "daily", m: 0, a: 0, n: 1, duration: "3m", status: "prescribed", rxLine: "0-0-1 · Qty 30" },
      { id: 2, name: "Folic Acid", strength: "5mg", form: "tablet", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "3m", status: "prescribed", rxLine: "1-0-0 · Qty 30" },
      { id: 3, name: "Salbutamol Inhaler", strength: "100mcg", form: "inhaler", qty: 1, interval: "sos", m: 0, a: 0, n: 0, dose: 2, sosMax: 4, duration: "ongoing", status: "pending", rxLine: "0-0-0 · Qty 1" },
    ] },
  pilot_ha_skipped_system: { ...BASE, caseType: "pilot", ha: "skipped-system", patient: "Mohan Reddy", age: 47, gender: "Male", order: "TM-ORD-20241112", total: "₹310",
    created: "22 Oct 2026", delivery: "26 Oct 2026", payment: "Online", medicines: [
      { id: 1, name: "Pantoprazole", strength: "40mg", form: "capsule", qty: 30, interval: "daily", m: 1, a: 0, n: 0, duration: "1m", status: "prescribed", rxLine: "1-0-0 · Qty 30" },
    ] },
};
CASES.stress = CASES.cat4;   // the stress scenario's variations are the caseKind story values below

// Story "caseKind" variations (plan §4 play link: normal, 10 medicines, long names, empty case, Rx fails, release refused).
const EXTRA = [["Pantoprazole", "40mg"], ["Cetirizine", "10mg"], ["Ibuprofen", "400mg"], ["Losartan", "50mg"], ["Telmisartan", "40mg"], ["Levocetirizine", "5mg"], ["Montelukast", "10mg"]];
// What the doctor has typed in the picture moments (a-notes-typing, d-discard-sheet): synthetic input, not app copy.
export const TYPED = { symptoms: "Fever since 2 days", note: "Take after dinner" };
export const LONG_PATIENT = "Venkataraman Ramachandran Iyer";
export function caseFor(scenario = "cat4", kind = "normal") {
  const src = CASES[scenario] || CASES.cat4;
  const c = JSON.parse(JSON.stringify(src));
  c.scenario = scenario;
  c.medicines.forEach((m) => { m.defaultDuration = m.duration; });
  if (kind === "ten-medicines") {
    const base = c.medicines.slice();
    EXTRA.forEach(([name, strength], i) => c.medicines.push({ ...base[i % base.length], id: 100 + i, name, strength }));
  }
  if (kind === "long-names") { c.patient = LONG_PATIENT; c.medicines[0].name = "Amoxicillin Clavulanate Dispersible"; c.medicines[0].strength = "625mg"; }
  if (kind === "empty") c.medicines = [];
  return c;
}

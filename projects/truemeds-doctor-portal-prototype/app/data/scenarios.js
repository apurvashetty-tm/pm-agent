// Synthetic scenarios (plan B11, app-logic §11). No real patient, phone or doctor data. Names are made up.
// Version A scenarios are not in the launch build (plan §5, step 9) and are not listed here.
export const SCENARIOS = {
  cat4: { label: "Cat4 — doctor call only", caseType: "Cat4", ha: "—", finalButton: "Confirm prescription", patient: "Test Patient One", order: "TM-T-1001", total: "₹1,240", medicines: 3 },
  pilot_ha_free: { label: "Pilot — HA free (Fallback B)", caseType: "Pilot", ha: "Required, HA free", finalButton: "Confirm prescription → HA check", patient: "Test Patient Two", order: "TM-T-1002", total: "₹2,015", medicines: 4 },
  pilot_no_ha_free: { label: "Pilot — no HA free", caseType: "Pilot", ha: "Required, no HA free", finalButton: "Confirm prescription → forwarded", patient: "Test Patient Three", order: "TM-T-1003", total: "₹760", medicines: 2 },
  pilot_ha_skipped_customer: { label: "Pilot — HA skipped (customer)", caseType: "Pilot", ha: "Skipped by customer", finalButton: "Confirm prescription", patient: "Test Patient Four", order: "TM-T-1004", total: "₹980", medicines: 2 },
  pilot_ha_skipped_system: { label: "Pilot — HA skipped (system)", caseType: "Pilot", ha: "Skipped by system", finalButton: "Confirm prescription", patient: "Test Patient Five", order: "TM-T-1005", total: "₹1,100", medicines: 3 },
  stress: { label: "Stress — 10 medicines, long names, empty case", caseType: "Cat4", ha: "—", finalButton: "Confirm prescription", patient: "Test Patient With A Very Long Synthetic Name For Layout", order: "TM-T-1099", total: "₹0", medicines: 10, empty: true },
};
export const LAUNCH_SCENARIOS = ["cat4", "pilot_ha_free", "pilot_no_ha_free", "pilot_ha_skipped_customer", "pilot_ha_skipped_system"];

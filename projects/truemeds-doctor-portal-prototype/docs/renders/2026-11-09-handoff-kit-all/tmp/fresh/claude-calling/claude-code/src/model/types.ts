// Data the case page receives. Everything that decides a route is a BACKEND FIELD (AGENTS.md rule 6,
// DECIDED case-131): the app never works out Cat4 vs Pilot, value vs non-value, HA required or HA-skip eligibility.

export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'drops' | 'inhaler' | 'injection' | 'cream';
export type MedicineStatus = 'prescribed' | 'pending' | 'disabled';

export interface Medicine {
  id: string;
  /** Backend display name incl. strength, e.g. "Metformin 500mg" (data, not copy). */
  name: string;
  qty: number;
  form: MedicineForm;
  status: MedicineStatus;
}

export interface CaseData {
  caseId: string;
  patient: { fullName: string; age: string; gender: string };
  order: {
    id: string;
    total: string; // formatted by the backend, e.g. "₹1,240"
    created?: string;
    expectedDelivery?: string;
    payment?: string;
  };
  /** Backend: case type. */
  route: 'cat4' | 'pilot';
  /**
   * Backend: an HA call follows the doctor call (Pilot, HA required, not skipped by customer/system).
   * Skip HA is offered only when this is true (DECIDED case-70). Never derived in the app.
   */
  haCallFollows: boolean;
  medicines: Medicine[];
}

/** Normalised call status from the backend (it maps Ozonetel / Knowlarity terms, DECIDED case-30). */
export interface CallStatus {
  callId: string;
  /** Request refused, or a leg-1 network / vendor error → state 3. */
  notThrough?: boolean;
  /** Leg 1 not answered / busy / rejected → state 4. */
  doctorMissed?: boolean;
  /** Leg 2 answered (live leg event, OQ-030 dependency). */
  patientAnswered?: boolean;
  /** Leg 2 failed (no answer, busy, rejected, off, unreachable, invalid) → state 9, closed automatically. */
  patientLegFailed?: boolean;
  /** Partner reported the hang-up. */
  hangup?: { endedBy: 'doctor' | 'patient' | 'unknown' };
  /** Partner's call result. Validity (total talk time ≥ gate, summed across calls) is decided by the backend. */
  result?: { verdict: 'valid' | 'tooShort' };
}

export type ConfirmKind =
  | 'confirmPrescription' // Cat4 / HA skipped (8a, 7d Cat4)
  | 'confirmLive' // Pilot B1 on the live call → HA check (Fallback B)
  | 'confirmForward'; // 16 / 7d Pilot

/** Analytics outcome — four separate events, never derived from the button label (DECIDED case-74). */
export type ConfirmOutcome = 'prescriptionCat4' | 'prescriptionHaSkipped' | 'transferredToHa' | 'forwardedToHa';

export interface CallbackSlot {
  id: string;
  /** Backend label, e.g. "3:00 PM" (data). */
  label: string;
}

export type UnavailableReason = 'noAnswer' | 'notReachable' | 'wrongNumber';
export type SkipHaReason = 'declined' | 'notRequired' | 'repeat';

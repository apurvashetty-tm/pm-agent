// Data the Prescribe screen receives (from the backend / case page) and the draft it edits.

export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'drops' | 'inhaler' | 'injection' | 'cream';

/** rx-04: Daily · Every X hours · Alt days · Weekly · Monthly · SOS only */
export type Frequency = 'daily' | 'everyXHours' | 'altDays' | 'weekly' | 'monthly' | 'sosOnly';

export type DurationUnit = 'days' | 'weeks' | 'months';
export type Period = { n: number; unit: DurationUnit };
/** rx-15: a number + unit, or Ongoing (prints the backend's default period). */
export type Duration = { kind: 'ongoing' } | { kind: 'fixed'; n: number; unit: DurationUnit };

/** rx-16 */
export type FoodOption = 'afterFood' | 'beforeFood' | 'emptyStomach';

/** rx-22: the five Disable reasons. */
export type DisableReason = 'remote' | 'contra' | 'duplicate' | 'declined' | 'strength';

/** A single-row dose: a number from the form's grid, or 'other' (typed in the Other field). */
export type SingleDose = number | 'other';

export interface PrescriptionDraft {
  frequency: Frequency;
  /** Daily: dose per time of day (0 = none; cream: 0 = None, 1 = Apply). */
  slots: { m: number; a: number; n: number };
  /** Every X hours / Alt days / Weekly / Monthly / SOS only. */
  singleDose: SingleDose | null;
  /** Text typed in the Other dose field (number pad with decimal key, rx-25). */
  otherText: string;
  /** rx-13: 4 · 6 · 8 · 12 */
  everyHours: number;
  /** rx-14: SOS only → Max doses a day 1–4 */
  maxDoses: number;
  /** rx-14: Also as needed (SOS) on a regular schedule */
  sosOn: boolean;
  sosDose: number | null;
  /** rx-14: Max extra doses a day 1–4 */
  sosMax: number;
  duration: Duration;
  food: FoodOption | null;
  instructions: string;
}

export type MedicineStatus = 'pending' | 'prescribed' | 'disabled';

/** What the case page hands to Prescribe. All of it is backend data. */
export interface PrescribeMedicine {
  id: string;
  /** Name + strength exactly as the backend sends it, e.g. "Metformin 500mg". */
  name: string;
  form: MedicineForm;
  status: MedicineStatus;
  /** Present when status === 'disabled' (rx-20). */
  disabledReason?: DisableReason;
  /** The backend's default duration for this medicine (shows "Default"). */
  defaultDuration: Duration;
  /** rx-15 / rx-29 [MOCK]: what Ongoing prints. Backend value; prototype uses 6 months. */
  ongoingPeriod: Period;
  /**
   * The schedule the screen opens with (a saved prescription, or the backend's prefill).
   * NOT IN THE KIT: where the d-default prefill (1-0-1) comes from — see report Q8.
   */
  initial?: Partial<PrescriptionDraft>;
}

export interface PrescribeResult {
  medicineId: string;
  draft: PrescriptionDraft;
  /** The exact "On prescription" line (rx-03, rx-23). */
  printedLine: string;
}

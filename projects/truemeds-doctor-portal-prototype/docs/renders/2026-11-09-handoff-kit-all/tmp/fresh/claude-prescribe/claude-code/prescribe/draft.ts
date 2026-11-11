// Opening draft and the edits the screen allows. Pure functions — easy to test.
import { FORM_RULES } from './formRules';
import type { Duration, DurationUnit, Frequency, PrescribeMedicine, PrescriptionDraft } from './types';

/**
 * ASSUMED (not in the kit, see report Q8/Q9): when the backend sends no saved schedule,
 * a single-row dose starts on 1 (or the first option), Every X hours on 6 h (d-every-x-hours),
 * Max doses / Max extra on 1 (d-sos-only, d-sos-on). Kept in this one function.
 */
export function initialDraft(med: PrescribeMedicine): PrescriptionDraft {
  const rule = FORM_RULES[med.form];
  const firstSingle = rule.single.includes(1) ? 1 : rule.single[0];
  return {
    frequency: 'daily',
    slots: { m: 0, a: 0, n: 0 },
    singleDose: firstSingle,
    otherText: '',
    everyHours: 6,
    maxDoses: 1,
    sosOn: false,
    sosDose: firstSingle,
    sosMax: 1,
    duration: med.defaultDuration,
    food: null,
    instructions: '',
    ...med.initial,
  };
}

export const isChanged = (a: PrescriptionDraft, b: PrescriptionDraft) => JSON.stringify(a) !== JSON.stringify(b);

export function setFrequency(d: PrescriptionDraft, frequency: Frequency): PrescriptionDraft {
  return { ...d, frequency };
}

/**
 * Duration picker edits. ASSUMED (report Q12): a number tapped while Ongoing is selected
 * takes the last unit used (or Days); a unit tapped while Ongoing takes the last number (or 1).
 */
export function pickDurationNumber(d: PrescriptionDraft, n: number, lastUnit: DurationUnit): PrescriptionDraft {
  const unit = d.duration.kind === 'fixed' ? d.duration.unit : lastUnit;
  return { ...d, duration: { kind: 'fixed', n, unit } };
}

export function pickDurationUnit(d: PrescriptionDraft, unit: DurationUnit, lastNumber: number): PrescriptionDraft {
  const n = d.duration.kind === 'fixed' ? d.duration.n : lastNumber;
  return { ...d, duration: { kind: 'fixed', n, unit } };
}

export const ongoing: Duration = { kind: 'ongoing' };

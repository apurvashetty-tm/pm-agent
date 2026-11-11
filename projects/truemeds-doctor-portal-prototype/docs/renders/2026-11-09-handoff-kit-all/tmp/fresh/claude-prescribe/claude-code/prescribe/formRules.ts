// Product rules for Prescribe, each tied to its DECIDED.md id.
// Dose numbers, hours and counts are VALUES (AGENTS.md: "Numbers shown as text … are
// values, not copy"), not style constants. Lines marked ASSUMED are not in the kit.
import type { FeedbackMessageId } from '../theme';
import type { DisableReason, FoodOption, Frequency, MedicineForm } from './types';

export interface FormRule {
  /** Printed unit, singular / plural (print.unit.*). */
  unitOne: FeedbackMessageId;
  unitMany: FeedbackMessageId;
  /** M / A / N grid values; 0 = none. */
  daily: number[];
  /** Single-row grid values (Every X hours, Alt days, Weekly, Monthly, SOS). */
  single: number[];
  /** Other (typed) dose in the single-row grid, and its unit (rx-05, rx-07). */
  otherUnit?: FeedbackMessageId;
  /** Muted unit hint after the "Dose" label, e.g. "Dose (ml)" (seen in d-syrup, d-inhaler). */
  doseHint?: FeedbackMessageId;
  /** Daily line prints the unit after M-A-N ("0-1-1 drops", "0-10-10 ml"). */
  manUnit: boolean;
  /** Cream: chips read None / Apply and the line reads "Apply 0-1-1" (rx-08). */
  apply?: true;
}

export const FORM_RULES: Record<MedicineForm, FormRule> = {
  // d-default: 0 · ½ · 1 · 2; d-alt-days / d-monthly single row: ½ · 1 · 2
  tablet: { unitOne: 'print.unit.tablet', unitMany: 'print.unit.tablets', daily: [0, 0.5, 1, 2], single: [0.5, 1, 2], manUnit: false },
  // d-weekly single row 1 · 2. Daily grid ASSUMED 0 · 1 · 2 (no picture).
  capsule: { unitOne: 'print.unit.capsule', unitMany: 'print.unit.capsules', daily: [0, 1, 2], single: [1, 2], manUnit: false },
  // rx-05: daily 0 · 2.5 · 5 · 10 ml; single 2.5 · 5 · 10 · Other (ml)
  syrup: {
    unitOne: 'print.unit.ml', unitMany: 'print.unit.ml', daily: [0, 2.5, 5, 10], single: [2.5, 5, 10],
    otherUnit: 'print.unit.ml', doseHint: 'print.unit.ml', manUnit: true,
  },
  // d-drops: daily 0 · 1 · 2 · 3. Single row ASSUMED 1 · 2 · 3.
  drops: { unitOne: 'print.unit.drop', unitMany: 'print.unit.drops', daily: [0, 1, 2, 3], single: [1, 2, 3], manUnit: true },
  // rx-06: daily 0 · 1 · 2 puffs; single 1 · 2 (no Other)
  inhaler: {
    unitOne: 'print.unit.puff', unitMany: 'print.unit.puffs', daily: [0, 1, 2], single: [1, 2],
    doseHint: 'print.unit.puffs', manUnit: true,
  },
  // rx-07: daily 0 · 1 · 2 · 3; single 1 · 2 · 3 · Other (units). Chips print "1 dose"
  // (d-injection-default); Other prints units. Daily line without unit: ASSUMED.
  injection: {
    unitOne: 'print.unit.dose', unitMany: 'print.unit.doses', daily: [0, 1, 2, 3], single: [1, 2, 3],
    otherUnit: 'print.unit.units', manUnit: false,
  },
  // rx-08: daily None / Apply; single Apply. SOS max counts "times" (rx-23).
  cream: { unitOne: 'print.unit.time', unitMany: 'print.unit.times', daily: [0, 1], single: [1], manUnit: false, apply: true },
};

/** rx-04, in the approved order. */
export const FREQUENCIES: { id: Frequency; label: FeedbackMessageId }[] = [
  { id: 'daily', label: 'prescribe.daily' },
  { id: 'everyXHours', label: 'prescribe.everyXHours' },
  { id: 'altDays', label: 'prescribe.altDays' },
  { id: 'weekly', label: 'prescribe.weekly' },
  { id: 'monthly', label: 'prescribe.monthly' },
  { id: 'sosOnly', label: 'prescribe.sosOnly' },
];

/** rx-13 */
export const EVERY_HOURS = [4, 6, 8, 12];
/** rx-14: Max doses a day / Max extra doses a day */
export const MAX_PER_DAY = [1, 2, 3, 4];
/** rx-15 */
export const DURATION_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 10, 14, 15];
/** Hours in a day, to derive "{n} times a day" for Every X hours (rx-13). A value, not a size. */
export const HOURS_PER_DAY = 24;

/** rx-16 */
export const FOOD: { id: FoodOption; label: FeedbackMessageId }[] = [
  { id: 'afterFood', label: 'prescribe.afterFood' },
  { id: 'beforeFood', label: 'prescribe.beforeFood' },
  { id: 'emptyStomach', label: 'prescribe.emptyStomach' },
];

/** rx-22, in the approved order. */
export const DISABLE_REASONS: { id: DisableReason; title: FeedbackMessageId; desc: FeedbackMessageId }[] = [
  { id: 'remote', title: 'prescribe.reasonRemote', desc: 'prescribe.reasonRemoteDesc' },
  { id: 'contra', title: 'prescribe.reasonContra', desc: 'prescribe.reasonContraDesc' },
  { id: 'duplicate', title: 'prescribe.reasonDuplicate', desc: 'prescribe.reasonDuplicateDesc' },
  { id: 'declined', title: 'prescribe.reasonDeclined', desc: 'prescribe.reasonDeclinedDesc' },
  { id: 'strength', title: 'prescribe.reasonStrength', desc: 'prescribe.reasonStrengthDesc' },
];

export const FORM_LABEL: Record<MedicineForm, FeedbackMessageId> = {
  tablet: 'form.tablet',
  capsule: 'form.capsule',
  syrup: 'form.syrup',
  drops: 'form.drops',
  inhaler: 'form.inhaler',
  injection: 'form.injection',
  cream: 'form.cream',
};

export const isSingleRow = (f: Frequency) => f !== 'daily';

// The pinned "On prescription" line (rx-03, rx-23) and the checks before Prescribe (rx-17).
// Every word comes from messages; only the joining glyphs listed under KIT GAP are typed.
import { message, messages } from '../theme';
import type { FeedbackMessageId } from '../theme';
import { FOOD, FORM_RULES, FormRule } from './formRules';
import type { Duration, MedicineForm, Period, PrescribeMedicine, PrescriptionDraft } from './types';

// ---------------------------------------------------------------------------
// KIT GAP — typed characters the kit has no message key for (see report §3):
//  • MAN_JOIN: the "-" between Morning-Afternoon-Night in "1-0-1".
//  • HALF: the "½" glyph for half tablets (the kit shows it as chip data "½").
//  • KEEP: a no-break space, so "6 months" / "1 tablet" never split (rx-10, ps-keep).
const MAN_JOIN = '-';
const HALF = '½';
const KEEP = ' ';
// ---------------------------------------------------------------------------

const keep = (s: string) => s.replace(/ /g, KEEP);

/** A dose value as shown on chips and in the printed line: 0.5 → "½", 1.5 → "1½", 2.5 ml stays "2.5". */
export function formatValue(n: number, form: MedicineForm): string {
  if (form === 'tablet') {
    const whole = Math.floor(n);
    if (n - whole === 0.5) return whole === 0 ? HALF : `${whole}${HALF}`;
  }
  return String(n);
}

/** "1 tablet", "2 puffs", "10 ml" — singular when the amount is 1 or less (rx-23). */
export function amount(n: number, form: MedicineForm, unitOne?: FeedbackMessageId, unitMany?: FeedbackMessageId): string {
  const rule = FORM_RULES[form];
  const one = unitOne ?? rule.unitOne;
  const many = unitMany ?? rule.unitMany;
  return keep(message('print.amount', { n: formatValue(n, form), unit: messages[n > 1 ? many : one] }));
}

export function durationText(p: Period): string {
  const unit: Record<Period['unit'], [FeedbackMessageId, FeedbackMessageId]> = {
    days: ['print.day', 'print.days'],
    weeks: ['print.week', 'print.weeks'],
    months: ['print.month', 'print.months'],
  };
  const [one, many] = unit[p.unit];
  return keep(message('print.duration', { n: p.n, unit: messages[p.n === 1 ? one : many] }));
}

/** Chip text on a dose grid: numbers are data; cream reads None / Apply (rx-08). */
export function chipLabel(value: number, form: MedicineForm): string {
  if (FORM_RULES[form].apply) return messages[value === 0 ? 'prescribe.slotNone' : 'prescribe.apply'];
  return formatValue(value, form);
}

/** Screen-reader dose for "{slot}: {dose}" (prescribe.slotAria). */
export function slotAriaDose(value: number, form: MedicineForm): string {
  if (value === 0) return messages['prescribe.none'];
  if (FORM_RULES[form].apply) return messages['prescribe.apply'];
  return amount(value, form).replace(new RegExp(KEEP, 'g'), ' ');
}

/** Plain positive numbers only: 7, 7.5, .5 (rx-17). */
export function parseOther(textValue: string): number | null {
  const t = textValue.trim();
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}

/** The single-row dose as printed, or '' when Other has no valid number yet. */
function singleDoseText(d: PrescriptionDraft, form: MedicineForm, rule: FormRule): { text: string; value: number | null; other: boolean } {
  if (d.singleDose === 'other') {
    const n = parseOther(d.otherText);
    const unit = rule.otherUnit ?? rule.unitMany;
    return { text: n == null ? '' : keep(message('print.amount', { n: String(n), unit: messages[unit] })), value: n, other: true };
  }
  if (d.singleDose == null) return { text: '', value: null, other: false };
  if (rule.apply) return { text: messages['prescribe.apply'], value: d.singleDose, other: false };
  return { text: amount(d.singleDose, form), value: d.singleDose, other: false };
}

/**
 * KIT GAP: with no valid dose (Other empty / invalid) the approved picture d-error-other
 * prints "Once a month · 3 months" — the template with the dose left out, first letter
 * capitalised. No key exists for that, so we derive it here, in one place.
 */
function withoutDose(line: string): string {
  const t = line.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function scheduleText(d: PrescriptionDraft, form: MedicineForm): string {
  const rule = FORM_RULES[form];
  if (d.frequency === 'daily') {
    const man = [d.slots.m, d.slots.a, d.slots.n].map((v) => formatValue(v, form)).join(MAN_JOIN);
    if (rule.apply) return message('print.applyMAN', { man });
    if (rule.manUnit) return keep(message('print.amount', { n: man, unit: messages[rule.unitMany] }));
    return man;
  }
  const dose = singleDoseText(d, form, rule);
  const fill = (key: FeedbackMessageId, values: Record<string, string | number>) => {
    const line = message(key, { dose: dose.text, ...values });
    return dose.text ? line : withoutDose(line);
  };
  switch (d.frequency) {
    case 'everyXHours':
      return fill('print.everyHours', { n: d.everyHours });
    case 'altDays':
      return fill('print.altDays', {});
    case 'weekly':
      return fill('print.weekly', {});
    case 'monthly':
      return fill('print.monthly', {});
    case 'sosOnly': {
      if (rule.apply) return message('print.applyAsNeeded', { max: amount(d.maxDoses, form) });
      const max = dose.value == null ? '' : dose.other
        ? keep(message('print.amount', { n: String(dose.value * d.maxDoses), unit: messages[rule.otherUnit ?? rule.unitMany] }))
        : amount(dose.value * d.maxDoses, form);
      return fill('print.asNeeded', { max });
    }
  }
}

function sosAddOn(schedule: string, d: PrescriptionDraft, form: MedicineForm): string {
  if (!d.sosOn || d.frequency === 'sosOnly' || d.sosDose == null) return schedule;
  const rule = FORM_RULES[form];
  const dose = rule.apply ? messages['prescribe.apply'] : amount(d.sosDose, form);
  const max = rule.apply ? amount(d.sosMax, form) : amount(d.sosDose * d.sosMax, form);
  return message('print.plusSos', { schedule, dose, max });
}

export function durationValue(duration: Duration, med: PrescribeMedicine): string {
  return duration.kind === 'ongoing' ? durationText(med.ongoingPeriod) : durationText(duration);
}

/** rx-23: schedule · duration · food (if chosen) · instructions (if written). */
export function printedLine(d: PrescriptionDraft, med: PrescribeMedicine): string {
  const parts = [sosAddOn(scheduleText(d, med.form), d, med.form), durationValue(d.duration, med)];
  const food = FOOD.find((f) => f.id === d.food);
  if (food) parts.push(messages[food.label]);
  if (d.instructions.trim()) parts.push(d.instructions.trim());
  return parts.join(messages['print.sep']);
}

/** Duration field text: "Ongoing (6 months)" or "7 days" (d-default, d-cream). */
export function durationFieldValue(duration: Duration, med: PrescribeMedicine): string {
  return duration.kind === 'ongoing'
    ? message('prescribe.ongoingValue', { period: durationText(med.ongoingPeriod) })
    : durationText(duration);
}

export const sameDuration = (a: Duration, b: Duration) =>
  a.kind === b.kind && (a.kind === 'ongoing' || (b.kind === 'fixed' && a.n === b.n && a.unit === b.unit));

export interface PrescribeErrors {
  /** rx-17 / rx-26: daily schedule with no dose at all. */
  dose?: string;
  /** rx-17: Other picked with no valid number. */
  other?: string;
}

/** rx-17 — checks before Prescribe. */
export function validate(d: PrescriptionDraft, form: MedicineForm): PrescribeErrors {
  const rule = FORM_RULES[form];
  if (d.frequency === 'daily') {
    return d.slots.m + d.slots.a + d.slots.n === 0 ? { dose: messages['prescribe.doseError'] } : {};
  }
  if (d.singleDose === 'other') {
    const unit = messages[rule.otherUnit ?? rule.unitMany];
    if (!d.otherText.trim()) return { other: message('prescribe.otherEmpty', { unit }) };
    if (parseOther(d.otherText) == null) return { other: message('prescribe.otherInvalid', { unit }) };
  }
  return {};
}

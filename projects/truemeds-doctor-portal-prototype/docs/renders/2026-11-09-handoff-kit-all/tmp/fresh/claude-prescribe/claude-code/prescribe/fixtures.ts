// Sample data that reproduces every approved Prescribe state (screens/prescribe.json).
// Names, strengths and doses are DATA (backend values in the real app), copied from the
// kit's `copy[].values` / pictures — not copy. Use for previews and screenshot tests:
//   <PrescribeScreen medicine={KIT_STATES['d-sos-on'].medicine} preview={KIT_STATES['d-sos-on'].preview} … />
import type { PrescribeScreenProps } from './PrescribeScreen';
import type { PrescribeMedicine } from './types';

// rx-29 [MOCK]: what Ongoing prints; the real value comes from the backend.
const SIX_MONTHS = { n: 6, unit: 'months' } as const;

const metformin: PrescribeMedicine = {
  id: 'metformin',
  name: 'Metformin 500mg',
  form: 'tablet',
  status: 'pending',
  defaultDuration: { kind: 'ongoing' },
  ongoingPeriod: SIX_MONTHS,
  initial: { frequency: 'daily', slots: { m: 1, a: 0, n: 1 } },
};

const withDraft = (m: PrescribeMedicine, initial: PrescribeMedicine['initial']): PrescribeMedicine => ({
  ...m,
  initial: { ...m.initial, ...initial },
});

type KitState = { medicine: PrescribeMedicine; preview?: PrescribeScreenProps['preview'] };

export const KIT_STATES: Record<string, KitState> = {
  'd-default': { medicine: metformin },
  'd-scrolled': { medicine: metformin },
  'd-header-white': { medicine: metformin },
  'd-every-x-hours': { medicine: withDraft(metformin, { frequency: 'everyXHours', everyHours: 6, singleDose: 1 }) },
  'd-alt-days': { medicine: withDraft(metformin, { frequency: 'altDays', singleDose: 1 }) },
  'd-monthly': { medicine: withDraft(metformin, { frequency: 'monthly', singleDose: 1 }) },
  'd-weekly': {
    medicine: { ...metformin, id: 'atorvastatin', name: 'Atorvastatin 10mg', form: 'capsule', initial: { frequency: 'weekly', singleDose: 2 } },
  },
  'd-sos-only': {
    medicine: { ...metformin, id: 'amlodipine', name: 'Amlodipine 5mg', initial: { frequency: 'sosOnly', singleDose: 1, maxDoses: 1 } },
  },
  'd-sos-on': { medicine: metformin, preview: { draft: { sosOn: true, sosDose: 1, sosMax: 1 } } },
  'd-duration-picker': { medicine: metformin, preview: { durationOpen: true } },
  'd-food-selected': { medicine: metformin, preview: { draft: { food: 'beforeFood' } } },
  'd-notes-keyboard': { medicine: metformin }, // focus Additional instructions
  'd-error-dose': { medicine: metformin, preview: { draft: { slots: { m: 0, a: 0, n: 0 } }, showErrors: true } },
  'd-syrup': {
    medicine: {
      id: 'antacid', name: 'Antacid Suspension 10ml', form: 'syrup', status: 'pending',
      defaultDuration: { kind: 'fixed', n: 7, unit: 'days' }, ongoingPeriod: SIX_MONTHS,
      initial: { slots: { m: 0, a: 10, n: 10 } },
    },
  },
  'd-drops': {
    medicine: {
      id: 'saline', name: 'Sodium Chloride Eye Drops 0.9%', form: 'drops', status: 'pending',
      defaultDuration: { kind: 'fixed', n: 7, unit: 'days' }, ongoingPeriod: SIX_MONTHS,
      initial: { slots: { m: 0, a: 1, n: 1 } },
    },
  },
  'd-inhaler': {
    medicine: {
      id: 'salbutamol', name: 'Salbutamol Inhaler 100mcg', form: 'inhaler', status: 'pending',
      defaultDuration: { kind: 'ongoing' }, ongoingPeriod: SIX_MONTHS,
      initial: { frequency: 'sosOnly', singleDose: 2, maxDoses: 4 },
    },
  },
  'd-injection-default': {
    medicine: {
      id: 'b12', name: 'Vitamin B12 1000mcg', form: 'injection', status: 'pending',
      defaultDuration: { kind: 'fixed', n: 3, unit: 'months' }, ongoingPeriod: SIX_MONTHS,
      initial: { frequency: 'monthly', singleDose: 1 },
    },
  },
  'd-cream': {
    medicine: {
      id: 'betamethasone', name: 'Betamethasone Cream 0.1%', form: 'cream', status: 'pending',
      defaultDuration: { kind: 'fixed', n: 7, unit: 'days' }, ongoingPeriod: SIX_MONTHS,
      initial: { slots: { m: 0, a: 1, n: 1 } },
    },
  },
  'd-disabled': { medicine: { ...metformin, status: 'disabled', disabledReason: 'declined' } },
  'd-disable-sheet': { medicine: metformin, preview: { sheet: 'disable' } },
  'd-discard-sheet': { medicine: metformin, preview: { sheet: 'discard', draft: { instructions: 'Take after dinner' } } },
};

// d-error-other: the injection with Other picked and "7..5" typed (decimal-pad typo).
KIT_STATES['d-error-other'] = {
  medicine: KIT_STATES['d-injection-default'].medicine,
  preview: { draft: { singleDose: 'other', otherText: '7..5' }, showErrors: true },
};
// d-rx-failed: render <RxViewer status="failed" … /> (RxViewer.tsx).

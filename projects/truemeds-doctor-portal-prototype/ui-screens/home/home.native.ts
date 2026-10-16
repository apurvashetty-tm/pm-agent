// Native handoff contract, not a shipping screen. Use existing app components.
import tokens from '../../../../design-system/native/tokens';
import icons from '../../../../design-system/native/icons';

export const homeNative = {
  tokens,
  icons,
  presetsMinutes: [15, 30, 45, 60, 120, 180] as const,
  minimumMinutes: 15,
  stepMinutes: 15,
  minimumTouchTarget: 44,
  primaryMinimumHeight: 56,
  logoAsset: '../../brand/truemeds-for-doctors.svg',
} as const;

export type DurationVariant = 'wheel';
export type Mutation = 'idle' | 'saving' | 'failed' | 'reconciling';
export interface HomeReferenceProps {
  prescribedToday: number;
  deadlineEpochMs: number | null; // Authoritative backend deadline.
  selectedMinutes: number;
  durationVariant: DurationVariant;
  mutation: Mutation;
  errorMessage?: string;
  requestPending: boolean;
  stopAfterRequest: boolean;
  onSelectMinutes(minutes: number): void;
  onStart(minutes: number): Promise<void>;
  onAdd(minutes: number): Promise<void>;
  onRequestCase(): Promise<void>;
  onEndAvailability(): Promise<void>;
}

export function isValidDuration(minutes: number): boolean {
  return Number.isSafeInteger(minutes) && minutes >= 15 && minutes % 15 === 0;
}
export function adjustDuration(current: number, delta: -60 | -15 | 15 | 60): number {
  if (!isValidDuration(current)) throw new Error('Invalid duration');
  const next = current + delta;
  return isValidDuration(next) ? next : current;
}
// Backend rule documented here for handoff; client must use returned deadline.
export function referenceAddedDeadline(serverNow: number, deadline: number | null, minutes: number): number {
  if (!isValidDuration(minutes)) throw new Error('Invalid duration');
  return Math.max(serverNow, deadline ?? serverNow) + minutes * 60_000;
}

export const presets = [15, 30, 45, 60, 120, 180] as const;
export function validMinutes(n: number) { return Number.isSafeInteger(n) && n >= 15 && n % 15 === 0; }
export function adjustMinutes(n: number, delta: number) {
  if (!validMinutes(n)) throw new Error('Duration must be at least 15 minutes in 15-minute increments');
  return validMinutes(n + delta) ? n + delta : n;
}
export function normaliseMobile(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length >= 10 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}
export function countdown(seconds: number) {
  const n = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toString().padStart(2, '0')}`;
}
export function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}
// Specification helper only: backend must apply this atomically and return its deadline.
export function addedDeadline(now: number, deadline: number | null, minutes: number) {
  if (!validMinutes(minutes)) throw new Error('Invalid duration');
  return Math.max(now, deadline ?? now) + minutes * 60_000;
}

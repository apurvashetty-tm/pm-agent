// Calling settings. These come from configuration / the server (DECIDED case-118 … case-127);
// they are never typed into a screen or into copy. The app reads them from `CallingSettings`.

export interface CallingSettings {
  /** case-118 · gate — agreed rule, 50 s today. Used for the Pilot live-call count (B1, case-22). */
  gateSeconds: number;
  /** case-121 · noResultTimeout — 3 min after the tap with no result → 7b / 7c. */
  noResultTimeoutMs: number;
  /** case-122 · stillOnCallRepeat — "Still talking" asks again after 3 min. */
  stillOnCallRepeatMs: number;
  /** case-126 · pollingInterval [MOCK 3 s] — status shown within ~5 s of the partner (D-58 pt 14). */
  pollingIntervalMs: number;
  /** case-123 · callRecordWait [MOCK 30 min] — backend-side; the app only displays its result. */
  callRecordWaitMs: number;
  /**
   * NOT IN THE KIT as a token or setting: the toast shows "about 4 seconds" (toast.json rule).
   * tokens.duration has no matching value. Kept here so it is not typed in a component; see report.
   */
  toastDurationMs: number;
}

export type SettingsSource = () => Promise<CallingSettings>;

# Round 5 — expected list (written before the render)

Derived from the probes in REPORT.md "Round 5" (before-state measured on the Round 4 promoted pictures).
Anything outside this list must be pixel-identical to `ui-screens/` (Round 4 promoted). Any other difference = failure until explained.

## Expected to change (100 pictures = 50 states × 390 and 360)

### Item 1 — notice band is the bar's top edge (case page bar; `#case-actionbar > .concept-new` margin override removed for band notices)
15 states, each has a band notice in the case action bar (not the question notice):
- case/a-confirm-failed
- case/a-offline
- case/a-offline-action
- case/a-release-failed
- case/t03-not-through
- case/t04-doctor-missed
- case/t06-ended-early
- case/t08c-confirm-blocked
- case/t15b-end-call-first
- case/t16-transfer-missed
- case/t16b-transfer-missed-patient
- case/t16c-transfer-missed-unknown
- case/t17-skip-ha-wait
- case/s7d-result-missing
- case/s7d-unavailable-sheet

Not expected to change: home/* and offer/* bar notices (already at the bar top edge, probe: notice top = bar top); case/s7b-still-on-call and case/s7c-checking (the question notice, no band).

### Item A — B-07 back / ✕ and title on one edge (`tm-header-edit`, `tm-header-viewer`)
24 states:
- every Prescribe state (23): prescribe/d-alt-days, d-cream, d-default, d-disable-sheet, d-disabled, d-discard-sheet, d-drops, d-duration-picker, d-error-dose, d-error-other, d-every-x-hours, d-food-selected, d-header-white, d-inhaler, d-injection-default, d-monthly, d-notes-keyboard, d-rx-failed, d-scrolled, d-sos-on, d-sos-only, d-syrup, d-weekly
- case/a-rx-viewer (Rx viewer header)
Not expected: case/t01-ready and every other case header (already compact, on the reference geometry).

### Item B — OTP Verify never moves (`otp/otp.html`, reserved message slot)
11 states: otp/otp_default, otp_empty-tap, otp_too-short, otp_verifying, otp_wrong-code, otp_two-tries-left, otp_resend-available, otp_new-code-sent, otp_code-expired, otp_cooldown-reconciling, otp_resending.
Not expected: otp_locked, otp_too-many-resends, otp_couldnt-verify, otp_resend-failed, otp_offline, otp_expired-and-resend-limited (notice states, keep their layout; Verify still moves there, see NEEDS-APURVA).

## Expected count
- Item 1: 15 states × 2 = 30 pictures
- Item A: 24 states × 2 = 48 pictures
- Item B: 11 states × 2 = 22 pictures
- Total: 100 pictures (50 states). Everything else identical.

# Phase D — Needs Apurva (after three review rounds)

Layout is reviewed; no open layout blockers. Open decisions:

1. **Mock data for the Rx and the order.** The Rx is dated today (14 Oct 2026), the order was created 12 Aug 2024. The Rx line for Vitamin B12 reads 0-0-0 while the medicine is one dose a month.
   - Options: (a) align the mock order dates to today and fix the B12 Rx line; (b) keep the mock as is.
   - Recommendation: (a), so the mock reads as one believable case. Data only; no logic change.

2. **Closed status on an unavailable case.** Four medicines show "Pending" on "Patient unavailable". No prescription was confirmed, so the status is true.
   - Options: (a) keep Pending; (b) show "Not prescribed"; (c) hide the status tags on closed unavailable cases.
   - Recommendation: (a). The status is the truth, and D-51 applies to confirmed endings.

3. **Destructive button boundary.** The design-system destructive style is now a red-600 inset border (fixed centrally in this pass). Please confirm this as the destructive treatment for full-width buttons.
   - Recommendation: confirm.

4. **Transfer-failed alert.** Still no spec (D-51 out of this pass). Needs copy, recovery, and what the doctor can do.

5. **Keyboard states on device.** Notes and instructions show focus only; the page has no on-screen keyboard. Checks: Prescribe stays reachable and keeps 16 px clearance; the bar steps aside while typing (D-51 defers).

6. **Status tags and row width.** A wider "Prescribed" tag wraps a medicine name differently (e-* states). Minor; reserve the tag width in the page build.

7. **Desktop side panel** (≥1100 px) is out of this pass (D-51).

8. **Missed-call sheet.** Kept as the page's existing flow (Retry call, Mark as unavailable). Confirm it should stay a sheet.

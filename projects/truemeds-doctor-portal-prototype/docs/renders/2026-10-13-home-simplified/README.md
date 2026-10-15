# Simplified Home review

16 representative static renders. These are visual states, not 16 routes. Two Home layouts (setup and active), reusable duration picker, and conditional pending-stop confirmation. New renders await approval; saved wheel/tap alternatives remain unchanged.

## Latest agreed behavior

- Expiry during Add availability is handled silently. Same title, selection and Add duration CTA. No expiry helper, restart label or second confirmation. On confirmation, deadline = max(server time, existing deadline) + selected duration. Explicit stop, logout or account restriction must not be silently overridden.
- Add succeeds: dismiss sheet, update countdown, preserve underlying Home state. Toast “30 minutes added” about 4 seconds, respecting accessibility timeout. Snapshot 13 illustrates temporary feedback, not a success route.
- Loading stays inside initiating control with spinner and duplicate submission disabled. Backend idempotency and reconciliation also required.
- Minimum 15 minutes; 15-minute increments. Shared presets/controls across setup and extension. Stepper used in this set; wheel remains testing alternative.
- Add time is quiet beside timer; at 5 minutes promote it into amber notice without duplicate link. Primary footer Request a case; secondary End availability.
- Expired or manually ended idle windows reuse inline setup. No 0 min hero or extra start gateway. Preserve prescriptions count on return. Optional contextual message/toast indicates why setup reappeared.
- Idle End availability: busy status while saving, then setup with short toast. Failure stays active with inline notice. Pending request: confirmation then persistent stop-scheduled status.
- Request sent before deadline remains honored. Unknown result uses same requesting layout with Checking request…; do not duplicate request. Stop/expiry during request does not interrupt assigned case.
- Existing completed-case Next order position retains agreed availability gating. No new expiry overlay during active care.

## States represented

1 setup; 2 setting; 3 setup error; 4 active; 5 requesting; 6 no cases; 7 request error; 8 offline; 9 ending soon; 10 add sheet; 11 adding; 12 addition error; 13 toast snapshot; 14 pending-stop confirmation; 15 stop scheduled; 16 expiry with request pending.

Other conditions reuse these components: uncertain request → requesting copy; end failure → inline error; expired/manually ended → setup; successful start → active. Support/account draft batch is separate and not part of these 16.

## Provenance and testing

390×844 at 2×. Static programmatic renders using project font and official assets, not browser screenshots. Gallery is image review, not interactive prototype. Engineering component-source and native interaction verification remain required. Timings are specified, not demonstrated by still images. Source renderer retained with original 43-state generator dependencies in neighboring review source folder.

Supersedes original 43-state FLOW.md on Home extension expiry, success feedback and inactive Home routing. Earlier exhaustive scenarios remain coverage checklist, not required pages.

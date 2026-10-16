# Home flow review — 2026-10-13

Status: draft review set. Only the two previously rendered duration alternatives have approval to be saved in ui-screens. New states are proposals, not production changes. Decision context: D-36 and docs/concepts/2026-10-12-home-jtbd.md.

## Screen map

Inline duration setup → Setting availability → Active Home.
- Start fails: retain duration, retry; an uncertain outcome reconciles before another mutation.
- Request a case → Requesting → existing consultation screen on assignment.
- No assignment → Empty Home → Check again.
- Confirmed failure → Retry. Unknown outcome → Checking request, never duplicate request.
- Offline → explain why Request is disabled. Countdown continues from server deadline.
- At five minutes → quiet warning; requests remain eligible until the deadline.
- At zero with no pending request → Ended → Set availability → inline setup.
- At zero with pending request → Finish pending request. Open assigned case regardless of elapsed window; otherwise Ended.
- End while idle → confirmation → confirmed Ended. Failed stop retains current state.
- End while pending → confirmation → Stop scheduled → finish request and any assigned case, then Ended.

## Extend: bottom sheet

Stay on current Home. Sheet selects **additional time**, not replacement duration. Proposed presets: 15 min, 30 min, 1 hour; +/- changes total by 15 minutes. Minimum addition 15 minutes. No keyboard. Larger durations remain possible through controls. Chosen duration control remains under doctor testing; extension currently uses compact stepper proposal.

- Add 30 minutes → saving → current Home with updated server deadline and short confirmation.
- Failure → retain selected addition, retry safely.
- Dismiss/back → no change; underlying countdown continues.
- Before submission, expiry changes CTA to **Start 30 minutes** and explains a new window starts. Doctor must explicitly confirm this new action.
- If expiry races an already-sent extension, server result controls outcome. Do not silently turn failed extension into a new start; reconcile then request explicit start if necessary.
- Duration preview is approximate because underlying countdown continues.

## Existing case-page boundary

This set does not redraw clinical consultation screens. When a case is assigned, open the existing case directly. Never show Home or an expiry popup over active care.

When a case finishes, its existing Next order position must check availability: active → Request next case; expired → Extend availability and Mark unavailable. Extend opens the same duration sheet in restart mode; confirmation starts a window and restores request eligibility, without automatically requesting a case. Mark unavailable resolves back to inactive Home. Stop scheduled during request also blocks another Next order until doctor explicitly starts availability again.

## Header flows

- Help sheet → Message support / Call Doctor Ops / Report app issue. External channels use configured contacts. In a live patient call, Call is hidden.
- Report → optional description + diagnostic disclosure → sending → reference or retry. Do not fabricate submitted reports; demo reference is labelled.
- Notifications → loading / empty / list / detail / failure. Sample announcement copy is illustrative.
- Profile → read-only identity, faster sign-in settings, Wallet coming soon, Help, Log out.
- Faster sign-in → native setup; success → enabled; cancel/failure → neutral retry. Native biometric/PIN prompt is OS-owned, not custom UI.
- Wallet → informational placeholder. No fake balance, KYC collection or withdrawals.
- Logout/device takeover rules are draft proposals from JTBD, not approved session-policy implementation. Hide logout while case or request is active.

## Interaction contract

All async mutations need idempotent requests and status reconciliation before retrying uncertain results. No endless blind spinners: persistent connection problems expose Help and retain state. Timers come from server deadline; background/foreground restores latest state before enabling requests. Expiry and pending-stop resolve on server truth.

All sheets: focus inside sheet; accessibility label; background inert; dismiss before submission; no duplicate submit while saving. Screen reader announces meaningful status once, not each countdown second. Font scaling and shorter phones use scrollable content with reachable action area. Native keyboard must not cover report input. Minimum target 44×44.

## Typography and render provenance

CTA: Plus Jakarta Sans 18px, weight 600, 56px button, optical text centering; same shared large-button specification. Screenshot reference cannot establish a different font reliably. No new typeface introduced.

PNGs: 390×844 CSS-equivalent at 2×, programmatically drawn with actual project font and official rasterized logo/icons. **Not browser captures.** Review gallery is a static image browser, not an interactive React Native prototype or editable component HTML. Source and assets are retained for reproduction. Existing browser file-protocol restriction was respected.

Shared color tokens are read at render time. Static layout geometry approximates shared components; full component/contrast/accessibility compliance still needs implementation verification. Approved PNGs require matching component HTML/RN source before engineering handoff can be called complete.

## Doctor test

1. Choose 45 minutes, then 1 h 15 min, using each duration option; counterbalance option order.
2. From active Home, add 30 minutes. Ask how much time they expect afterward.
3. Encounter no cases, then 5 minutes left. Ask what actions remain available.
4. End availability. Ask whether that logs them out or interrupts a case.

Static screens support comprehension tests only. Compare speed, mis-taps and wheel-versus-stepper effort in an interactive native prototype, not these images.

## Review status

43 draft screens. New expiry, extension, support and account choices require review. Post-case auth lifetime, multi-device enforcement, diagnostic contents and automatic queue polling remain unresolved; this set does not declare them locked. No automatic queue polling rendered.

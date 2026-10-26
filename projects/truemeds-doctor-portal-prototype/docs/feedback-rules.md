# Feedback and render contract

Version: 1.3 · 2026-10-15 · Decisions: D-41, D-44, D-45, D-46, D-53 (timer format; approved copy)

## Authority and scope

Apurva requested this rules-first workflow. This document governs feedback in sign-in, OTP, returning unlock, availability and Home. Apply the same principles to future app screens when their product behavior is specified; do not infer new consultation rules from this document.

Read before editing or rendering: central `../../../design-system/RULES.md`, this file, `feedback-state-map.md`, relevant product decision/spec and approved reference. Latest explicit user direction wins. Central design system owns appearance; decision log owns product behavior; this document owns feedback application and review process. Historical concepts do not override these sources.

This contract was created before source repair. On 2026-10-13 the shared registry and source components were updated; source checks passed. Existing screenshots remain historical approvals until replacements are reviewed. This document does not certify visual or native-device parity. See `renders/2026-10-13-feedback-review/README.md` for current QA status.

## 1. Two error structures

| ID | Meaning | Placement | Recovery |
|---|---|---|---|
| F1 Field error | The value is missing, malformed, rejected or expired | Immediately below the relevant field, replacing its normal helper; field gets error border | Correct input or obtain a fresh OTP |
| F2 Action notice | Service, connectivity, access or mutation prevents progress | Inside the relevant form/sheet, after its input group and before primary action; Home uses a stable status area | Retry, wait, contact Ops or use existing fallback |

Before/after clicking is a **trigger**, not a visual family. Wrong OTP arrives after submission but remains F1. Failed OTP verification service is F2 and must not mark the code invalid. Regex is an implementation technique, not a message component.

## 2. Other feedback uses existing components

| ID | Use | Component / treatment |
|---|---|---|
| W1 Warning | Temporary cooldown/lock; availability approaching expiry | Same notice anatomy as F2, amber variant; authoritative countdown where relevant |
| N1 Status | Not registered, queue empty, stop pending, connectivity condition | Neutral notice or ordinary status text according to existing screen; no error border |
| S1 Inline success | New OTP sent | Small confirmation next to resend controls; does not imply code is correct |
| T1 Toast | Availability added or ended successfully; phone back blocked during a call (D-52) | Central dark toast (RULES §9.5), only where nothing on screen can show the result |
| L1 Loading | Send, verify, set, add or request underway | Original CTA retains position and width; progress label/spinner; prevent duplicate submissions |

Warning/neutral/success/loading are not additional error layouts. Do not create a separate route for each message.

## 3. Visual specification: reference central components

The values below describe current central components and are for parity checking, not a new local token sheet. Import semantic tokens/components; never copy literal colours or maintain a separate palette. If central components change, review impacted references deliberately before accepting the change.

| Element | Existing specification |
|---|---|
| Field helper | `.tm-field__helper`: **14/20 (L4, D-46)**; aligned with its field — left under full-width fields, centred under the OTP code boxes (**L7, D-47**); error uses content-error; shared field border, no extra per-screen shadow |
| Notice | `.tm-notice`: **14/20 (L5, D-46)**, neutral body text, spacing-md padding (12), spacing-sm gap (8), radius-md (12), 1px semantic border |
| Notice icon | Shared outline icon, 20pt and fixed leading alignment; same icon rule on web/native |
| Failure | Error tint/border and error icon; no red input border unless input itself is wrong |
| Warning | Warning tint/border and clock/warning icon; neutral body text |
| Neutral access/status | Neutral surface/border and appropriate shared icon; no new custom card class |
| Toast | `.tm-toast` per `design-system/RULES.md` §9.5 (2026-10-15): dark inverse surface, 14/20, 12×16 padding, medium radius, one line (two at most), up to screen width minus margins. Replaces the earlier 12/16, 4×8 spec, which was too small to notice. |
| Primary CTA | Shared large primary button, minimum 56pt; same font/weight/alignment across idle/loading/error. **Loading = brand-blue primary with white label and white spinner (L2, D-46); never grey or pale.** |

All type uses Plus Jakarta Sans. Native screen code must use shared native tokens and match component anatomy. Any missing neutral/accessible variant is implemented once through central design-system proposal process, not as another bespoke screen style. Enlarging field helper text, if needed, requires reviewing a shared variant rather than changing one state.

## 4. Trigger, persistence and recovery

Preserve D-39:

- Untouched empty field: no error.
- Potentially valid partial input: do not error while typing; validate on Send/Verify.
- Impossible input: show field error immediately using approved validation rules. Normalise supported phone prefixes before validation.
- After a format error is shown: revalidate on edit; clear when valid.
- **Server wrong-code response:** the entered code **stays visible** with field-error borders and message; the **first new keystroke replaces the whole code** and clears the error. Expired: same, and Resend code is available at once. Network failures retain input. (D-44)
- Local format failures do not consume server wrong-code attempts.
- A known-expired OTP challenge remains expired until a valid fresh challenge is obtained. Clearing visual error does not authorize resubmission of known-expired credentials.
- **No repeated button (D-65):** a message says what happened, and what is safe or kept ("Nothing was lost", "Your selection is saved"). It does not tell the user to do what a button or link already on the screen does ("Try again", "Call again", "Tap Verify…", "Get a new one", "Reconnect to turn on…", "Please wait before trying again" next to a countdown button). Naming what failed is not a repeat ("Couldn't confirm."). Give an instruction only when no control on screen does it ("Read the script, then end the call", "…or call Doctor Ops"), when it explains why a button is blocked ("Reconnect to request a case"), or when it adds timing ("Try again in a minute").
- Only one primary message for the same cause: no duplicated field error + notice + toast. Independent actionable conditions may coexist when necessary; choose one clear recovery priority.
- Order local field failures: empty, impossible prefix, then incomplete length, consistent with D-39. Do not show contradictory messages simultaneously.
- Lock/cooldown eligibility comes from explicit authoritative state. Countdown reaching zero does not itself grant access; reconcile and expose recovery progress.
- Show attempts remaining only when supplied authoritatively. Issuance and wrong-code locks remain separate; preserve configurable caps and number-lock decision.
- Connectivity discovered passively: neutral status. Submitted action fails because offline: one action notice. Replace/suppress redundant connectivity notice for that same failure.
- Native biometric cancellation: return to previous screen without an error. Expected OS retry guidance stays in OS prompt where supported. Credential unavailable/revoked: shared notice with OTP fallback.

## 5. Toast contract

- Only for completed, non-blocking confirmation, or brief guidance after a gesture that cannot act (phone back during a call, D-52). Only where nothing on screen can show the result (D-27 principle). Never carry essential recovery, lockout explanation, unsaved data warning or pending request result.
- Show after confirmed success, never optimistic confirmation of an uncertain mutation.
- Bottom-centred above primary action/footer and safe-area inset; never cover input, keyboard, action or system gesture area. Overlay does not push the CTA.
- Content width, short sentence, no button styling, no shadow/action/icon unless central component explicitly supplies it. Do not stretch to screen width merely to match the CTA.
- Default display target: about4 seconds; respect platform accessibility-recommended timing. This is a presentation default, not business logic. If announcement requires longer, allow it.
- Polite announcement once. Focus stays where it belongs; toast never takes focus.
- At most one toast; deduplicate repeated events. Underlying successful state must remain discoverable after toast disappears.
- If message needs an action, use a persistent notice or centrally proposed snackbar; do not overload T1. If text cannot fit at large font scale, use accessible persistent confirmation rather than clipping or shrinking.

## 6. Layout and state invariants

- Same base screen, same header, field, primary-action alignment and typography. Loading does not introduce another headline or route.
- Timers (D-53): the Home availability timer is m:ss below an hour and h:mm:ss from one hour up (1:00:00). OTP and other timers stay m:ss (9:42, never 09:42).
- Text is never clipped or hidden behind a notice; content scrolls instead (D-47). Spinners belong to the primary loading button only; quiet actions show progress with text ("Ending…").
- Do not move Add time merely because remaining time becomes amber. Keep approved action position.
- Give notices a consistent local slot; short and long messages may grow naturally. Do not reserve a huge empty block for a hypothetical error.
- Content must scroll on small screens or large text; CTA must remain reachable. Never clip text or reduce type to preserve a screenshot coordinate.
- Error in add-time sheet stays in sheet; preserve selected duration and Home beneath it. No auto-dismiss on failure.
- Wheel is sole duration control (D-40); quick presets remain. Minimum15 and increments15. Minimum helper appears once on setup, never repeatedly inside Add availability.
- Uncertain server outcome is not confirmed failure. Reconcile same operation before enabling a retry that could duplicate a case request or add time.
- Main button placement follows `design-system/RULES.md` §8.4 (D-43): inline on sign-in and OTP; pinned on the faster sign-in offer and Home.
- OTP: keyboard opens on load and stays open except when locked. Resend line shows whenever the doctor can act; hidden on too-many-resends and locked. Consent line shows only when Verify is possible. (D-44)
- A focus highlight never appears together with an error state on the same code input.

## 7. Source ownership: no copy drift

Implementation: `../ui-screens/feedback/messages.json` owns text and `metadata.json` owns pattern, trigger, recovery and copy status. One build generates browser and typed React Native adapters with placeholder validation. Never manually maintain parallel feedback strings in HTML and TSX.

The mapping document is the state/behavior specification; it references current source and decision IDs. It deliberately does not duplicate every full message. Copy edits belong in the registry. Source-level copy parity is checked; visual and native-device parity remain pending.

Screens select state and provide values such as remaining attempts, remaining time or added duration. Components render the assigned pattern. Buttons manage disabled/loading visuals; they must not invent their own error messages. Host outcome handler owns errors and cancellation.

Registry entries must identify: state ID, message ID, pattern/severity, trigger, field or notice slot, next action, clearing condition, input-retention rule and copy approval status. Secrets, OTP values and real doctor identifiers must not enter render fixtures or logging.

## 8. Render policy: pattern coverage, not copy enumeration

React Native handoff does **not** require a PNG for every state. Every state requires source/fixture/behavior coverage; screenshots prove selected visual conditions only.

Capture a new example when any of these changes:

1. Component structure, severity/icon treatment or recovery action hierarchy.
2. Field/CTA enabled state, keyboard interaction, modal placement or materially different surrounding layout.
3. Copy wrapping, long dynamic values, large text, or smaller screen creates a layout risk.
4. Product introduces a new interaction outcome that existing references cannot explain.

Do not create a new PNG when only a short message changes and component, placement, wrapping and behavior remain covered. Associate that state with an approved representative ID in mapping and keep exact approved copy in registry. Same pattern in a different layout still needs integration QA; a small comparison crop can be sufficient for review but never replaces a complete screen when context matters.

Keep existing approved PNGs as history until replaced; do not delete states merely because their next implementation shares a pattern. Previously removed tap alternatives remain superseded.

## 9. README required before rendering

Each render **batch folder** must contain a README before any image is generated. One README can cover several renders, with one row per output; do not create dozens of identical README files. Template: `renders/RENDER-README-TEMPLATE.md`.

Required: purpose, status, rule version, decision/spec links, source/component/registry paths, representative IDs and copy-only siblings, fixtures, expected changes, capture dimensions, platform/font build, preflight checklist, known limitations and approval status.

Drafts stay in docs/renders. Only explicit approval promotes a representative to ui-screens. Do not silently treat a copy change or new severity as already visually approved. Replace affected approved references in place after approval; record date/change note and source/copy fingerprint.

## 10. Acceptance gates

Before render: README exists; mapped state/pattern; current source/copy identifiers; shared assets; semantic tokens; preserved product rules; exact approved copy or clearly marked proposed copy.

Before review: check target390×844 at2×; readable360-width and large-text layout; keyboard/action reachability; worst-case line wrapping; no duplicate notices; stable CTA alignment; loading single-flight behavior; message accessible association/announcement. Record passed, failed or not run separately.

Before handoff: HTML/native message-ID and copy parity; component geometry/token comparison; source-derived captures; native font/gesture/safe-area/accessibility testing. Type checking is not device validation. Existing Home programmatic PNGs remain a documented provenance exception, not evidence of source parity.

If render tooling is blocked, record the block and stop claiming visual verification. Never rebuild screenshot independently and claim it came from HTML/native source.

## Change control

Update this document and state map first when a rule changes. Update shared components/registry next, then only affected representatives. Link change in decision log and batch README. Do not quietly change central design-system tokens to make one screenshot fit.

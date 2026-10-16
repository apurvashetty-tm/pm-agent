# Feedback review — render brief

Status: SOURCE CAPTURES REVIEWED (3 rounds); VISUAL APPROVAL PENDING · 2026-10-13 · Rules: feedback-rules v1.0 · Decisions: D-33–D-41

## Review question

Do shared field, notice, warning and toast components remain legible and correctly placed across sign-in, OTP and Home after replacing oversized OTP input with four compact visual slots backed by one input?

Approved baselines: `../../../ui-screens/{sign-in,otp,home}/`. Proposed work: shared registry, common feedback anatomy and compact OTP input. Copy edits will be marked in registry; no business rule changes intended.

## Source and capture plan

- Source: final HTML in `ui-screens/`, shared `ui-screens/feedback/messages.json`, generated web/native adapters, central design-system CSS; React Native references in `ui-screens/native/`.
- Standard capture: 390×844 logical px, 2× density; plus 360 width and large text (font sizes ×1.3, approximated in-page).
- Reference platform: browser HTML via `file://` in headless Chromium. Native device parity requires separate app integration.
- No real doctor, customer or OTP data; use existing synthetic fixtures.

| Candidate | State/fixture | Pattern | Why capture | Copy siblings |
|---|---|---|---|---|
| R01 | Sign-in wrong first digit, keyboard | F1 | Input border and keyboard fit | Empty, too short |
| R02 | OTP expired, four digits | F1 | Compact slots and resend recovery | Wrong, too short |
| R03 | OTP could not verify | F2 | Long message and CTA fit | Send/offline failures |
| R04 | OTP locked | W1 | Disabled controls and cooldown | Sign-in cooldown |
| R05 | OTP resend limit | W1 | Verify remains available | Other cooldown copy |
| R06 | Sign-in not registered | N1 | Access recovery | Inactive treatment separately checked |
| R07 | Add availability failed | F2 | Notice inside wheel sheet | Setup failure |
| R08 | Home time added | T1 | Compact toast above CTA | Other short confirmations |
| R09 | Home request failed | F2 | Notice in stable Home slot | Offline request failure |

Capture only candidates whose new styling/layout is not already proven by an approved reference; document omissions here. Copy-only siblings stay in fixtures and shared registry.

Capture tooling: Playwright and the capture script live in the session scratchpad, outside the project. Captures: `round-1/`, `round-2/`, `round-3/` (final = round-3). Each folder has `metrics.json`, `codex-review.md` and `changes.md`. Round-1 360-width and large-text frames were taken with a harness bug and are superseded; use round-3 for evidence.

## Preflight

- [x] Canonical rules, mapping, audit, D-39 and D-40 read.
- [x] Batch README created before capture.
- [x] Message registry, metadata, generated adapters and shared components completed.
- [x] Source-level input, recovery, retained values and load-state checks completed for approved auth states. This preflight Pass was recorded before the detached-message crash was found and fixed, so it is superseded for runtime behavior; the outside 33-state page-load check is recorded in QA evidence. Backend actions still require host integration.
- [x] Local source paths and design-system token references checked. Native font and device rendering remain unverified.

## QA evidence

| Check | Status | Evidence |
|---|---|---|
| Standard-size source capture (390×844 @2×) | Pass | Headless Chromium via `file://`, round-3 (final): R01–R09 captured with zero console/page/request errors. `round-3/metrics.json`. |
| 360-width capture | Pass | Round-3 `*_w360.png`: no horizontal overflow, no clipped text, primary CTA visible for every state. Round-1 360 frames were invalid (capture CSS fixed the frame at 390px) and were superseded. |
| Large text (fonts ×1.3) | Pass for layout; partial for copy | Round-3 `*_w390-large.png`: no overflow or clipping; Add-time sheet stacks wheel, notice and CTA without overlap. Longest-copy siblings not captured. |
| Browser message adapter runtime | Pass for reported crash | Real-browser review exposed detached `msg()` callers crashing on `this.messages`. Generator now uses a closure; runtime regression calls the detached function for all 27 messages. |
| Page-load smoke | Pass | Outside headless-Chromium check, run after the `msg()` fix: all 33 states (12 sign-in, 12 OTP, 8 Home, 1 unlock) loaded with zero console and zero page errors. Reported by Apurva; not re-run or captured in this batch. |
| CTA position and centred text | Pass (with known 4px variance) | Round-3 metrics: auth CTAs inside frame; Add-time CTA at y=704 vs approved ≈708 (4px); stable between normal and error sheet. |
| Field, notice and toast rules (visual) | Pass for reviewed states | Codex round 3: BLOCKERS none. Claude checks in each round. Error-sheet notice fits between wheel and CTA with spacing changed in that variant only (see Needs Apurva). |
| Toast placement | Pass | R08 toast ~14px above Request a case, inside the frame, does not cover the CTA. |
| Keyboard/safe-area reachability | Partial | Static source and native input configuration checked; no device or keyboard-open capture in batch. |
| Duplicate request handling | Partial | Native Button guards repeat taps during pending promise; server idempotency and HTML reference callbacks not integrated. |
| Screen-reader associations | Partial | OTP input labels, helper association, alert/live regions and native accessibility props present; device screen reader pending. |
| HTML/native copy and state mapping | Pass (corrected) | The earlier Pass was given before the detached `msg()` crash was found and fixed, so it did not cover the browser runtime. Current basis: generated adapters use one registry; 27 metadata IDs validate (`check-sources.mjs` PASS); the outside page-load check covers all 33 states. Native rendering parity and proposed combination states remain host integration checks. |
| Native type and pure logic | Pass (prior run) | TypeScript compile, number normalization and duration tests passed earlier. Not re-run in this batch. |
| Native device parity | Not run | App integration required. |
| Approved-reference parity (wheel) | Pass for wheel anatomy | Round-2 fix: shared centred band + divider matches `ui-screens/home/add-availability_wheel.png`. Presets use central chip component; corner treatment not changed here. |

## Codex review loop

| Round | Codex result | Action | Notes |
|---|---|---|---|
| 1 | 3 BLOCKERS (1 real: R07 wheel; 2 rejected: "+ Add time" is near-expiry only) | Fixed wheel; metrics harness fixed | `round-1/codex-review.md`, `round-1/changes.md` |
| 2 | 2 BLOCKERS (R07 CTA moved; R07 band split) + 1 rejected (preset corners) | Fixed CTA position and band; toast raised | `round-2/codex-review.md`, `round-2/changes.md` |
| 3 | BLOCKERS: none | None; NEEDS APURVA item recorded | `round-3/codex-review.md`, `round-3/changes.md` |

Loop stopped after round 3 (round cap); Codex reported no blockers in round 3.

## Approval and promotion

Approved by/date: pending. Approved new representatives: none. Copy-only siblings: source/registry coverage only. Promoted PNGs: none. Existing approved PNGs were preserved; repaired sources may differ visually. Unknown-result reconciliation and exact backend timings remain host integration requirements.

## Needs Apurva

1. **OTP four-slot field anatomy** (R02–R05): replaces the approved full-width field. Approve the new anatomy before any approved OTP PNG is replaced. Codex round 3 raised the same point.
2. **Add-time error sheet spacing** (R07): the notice fits above the CTA only with picker top 108px and adjust margins 12px (approved sheet: 120px / 24px). Approve as a visual variant, or choose another placement (for example, notice replacing the subtitle, or a scrolling sheet, which would move the CTA).
3. **Sheet CTA 4px variance**: CTA at y=704 vs approved ≈708. Confirm acceptable or ask for a footer offset change to the approved wheel sheet.
4. **Proposed copy** (metadata.json `proposed`): `otp.resendFailed`, `otp.expiredAndLimited`, `home.setupFailed`, `home.addFailed`, `home.requestFailed`, `home.offline`, `unlock.unavailable`. Needs copy review before shipping.
5. **Representatives for R08 toast and R09 request-failed**: no approved PNG exists. Approve these captures as new representatives, or accept coverage by source and metrics only.
6. **Preset corner treatment**: presets come from the central chip component (`tm-chip--lg`), not feedback. Codex flagged it; not changed. Design-system owner to decide.

## Next step

Apurva reviews `round-3/` PNGs against the approved references, decides items 1–6, and only then promotes representatives into `ui-screens/`. Nothing promoted. Nothing committed.

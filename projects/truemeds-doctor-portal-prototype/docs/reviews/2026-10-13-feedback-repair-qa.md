# Feedback source repair audit — 2026-10-13

Scope: doctor app sign-in, OTP, returning unlock, availability setup and Home. Control panel excluded. Rules: `feedback-rules.md` v1.0 and `feedback-state-map.md` (D-41). Existing approved PNGs are historical visual baselines; this audit does not reapprove changed pixels.

## Changes checked

| Area | Source result | Remaining visual/device check |
|---|---|---|
| Shared feedback | 27 copy IDs in one JSON registry; matching behavior metadata; generated browser and React Native adapters. Unknown IDs and missing template values fail. | Proposed copy IDs need user review. |
| Field errors F1 | Sign-in and OTP use one helper immediately below input and error border, no duplicate notice. OTP has four compact slots over one paste/autofill-capable input. | Capture R01/R02, keyboard and large text. |
| Action feedback F2 / warning W1 / neutral N1 | Shared web `.tm-notice`; native Notice matches padding, type, icon size, border and semantic tones. Sign-in access result uses neutral. OTP service failure keeps code; lock/resend limit use warning. | Capture R03–R07/R09; verify longest copy wrapping and actions. |
| Loading L1 | Original CTA position retained; native Button gates repeat taps, no generic error injected by button. Sign-in preview disables Sending OTP. | Browser/native loading placement and backend single-flight integration. |
| Toast T1 | Home source uses compact shared toast; native Toast mirrors tokens and overlays above footer. | Capture R08 and verify four-second accessible dwell in host. |
| Lock / expiry | Native lock gating follows explicit state, not countdown reaching zero. Known-expired OTP cannot be reverified. Leading dialling zero is dropped after ten digits, following D-39. | Server eligibility, countdown and OS autofill on devices. |
| Wheel / Home | Sole wheel/presets retained; setup alone shows minimum reminder. Add time only appears when remaining time is 15 minutes or less. Error stays in add sheet, and Home headline/CTA base stays fixed. | Home HTML layout/capture, 360 width, wheel/sheet scroll and safe area. |

## State coverage

- Sign-in: all 12 approved selector states present; shared registry used for current feedback. Generic HTML is a design reference, not working auth.
- OTP: all 12 approved selector states present; field/notice ownership and four-slot input implemented. Resend failure, offline, expired-plus-limited and cooldown reconciliation remain mapped integration combinations, without separate PNGs.
- Returning unlock: three approved device variants remain; unavailable credential gets shared notice and OTP fallback fixture. OS prompt/cancellation belongs to host app.
- Home: existing three approved wheel/Home references preserved. Source now has setup failure, request failure, add failure, near-expiry and added-time toast fixtures. No-cases, pending request, expiry/stop orchestration and unknown-result reconciliation are host state-machine responsibilities; existing drafts are not promoted.

## Checks run

- `node ui-screens/feedback/build-messages.mjs`: passed metadata/placeholder validation and regenerated both adapters.
- `node ui-screens/feedback/check-sources.mjs`: passed 12 sign-in + 12 OTP selector checks, local asset paths, OTP input structure and Home/unlock source presence.
- 2026-10-13 correction: a real-browser review found every affected page crashed because callers detached `window.TMFeedback.msg`, while generated `msg()` read `this.messages`. Generator now closes over the message registry. Source check executes the generated browser adapter and calls `msg` detached for all 27 IDs, including placeholder substitution. This regression check passes. Claude subsequently reported a headless Chromium check of all 33 states (12 sign-in, 12 OTP, 8 Home, 1 unlock): zero console or page errors, with registry messages shown. Visual QA remains pending.
- JavaScript syntax checks: passed for browser renderers and inline scripts.
- React Native strict TypeScript compilation: passed in isolated validation workspace with React Native peer packages.
- Pure behavior checks: passed for 15-minute duration boundaries, extension arithmetic, +91 paste and leading-zero normalization.
- Source-derived browser captures, 390×844/360 layout, device screen reader, actual OTP autofill, native safe area and font parity: **not run**. Prior browser policy blocked local-file capture and disallowed an alternate capture route. No new PNGs were generated or promoted.

## Handoff status

The reported message-adapter crash is repaired and covered by a runtime regression check. Claude's reported 33-state page-load smoke passes. Visual review and native-device QA remain pending; do not call the screens visually verified. Existing auth/Home PNGs may not match modified HTML or React Native output. Consult `renders/2026-10-13-feedback-review/README.md` before promoting any replacement. Host app must provide authoritative OTP/cooldown/request states, `onActionError` handling, passkey/biometric OS prompts, real links and backend idempotency.

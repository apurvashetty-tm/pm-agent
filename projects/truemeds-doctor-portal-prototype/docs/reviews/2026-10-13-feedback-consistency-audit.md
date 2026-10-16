# Approved-screen feedback audit — 2026-10-13

## Scope and evidence

Reviewed sources for all 12 approved sign-in states, 12 OTP states, three returning-unlock variants and the three remaining Home references (wheel setup, active Home, wheel add-time). Also reviewed all 16 older simplified Home draft states via their four saved boards and render source. Those draft boards are historical evidence, not approvals or the latest layout specification.

Visual spot checks: sign-in empty/offline; OTP wrong/expired/verification-failed/locked/new-code-sent; approved wheel setup; all four Home draft boards. Remaining approved state coverage is source-based. This is not a fresh interactive browser or native-device audit, and not a consultation/prescribing-flow audit. Browser local-file access remains restricted.

The wheel selection is implemented separately. Error redesign below is a recommendation for review; existing approved auth PNGs are unchanged.

## Verdict

Two reusable error structures are enough. Classify by what the doctor needs to fix, not by whether the message appeared before or after a CTA press:

1. **Field error:** a problem with the mobile number or code. One message directly below that field plus its error border. Includes server-rejected wrong/expired OTPs.
2. **Action/status notice:** delivery, connectivity, verification service, access, or request problem. One consistent notice within the relevant form/sheet; the field keeps its normal border unless the input itself is invalid.

Success, loading, empty queue and approaching availability expiry are not errors. Their feedback can differ semantically without inventing another error component.

## Confirmed consistency findings

| ID | Evidence | Impact and smallest correction | Priority |
|---|---|---|---|
| E01 | Source + visual: sign-in HTML lines28–35 defines separate notice classes at 14/24, padding16, radius16, gap12. OTP uses central `.tm-notice`: 13/20, padding12, radius12, gap8. | Same kind of service failure has different visual weight. Replace sign-in variants with the same shared notice primitive as OTP; one text/body/icon/border specification. | P2 |
| E02 | Source + visual: sign-in HTML line50 adds a 1px shadow around its error border; OTP uses only central 1px border. | Sign-in error outline looks heavier. Use the same field error component; preserve a distinct accessible focus treatment. | P2 |
| E03 | Source: native `ui.tsx` Notice uses bodyMd14, padding16, radius12, no border and semantic colour on all text. Web notice uses bodySm13, padding12, 1px border and neutral body text. Native field errors use bodySm13 versus web helper12. | Devs receive conflicting instructions. Map one shared specification to both platforms before regenerating screenshots. | P2 |
| E04 | Source + visual: older Home failures are coloured text on tinted blocks without the same icon/border anatomy as auth notices. Setup/request/add failures appear at different local offsets. | Home introduces another feedback style. Reuse shared notice; place setup/add failures below the picker and request failures in a stable Home feedback area. Keep primary action position stable where content fits; allow scrolling for small/large-text screens. | P2 |
| E05 | Source: native OTP repeats Doctor Ops in notice prose and a separate action. Sign-in uses Unicode info/warning symbols while OTP uses shared icons. | Extra visual/reading noise and mismatched glyphs. One Ops action per notice, using the same shared icon set. | P3 |
| E06 | Source + visual: expired OTP says get a new code but keeps the rejected code and an enabled Verify CTA. | Recovery instruction competes with repeat verification. Keep Resend in its usual place and make known-expired submission unavailable until a new valid attempt is possible; do not move the primary footer. Review this behavior before changing approved render. | P2 |
| E07 | Source: OTP helper is not linked by aria-describedby; input lacks aria-invalid; dynamic notice has no live region. Sign-in links helper but does not expose invalid state. | Screen-reader error identification is incomplete. Associate message with field, expose invalid state and announce submitted error once. Verify native equivalents on device. Static screenshots cannot prove this. | P1 accessibility |
| E08 | Source: generic native Button renders its own fallback error before whichever button failed, independently of screen feedback props. | Can create another placement/style or duplicate a notice; cancelled OS auth may be treated as an error. Screen owns feedback; primitives own only loading/disabled state. Map cancellation separately. | P2 |
| E09 | Source: native OTP uses `state==='locked' && lockSeconds>0`; sign-in cap similarly depends on countdown. | At zero, controls can enable before host confirms eligibility; sign-in notice can even change amber to red while state is unchanged. Eligibility must be explicit/server-owned. Timer is display, not permission. No evidence of a production backend bypass is claimed. | P1 handoff |
| E10 | Source: native normaliseMobile handles +91 but truncates an 11-digit leading-zero number rather than normalising it. D-39 permits the leading-zero dialling habit. | Native handoff does not match locked validation rules. Share tested normalisation/validation policy with prototype; do not reject the doctor's corrected number. | P2 |
| E11 | Source + visual: older Home toast uses near-button dimensions and large radius; setup footer remains 56pt below active Home, a previously documented mismatch. | Feedback and primary action compete; transitions feel unstable. Use shared compact toast and review footer alignment as a separate layout correction. Historical toast is not approved. | P2 |

### Differences that are not defects

- Wrong OTP and expired OTP already use the same field-error family. Pixel sampling found the same dominant error red, #D61212, in both and in sign-in field errors. This is the current shared semantic red, not a request to hard-code it.
- A code/service failure notice is appropriately different from an invalid-code helper. A server outage should not imply the doctor typed incorrectly.
- All authored feedback examined uses Plus Jakarta Sans. Font size/line-height/weight differ; evidence does not show separate font families across these error messages. Native font resolution remains unverified until font assets are loaded.
- Disabled grey, brand blue and a small green success cue have separate jobs. Removing every colour would hide meaning rather than fix consistency.
- More scenarios do not require more components or routes. Wrong, expired, incomplete and missing code share one field-message structure.

## Proposed feedback specification

- Start with current shared field helper and notice components: helper body-xs12/16; notice body-sm13/20. Match these intentionally on web and native. Do not vary either per scenario. If helper text needs enlargement, review one shared variant rather than changing individual screens.
- Field error: semantic red text and consistent error border; no tinted card. One message at a time. Error replaces helper, not an additional line stacked with it.
- Action notice: neutral body text, shared semantic icon, tint, 1px border, radius12, padding12 and gap8 from central tokens. Same geometry for errors, warnings and neutral status.
- Failed Send/Verify/Set/Add/Request: red error notice. Temporary cooldown/lock: same notice anatomy with amber clock. Not registered: neutral access notice. Inactive access: retain existing blocking-error treatment unless product decision changes.
- Offline: use one treatment across sign-in, OTP and Home. Recommendation: neutral persistent connectivity notice when merely offline; a red notice when a submitted action fails. Never show both for the same event.
- Success after resend: small confirmation near Resend, not a green input border (code has not been validated). Time added: compact transient toast. No error toasts for failures requiring action.
- Keep at most one primary explanatory message for the blocking cause. Independently actionable simultaneous issues may coexist, but do not repeat the same cause as field text, card and toast.
- Loading stays in the originating CTA and suppresses duplicate requests. No new headline or new full screen merely for loading.

## Timing: preserve D-39

Existing decision: docs/context/decision_log.md, D-39, lines399–410.

- No error on untouched empty input.
- Incomplete but potentially valid entry: wait for Send/Verify. Do not flash red after digit1 of a 10-digit mobile number.
- Impossible value: show immediately under field, following existing first-digit rules and leading-zero normalisation.
- Once format error exists, revalidate while editing and clear once valid.
- Wrong/expired server response clears on a new attempt; network failures retain input. Do not spend wrong-code attempts on local format checks.
- Expired current challenge requires a resend; typing must not make a known-expired challenge valid.

## State coverage and recommended mapping

### Sign-in: 12 states

| State | Treatment / audit disposition |
|---|---|
| default | Neutral helper; no error |
| keyboard-open | No error while a potentially valid number is still being entered |
| empty-tap | Shared field error; unify outline |
| too-short | Shared field error; preserve D-39 timing |
| wrong-first-digit | Shared field error, immediate for impossible input |
| pasted-cleaned | Normal input; resolve leading-zero source mismatch |
| sending | Loading CTA, input retained, no duplicate send |
| not-registered | Shared neutral access notice; retain sign-up route |
| offline | Shared connectivity/action notice, per offline rule above |
| couldnt-send | Shared red action notice |
| too-many-tries | Shared cooldown notice; one countdown source; server-owned eligibility |
| inactive | Shared blocking access notice; existing Call Doctor Ops primary action |

### OTP: 12 states

| State | Treatment / audit disposition |
|---|---|
| default | No error |
| empty-tap | Shared field error |
| too-short | Shared field error after submission |
| verifying | Loading CTA; retain code and choice |
| wrong-code | Shared field error, not a new card |
| two-tries-left | Same field error with remaining tries in same message |
| resend-available | Normal action state, not success/error |
| new-code-sent | Small status beside resend; do not style as validated input |
| code-expired | Same field error; strengthen resend recovery and prevent knowingly expired resubmission |
| couldnt-verify | Shared red action notice; retain input |
| too-many-resends | Shared cooldown notice; allow verification of last unexpired code |
| locked | Shared cooldown notice; disabled verification; eligibility not inferred solely from timer |

Additional coverage gaps to settle in behavior/source: OTP resend sending/failure, loss of connectivity during verification, recovery after cooldown, and expired-last-code while resend is capped. These should reuse existing field/notice/loading patterns, not add a full-page screen per combination.

### Returning unlock: 3 approved variants

Fingerprint / Face ID / screen lock share one layout and OS-owned prompt. No separate custom error per authentication modality. Cancel returns to unchanged screen; recoverable platform errors stay in system prompt where appropriate; unavailable/revoked credential uses shared notice and existing OTP fallback. Native component currently has only busy and generic button catch, so explicit outcome handling is a handoff gap, not proof of a broken production flow.

### Home: 3 current approved references and 16 historical draft states

Wheel setup / active / wheel add-time are current references. Historical draft review covered setup, setting, setup error, ready, requesting, empty queue, request error, offline, near expiry, add, adding, add error, success toast, end-pending confirmation, stop scheduled and expired-pending.

Use one notice for set/add/request failures. Empty queue, stop scheduled and window expiry are statuses, not red failures. Near-expiry amber must not relocate Add time. Error on add stays in the sheet, preserves selection and leaves background Home intact. Uncertain request results require reconciliation before allowing another request. Keep this in state logic rather than multiplying layouts.

## Recommended repair order

1. Agree two structures and severity mapping, preserving D-39 timing.
2. Fix shared web/native components and behavior mismatches once.
3. Review representative comparisons: invalid input, wrong/expired code, service failure and cooldown. Re-render affected states from the same sources after review; do not redesign all happy states.
4. Validate keyboard recovery, screen readers, 360/390 widths, large text, countdown reconciliation and one-request-at-a-time behavior on native devices.

### External cross-check

The distinction between input validation and service/access failure is supported by [GOV.UK error-message guidance](https://design-system.service.gov.uk/components/error-message/). Accessible association and notification of validation errors are covered by [W3C form validation guidance](https://www.w3.org/WAI/tutorials/forms/validation/). These sources inform the distinction; the exact layout recommendation is specific to this app and its shared design system.

# Doctor app — React Native screen components

## Scope

Actual TSX components using React Native View/Text/TextInput/Pressable/Modal/FlatList and react-native-svg. No WebView or CSS runtime. These are editable reference components, not a finished authenticated application.

- SignInScreen: all12 approved states, native keyboard and number field, conditional legacy sign-up callback.
- OtpScreen: all12 approved states,4 digits, native autofill props, number lock, resend status, optional faster-sign-in opt-in.
- UnlockScreen: fingerprint, Face ID and screen-lock variants. Callback opens native authentication owned by host app.
- HomeScreen: approved wheel setup and active Home.
- AddAvailabilitySheet: wheel only, selected as final control.
- DurationPicker: shared presets and real scroll-snap wheel with adjustable accessibility actions.
- Shared primitives and pure behavior helpers.

State fixtures are supplied via controlled props. State strings represent UI feedback, not screens with separate navigation routes. Components do not call fake APIs or navigate automatically on success.

## Integration

Import components from `./index`. Import paths to `../../../../design-system/native/tokens` and `icons` resolve in this repo. When copying into another app, preserve or alias those imports to your central native design-system package. Do not create another palette.

Required peers: React, React Native and react-native-svg. Validated against versions recorded in VALIDATION.md; use the app's approved versions and recheck types. No new navigation or sheet library is imposed.

Host provides:
1. Insets from existing safe-area provider; screens apply them once. Android resize behavior must be checked with host window configuration.
2. Loaded Plus Jakarta Sans native TTF/OTF weights400/500/600/700 mapped to the shared font family. Existing WOFF2 cannot be used as a native font. Native font files are NOT bundled here.
3. Server status, number/code/duration values and event callbacks. Async callbacks should return their promise and update controlled feedback state; pass `onActionError` to route rejections to the host's outcome handler. Buttons guard simultaneous taps while pending and no longer create their own generic error text. Backend idempotency is still required.
4. Native authentication, SMS retrieval/consent bridge as appropriate, approved Terms/Privacy URLs, legacy sign-up URL, and Doctor Ops integration. Link/call callbacks avoid hard-coded contacts.
5. Logo XML is generated verbatim from approved brand asset, not redrawn. Regenerate logo.ts only when canonical asset changes.

## Prop guide

Sign-in: `state`, `mobile`, `retrySeconds`, mobile-change/send/ops/signup callbacks.
OTP: `state`, `mobileLabel`, `code`, resend/lock seconds, capability/checkbox booleans, verify/resend/back/change-number/ops/legal callbacks.
Unlock: doctorName (e.g. `Dr. Apurva`), capability-selected variant, busy and unlock/OTP/switch callbacks.
Home: setup/active mode, prescribed count, remaining whole minutes, selected duration/variant, header callbacks, start/request/end/add callbacks.
Sheet: visibility, selected duration/variant, busy/feedbackKey, close/select/add callbacks. `feedbackKey` uses IDs from `../feedback/messages.json`.

Counters and deadlines come from backend. Do not fake unlock because a timer reaches0; parent must obtain updated server eligibility. Authentication retry limits remain configurable: issuance initial4 total, wrong-code lock initial5, server-enforced windows.

## State responsibilities

- Wrong OTP response: parent clears rejected code, preserves opt-in, supplies wrong-code/two-tries-left state. Network failure retains code.
- Native OS prompt only after valid authentication and explicit consent. These screens never store biometrics.
- No Home reminder inside add-time sheet. Initial setup shows only **Minimum 15 minutes**. Wheel enforces 15-minute increments.
- Adding after natural expiry is same operation/copy. Backend adds selected duration to max(serverNow, oldDeadline), idempotently. Explicit stop/logout/restriction must be handled independently.
- Timer/case orchestration lives outside these UI components. Pending case is never interrupted by window expiry. End during request remains reachable; host opens agreed confirmation and schedules stop.

## Verification limits

Type checking and pure logic tests passed. This does not establish visual pixel parity or device accessibility. No simulator, OS authentication, network integration, font mapping or gesture test run is claimed.

Outstanding host QA: screen readers/modal initial and return focus, Dynamic Type, keyboard on small phones, Android gesture/back behavior, wheel inertia and minimum boundaries, landscape if supported, safe areas, server concurrency/recovery. Some app components may replace local primitives after mapping.

Native references use responsive flow and safe areas rather than copying browser absolute coordinates. Compare them on devices to approved PNGs before shipment. Native component existence must not be described as fully validated React Native compliance.

2026-10-13: Wheel is the final selected availability control. Tap/stepper option removed from active handoff. Historical comparisons are superseded.


## Feedback source repair — 2026-10-13

Sign-in, OTP, unlock and Home consume generated `messages.ts` from `../feedback/messages.json`. `Notice` now uses shared 13/20 text, 12pt padding, 8pt gap, semantic border, and a neutral variant. `Toast` uses compact inverse styling. OTP shows four 56pt slots while one native `TextInput` handles input, paste and OTP autofill. Known-expired challenges cannot be reverified. Locked states remain blocked until host supplies an authoritative unlocked state, even when local countdown reaches zero. Home Add time appears at 15 minutes or less; toast overlays above footer. Host must hide toast after accessible dwell time and keep updated deadline visible.

Type checking and pure logic checks passed, but native device rendering, autofill, screen reader, Dynamic Type and source/PNG pixel parity remain pending. Do not treat these repaired components as newly approved visuals.

## Required reference before edits

Read `../../docs/feedback-rules.md` and `../../docs/feedback-state-map.md` (D-41). Use `../feedback/messages.json` for copy and its generated adapters for preview/native parity. Use state fixtures for all cases and representative images for visual coverage. Do not treat source type checks as native-device certification.

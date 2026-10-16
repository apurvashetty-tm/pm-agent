> Current selection: wheel only (D-40, 2026-10-13). Earlier tap/stepper mappings below are historical and superseded. Actual current picker contains no stepper branch.

# Home — React Native handoff

## What exists, and what this package means

Sign-in/OTP already have editable HTML references, approved PNGs and native behavior notes. Shared React Native exports exist in `../../../../design-system/native/`: tokens.ts, tokens.json and icons.ts. They contain the same SALT values as web styles. They do not contain native Button, Sheet or Picker components.

This Home package follows that reference pattern: editable HTML entries, shared reference JS/CSS, PNG approvals, native specification and typed native contract. Actual TSX reference screen components now live in ../native and pass TypeScript validation. They are not a built native app or a WebView implementation. Do not copy CSS into React Native or claim HTML proves native compliance.

## Files

- availability.html: saved setup alternatives, tap/wheel selector.
- home.html: active Home reference.
- add-availability.html: tap/wheel extension sheet selector.
- home-reference.js / home-reference.css: shared editable renderer and geometry.
- home.native.ts: shared native token imports and typed duration/availability contract.
- Existing PNGs remain approved visual evidence. Wheel add variant was explicitly approved on 2026-10-13.

## Component mapping

| Reference | Native implementation contract |
|---|---|
| Frame/content | App safe-area host + View; ScrollView for overflow; footer outside scrolling body. Reference coordinates describe390×844 only, not fixed phone dimensions. |
| Header | Official project SVG lockup; SvgXml or established SVG transformer. Icons from shared native/icons.ts. Pressable targets at least44×44 with labels. |
| Heading/copy | Text using shared tokens; allowFontScaling. No fixed-height text clipping. |
| Primary CTA | Existing native primary Button/Pressable, shared semantic colors,18px semibold,56px minimum. ActivityIndicator during mutation; disable duplicate interaction. |
| Presets | Wrapping three-column Pressables at normal font scale; reflow at large scale. accessibilityRole button + selected state. |
| Stepper | Display-only Text value;44px increment/decrement Pressables. Hours ±60 minutes; minutes ±15; reject totals below15. No keyboard. |
| Wheel | App team's accessible native wheel. Hours0… with no invented business cap, minutes0/15/30/45. Values snap; minimum total15. Screen-reader adjustable actions. Web listbox is only a semantic editing stand-in, not native wheel styling or validated touch behavior. |
| Add sheet | App-standard native modal sheet; accessible modal focus, Android Back dismissal, close/cancel, safe bottom inset. Height grows for wheel; primary/footer placement stable. Smaller screens scroll body; never hide controls to preserve coordinates. |
| Status/errors | Inline persistent Text/View in stable status area, polite announcements. Do not rewrite active headline for every response. |
| Toast (future approved state) | Shared inverse surface, body-xs12/16 semibold,4/8 padding,4radius; content width, no action, above footer. Approximately4seconds adjusted for accessibility. Current toast PNG not approved in UI folder. |

## Fonts

Use Plus Jakarta Sans TTF/OTF mapped for weights400/500/600/700. Existing WOFF2 files are browser assets and cannot simply be bundled as native fonts. The shared native README records this existing integration gap. App team must validate actual family names and weight resolution on iOS and Android.

## State/transition rules

1. Selection stores total integer minutes, >=15, divisible by15. Presets and both control variants update same value; minutes rollover comes from total, not independent clamping.
2. Set availability only starts after server confirmation. Keep selection and error inline on failure. Server returns authoritative deadline.
3. Add availability sends an idempotent operation. Backend result adds duration to max(serverNow, previousDeadline). Natural expiry during open sheet does not change copy, CTA or introduce another confirmation. Explicit stop/logout/restriction must not be overridden.
4. On success dismiss sheet, update deadline and preserve Home context. Duplicate/uncertain responses reconcile same operation ID; never add twice.
5. Remaining time derives from authoritative deadline plus clock-offset handling. Backgrounding does not pause countdown. Foreground refresh reconciles pending request before enabling new request.
6. Last-second requests honored. Expiry or stop during pending request waits for result and any assigned case. Existing consultation not interrupted. Completed-case Next order location uses agreed availability gating.
7. Idle expiry/manual end reuse setup, preserving prescriptions count. Saved setup footer is currently56px lower than current active Home: known visual mismatch, user requested originals not be modified.

## Verification status

- Static: asset/import paths, JS syntax, shared-token names and image hashes can be verified here.
- Still required: rendered HTML-to-PNG visual parity; native compile, device gestures, Dynamic Type, VoiceOver/TalkBack, safe areas, font mapping, server integration, recovery and duplicate prevention.
- No native app package/build exists in this folder. Native runtime behavior cannot be certified here.
- Earlier browser file-policy restriction was respected. Editable HTML reconstructed from PNG intent; no claim that existing PNGs were captured from this new source.

## Acceptance checks for native team

- 390×844,360-width and larger text: no clipped content or obscured primary action.
- Both variants select45min,1h15min and minimum15; decreasing below minimum disabled; no keyboard.
- Modal back/cancel keeps original deadline; screen-reader focus returns to Add time.
- Busy primary receives one request despite rapid taps; lost response reconciles same ID.
- Add30 with12remaining yields42; add30 after natural expiry yields30. No special expiry UI inside sheet.
- Add time stays next to timer at near-expiry; only timer/notice uses amber.

## 2026-10-13 implementation update

`../native/HomeScreen.tsx` and `DurationPicker.tsx` provide native setup, active Home and both add-time variants. Auth components are included alongside them. See `../native/VALIDATION.md` for checks and integration limits. Setup shows Minimum 15 minutes once; add-time sheets do not repeat it.

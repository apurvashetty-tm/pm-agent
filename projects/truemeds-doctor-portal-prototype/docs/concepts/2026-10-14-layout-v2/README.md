# Layout v2 — concept renders (historical visual direction)

Status: **HISTORICAL — not a spec.** Concepts from the 2026-10-14 working session. The agreed rules now live in
`docs/context/decision_log.md` (**D-42–D-45**) and `design-system/RULES.md` §8; **they win over anything here.**
Use these images for overall look only. Known differences from the final decisions are listed under "Superseded"
below.

## Superseded by later decisions (do not build from these)
| Here | Final decision |
|---|---|
| Title 32/40 **bold** | 32/40 **semibold** via `.tm-text-title-lg` (D-43) |
| Wrong code **clears the boxes** and refocuses box 1 (`03_otp-v2_wrong-code.png`) | Digits **stay visible** with red borders, no focus box; first keystroke replaces the code (D-44) |
| Resend line "Resend in 00:30", plain | "Resend in **0:30**" (heavier timer, fixed-width digits); "**Resend code**" brand link when available; hidden on too-many-resends and locked (D-44) |
| Blue links blue-500 | Brand text is blue-600 via `tokens/truemeds.json` (RULES.md §8.7) |
| `04_otp-v2_locked-keyboard-closed.png` (pinned footer) | Button inline under content on typing screens (D-43) |


## What this tested (session notes)

- **Logo rule:** logo only on entry/home-base screens (sign-in, Home). Task/step screens (OTP, biometric, unlock, case) use Back + title.
- **Type scale (4 levels):** L1 screen title 32/40 (bold in these renders; final: semibold) · L2 key content 16/24 medium · L3 supporting 14/20 secondary · L4 fine print 12/16 secondary. 
- **Spacing:** one side margin (24, `--tm-space-xl`) on every screen; gaps limited to tight 8 / related 16 / section 32.
- **Button placement:** input screens (sign-in, OTP) keep the button inline under the content; non-input screens (biometric, Home) pin it to the bottom.
- **OTP:** no logo; "Sent to +91 … · Change" on one line; no visible "Verification code" label (screen-reader label kept); one centred resend line; notice directly under the boxes; keyboard stays open; the doctor taps Verify (no auto-verify). Wrong-code behaviour: see Superseded table.
- **Biometric:** separate screen after first successful sign-in, "Turn on faster sign-in" / "Not now". Replaces the opt-in card on OTP.

## Changes after Apurva's review (v2b)
- **No auto-verify.** Doctor taps Verify & sign in; keyboard stays open after the 4th digit.
- **Input screens keep the button inline**, directly under the content (sign-in as approved, and now OTP too). Pinned bottom footer only on non-input screens (biometric, Home). Removes the empty gap above the button on OTP.
- **Locked OTP:** consent text and resend line removed (no action is possible); notice carries the countdown and Doctor Ops link; button shown disabled so the layout doesn't jump when the lock ends.
- **Sign-in:** approved layout kept (Send OTP under the field); only the type scale applied.
- **All text sizes now use design-system tokens**; buttons use the design-system default weight (semibold).

## Files
| File | What it shows |
|---|---|
| 01_otp-current.png | Current OTP source, *before* (for comparison only) |
| 02_otp-v2_entering.png | OTP v2, typing, keyboard open, SMS autofill suggestion |
| 02b_otp-v2_filled-ready.png | OTP v2, 4 digits entered, waiting for the doctor to tap Verify |
| 03_otp-v2_wrong-code.png | SUPERSEDED — shows cleared boxes; final keeps the digits visible (D-44) |
| 04_otp-v2_locked.png | OTP v2, locked: keyboard closed, no consent/resend |
| 04_otp-v2_locked-keyboard-closed.png | SUPERSEDED (v2a, pinned footer) |
| 05_signin-current.png | Current sign-in source (for comparison) |
| 06_signin-v2_default.png | Sign-in, approved layout + type scale, keyboard closed |
| 06b_signin-v2_keyboard.png | Sign-in, approved layout + type scale, keyboard open |
| 07_biometric-offer_v2.png | New post-sign-in biometric offer screen |
| concept.html | Source (`?s=otp-entering`, `otp-filled`, `otp-wrong-code`, `otp-locked`, `signin-default`, `signin-keyboard`, `biometric-offer`) |
| audit.json | Automated audit output (contrast, tap targets, type styles, overflow) |

Captured with headless Chromium from `concept.html`, 390×844 @2x, central `design-system/truemeds.css` and icons. Copy on the biometric screen is draft.

## Audit (standards + design system) — v2b
| Check | Result |
|---|---|
| Design-system tokens | Pass — all type sizes, weights, line heights, spacing, radii and colours are `--tm-*` tokens. Raw colours only in the mock OS keyboard. |
| Type scale | Pass at the time — 4 levels on every screen (32 bold / 16 / 14 / 12; final title is semibold); buttons 18 semibold (DS default). |
| Text contrast (WCAG AA 4.5:1) | Biometric: pass. **Flags (design-system level, also in current approved screens):** brand-blue "Change" on light-blue band = 4.497:1 (fails by a hair); brand-blue "call Doctor Ops" on yellow warning notice = 4.19:1 (fails); placeholder "10-digit mobile number" = 3.0:1. |
| Tap targets (44pt iOS / 48dp Android) | Back and Change enlarged to 44pt. Inline links in sentences (Terms, Privacy, Sign up, call Doctor Ops) are below 44pt — allowed by WCAG 2.5.8 inline exception; consider larger hit areas in native. |
| Keyboard fit | OTP and sign-in: button fully visible above keyboard (button bottom ≤ 492, keyboard top 544). |
| Overflow / clipping / console errors | None. |
| Biometric screen vs platform guidance | Explains benefit before the OS prompt, offers a clear decline ("Not now"), reversible. **Native note:** copy must match the device — "Face ID" on Face-ID iPhones, "fingerprint" on fingerprint devices; never imply Truemeds stores biometric data (copy already says it doesn't). |

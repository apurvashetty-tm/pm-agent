# OTP screen: final spec and error handling (2026-10-09)

Status: **agreed screen, not built.** Built together with sign-in, biometric and Home in one pass (see D-33).
Concept: `2026-10-09-otp-v2.html`. Renders: `renders/2026-10-09/25` (screen), `26`–`27` (errors).

## Screen (Apurva's layout)
- Blue top (brand subtle): Back, logo, "Verify your number", "Enter the OTP sent to +91 98765 43210", Change number.
- White panel: Verification code (one field, 4 digits, SMS autofill), "Didn't receive it?" + resend timer,
  biometric card, Terms line, **Verify & sign in**.
- **Faster sign-in card (option C):** fingerprint icon in a white tile, "Sign in faster next time" / "Use your
  device's face, fingerprint, or screen lock.", checkbox on the right, grey card, no border, no dividers. The whole
  card toggles the checkbox; only the checkbox changes when ticked.
- **Keyboard:** opens on arrival; closes by itself on the 4th digit so the card and button are in view. Nothing is
  sent until Verify & sign in is tapped.
- **Back and Change number** both return to sign-in with the number filled in. The resend wait carries over.

## Messages: same rule as sign-in
Problems with what was typed: field turns red, red line under the field. Problems from the server or network: a
notice under the field, field stays neutral. No toasts.

## States
| # | State | When | What the doctor sees | What happens |
|---|---|---|---|---|
| 1 | Nothing typed | Verify tapped, field empty | Red: "Enter the 4-digit code." | Clears on first digit |
| 2 | Too short | Verify tapped with 1–3 digits | Red: "Enter all 4 digits." | Same |
| 3 | Verifying | Valid tap | Button "Verifying" with spinner; field and card locked | Success → biometric setup if ticked → Home |
| 4 | Wrong code | Server: wrong | Red: "That code isn't right. Try again." Field cleared, keyboard reopens | Tick on the card is kept |
| 5 | Few tries left | 2 or fewer tries left | Red: "That code isn't right. 2 tries left." | Same |
| 6 | Resend available | Timer reaches 0 | "Resend code" link replaces the timer | Waits: 30 s, then 60 s, then 120 s |
| 7 | New code sent | Resend tapped | Green: "New code sent." Timer restarts | The old code stops working |
| 8 | Expired | Server: expired | Red: "This code has expired. Get a new one." Resend link shown at once | |
| 9 | Couldn't verify | Network or server failure | Red notice: "We couldn't check the code. Tap Verify & sign in to try again." | Code and tick kept; same button retries |
| 10 | Too many resends | Resend limit hit | Yellow notice: "You've asked for too many codes. Use the last one, or call Doctor Ops." Timer shows the wait | Field still works with the last code |
| 11 | Locked | Too many wrong tries | Yellow notice with countdown and "call Doctor Ops"; field, card and button disabled | Unlocks when the countdown ends |
| 12 | Passkey setup cancelled or fails | After a correct code, doctor cancels the phone's sheet or setup fails | Signed in anyway; lands on Home | OTP stays the sign-in next time; can be turned on later from the profile sheet |
| 13 | SMS autofill | Code arrives on the phone | iPhone offers it above the keyboard; Android fills it | Keyboard closes on the 4th digit as usual |

## Faster sign-in (passkey)
Built on passkeys: WebAuthn in the web prototype; Apple Authentication Services / Android Credential Manager in a
native app. In all three the phone shows its own sheet and checks face, fingerprint, PIN or pattern. We design no
PIN screen.

- **Unticked by default.** Ticking is an explicit choice because it adds a setup step after the OTP. Pre-ticking
  would inflate adoption while adding surprise, cancellations and mistrust. Adoption comes from a clear benefit and
  easy setup.
- **Shown only when passkey setup is supported** (web: `isUserVerifyingPlatformAuthenticatorAvailable()`). Not tied
  to a fingerprint sensor: a phone with only a screen-lock PIN still qualifies. Hidden on phones with no screen
  lock or an old browser.
- **Flow when ticked** (render 30):
  1. Doctor enters the code and taps Verify & sign in.
  2. The OTP is checked first.
  3. The app asks the phone to create a passkey; the phone's own sheet appears.
  4. Faster sign-in counts as on only after the passkey is created **and** saved on our server. Then Home.
  5. Cancelled or failed: Home as normal; OTP next time. No nag.
- **Flow when unticked:** correct OTP goes straight to Home. No second prompt.
- **iPhone risk, to test in the build:** Safari only shows the passkey sheet shortly after a tap. The wait for the
  OTP check can use that up. If Safari blocks it, Home shows one sheet, "Finish setting up faster sign-in" with
  **Set up** / **Not now**; the new tap opens the phone's sheet. Shown only to doctors who ticked the box and were
  blocked.
- **Next visits:** sign in with the passkey, with "Use OTP instead" as the fallback (designed with Welcome back).
  Later option: offer the passkey in the sign-in number field itself.
- **Security note for compliance:** a passkey unlocked by a screen-lock PIN is only as strong as that PIN (shared
  family phones). That is no weaker than SMS OTP to the same phone. Passkeys may sync to the doctor's other devices
  through Apple or Google.
- **Measure:** ticked, setup completed, setup cancelled or failed. The gap shows whether copy or setup loses doctors.

Sources: Apple passkeys (developer.apple.com/documentation/authenticationservices/supporting-passkeys),
Android Credential Manager (developer.android.com/identity/passkeys/create-passkeys), Google passkeys
(developers.google.com/identity/passkeys), web.dev passkey registration (web.dev/articles/passkey-registration).

## Open (backend / ops)
- Code life, wrong tries allowed, resend limit and lock time. Placeholders: 4 digits, 5 min life, 5 wrong tries,
  15 min lock, resend 30 s / 60 s / 120 s.
- Doctor Ops phone number. Terms & Conditions and Privacy Policy URLs.

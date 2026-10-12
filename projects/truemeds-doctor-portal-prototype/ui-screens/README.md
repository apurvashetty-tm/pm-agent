# Approved UI screens

This folder is the handoff set for Claude and frontend engineers. Add a screen only after Apurva reviews and approves
that exact render. Earlier concepts and review drafts stay in `docs/renders/`.

**Approved copy or behaviour is not an approved layout.** A decision in the decision log or a spec does not by itself
let a screen into this folder. Only an approved render does.

## File format

One folder per flow (e.g. `sign-in/`, `otp/`). In it:

- `<screen>.html`: one file per screen with a **state selector** covering every approved state. Editable mockup
  source using the central Truemeds design system. A design reference, not production code.
- `<screen>_<state>.png`: one image per approved state, **generated from that same HTML file**, so the images and
  the source never drift apart.
- An entry below for the screen (see the template).

### Paths (from `ui-screens/<flow>/`)

- Design system: `../../../../design-system/truemeds.css` and `../../../../design-system/icons/icons.js`
- Logo: `../../brand/truemeds-for-doctors.svg`. Use this canonical file; do not duplicate or redraw it.

Before adding a screen, open its HTML from its final location and check it renders styled, with the logo and icons.

### Capture size

New PNGs are captured at **390 × 844** (2× pixel density). This is the capture size only; engineers should still
test smaller and larger phones (e.g. 360 wide) and the desktop frame.

### Changing an approved screen

Replace the HTML and PNGs in place, update the entry's date, and add a one-line change note. Do not add "v2" files;
Git keeps the older versions.

## Entry template

```
### <Screen name>
- Files: `<flow>/<screen>.html`; states: `<state>`, `<state>`, …
- Approved: YYYY-MM-DD by Apurva
- Decision: D-xx · Spec: `docs/concepts/…`
- Copy: key strings that must match exactly
- Behaviour a still image can't show: keyboard, timers, autofill, what happens on tap
- Changes: YYYY-MM-DD: one-line note
```

## Approved screens

### Sign-in
- Files: `sign-in/sign-in.html`; approved states: `sign-in_default.png`, `sign-in_keyboard-open.png`, `sign-in_empty-tap.png`, `sign-in_too-short.png`, `sign-in_wrong-first-digit.png`, `sign-in_pasted-cleaned.png`, `sign-in_sending.png`, `sign-in_not-registered.png`, `sign-in_offline.png`, `sign-in_couldnt-send.png`, `sign-in_too-many-tries.png`, `sign-in_inactive.png`
- Approved: 2026-10-09 by Apurva
- Decision: D-33 · Spec: `docs/concepts/2026-10-09-signin-screen-evaluation.md`
- Copy: “Welcome, Doctor.” / “Your partner in thoughtful, affordable care.” / “Send OTP”
- Behaviour a still image cannot show: Send OTP with an empty field shows “Enter your mobile number.”; with fewer than 10 digits it shows “Enter all 10 digits.” A number beginning with 0–5 shows “Mobile numbers start with 6, 7, 8 or 9.” These validation states leave the keyboard open. Pasting or autofilling a valid number displays the cleaned 10 digits in the focused field. While OTP is sending, the number stays visible, the action shows progress and cannot be tapped again. An unregistered number closes the keyboard and shows “Number not registered with Truemeds. Already applied? We’ll contact you after approval.” The footer provides Sign up. Offline failure keeps the number, closes the keyboard, and offers retry after connection returns. A failed code send keeps the number and offers Send OTP again. Too many attempts shows a disabled retry button with a countdown snapshot; production countdown should update and re-enable retry at expiry. Inactive account shows a red notice and Call Doctor Ops as the primary action; production needs the Ops phone number. The footer Sign up is hidden while the native keyboard is open; the HTML keyboard is a visual stand-in.
- Changes: 2026-10-10: Too many tries state approved; the single HTML switched among eleven approved states.
- Changes: 2026-10-12: Inactive account added as twelfth state with Call Doctor Ops action; captured from the same HTML at 390 × 844.

### OTP verification
- Files: `otp/otp.html`; approved states: `otp/otp_default.png`, `otp/otp_empty-tap.png`, `otp/otp_too-short.png`, `otp/otp_verifying.png`, `otp/otp_wrong-code.png`, `otp/otp_two-tries-left.png`, `otp/otp_resend-available.png`, `otp/otp_new-code-sent.png`, `otp/otp_code-expired.png`, `otp/otp_couldnt-verify.png`, `otp/otp_too-many-resends.png`, `otp/otp_locked.png`
- Approved: 2026-10-10 by Apurva
- Decision: D-34 (number lock) · Spec: `docs/concepts/2026-10-09-otp-screen-spec.md`
- Copy: “Verify your number” / “Verification code” / “Sign in faster next time” / “Verify & sign in”
- Behaviour a still image cannot show: The code has four digits. The faster sign-in card is unticked by default and, where supported, lets the doctor opt into passkey setup after a correct OTP. Back and Change number return to sign-in. Tapping Verify with no code focuses the code field, shows “Enter the 4-digit code.”, and opens the numeric keyboard. Tapping Verify with one to three digits keeps them, focuses the field, shows “Enter all 4 digits.”, and opens the numeric keyboard. During verification the four entered digits stay visible, the code field and faster sign-in card are locked, and the action shows progress. Wrong-code response clears the rejected code, opens the keyboard, shows “That code isn’t right. Try again.”, and keeps the faster sign-in selection. With two tries left, the rejected code clears and the error says “That code isn’t right. 2 tries left.” When resend countdown reaches zero, “Resend code” appears as a tappable button in the same position. After a resend succeeds, a green confirmation appears and the resend countdown restarts at 01:00. When the server reports an expired code, the entered digits remain visible, an error appears below the field, and Resend code is available immediately. If the server cannot check the code, entered digits and faster sign-in selection remain; Verify & sign in retries. OTP issuance is capped at a configurable 4 codes per mobile number in a server-enforced window (first send plus up to 3 resends); the exact window and reset rule remain open. At the cap, the last valid code can still be entered while resend waits. Five server-confirmed wrong OTP submissions trigger a separate lock on the attempted mobile number; resend and sign-in restart do not reset this count: disable code entry, faster sign-in card, and Verify button until server countdown expires. Change number remains available, but another number needs Doctor Ops approval for this doctor. Remaining OTP states are behavioral handoff cases.
- Changes: 2026-10-10: Default OTP screen approved; captured directly at 390 × 844 CSS pixels and 2× density from this HTML.
- Changes: 2026-10-10: Empty-code error approved; its PNG is pixel-identical to the reviewed render and comes from the same HTML.
- Changes: 2026-10-10: Two-digit example of the too-short error approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Verifying state approved with faster sign-in selected; its PNG matches the reviewed render.
- Changes: 2026-10-10: Wrong-code state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Two-tries-left state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Resend-available state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: New-code-sent state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Code-expired state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Couldn’t-verify state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Too-many-resends state approved; its PNG matches the reviewed render.
- Changes: 2026-10-10: Locked-number state approved; its PNG matches the reviewed render.

Other states and screens will be added only after review.

### Returning doctor unlock
- Files: `returning-unlock/returning-unlock.html`; approved states: `returning-unlock_fingerprint.png`, `returning-unlock_face-id.png`, `returning-unlock_screen-lock.png`
- Approved: 2026-10-12 by Apurva
- Decision: D-32 (faster sign-in, partly superseded by OTP spec) · Spec: `docs/concepts/2026-10-09-otp-screen-spec.md`
- Copy: “Hello, Dr. Apurva.” / “Let’s check in on your patients today.” / “Ready when you are” / “Use OTP instead”
- Behaviour a still image cannot show: Show fingerprint, Face ID, or screen-lock option according to the credential available on this device. OS authentication opens after Unlock; Use OTP instead returns to mobile-number sign-in. These mockup buttons are visual references, not a working authentication flow.
- Changes: 2026-10-12: Three variants approved with larger greeting and subtitle, more space above Unlock, and less space between Unlock and OTP. Face ID glyph added to shared icons as `[PROPOSED]`. Final-source captures match reviewed PNGs by SHA-256.


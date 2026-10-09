# Sign-in screen: evaluation note (2026-10-09)

This note compares Apurva's reference layout (`renders/2026-10-09/15a`) with my v2 bottom-panel layout (`14`). It was reviewed as UX, visual/UI and mobile-web engineering. Renders of the recommended version: `renders/2026-10-09/15`.

## Verdict
**Go with Apurva's layout: everything stacked near the top, with the field and button directly under the heading.** The v2 bottom panel should be dropped.

## Why the stacked layout wins

| Check | Stacked (Apurva) | Bottom panel (v2) |
|---|---|---|
| **Keyboard opens** | Nothing moves. The field and Send OTP sit just above the keyboard. | The panel has to jump up with the keyboard. |
| **Mobile web reality** | Stable on iOS Safari and Android Chrome. | Fragile. iOS Safari doesn't shrink the page for the keyboard, so bottom-pinned panels hide behind it or jump. |
| **Thumb reach** | The field takes one tap (it can also be focused automatically). After that the doctor types on the keyboard, and the button is right above it. | Good before the keyboard opens, but no better once it's up. |
| **Familiarity** | The pattern doctors know from banking and delivery apps. | Less common; reads as a marketing screen. |
| **Empty space** | The lower half is empty while the keyboard is down. That's normal, and the keyboard fills it in about a second. | The large tinted top half reads as unfinished. |

**What decides it:** a phone sign-in screen spends nearly all its life with the keyboard open. So the right test is where the button sits relative to the keyboard, not where the thumb rests on an empty screen. My v2 optimised the wrong moment.

## Changes from the reference (recommended)

1. **Subtitle.** Keep the warmth of "Good care starts with a hello." only if brand approves it. Otherwise use "Sign in to start taking orders.", which says what happens next.
2. **Helper text.** Use "We'll send a 4-digit code by SMS." The OTP is 4 digits. Errors replace this line, so the layout doesn't jump.
3. **Footer.** Change "New to Truemeds? Sign up" to "New doctor? Sign up". "New to Truemeds" could mean customers. Sign up opens the existing web form.
4. **Terms.** Add "By continuing you agree to the Terms and Privacy policy" under Sign up, in small type. It records consent under the DPDP Act.
5. **No full stop** after "Welcome, Doctor". Headings don't take periods.
6. **Focus the field on open** on Android, so the number pad comes straight up. iOS Safari ignores this, so there it's one tap.

## States

| State | Behaviour |
|---|---|
| A · Opens | Field empty, helper line, Send OTP. |
| B · Typing | Digits only, at most 10. |
| C · Sending | "Sending OTP…" on the button. |
| D · Too short / invalid | "Enter your 10-digit mobile number." in red, in place of the helper. |
| E · Not registered | "This number isn't registered with Truemeds. If you've already signed up, our team will call you once you're approved." Sign up appears once, in the footer. |

There is no "under review" state, because sign-up requests aren't stored in the backend. State E covers both new and pending doctors.

## Audit (run before sharing)
- **Duplicate text or links:** none. State E's inline "sign up" was removed.
- **Main action:** one, Send OTP.
- **Errors:** shown in place of the helper line, with no extra pop-ups.
- **Keyboard open:** the field, error and button are all visible.
- **Design system:** colours and parts only (`.tm-field`, `.tm-btn--lg`, plus the [PROPOSED] `.tm-field__prefix`).
- **Contrast:** the Terms line uses the secondary text colour.

## Open
- Brand approval for the subtitle line.
- URLs for the Terms page, Privacy page and sign-up form.

## Update: final screen and error states (v4)

Apurva's screen is used as is: "Welcome, Doctor.", "We'll send you a verification code by SMS.", Send OTP, "New to Truemeds? Sign up". The v3 tweaks (no period, "New doctor?", Terms line) are dropped. Concept: `2026-10-09-signin-v4.html`. Renders: `renders/2026-10-09/16`, `17`, `18`.

**Two kinds of message.** Problems with what the doctor typed turn the field red and replace the helper line. Problems after sending (network, account) appear as a notice in the same spot, and the field stays neutral, because the number is fine.

| # | State | When | What the doctor sees | What happens next |
|---|---|---|---|---|
| 1 | Opens | Screen loads | Empty field, helper line | Android focuses the field, so the number pad opens |
| 2 | Typing | Keyboard up | Digits only, max 10 | Send OTP always tappable; checks run on tap, not while typing |
| 3 | Empty | Tap with nothing typed | Red: "Enter your mobile number." | Error clears on the first keystroke |
| 4 | Too short | Under 10 digits | Red: "Enter all 10 digits." | Same |
| 5 | Wrong first digit | Starts with 0–5 | Red: "Mobile numbers start with 6, 7, 8 or 9." | Same |
| 6 | Pasted / autofilled | "+91 98765-43210", "098765…" | Cleaned silently to 10 digits | No error; phone autofill offered (`autocomplete=tel-national`) |
| 7 | Sending | After a valid tap | Button "Sending OTP" with spinner, field locked | Success opens the OTP screen; no response in 15 s → state 10 |
| 8 | Not registered | Server: unknown number | Info notice: "This number isn't registered with Truemeds. **New here?** Sign up below. **Already applied?** Our team will call you once you're approved." | Keyboard closes so the footer Sign up is visible (render 19). Field editable for a typo; Sign up only in the footer |
| 9 | Offline | No network before sending | Yellow: "You're offline. Check your connection and try again." | Nothing sent; notice clears when they tap again |
| 10 | Couldn't send | Server error or timeout | Red notice: "We couldn't send the code. Please try again." | Same button retries |
| 11 | Too many tries | OTP request limit hit | Yellow notice + button "Try again in 9:42" (counts down, disabled) | Button returns to Send OTP at 0:00. Editing the number doesn't skip the wait |
| 12 | Inactive | Account blocked by ops | Red notice: "This account is inactive. Call Doctor Ops" (tap to call) | Needs the Doctor Ops number |

Not on this screen: SMS not arriving, wrong or expired code and resend belong to the OTP screen.

**Trade-off noted.** States 8 and 12 tell anyone whether a number is a Truemeds doctor. Security guidance prefers one message for all. We accept it because the doctor list isn't secret, and a pending doctor told "code sent" with no SMS would call support. Rate limiting (state 11) stops bulk checking.

**Subtitle.** Recommend "A different kind of house call." It describes the job literally (the doctor phones the patient at home) and stays fresh on daily use. "Your expertise. Someone's peace of mind." is the safe second; it's the longest and may wrap on 360 px phones.

**Audit:** one main action; Sign up appears once (footer); no toasts; error, notice and button all visible above the keyboard; the sending button stays blue (not grey) so it doesn't look broken.

**Open:** subtitle choice, Doctor Ops phone number, request limit and wait time (backend), sign-up form URL.

## Final renders (blue top)
The agreed screen uses the blue top + white panel shared with the OTP screen (`signin-v5.html`). All 12 states above
are rendered on it: `renders/2026-10-09/28` (states 1–7) and `29` (states 8–12). Earlier renders 16–19 and 23 are
superseded. Subtitle still pending (shown: "A different kind of house call.").

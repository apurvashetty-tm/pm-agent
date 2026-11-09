# DECIDED — Sign-in

Questions already answered. **Check here before asking.** Each answer quotes its source; `D-xx` is a product decision number.
Generated from the product rules — do not edit by hand.

| # | Topic | Question |
|---|---|---|
| [d01](#d01) | Input and paste | What does the mobile field accept, and how are typed or pasted numbers cleaned? |
| [d02](#d02) | Validation | Which checks run, in what order, and when does each error appear? |
| [d03](#d03) | Validation | When does an error clear? |
| [d04](#d04) | Errors | Where do errors show, and what does the field look like in error? |
| [d05](#d05) | Server answers | What can the server answer after Send OTP, and how is each answer shown? |
| [d06](#d06) | Server answers | Does a server answer stay when the doctor edits the number? |
| [d27](#d27) | Errors | Can a field error and a server notice show at the same time? |
| [d07](#d07) | Sending | What happens to the button and the field while the code is being sent? |
| [d08](#d08) | Limits | Too many attempts: what does the button show, and how long is the wait? |
| [d09](#d09) | Limits | Which limits are enforced on the server and which in the app? |
| [d10](#d10) | Limits | What happens when the doctor signs in with a number that is locked? |
| [d11](#d11) | Inactive account | The account is inactive: what does the doctor see and what does the button do? |
| [d12](#d12) | Sign-up | Where does "Sign up" go, and what happens for a number that isn't registered? |
| [d13](#d13) | Keyboard | Does the keyboard open by itself on Sign-in, and where is Send OTP when it is open? |
| [d14](#d14) | Keyboard | Which keyboard type and autofill hint does the field use? |
| [d15](#d15) | Keyboard | What happens to the keyboard and the sign-up line when a server answer arrives or the keyboard is open? |
| [d16](#d16) | Offline | What happens when the doctor taps Send OTP while offline? |
| [d17](#d17) | Copy | Where does every word on the screen come from? Can I change copy? |
| [d18](#d18) | Copy | Is it "case" or "order"? |
| [d19](#d19) | Layout | What are the logo size and the spacing at the top of the screen? |
| [d20](#d20) | Layout | Which type sizes does the screen use? |
| [d21](#d21) | Accessibility | What are the accessibility rules (targets, contrast, focus, names)? |
| [d22](#d22) | Fonts | Which font, which weights? |
| [d23](#d23) | Tokens | Can I use a hex colour, a palette colour or a pixel value that matches a token? |
| [d24](#d24) | Buttons | How many primary buttons, and what do the button labels look like? |
| [d25](#d25) | Journey | Where does Sign-in sit in the app, and where does it go next? |
| [d26](#d26) | Notices | How do notices wrap and where do they sit? |

## Input and paste

<a id="d01"></a>
### d01 · What does the mobile field accept, and how are typed or pasted numbers cleaned?

- Typing and pasting are cleaned: "+91 98765-43210", "098765 43210" → `9876543210`. A leading 0 or 91 is dropped. — *App logic §2*
- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *D-39*
- **Leading 0** is a dialling habit, not an error; it is dropped once all 10 digits are in ("0 + 9 digits" → "Enter all 10 digits."). — *D-39*
- At most 10 digits are kept: `return d.slice(0, MOBILE_LENGTH);` — *Sign-in build*

Decisions: D-33, D-39

## Validation

<a id="d02"></a>
### d02 · Which checks run, in what order, and when does each error appear?

- Checks, most basic first: empty → "Enter your mobile number." · first digit not 6/7/8/9 → "Mobile numbers start with 6, 7, 8 or 9." (shown as soon as it's typed) · fewer than 10 digits → "Enter all 10 digits." (shown on Send OTP). Once an error shows, it re-checks on every keystroke. — *App logic §2*
- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *D-39*

Decisions: D-39

<a id="d03"></a>
### d03 · When does an error clear?

- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *D-39*
- signin.empty: clears on valid edit; keeps the number · signin.short: clears on valid edit; keeps the number · signin.prefix: clears on valid edit; keeps the number — *Message rules*

Decisions: D-39

## Errors

<a id="d04"></a>
### d04 · Where do errors show, and what does the field look like in error?

- **Errors:** typing problems turn the field red and replace the helper line (empty, under 10 digits, first digit not 6–9). Problems after sending show a notice in the same spot and leave the field neutral: not registered (info), offline (warning), couldn't send (error), too many requests (warning + button counts down), inactive account (error + Call Doctor Ops). No toasts. Pasted or autofilled numbers are cleaned to 10 digits. — *D-33*
- **Field error** — Under the field (L4, L7). — *Design rules 9.5*
- L4 — Field helper and field error text: 14/20 (`.tm-field__helper`). — *Design rules L4*
- L7 — Field helper/error text aligns with its field: left under full-width fields, centred under the centred OTP code boxes (D-47). — *Design rules L7*

Decisions: D-33, D-46, D-47

<a id="d27"></a>
### d27 · Can a field error and a server notice show at the same time?

- **Errors:** typing problems turn the field red and replace the helper line (empty, under 10 digits, first digit not 6–9). Problems after sending show a notice in the same spot and leave the field neutral: not registered (info), offline (warning), couldn't send (error), too many requests (warning + button counts down), inactive account (error + Call Doctor Ops). No toasts. Pasted or autofilled numbers are cleaned to 10 digits. — *D-33*
- **Rule** — One message per cause — never field error + notice + toast for the same thing. — *Design rules 9.5*
- No. The notice and the helper / error line share one spot; typing a different number removes the notice first, then the format check runs: `helper.hidden = !!m.notice;` — *Sign-in build*

Decisions: D-33

## Server answers

<a id="d05"></a>
### d05 · What can the server answer after Send OTP, and how is each answer shown?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *App logic §2*
- not-registered: neutral notice, icon `info-circle`, copy `signin.notRegistered`, role="status" · offline: warning notice, icon `alert-triangle`, copy `signin.offline`, role="alert" · couldnt-send: error notice, icon `alert-circle`, copy `signin.couldntSend`, role="alert" · too-many-tries: warning notice, icon `clock`, copy `signin.tooMany`, role="alert" · inactive: error notice, icon `alert-circle`, copy `signin.inactive`, role="alert" — *Sign-in screen*
- **Notice** — Neutral / warning / error (L5); stays until the cause is gone. **Warning** when something blocks the main action or runs on a timer (offline, locks, near expiry); **error** when an action failed; **neutral** only for side information (D-54). Text wraps balanced. **Placement:** a notice that is the **result of an action** sits next to the control that did it — on a screen with a pinned bar, inside the bar above its button, in the band style of §3 (Home "ending soon", setup / add / request failures, the offer's "Couldn't turn on…", the case and calling bar notices); on a screen without a bar, 8 below the field or button it came from. A notice about **the bar's own action** — the result of the last tap, or why its button is disabled now (offline, "No cases right now") — is also in the bar. A notice about the **screen's general situation** (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending) stays at the top of the panel, not tied to a button. **Alignment (D-86, 2026-11-03):** the band inside the bar is centred (icon and text as a group, wrapped lines centred, balanced breaks kept); every other notice (top of page, inside sheets, in content) stays left-aligned. — *Design rules 9.5*

Decisions: D-33, D-54

<a id="d06"></a>
### d06 · Does a server answer stay when the doctor edits the number?

- signin.notRegistered: clears on new number · signin.offline: clears on new attempt · signin.couldntSend: clears on new attempt · signin.tooMany: clears on authoritative unlock · signin.inactive: clears on Ops resolution — *Message rules*
- Changing the number clears the server notice and the button goes back to Send OTP (an answer belongs to the number it was for); nothing is remembered per number on the phone: `if (changed && m.notice) { m.notice = null; m.button = "default"; }` — *Sign-in build*

Decisions: D-33

## Sending

<a id="d07"></a>
### d07 · What happens to the button and the field while the code is being sent?

- L2 — Loading primary buttons: brand-blue fill, white label, white spinner, on every screen (sign-in "Sending OTP", OTP "Verifying", any future loading primary). — *Design rules L2*
- **States:** pressed; disabled (design-system disabled style, exempt from contrast); busy (L2). Busy spinner → label gap is 8 on every busy button. A quiet action in progress shows text only ("Ending…"), no spinner. **Busy labels always end with "…"** ("Verifying…", "Sending OTP…") (D-54). — *Design rules 9.1*
- signin.sending: L1 — Send pending; disable duplicate send — *Feedback state map: signin.sending*

Decisions: D-46, D-54

## Limits

<a id="d08"></a>
### d08 · Too many attempts: what does the button show, and how long is the wait?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *App logic §2*
- **Open implementation detail:** Set limit-window length and reset rule with backend/ops. Keep wait time server-driven; the 09:42 screen timer is illustrative. — *D-35*
- Timer format is m:ss with no leading zero (9:42, never 09:42), everywhere. — *D-46*
- signin.too-many-tries: W1 — Issuance cap; wait for server eligibility, retain number — *Feedback state map: signin.too-many-tries*

Decisions: D-35, D-46

<a id="d09"></a>
### d09 · Which limits are enforced on the server and which in the app?

- All OTP limits are enforced by the server; the app only shows them. — *App logic §2*
- **Decision:** OTP issue cap is configurable. Start at 4 codes per mobile number in a server-enforced limit window, counting initial code and up to 3 resends. Do not reset count when the doctor restarts sign-in or changes number and returns. — *D-35*
- **Decision:** 5 server-confirmed wrong OTP submissions lock the attempted mobile number, not the doctor's account. The OTP screen keeps **Change number** available during the lock. Resending a code or restarting sign-in does not reset the wrong-try count. — *D-34*

Decisions: D-34, D-35

<a id="d10"></a>
### d10 · What happens when the doctor signs in with a number that is locked?

- **Sign-in on a locked number** goes straight to OTP in the locked state (`otp_locked`): code field and Verify off, the lock time and "call Doctor Ops" shown, Change still available (D-81 F6). — *App logic §2*
- signin.locked-number: W1 — Sign-in on a locked number goes to OTP in the locked state (`otp.locked`): code and Verify off, lock time and "call Doctor Ops", Change still available (D-81 F6) — *Feedback state map: signin.locked-number*

Decisions: D-81

## Inactive account

<a id="d11"></a>
### d11 · The account is inactive: what does the doctor see and what does the button do?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *App logic §2*
- signin.inactive: F2 access block — Server says inactive; Call Doctor Ops — *Feedback state map: signin.inactive*
- **Answered 2026-10-12:** Sign up → `https://pwa-doctor.truemeds.in/onboarding`. Doctor Ops / support WhatsApp: **+91 86524 24617** (`https://wa.me/918652424617`). Terms & Conditions and Privacy Policy stay dummy links. The number takes both voice calls and WhatsApp, so "Call Doctor Ops" (tel:) and "Message support" (WhatsApp) stay as approved. **Production:** sign-up URL, Terms, Privacy and support numbers must be configurable, not hard-coded. — *OQ-021*

Decisions: D-33

## Sign-up

<a id="d12"></a>
### d12 · Where does "Sign up" go, and what happens for a number that isn't registered?

- **Not registered:** sign-up requests aren't stored, so one message serves new and pending doctors (copy: `signin.notRegistered`). The keyboard closes on this answer so the footer Sign up is visible. Sign up appears once. — *D-33*
- signin.signupLink: onboarding page, new tab (OQ-021) — *Message rules*
- **Answered 2026-10-12:** Sign up → `https://pwa-doctor.truemeds.in/onboarding`. Doctor Ops / support WhatsApp: **+91 86524 24617** (`https://wa.me/918652424617`). Terms & Conditions and Privacy Policy stay dummy links. The number takes both voice calls and WhatsApp, so "Call Doctor Ops" (tel:) and "Message support" (WhatsApp) stay as approved. **Production:** sign-up URL, Terms, Privacy and support numbers must be configurable, not hard-coded. — *OQ-021*

Decisions: D-33

## Keyboard

<a id="d13"></a>
### d13 · Does the keyboard open by itself on Sign-in, and where is Send OTP when it is open?

- On sign-in the keyboard does not open by itself, and the main button is not pinned to the bottom. — *D-43*
- **Button placement:** on screens where the doctor types (sign-in, OTP), the main button sits **inline, directly under the content**, so it stays visible above the keyboard without moving. On screens without typing (faster sign-in offer, Home), the main button is **pinned to the bottom**. — *D-43*
- **Keyboard clearance:** keep at least 16px between the inline main button and an open keyboard. If the content does not fit, the content scrolls. — *Design rules 8.9*

Decisions: D-43, D-46

<a id="d14"></a>
### d14 · Which keyboard type and autofill hint does the field use?

- The field is a phone-number field with national-number autofill: `type: "tel", inputmode: "tel", autocomplete: "tel-national"` — *Sign-in build*

<a id="d15"></a>
### d15 · What happens to the keyboard and the sign-up line when a server answer arrives or the keyboard is open?

- **Not registered:** sign-up requests aren't stored, so one message serves new and pending doctors (copy: `signin.notRegistered`). The keyboard closes on this answer so the footer Sign up is visible. Sign up appears once. — *D-33*
- While the keyboard is open, the sign-up line is hidden (its space is kept): `[data-keyboard="true"] .login-signup { visibility: hidden; }` — *Sign-in build*
- On every server answer that stays on Sign-in, the keyboard closes: `input.blur();` — *Sign-in build*

Decisions: D-33

## Offline

<a id="d16"></a>
### d16 · What happens when the doctor taps Send OTP while offline?

- signin.offline: F2 after action; N1 passive — Restore connectivity, retry; retain number; one message — *Feedback state map: signin.offline*
- signin.offline: failed send offline; next: reconnect and retry; clears on new attempt; keeps the number — *Message rules*

Decisions: D-65, D-66

## Copy

<a id="d17"></a>
### d17 · Where does every word on the screen come from? Can I change copy?

- All on-screen text comes from `foundation/messages.ts`. Error, offline and busy states for every screen: the feedback map. — *App logic*
- **Titles never end with a full stop**. — *D-47*
- (1) **A message says what happened (and what is safe or kept); it does not repeat a button already on screen.** Instructions only when no control does it, to explain a blocked button, or to add timing. — *D-65*

Decisions: D-47, D-53, D-65

<a id="d18"></a>
### d18 · Is it "case" or "order"?

- **Wording: "case", never "order",** for the doctor's unit of work in the UI ("Request next case", "Release case", "Leave this case?"). The customer order ID stays ("Order 12345"); final CTA labels are in D-50. — *D-48*

Decisions: D-48

## Layout

<a id="d19"></a>
### d19 · What are the logo size and the spacing at the top of the screen?

- **Logo lockup size and place.** Every home-base screen with the "truemeds for doctors" lockup (`foundation/logo/truemeds-for-doctors.svg`, project level, §2.8) draws it **166px wide** (height follows the 220×54 artwork), **16px from the top**, and the logo→title gap stays as in §8.3 (L6). Nothing else sets the lockup size. — *Design rules 8.13*
- L6 — Sign-in logo-to-title gap: 48 (`--tm-space-3xl`), home-base hero gap. — *Design rules L6*
- **Side margin:** `--tm-space-page` (**16**, the design team's standard — changed from 24 on 2026-10-26, D-67) on every mobile screen, including the header, sheets and the action bar. Every block — fields, notices, cards, code boxes, buttons — shares the same left and right edges. — *Design rules 8.2*
- **Three gaps only:** tight `--tm-space-sm` (8): label↔field, field↔helper, and a result notice ↔ the control it came from · related `--tm-space-lg` (16): items within a group, **and cards stacked one above another — the same gap everywhere cards stack, on the case page, Prescribe and Profile** · section `--tm-space-2xl` (32): between groups. Spare vertical space goes between the content and a pinned button, never inside a group. Home-base screens use 3xl (48) as the hero gap between logo and title. — *Design rules 8.3*

Decisions: D-46, D-61, D-67

<a id="d20"></a>
### d20 · Which type sizes does the screen use?

- L1 — Screen title: `.tm-text-title-lg` 32/40 semibold — *Design rules 8.1*
- L2 — Key content (values, names, the thing acted on): `.tm-text-body-lg-strong` where emphasis matters) — *Design rules 8.1*
- L3 — Supporting text (descriptions, helper, status lines): `.tm-text-body-md--tm-content-secondary` — *Design rules 8.1*
- L4 — Field helper and field error text: 14/20 (`.tm-field__helper`). — *Design rules L4*
- L5 — Notice text (`.tm-notice`): 14/20. — *Design rules L5*

Decisions: D-43, D-46

## Accessibility

<a id="d21"></a>
### d21 · What are the accessibility rules (targets, contrast, focus, names)?

- **Tap targets:** **48px minimum** for everything tappable that is not a link inside a sentence: icon buttons (✕, ?, Back, zoom), buttons, chips, rows, toggles, standalone links. Enlarge the hit area, not the text. Meets Android (48dp) and iOS (44pt); WCAG 2.5.8's floor is 24px. Links inside a sentence follow WCAG 2.5.8's inline exception. — *Design rules 8.6*
- **Contrast:** all text meets WCAG AA (4.5:1; 3:1 for 24px+ or 18.66px+ bold) on the surface it sits on, including tinted bands and notices. Blue means "tap me" (§2.5): links are always `--tm-content-brand`, never grey-and-underlined. Disabled controls are exempt from the contrast rule (WCAG 1.4.3) and keep the design-system disabled style. — *Design rules 8.7*
- **Visible focus ring** on buttons, links and tappable rows. Text fields and the OTP code show focus with their own border (no outline on top); a sheet or screen focused by script shows no outline (D-54). — *Design rules 9.8*
- A field error is announced (role alert); notices use the roles listed in d05: `if (m.error) helper.setAttribute("role", "alert")` — *Sign-in build*

Decisions: D-54

## Fonts

<a id="d22"></a>
### d22 · Which font, which weights?

- **One font:** Plus Jakarta Sans (comes with the design system). No system-font stacks, no second typeface. — *Design rules 2.3*
- tokens.font.family is "Plus Jakarta Sans". Weights this screen uses: tokens.font.weight.semibold = 600, tokens.font.weight.regular = 400. Font files and setup: foundation/fonts/FONTS.md. — *Tokens*

## Tokens

<a id="d23"></a>
### d23 · Can I use a hex colour, a palette colour or a pixel value that matches a token?

- **No raw values.** No hex codes, no `rgb`, no ad-hoc px for colour, radius, spacing or shadow in project code. If a value isn't a token, it isn't allowed. — *Design rules 2.1*
- **Semantic tokens only.** Use `--tm-content-*`, `--tm-surface-*`, `--tm-border-*`, `--tm-feedback-*`, `--tm-space-*`, `--tm-radius-*`. Never use `--tm-core-*` (the raw palette) in a project. — *Design rules 2.2*

## Buttons

<a id="d24"></a>
### d24 · How many primary buttons, and what do the button labels look like?

- **One primary button per context.** Other actions use the button roles in §9.1: secondary → quiet (and destructive where something is removed or closed for good). — *Design rules 2.6*
- **Labels:** verb first, sentence case, no full stop, never "Click" / "Tap". — *Design rules 9.1*
- **One height per group** — differ by style, not size (Apple HIG). Full-width action buttons in a pinned bar, sheet or form: **56px, 18 semibold**, whatever their role. Compact inline buttons (e.g. "View Rx" in a content row): **48px, 16 semibold**. — *Design rules 9.1*

Decisions: D-54

## Journey

<a id="d25"></a>
### d25 · Where does Sign-in sit in the app, and where does it go next?

- Sign-in — Enter a mobile number, get an OTP: — *App logic §1*
- Order on first use: Sign-in → OTP → (offer, once) → Home → Case. Returning doctor with faster sign-in on: Unlock → Home. A doctor with a case open goes straight back into the case (D-48). — *App logic §1*

Decisions: D-48

## Notices

<a id="d26"></a>
### d26 · How do notices wrap and where do they sit?

- **Notices** wrap balanced, set centrally. — *App logic §10*
- **Notice** — Neutral / warning / error (L5); stays until the cause is gone. **Warning** when something blocks the main action or runs on a timer (offline, locks, near expiry); **error** when an action failed; **neutral** only for side information (D-54). Text wraps balanced. **Placement:** a notice that is the **result of an action** sits next to the control that did it — on a screen with a pinned bar, inside the bar above its button, in the band style of §3 (Home "ending soon", setup / add / request failures, the offer's "Couldn't turn on…", the case and calling bar notices); on a screen without a bar, 8 below the field or button it came from. A notice about **the bar's own action** — the result of the last tap, or why its button is disabled now (offline, "No cases right now") — is also in the bar. A notice about the **screen's general situation** (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending) stays at the top of the panel, not tied to a button. **Alignment (D-86, 2026-11-03):** the band inside the bar is centred (icon and text as a group, wrapped lines centred, balanced breaks kept); every other notice (top of page, inside sheets, in content) stays left-aligned. — *Design rules 9.5*

Decisions: D-86


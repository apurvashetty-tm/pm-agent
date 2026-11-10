# DECIDED

Questions already answered, by screen. **Check here before asking.** Each answer quotes its source; `D-xx` is a product decision number. `[MOCK]` = the prototype's own value or behaviour (it runs on a fake backend): build it, keep it configurable, and don't treat it as a production promise.
Generated from the product rules — do not edit by hand.

## Sign-in

| # | Topic | Question |
|---|---|---|
| [d01](#d01) | Input and paste | What does the mobile field accept, and how are typed or pasted numbers cleaned? |
| [d02](#d02) | Validation | Which checks run, in what order, and when does each error appear? |
| [d03](#d03) | Validation | When does an error clear? |
| [d04](#d04) | Errors | Where do errors show, and what does the field look like in error? |
| [d05](#d05) | Server answers | What can the server answer after Send OTP, and how is each answer shown? |
| [d06](#d06) | Server answers | Does a server answer stay when the doctor edits the number? |
| [d28](#d28) | Errors | What colour is the placeholder text in the field? |
| [o06](#o06) | Limits | When the "Try again in m:ss" countdown ends, does the notice stay or go? |
| [o13](#o13) | Tokens | Which token is the busy spinner's ring? |
| [o14](#o14) | Logo | react-native-svg may not draw the image the logo SVG embeds. What do we use on the phone? |
| [o20](#o20) | Layout | Is a server notice 8 or 16 below the field? |
| [d29](#d29) | Tokens | Border widths, the focus ring, icon and spinner sizes and the logo width: are there tokens? |
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
| [o01](#o01) | Limits | How long are the OTP issue window, the number lock and the code life in production? |
| [o02](#o02) | Limits | How long is the "Try again in m:ss" wait after too many attempts? |
| [o03](#o03) | Server answers | Send OTP again for the same number while the resend wait is still running: what does the server answer? |
| [o04](#o04) | Validation | More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message? |
| [o05](#o05) | Offline | Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)? |
| [o07](#o07) | Safe areas | Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)? |
| [o08](#o08) | Navigation | Android back gesture on Sign-in (the first screen): leave the app, or stay? |
| [o09](#o09) | Keyboard | The prototype draws a number keyboard in its pictures. Do we draw one? |
| [o10](#o10) | Edit after return | Coming back from OTP (Change): is the number kept, and does the first typed digit replace it? |
| [o11](#o11) | Links | Terms, Privacy and support links: final URLs, and where are they configured? |
| [o15](#o15) | Server answers | Send OTP API: endpoint, request and the shape of each answer (sent, locked, not registered, couldn't send, too many attempts, inactive). Does "too many attempts" return an end time or seconds left? |
| [o16](#o16) | Server answers | How long does the app wait for Send OTP before showing "Couldn't send the code."? |
| [o17](#o17) | Sign-up | On the phone, does Sign up open the system browser or a browser inside the app? |
| [o18](#o18) | Server answers | If the doctor changes the number and then types the old one back, should its earlier answer (too many attempts, inactive) show again without a new Send OTP? |
| [o19](#o19) | Platform | Some web styles have no native equivalent: balanced line breaks for titles and notices (iOS), the subtitle's 31-character width limit, and the 2px focus ring for hardware keyboards. Drop or approximate? |
| [o21](#o21) | Accessibility | Is "New to Truemeds? Sign up" a link inside a sentence (exempt from the 48 tap target) or a standalone link (48 tall)? |
| [o22](#o22) | Platform | Should text grow with the phone's font-size setting (dynamic type), and is there a dark mode? |
| [o23](#o23) | Platform | Expo or bare React Native CLI, and which navigation library? |
| [o24](#o24) | Motion | How fast does the busy spinner turn, and does it stop when the phone's reduce-motion setting is on? |
| [o25](#o25) | Copy | "New to Truemeds?" and "Sign up" are two copy entries; the space between them is typed in code. One entry with a {link} placeholder instead? |
| [o26](#o26) | Inactive account | What does "Call Doctor Ops" do on a device that can't make calls (tablet, no SIM)? |
| [o12](#o12) | Session | How long does a signed-in session last before OTP is asked again? |

<a id="d01"></a>
### d01 · What does the mobile field accept, and how are typed or pasted numbers cleaned?

- Typing and pasting are cleaned: "+91 98765-43210", "098765 43210" → `9876543210`. A leading 0 or 91 is dropped. More than 10 digits left after that is **not cut** (D-101 o04). — *Source: App logic §2*
- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *Source: D-39*
- **Leading 0** is a dialling habit, not an error; it is dropped once all 10 digits are in ("0 + 9 digits" → "Enter all 10 digits."). — *Source: D-39*
- A leading 91 is dropped only when more than 10 digits were entered (a 10-digit number starting 91 is kept): `if (d.length > MOBILE_LENGTH && d.startsWith("91")) d = d.slice(2);` — *Source: Sign-in build*
- More than 10 digits are never cut; the field shows the error signin.long: `if (d.length > MOBILE_LENGTH) return "signin.long";` — *Source: Sign-in build*

Decisions: D-33, D-39, D-101

<a id="d02"></a>
### d02 · Which checks run, in what order, and when does each error appear?

- Checks, most basic first: empty → "Enter your mobile number." · more than 10 digits → "That’s more than 10 digits. Check the number." (shown as soon as it's typed, whatever the first digit; same place and style as the other field errors, D-101 o04) · first digit not 6/7/8/9 → "Mobile numbers start with 6, 7, 8 or 9." (shown as soon as it's typed) · fewer than 10 digits → "Enter all 10 digits." (shown on Send OTP). Once an error shows, it re-checks on every keystroke. — *Source: App logic §2*
- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *Source: D-39*

Decisions: D-39

<a id="d03"></a>
### d03 · When does an error clear?

- Format errors follow one pattern. Impossible input is blocked silently (digits only, maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP / Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on every keystroke and stays until the value is valid. — *Source: D-39*
- signin.empty: clears on valid edit; keeps the number · signin.short: clears on valid edit; keeps the number · signin.prefix: clears on valid edit; keeps the number — *Source: Message rules*

Decisions: D-39

<a id="d04"></a>
### d04 · Where do errors show, and what does the field look like in error?

- **Errors:** typing problems turn the field red and replace the helper line (empty, under 10 digits, first digit not 6–9). Problems after sending show a notice in the same spot and leave the field neutral: not registered (info), offline (warning), couldn't send (error), too many requests (warning + button counts down), inactive account (error + Call Doctor Ops). No toasts. Pasted or autofilled numbers are cleaned to 10 digits. — *Source: D-33*
- **Field error** — Under the field (L4, L7). — *Source: Design rules 9.5*
- L4 — Field helper and field error text: 14/20 (`.tm-field__helper`). — *Source: Design rules L4*
- L7 — Field helper/error text aligns with its field: left under full-width fields, centred under the centred OTP code boxes (D-47). — *Source: Design rules L7*

Decisions: D-33, D-46, D-47

<a id="d05"></a>
### d05 · What can the server answer after Send OTP, and how is each answer shown?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *Source: App logic §2*
- not-registered: neutral notice, icon `info-circle`, copy `signin.notRegistered`, role="status" · offline: warning notice, icon `alert-triangle`, copy `signin.offline`, role="alert" · couldnt-send: error notice, icon `alert-circle`, copy `signin.couldntSend`, role="alert" · too-many-tries: warning notice, icon `clock`, copy `signin.tooMany`, role="alert" · inactive: error notice, icon `alert-circle`, copy `signin.inactive`, role="alert" — *Source: Sign-in screen*
- **Notice** — Neutral / warning / error (L5); stays until the cause is gone. **Warning** when something blocks the main action or runs on a timer (offline, locks, near expiry); **error** when an action failed; **neutral** only for side information (D-54). Text wraps balanced. **Placement:** a notice that is the **result of an action** sits next to the control that did it — on a screen with a pinned bar, inside the bar above its button, in the band style of §3 (Home "ending soon", setup / add / request failures, the offer's "Couldn't turn on…", the case and calling bar notices); on a screen without a bar, 16 below the field it came from (D-98) or 8 below the button. A notice about **the bar's own action** — the result of the last tap, or why its button is disabled now (offline, "No cases right now") — is also in the bar. A notice about the **screen's general situation** (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending) stays at the top of the panel, not tied to a button. **Alignment (D-86, 2026-11-03):** the band inside the bar is centred (icon and text as a group, wrapped lines centred, balanced breaks kept); every other notice (top of page, inside sheets, in content) stays left-aligned. — *Source: Design rules 9.5*

Decisions: D-33, D-54

<a id="d06"></a>
### d06 · Does a server answer stay when the doctor edits the number?

- signin.notRegistered: clears on new number · signin.offline: clears on new attempt · signin.couldntSend: clears on new attempt · signin.tooMany: clears on authoritative unlock · signin.inactive: clears on Ops resolution — *Source: Message rules*
- Changing the number clears the server notice and the button goes back to Send OTP (an answer belongs to the number it was for); nothing is remembered per number on the phone: `if (changed && m.notice) { m.notice = null; m.button = "default"; }` — *Source: Sign-in build*

Decisions: D-33

<a id="d28"></a>
### d28 · What colour is the placeholder text in the field?

- tokens.color.content.placeholder (web --tm-content-placeholder): `.tm-field__control ::placeholder { color: var(--tm-content-placeholder); }` — *Source: Design system*

Decisions: D-78 (the approved screens and app logic)

<a id="o06"></a>
### o06 · When the "Try again in m:ss" countdown ends, does the notice stay or go?

- When the "Try again in m:ss" countdown ends, the "Too many attempts" notice goes away and **Send OTP** works again (D-98). — *Source: App logic §2*
- The build does exactly that: `if (clock.now() >= m.until) { m.button = "default"; m.notice = null; }` — *Source: Sign-in build*

Decisions: D-98

<a id="o13"></a>
### o13 · Which token is the busy spinner's ring?

- The busy spinner ring uses `--tm-content-inverse` instead of `#fff` (same white). — *Source: D-98*
- Ring width tokens.spinner.ring, colour tokens.color.content.inverse, box tokens.spinner.size: `border: var(--tm-spinner-ring) solid var(--tm-content-inverse)` — *Source: Design system*

Decisions: D-98

<a id="o14"></a>
### o14 · react-native-svg may not draw the image the logo SVG embeds. What do we use on the phone?

- The native logo ships as PNG exports of the locked SVG (no redraw). — *Source: D-98*
- PNG exports in foundation/brand/ (truemeds-for-doctors.png with the @1x / @2x / @3x density suffixes: 166, 332, 498 px wide), drawn tokens.logoLockup.width wide; source SVG and its sha256 in foundation/brand/logo.json. — *Source: Kit*

Decisions: D-98, D-02

<a id="o20"></a>
### o20 · Is a server notice 8 or 16 below the field?

- The notice sits 16 below the field as the approved pictures show, and RULES §8.3 wording is corrected. — *Source: D-98*
- **Three gaps only:** tight `--tm-space-sm` (8): label↔field, field↔helper, and a result notice ↔ the button it came from. **A result notice under a field sits 16 below the field** (the field's 8 gap plus the notice's 8; D-98) · related `--tm-space-lg` (16): items within a group, **and cards stacked one above another — the same gap everywhere cards stack, on the case page, Prescribe and Profile** · section `--tm-space-2xl` (32): between groups. Spare vertical space goes between the content and a pinned button, never inside a group. Home-base screens use 3xl (48) as the hero gap between logo and title. — *Source: Design rules 8.3*

Decisions: D-98

<a id="d29"></a>
### d29 · Border widths, the focus ring, icon and spinner sizes and the logo width: are there tokens?

- (1) Sizes the Sign-in kit found with no token become design-system tokens (border width, focus ring width and offset, logo lockup width, icon sizes incl. the notice icon 20, spinner size and ring), listed in as `[PROPOSED]`. — *Source: D-98*
- tokens.borderWidth.default, tokens.focusRing.width / .offset, tokens.iconSize.sm / .md / .lg, tokens.spinner.size / .ring, tokens.logoLockup.width. The +91 prefix is messages['signin.phonePrefix']; the logo's accessible name is messages['signin.logoAlt']. — *Source: Tokens*

Decisions: D-98

<a id="d27"></a>
### d27 · Can a field error and a server notice show at the same time?

- **Errors:** typing problems turn the field red and replace the helper line (empty, under 10 digits, first digit not 6–9). Problems after sending show a notice in the same spot and leave the field neutral: not registered (info), offline (warning), couldn't send (error), too many requests (warning + button counts down), inactive account (error + Call Doctor Ops). No toasts. Pasted or autofilled numbers are cleaned to 10 digits. — *Source: D-33*
- **Rule** — One message per cause — never field error + notice + toast for the same thing. — *Source: Design rules 9.5*
- No. The notice and the helper / error line share one spot; typing a different number removes the notice first, then the format check runs: `helper.hidden = !!m.notice;` — *Source: Sign-in build*

Decisions: D-33

<a id="d07"></a>
### d07 · What happens to the button and the field while the code is being sent?

- L2 — Loading primary buttons: brand-blue fill, white label, white spinner, on every screen (sign-in "Sending OTP", OTP "Verifying", any future loading primary). — *Source: Design rules L2*
- **States:** pressed; disabled (design-system disabled style, exempt from contrast); busy (L2). Busy spinner → label gap is 8 on every busy button. A quiet action in progress shows text only ("Ending…"), no spinner. **Busy labels always end with "…"** ("Verifying…", "Sending OTP…") (D-54). — *Source: Design rules 9.1*
- signin.sending: L1 — Send pending; disable duplicate send — *Source: Feedback state map: signin.sending*

Decisions: D-46, D-54

<a id="d08"></a>
### d08 · Too many attempts: what does the button show, and how long is the wait?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *Source: App logic §2*
- **Open implementation detail:** Set limit-window length and reset rule with backend/ops. Keep wait time server-driven; the 09:42 screen timer is illustrative. — *Source: D-35*
- Timer format is m:ss with no leading zero (9:42, never 09:42), everywhere. — *Source: D-46*
- Minutes are not capped, so 75 minutes shows 75:00; the time is rounded up, so it never shows 0:00 while waiting: `return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;` — *Source: Sign-in build*
- signin.too-many-tries: W1 — Issuance cap; wait for server eligibility, retain number — *Source: Feedback state map: signin.too-many-tries*

Decisions: D-35, D-46

<a id="d09"></a>
### d09 · Which limits are enforced on the server and which in the app?

- All OTP limits are enforced by the server; the app only shows them. — *Source: App logic §2*
- **Decision:** OTP issue cap is configurable. Start at 4 codes per mobile number in a server-enforced limit window, counting initial code and up to 3 resends. Do not reset count when the doctor restarts sign-in or changes number and returns. — *Source: D-35*
- **Decision:** 5 server-confirmed wrong OTP submissions lock the attempted mobile number, not the doctor's account. The OTP screen keeps **Change number** available during the lock. Resending a code or restarting sign-in does not reset the wrong-try count. — *Source: D-34*

Decisions: D-34, D-35

<a id="d10"></a>
### d10 · What happens when the doctor signs in with a number that is locked?

- **Sign-in on a locked number** goes straight to OTP in the locked state (`otp_locked`): code field and Verify off, the lock time and "call Doctor Ops" shown, Change still available (D-81 F6). — *Source: App logic §2*
- signin.locked-number: W1 — Sign-in on a locked number goes to OTP in the locked state (`otp.locked`): code and Verify off, lock time and "call Doctor Ops", Change still available (D-81 F6) — *Source: Feedback state map: signin.locked-number*

Decisions: D-81

<a id="d11"></a>
### d11 · The account is inactive: what does the doctor see and what does the button do?

- After sending, server results show as a notice: not registered (with the sign-up route), offline, couldn't send, too many attempts (button counts down "Try again in m:ss"), account inactive (button becomes **Call Doctor Ops**). — *Source: App logic §2*
- signin.inactive: F2 access block — Server says inactive; Call Doctor Ops — *Source: Feedback state map: signin.inactive*
- **Answered 2026-10-12:** Sign up → `https://pwa-doctor.truemeds.in/onboarding`. Doctor Ops / support WhatsApp: **+91 86524 24617** (`https://wa.me/918652424617`). Terms & Conditions and Privacy Policy stay dummy links. The number takes both voice calls and WhatsApp, so "Call Doctor Ops" (tel:) and "Message support" (WhatsApp) stay as approved. **Production:** sign-up URL, Terms, Privacy and support numbers must be configurable, not hard-coded. — *Source: OQ-021*

Decisions: D-33

<a id="d12"></a>
### d12 · Where does "Sign up" go, and what happens for a number that isn't registered?

- **Not registered:** sign-up requests aren't stored, so one message serves new and pending doctors (copy: `signin.notRegistered`). The keyboard closes on this answer so the footer Sign up is visible. Sign up appears once. — *Source: D-33*
- signin.signupLink: onboarding page, new tab (OQ-021) — *Source: Message rules*
- **Answered 2026-10-12:** Sign up → `https://pwa-doctor.truemeds.in/onboarding`. Doctor Ops / support WhatsApp: **+91 86524 24617** (`https://wa.me/918652424617`). Terms & Conditions and Privacy Policy stay dummy links. The number takes both voice calls and WhatsApp, so "Call Doctor Ops" (tel:) and "Message support" (WhatsApp) stay as approved. **Production:** sign-up URL, Terms, Privacy and support numbers must be configurable, not hard-coded. — *Source: OQ-021*

Decisions: D-33

<a id="d13"></a>
### d13 · Does the keyboard open by itself on Sign-in, and where is Send OTP when it is open?

- On sign-in the keyboard does not open by itself, and the main button is not pinned to the bottom. — *Source: D-43*
- **Button placement:** on screens where the doctor types (sign-in, OTP), the main button sits **inline, directly under the content**, so it stays visible above the keyboard without moving. On screens without typing (faster sign-in offer, Home), the main button is **pinned to the bottom**. — *Source: D-43*
- **Keyboard clearance:** keep at least 16px between the inline main button and an open keyboard. If the content does not fit, the content scrolls. — *Source: Design rules 8.9*

Decisions: D-43, D-46

<a id="d14"></a>
### d14 · Which keyboard type and autofill hint does the field use?

- The field is a phone-number field with national-number autofill: `type: "tel", inputmode: "tel", autocomplete: "tel-national"` — *Source: Sign-in build*

Decisions: D-78 (the approved screens and app logic)

<a id="d15"></a>
### d15 · What happens to the keyboard and the sign-up line when a server answer arrives or the keyboard is open?

- **Not registered:** sign-up requests aren't stored, so one message serves new and pending doctors (copy: `signin.notRegistered`). The keyboard closes on this answer so the footer Sign up is visible. Sign up appears once. — *Source: D-33*
- While the keyboard is open, the sign-up line is hidden (its space is kept): `[data-keyboard="true"] .login-signup { visibility: hidden; }` — *Source: Sign-in build*
- On every server answer that stays on Sign-in, the keyboard closes: `input.blur();` — *Source: Sign-in build*

Decisions: D-33

<a id="d16"></a>
### d16 · What happens when the doctor taps Send OTP while offline?

- signin.offline: F2 after action; N1 passive — Restore connectivity, retry; retain number; one message — *Source: Feedback state map: signin.offline*
- signin.offline: failed send offline; next: reconnect and retry; clears on new attempt; keeps the number — *Source: Message rules*

Decisions: D-65, D-66

<a id="d17"></a>
### d17 · Where does every word on the screen come from? Can I change copy?

- All on-screen text comes from `foundation/messages.ts`. Error, offline and busy states for every screen: the feedback map. — *Source: App logic*
- **Titles never end with a full stop**. — *Source: D-47*
- (1) **A message says what happened (and what is safe or kept); it does not repeat a button already on screen.** Instructions only when no control does it, to explain a blocked button, or to add timing. — *Source: D-65*

Decisions: D-47, D-53, D-65

<a id="d18"></a>
### d18 · Is it "case" or "order"?

- **Wording: "case", never "order",** for the doctor's unit of work in the UI ("Request next case", "Release case", "Leave this case?"). The customer order ID stays ("Order 12345"); final CTA labels are in D-50. — *Source: D-48*

Decisions: D-48

<a id="d19"></a>
### d19 · What are the logo size and the spacing at the top of the screen?

- **Logo lockup size and place.** Every home-base screen with the "truemeds for doctors" lockup (`foundation/logo/truemeds-for-doctors.svg`, project level, §2.8) draws it **166px wide** (height follows the 220×54 artwork), **16px from the top**, and the logo→title gap stays as in §8.3 (L6). Nothing else sets the lockup size. — *Source: Design rules 8.13*
- L6 — Sign-in logo-to-title gap: 48 (`--tm-space-3xl`), home-base hero gap. — *Source: Design rules L6*
- **Side margin:** `--tm-space-page` (**16**, the design team's standard — changed from 24 on 2026-10-26, D-67) on every mobile screen, including the header, sheets and the action bar. Every block — fields, notices, cards, code boxes, buttons — shares the same left and right edges. — *Source: Design rules 8.2*
- **Three gaps only:** tight `--tm-space-sm` (8): label↔field, field↔helper, and a result notice ↔ the button it came from. **A result notice under a field sits 16 below the field** (the field's 8 gap plus the notice's 8; D-98) · related `--tm-space-lg` (16): items within a group, **and cards stacked one above another — the same gap everywhere cards stack, on the case page, Prescribe and Profile** · section `--tm-space-2xl` (32): between groups. Spare vertical space goes between the content and a pinned button, never inside a group. Home-base screens use 3xl (48) as the hero gap between logo and title. — *Source: Design rules 8.3*

Decisions: D-46, D-61, D-67

<a id="d20"></a>
### d20 · Which type sizes does the screen use?

- L1 — Screen title: `.tm-text-title-lg` 32/40 semibold — *Source: Design rules 8.1*
- L2 — Key content (values, names, the thing acted on): `.tm-text-body-lg` 16/24 (or `-strong` where emphasis matters) — *Source: Design rules 8.1*
- L3 — Supporting text (descriptions, helper, status lines): `.tm-text-body-md` 14/20, `--tm-content-secondary` — *Source: Design rules 8.1*
- L4 — Field helper and field error text: 14/20 (`.tm-field__helper`). — *Source: Design rules L4*
- L5 — Notice text (`.tm-notice`): 14/20. — *Source: Design rules L5*

Decisions: D-43, D-46

<a id="d21"></a>
### d21 · What are the accessibility rules (targets, contrast, focus, names)?

- **Tap targets:** **48px minimum** for everything tappable that is not a link inside a sentence: icon buttons (✕, ?, Back, zoom), buttons, chips, rows, toggles, standalone links. Enlarge the hit area, not the text. Meets Android (48dp) and iOS (44pt); WCAG 2.5.8's floor is 24px. Links inside a sentence follow WCAG 2.5.8's inline exception. — *Source: Design rules 8.6*
- **Contrast:** all text meets WCAG AA (4.5:1; 3:1 for 24px+ or 18.66px+ bold) on the surface it sits on, including tinted bands and notices. Blue means "tap me" (§2.5): links are always `--tm-content-brand`, never grey-and-underlined. Disabled controls are exempt from the contrast rule (WCAG 1.4.3) and keep the design-system disabled style. — *Source: Design rules 8.7*
- **Visible focus ring** on buttons, links and tappable rows. Text fields and the OTP code show focus with their own border (no outline on top); a sheet or screen focused by script shows no outline (D-54). — *Source: Design rules 9.8*
- A field error is announced (role alert); notices use the roles listed in d05: `if (m.error) helper.setAttribute("role", "alert")` — *Source: Sign-in build*

Decisions: D-54

<a id="d22"></a>
### d22 · Which font, which weights?

- **One font:** Plus Jakarta Sans (comes with the design system). No system-font stacks, no second typeface. — *Source: Design rules 2.3*
- tokens.font.family is "Plus Jakarta Sans". Weights this screen uses: tokens.font.weight.semibold = 600, tokens.font.weight.regular = 400. Font files and setup: foundation/fonts/FONTS.md. — *Source: Tokens*

Decisions: D-78 (the approved screens and app logic)

<a id="d23"></a>
### d23 · Can I use a hex colour, a palette colour or a pixel value that matches a token?

- **No raw values.** No hex codes, no `rgb`, no typed numbers for colour, spacing, radius, shadow, **sizes, border widths, timing, layering (z-index) or opacity** in component or project code (D-99). If a value isn't a token, it isn't allowed. Use a token by meaning, not by value (a 20px text line is `--tm-font-lineheight-sm`, not an icon size). Allowed exceptions carry a same-line `/* raw-ok: <reason> */` marker: geometry (`50%` centring, `100%`, `100vh`, `rotate(360deg)`, `line-height: 1`), optical nudges of 1–3px, the 31ch text measure, the hidden OTP input's 16px (stops iPhone zoom), reduced-motion `0.01ms`, `@media` widths, and prototype-only drawings (the drawn keyboard). Not scanned:,, the mock Rx paper, reference files and the `[DEPRECATED]` legacy `.tm-otp` block. — *Source: Design rules 2.1*
- **Semantic tokens only.** Use `--tm-content-*`, `--tm-surface-*`, `--tm-border-*`, `--tm-feedback-*`, `--tm-space-*`, `--tm-radius-*`. Never use `--tm-core-*` (the raw palette) in a project. — *Source: Design rules 2.2*

Decisions: D-78 (the approved screens and app logic)

<a id="d24"></a>
### d24 · How many primary buttons, and what do the button labels look like?

- **One primary button per context.** Other actions use the button roles in §9.1: secondary → quiet (and destructive where something is removed or closed for good). — *Source: Design rules 2.6*
- **Labels:** verb first, sentence case, no full stop, never "Click" / "Tap". — *Source: Design rules 9.1*
- **One height per group** — differ by style, not size (Apple HIG). Full-width action buttons in a pinned bar, sheet or form: **56px, 18 semibold**, whatever their role. Compact inline buttons (e.g. "View Rx" in a content row): **48px, 16 semibold**. — *Source: Design rules 9.1*

Decisions: D-54

<a id="d25"></a>
### d25 · Where does Sign-in sit in the app, and where does it go next?

- Sign-in — Enter a mobile number, get an OTP: — *Source: App logic §1*
- Order on first use: Sign-in → OTP → (offer, once) → Home → Case. Returning doctor with faster sign-in on: Unlock → Home. A doctor with a case open goes straight back into the case (D-48). — *Source: App logic §1*

Decisions: D-48

<a id="d26"></a>
### d26 · How do notices wrap and where do they sit?

- **Notices** wrap balanced, set centrally. — *Source: App logic §10*
- **Notice** — Neutral / warning / error (L5); stays until the cause is gone. **Warning** when something blocks the main action or runs on a timer (offline, locks, near expiry); **error** when an action failed; **neutral** only for side information (D-54). Text wraps balanced. **Placement:** a notice that is the **result of an action** sits next to the control that did it — on a screen with a pinned bar, inside the bar above its button, in the band style of §3 (Home "ending soon", setup / add / request failures, the offer's "Couldn't turn on…", the case and calling bar notices); on a screen without a bar, 16 below the field it came from (D-98) or 8 below the button. A notice about **the bar's own action** — the result of the last tap, or why its button is disabled now (offline, "No cases right now") — is also in the bar. A notice about the **screen's general situation** (unlock "isn't available", Home idle-expired, manually ended, expired-pending, stop-pending) stays at the top of the panel, not tied to a button. **Alignment (D-86, 2026-11-03):** the band inside the bar is centred (icon and text as a group, wrapped lines centred, balanced breaks kept); every other notice (top of page, inside sheets, in content) stays left-aligned. — *Source: Design rules 9.5*

Decisions: D-86

<a id="o01"></a>
### o01 · How long are the OTP issue window, the number lock and the code life in production?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend + Product. — *Source: Prototype [MOCK]*
- Code life and issue window 10 min (`otpWindow`), number lock 15 min after the 5th server-confirmed wrong code (`otpLock`, D-34), resend waits 30 s → 1 min → 2 min (`resendWaits`), 4 codes per window (D-35). `[MOCK ASSUMPTION]` — *Source: Prototype setting [MOCK]*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101, OQ-017, D-34, D-35

<a id="o02"></a>
### o02 · How long is the "Try again in m:ss" wait after too many attempts?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend. — *Source: Prototype [MOCK]*
- The server sends the time the wait ends; the prototype uses otpWindow, otpLock, resendWaits, tooManyTriesWait as stand-ins (mock values, not product promises). — *Source: Sign-in build*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101, OQ-017, D-35

<a id="o03"></a>
### o03 · Send OTP again for the same number while the resend wait is still running: what does the server answer?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend. — *Source: Prototype [MOCK]*
- Assumed: no new code is sent; OTP opens on the running wait and the code already sent stays valid. — *Source: Sign-in build*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101

<a id="o04"></a>
### o04 · More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message?

- More than 10 digits that aren't a +91 / 0 prefix → show "That’s more than 10 digits. Check the number." instead of cutting silently. — *Source: D-101*

Decisions: D-101, D-39

<a id="o05"></a>
### o05 · Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)?

- No passive offline notice on Sign-in; the notice shows only after Send OTP. — *Source: D-101*

Decisions: D-101, D-65

<a id="o07"></a>
### o07 · Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)?

- The logo's 16 from the top is measured from the **safe area** (below the status bar / notch). — *Source: D-101*

Decisions: D-101, D-61

<a id="o08"></a>
### o08 · Android back gesture on Sign-in (the first screen): leave the app, or stay?

- Android back on Sign-in (the first screen) **leaves the app**. — *Source: D-101*

Decisions: D-101

<a id="o09"></a>
### o09 · The prototype draws a number keyboard in its pictures. Do we draw one?

- Prototype only: no action for the app. — *Source: D-101 (amended)*
- No: the pictures show the phone's own number keyboard; the app uses the system keyboard (type tel). — *Source: Sign-in build*

Decisions: D-101

<a id="o10"></a>
### o10 · Coming back from OTP (Change): is the number kept, and does the first typed digit replace it?

- Coming back from OTP via Change keeps the number and it edits normally (the first typed digit does **not** replace it). — *Source: D-101*

Decisions: D-101

<a id="o11"></a>
### o11 · Terms, Privacy and support links: final URLs, and where are they configured?

- Terms → `https://www.truemeds.in/legal/terms-and-conditions`, Privacy → `https://www.truemeds.in/legal/privacy-policy` (placeholders, linked from the live Terms page), configurable from the server, not typed into the app. — *Source: D-101*

Decisions: D-101, OQ-021

<a id="o15"></a>
### o15 · Send OTP API: endpoint, request and the shape of each answer (sent, locked, not registered, couldn't send, too many attempts, inactive). Does "too many attempts" return an end time or seconds left?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend. — *Source: Prototype [MOCK]*
- The web build fakes the server; it receives an end time for the wait. No contract exists yet. — *Source: Sign-in build*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101, D-35

<a id="o16"></a>
### o16 · How long does the app wait for Send OTP before showing "Couldn't send the code."?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend + Product. — *Source: Prototype [MOCK]*
- No timeout is defined; the web build answers at once. — *Source: Sign-in build*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101

<a id="o17"></a>
### o17 · On the phone, does Sign up open the system browser or a browser inside the app?

- Sign up opens a browser **inside the app** (with a close button). — *Source: D-101*

Decisions: D-101, OQ-021

<a id="o18"></a>
### o18 · If the doctor changes the number and then types the old one back, should its earlier answer (too many attempts, inactive) show again without a new Send OTP?

- Nothing is remembered per number; an earlier answer shows again only after a new Send OTP. — *Source: D-101*

Decisions: D-101

<a id="o19"></a>
### o19 · Some web styles have no native equivalent: balanced line breaks for titles and notices (iOS), the subtitle's 31-character width limit, and the 2px focus ring for hardware keyboards. Drop or approximate?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Design. — *Source: Prototype [MOCK]*
- Titles and notices wrap balanced (L8, d26); focus ring on buttons and links (d21). — *Source: Design rules*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101, D-47

<a id="o21"></a>
### o21 · Is "New to Truemeds? Sign up" a link inside a sentence (exempt from the 48 tap target) or a standalone link (48 tall)?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Design. — *Source: Prototype [MOCK]*
- **Tap targets:** **48px minimum** for everything tappable that is not a link inside a sentence: icon buttons (✕, ?, Back, zoom), buttons, chips, rows, toggles, standalone links. Enlarge the hit area, not the text. Meets Android (48dp) and iOS (44pt); WCAG 2.5.8's floor is 24px. Links inside a sentence follow WCAG 2.5.8's inline exception. — *Source: Design rules 8.6*
- Build: the link is about 20 tall; the visual must not change either way. — *Source: Prototype*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101

<a id="o22"></a>
### o22 · Should text grow with the phone's font-size setting (dynamic type), and is there a dark mode?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Design + Product. — *Source: Prototype [MOCK]*
- Dark mode · large text / dynamic type (tested in the native app) · haptics and animation detail (native) · desktop layouts beyond §7. — *Source: Design rules 9.9*
- Out of scope for the design system unless the project opts in; tokens are light only and fixed sizes. — *Source: Prototype*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101

<a id="o23"></a>
### o23 · Expo or bare React Native CLI, and which navigation library?

- The app team's choice: the kit does not set it. — *Source: D-101 (amended)*
- Not set by the kit: the app team owns the components, screens and project set-up. Sign-in hands off to OTP (or locked OTP) after Send OTP (d10, d25). — *Source: Kit*

Decisions: D-101

<a id="o24"></a>
### o24 · How fast does the busy spinner turn, and does it stop when the phone's reduce-motion setting is on?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Design. — *Source: Prototype [MOCK]*
- Animations (sheets, toasts) respect the phone's reduce-motion setting. — *Source: Design rules 9.8*
- Use `tokens.duration.spinner` (800 ms): the web turns it once every 0.8 s and stops it under reduce motion. — *Source: Prototype*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101

<a id="o25"></a>
### o25 · "New to Truemeds?" and "Sign up" are two copy entries; the space between them is typed in code. One entry with a {link} placeholder instead?

- "New to Truemeds? Sign up" becomes one copy entry with a `{link}` placeholder. — *Source: D-101*

Decisions: D-101

<a id="o26"></a>
### o26 · What does "Call Doctor Ops" do on a device that can't make calls (tablet, no SIM)?

- "Call Doctor Ops" on a device that can't call → open WhatsApp to the same number; without WhatsApp, show the number with a copy button. — *Source: D-101*

Decisions: D-101, OQ-021

<a id="o12"></a>
### o12 · How long does a signed-in session last before OTP is asked again?

- [MOCK] The prototype's answer, below. Keep configurable (a server or config value); not a production promise. Owner when it becomes real: Backend + Product. — *Source: Prototype [MOCK]*
- **Confirmed 2026-10-12:** Signed-in session remains valid until the case is closed; no OTP prompt over a live case. Technical token renewal must not interrupt the doctor. Re-authentication after case closure remains open; the 24 h session value above is only a mock placeholder. — *Source: OQ-017*
- **Amended same day:** the kit is a hand-off of a **prototype with a fake backend**, so the Backend and Design items (o01, o02, o03, o12, o15, o16, o19, o21, o22, o24) are not left open either: each becomes DECIDED with **the prototype's own mock value or behaviour**, marked `[MOCK]` and "keep configurable" so nobody treats it as a production promise. o23 (Expo or plain React Native, navigation library) is the app team's choice and is stated as theirs, not as an open question. o09 stays a prototype-only note. — *Source: D-101 (amended)*

Decisions: D-101, OQ-017

## OTP

| # | Topic | Question |
|---|---|---|
| [otp-01](#otp-01) | App rules | What is the rule for "4 digits, keyboard opens on load and stays open"? |
| [otp-02](#otp-02) | App rules | What is the rule for "The terms line stays during Verifying… and Checking…, so"? |
| [otp-03](#otp-03) | App rules | What is the rule for "Verify never moves"? |
| [otp-04](#otp-04) | App rules | What is the rule for "Waiting text"? |
| [otp-05](#otp-05) | App rules | What is the rule for "Wrong code"? |
| [otp-06](#otp-06) | App rules | What is the rule for "5"? |
| [otp-07](#otp-07) | App rules | What is the rule for "4"? |
| [otp-08](#otp-08) | App rules | What is the rule for "Resend waits `[MOCK]` 30 s, then 60 s, then"? |
| [otp-09](#otp-09) | App rules | What is the rule for "Expired code"? |
| [otp-10](#otp-10) | App rules | What is the rule for "Sign-in on a locked number"? |
| [otp-11](#otp-11) | App rules | What is the rule for "All OTP limits are enforced by the server; the"? |
| [otp-12](#otp-12) | Layout | What is the rule for "OTP (item 4, A-01 to A-03, A-17, A-21)"? |
| [otp-13](#otp-13) | States and feedback | What does the app show in otp.default, and how does it recover? |
| [otp-14](#otp-14) | States and feedback | What does the app show in otp.empty-tap, and how does it recover? |
| [otp-15](#otp-15) | States and feedback | What does the app show in otp.too-short, and how does it recover? |
| [otp-16](#otp-16) | States and feedback | What does the app show in otp.verifying, and how does it recover? |
| [otp-17](#otp-17) | States and feedback | What does the app show in otp.wrong-code, and how does it recover? |
| [otp-18](#otp-18) | States and feedback | What does the app show in otp.two-tries-left, and how does it recover? |
| [otp-19](#otp-19) | States and feedback | What does the app show in otp.resend-available, and how does it recover? |
| [otp-20](#otp-20) | States and feedback | What does the app show in otp.new-code-sent, and how does it recover? |
| [otp-21](#otp-21) | States and feedback | What does the app show in otp.code-expired, and how does it recover? |
| [otp-22](#otp-22) | States and feedback | What does the app show in otp.couldnt-verify, and how does it recover? |
| [otp-23](#otp-23) | States and feedback | What does the app show in otp.too-many-resends, and how does it recover? |
| [otp-24](#otp-24) | States and feedback | What does the app show in otp.resending, and how does it recover? |
| [otp-25](#otp-25) | States and feedback | What does the app show in otp.resend-failed, and how does it recover? |
| [otp-26](#otp-26) | States and feedback | What does the app show in otp.offline, and how does it recover? |
| [otp-27](#otp-27) | States and feedback | What does the app show in otp.cooldown-reconciling, and how does it recover? |
| [otp-28](#otp-28) | States and feedback | What does the app show in otp.expired-and-resend-limited, and how does it recover? |
| [otp-29](#otp-29) | Limits and timings | What is the value of "otpWindow"? |
| [otp-30](#otp-30) | Limits and timings | What is the value of "otpLock"? |
| [otp-31](#otp-31) | Limits and timings | What is the value of "resendWaits"? |
| [otp-32](#otp-32) | Limits and timings | What is the value of "otpWrongLimit"? |
| [otp-33](#otp-33) | Limits and timings | What is the value of "otpCodesPerWindow"? |
| [otp-34](#otp-34) | Limits and timings | What is the value of "otpTriesLeftFrom"? |
| [otp-35](#otp-35) | Prototype stand-ins | The prototype fakes this: "app-logic §2 is silent on what the server answers". What do we build? |

<a id="otp-01"></a>
### otp-01 · What is the rule for "4 digits, keyboard opens on load and stays open"?

- 4 digits, keyboard opens on load and stays open while verifying. No auto-verify: the doctor taps **Verify & sign in**. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-02"></a>
### otp-02 · What is the rule for "The terms line stays during Verifying… and Checking…, so"?

- The terms line stays during **Verifying…** and **Checking…**, so Verify & sign in never moves (D-81 F5, amends D-44 for those two states). The cooldown line reads "Checking…" alone, with no "Didn’t receive it?", and the boxes stay focused (D-81 F7). — *Source: App logic §2.*

Decisions: D-81, D-44

<a id="otp-03"></a>
### otp-03 · What is the rule for "Verify never moves"?

- **Verify never moves:** one line is reserved under the code boxes. Every state with a one-line message (wrong code, tries left, new code sent, code expired, empty or too short, resend, cooldown) shows its message there, or nothing; Verify & sign in keeps the same place. Notice-box states (offline, locked, couldn't verify, resend failed, too many codes) may move it; accepted. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-04"></a>
### otp-04 · What is the rule for "Waiting text"?

- Waiting text ("Resend in 0:30") and the Resend code link share one height, so Verify & sign in never moves when the link appears. The terms line is centred and "Terms & Conditions" never splits. "Doctor Ops" and the timer never split across lines. "New code sent." is green text with no icon, like the errors. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-05"></a>
### otp-05 · What is the rule for "Wrong code"?

- Wrong code: digits stay visible with red borders; the first new keystroke replaces the whole code. The message is "Wrong code."; from 2 tries left it counts ("Wrong code. 2 tries left."), and at 1 try left it uses the singular ("Wrong code. 1 try left.") (D-81 F1; no next-step wording, D-53 pt 2). — *Source: App logic §2.*

Decisions: D-81, D-53

<a id="otp-06"></a>
### otp-06 · What is the rule for "5"?

- **5** server-confirmed wrong codes lock **that mobile number** (not the account) `[LOCKED D-34]`. Lock length `[MOCK 15 min, OPEN OQ-017]`. Change number stays available; another number works only if Doctor Ops approved it for this doctor. — *Source: App logic §2.*

Decisions: D-34

<a id="otp-07"></a>
### otp-07 · What is the rule for "4"?

- **4** codes per number per limit window (first code + 3 resends), not reset by restarting sign-in `[LOCKED D-35]`. Window length `[MOCK 10 min, OPEN OQ-017]`. — *Source: App logic §2.*

Decisions: D-35

<a id="otp-08"></a>
### otp-08 · What is the rule for "Resend waits `[MOCK]` 30 s, then 60 s, then"?

- Resend waits `[MOCK]` 30 s, then 60 s, then 120 s. Resend line hidden when resends are used up or the number is locked. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-09"></a>
### otp-09 · What is the rule for "Expired code"?

- Expired code: Resend is available at once; the expired code can't be verified. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-10"></a>
### otp-10 · What is the rule for "Sign-in on a locked number"?

- **Sign-in on a locked number** goes straight to OTP in the locked state (`otp_locked`): code field and Verify off, the lock time and "call Doctor Ops" shown, Change still available (D-81 F6). — *Source: App logic §2.*

Decisions: D-81

<a id="otp-11"></a>
### otp-11 · What is the rule for "All OTP limits are enforced by the server; the"?

- All OTP limits are enforced by the server; the app only shows them. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-12"></a>
### otp-12 · What is the rule for "OTP (item 4, A-01 to A-03, A-17, A-21)"?

- **OTP.** Terms line centred, "Terms & Conditions" on one line; the waiting text and the Resend code link share one height, so Verify & sign in does not move. — *Source: App logic §13*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-13"></a>
### otp-13 · What does the app show in otp.default, and how does it recover?

- otp.default: None — Keyboard open on load; box 1 focused; resend timer running (D-44) — *Source: Feedback state map: otp.default*

Decisions: D-44

<a id="otp-14"></a>
### otp-14 · What does the app show in otp.empty-tap, and how does it recover?

- otp.empty-tap: F1 — Submit empty; focus input — *Source: Feedback state map: otp.empty-tap*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-15"></a>
### otp-15 · What does the app show in otp.too-short, and how does it recover?

- otp.too-short: F1 — Submit1–3 digits; retain input, edit — *Source: Feedback state map: otp.too-short*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-16"></a>
### otp-16 · What does the app show in otp.verifying, and how does it recover?

- otp.verifying: L1 — Verification pending; retain code, prevent duplicate — *Source: Feedback state map: otp.verifying*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-17"></a>
### otp-17 · What does the app show in otp.wrong-code, and how does it recover?

- otp.wrong-code: F1 — Code stays visible, red borders, no focus box; first keystroke replaces whole code; keyboard open. Copy "Wrong code." (D-81 F1; replaces "That code isn't right.") — *Source: Feedback state map: otp.wrong-code*

Decisions: D-81

<a id="otp-18"></a>
### otp-18 · What does the app show in otp.two-tries-left, and how does it recover?

- otp.two-tries-left: F1 — Same as wrong code, with the remaining-tries count (dynamic): "Wrong code. 2 tries left."; at 1 try left the singular "Wrong code. 1 try left." (D-81 F1) — *Source: Feedback state map: otp.two-tries-left*

Decisions: D-81

<a id="otp-19"></a>
### otp-19 · What does the app show in otp.resend-available, and how does it recover?

- otp.resend-available: None — "Resend code" brand link, 44pt tap area, under the notice (D-44) — *Source: Feedback state map: otp.resend-available*

Decisions: D-44

<a id="otp-20"></a>
### otp-20 · What does the app show in otp.new-code-sent, and how does it recover?

- otp.new-code-sent: S1 — Confirmed resend; restart countdown — *Source: Feedback state map: otp.new-code-sent*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-21"></a>
### otp-21 · What does the app show in otp.code-expired, and how does it recover?

- otp.code-expired: F1 — Code stays visible; "Resend code" available at once; Verify of the same code blocked — *Source: Feedback state map: otp.code-expired*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-22"></a>
### otp-22 · What does the app show in otp.couldnt-verify, and how does it recover?

- otp.couldnt-verify: F2 — Retain code; resend line shown (D-44) — *Source: Feedback state map: otp.couldnt-verify*

Decisions: D-44

<a id="otp-23"></a>
### otp-23 · What does the app show in otp.too-many-resends, and how does it recover?

- otp.too-many-resends: W1 — Resend line hidden; last unexpired code can still verify — *Source: Feedback state map: otp.too-many-resends*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-24"></a>
### otp-24 · What does the app show in otp.resending, and how does it recover?

- otp.resending: L1 on Resend — One resend pending; keep current challenge until response; prevent duplicates — *Source: Feedback state map: otp.resending*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-25"></a>
### otp-25 · What does the app show in otp.resend-failed, and how does it recover?

- otp.resend-failed: F2 — Preserve code; retry if eligible; do not claim new code sent — *Source: Feedback state map: otp.resend-failed*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-26"></a>
### otp-26 · What does the app show in otp.offline, and how does it recover?

- otp.offline: F2 or N1 — Same offline rule as sign-in; do not label code wrong — *Source: Feedback state map: otp.offline*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-27"></a>
### otp-27 · What does the app show in otp.cooldown-reconciling, and how does it recover?

- otp.cooldown-reconciling: W1 + progress — Timer zero; the terms line stays and Verify & sign in does not move; the line reads "Checking…" alone; boxes stay focused (D-81 F5, F7). Wait for authoritative eligibility before enabling — *Source: Feedback state map: otp.cooldown-reconciling*

Decisions: D-81

<a id="otp-28"></a>
### otp-28 · What does the app show in otp.expired-and-resend-limited, and how does it recover?

- otp.expired-and-resend-limited: W1 — Locked treatment (D-46): empty disabled boxes, keyboard closed, Verify disabled, no consent, no resend line. Copy: "This code has expired. Request a new code in 9:42, or call Doctor Ops." — *Source: Feedback state map: otp.expired-and-resend-limited*

Decisions: D-46

<a id="otp-29"></a>
### otp-29 · What is the value of "otpWindow"?

- [MOCK] 10 min in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: OQ-017: how long a code stays valid. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-30"></a>
### otp-30 · What is the value of "otpLock"?

- [MOCK] 15 min in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: OQ-017: lock after 5 wrong codes. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-31"></a>
### otp-31 · What is the value of "resendWaits"?

- [MOCK] 30 s → 60 s → 120 s in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: OQ-017: waits between resends. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="otp-32"></a>
### otp-32 · What is the value of "otpWrongLimit"?

- 5. Agreed rule (D-34: the 5th server-confirmed wrong code locks the number). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-34

<a id="otp-33"></a>
### otp-33 · What is the value of "otpCodesPerWindow"?

- 4. Agreed rule (D-35: first code + 3 resends per number per window). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-35

<a id="otp-34"></a>
### otp-34 · What is the value of "otpTriesLeftFrom"?

- 2. Agreed rule (D-81 F1: the wrong-code line counts from 2 tries left). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-81

<a id="otp-35"></a>
### otp-35 · The prototype fakes this: "app-logic §2 is silent on what the server answers". What do we build?

- [MOCK] app-logic §2 is silent on what the server answers here; the code already sent stays valid. Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

## Faster sign-in offer

| # | Topic | Question |
|---|---|---|
| [offer-01](#offer-01) | App rules | What is the rule for "Faster sign-in"? |
| [offer-02](#offer-02) | App rules | What is the rule for "Offered once, on its own screen, after the first"? |
| [offer-03](#offer-03) | App rules | What is the rule for "Which unlock (D-64)"? |
| [offer-04](#offer-04) | Layout | What is the rule for "Pinned action bar (item 1)"? |
| [offer-05](#offer-05) | States and feedback | What does the app show in offer.shown, and how does it recover? |
| [offer-06](#offer-06) | States and feedback | What does the app show in offer.enabling, and how does it recover? |
| [offer-07](#offer-07) | States and feedback | What does the app show in offer.enabled, and how does it recover? |
| [offer-08](#offer-08) | States and feedback | What does the app show in offer.cancelled, and how does it recover? |
| [offer-09](#offer-09) | States and feedback | What does the app show in offer.failed, and how does it recover? |
| [offer-10](#offer-10) | States and feedback | What does the app show in offer.offline, and how does it recover? |
| [offer-11](#offer-11) | States and feedback | What does the app show in offer.unavailable, and how does it recover? |
| [offer-12](#offer-12) | States and feedback | What does the app show in offer.not-now, and how does it recover? |
| [offer-13](#offer-13) | States and feedback | What does the app show in offer.screen-lock, and how does it recover? |
| [offer-14](#offer-14) | States and feedback | What does the app show in offer.unsupported, and how does it recover? |

<a id="offer-01"></a>
### offer-01 · What is the rule for "Faster sign-in"?

- **Faster sign-in** (D-45, D-47) — *Source: App logic §2.*

Decisions: D-45, D-47

<a id="offer-02"></a>
### offer-02 · What is the rule for "Offered once, on its own screen, after the first"?

- Offered once, on its own screen, after the first successful OTP sign-in on a phone that supports it and has it off. The footer is the action bar; the content above it scrolls. Subtitle on one line: "Use your screen lock instead of an OTP.". **Turn on** → phone prompt → Home. **Cancelled** prompt → back to the offer, no message. **Failed** → stays on the offer; "Couldn't turn on faster sign-in." sits in the bar above Try again · Try again · Not now (D-61, D-65). **Offline** → "You're offline. Check your connection." (D-66). **Unavailable** (the phone answers "unavailable" at Turn on) → stays on the offer, unchanged (title, subtitle, tile and the three points): the amber warning notice "Faster sign-in isn't available on this phone right now." sits in the bar, the primary reads **Continue** → Home and Not now is hidden; not enabled, recorded as offered, can be turned on later in Profile (D-93, state `offer_unavailable`). **Not now** → Home; offered again later `[OPEN OQ-023]`; can be turned on or off in Profile (D-69). — *Source: App logic §2.*

Decisions: D-61, D-65, D-66, D-93, D-69

<a id="offer-03"></a>
### offer-03 · What is the rule for "Which unlock (D-64)"?

- **Which unlock (D-64):** fingerprint or face if set up on the phone; otherwise the phone's **screen lock** (PIN / pattern / password); if the phone has no screen lock at all, the offer is skipped. — *Source: App logic §2.*

Decisions: D-64

<a id="offer-04"></a>
### offer-04 · What is the rule for "Pinned action bar (item 1)"?

- **Pinned action bar (item 1).** Every pinned main action sits in the action bar: case page, Prescribe, Home, faster sign-in offer, returning unlock. The content above the bar scrolls on short phones; the bar never covers the last content at the end of the scroll; toasts sit above the bar. Sign-in and OTP keep their main button inline under the fields (RULES §8.4). — *Source: App logic §13*

Decisions: D-78 (the approved screens and app logic)

<a id="offer-05"></a>
### offer-05 · What does the app show in offer.shown, and how does it recover?

- offer.shown: None — After first successful OTP sign-in on a supported device where faster sign-in is off — *Source: Feedback state map: offer.shown*

Decisions: D-78 (the approved screens and app logic)

<a id="offer-06"></a>
### offer-06 · What does the app show in offer.enabling, and how does it recover?

- offer.enabling: L1 + OS prompt — One request at a time; primary shows progress — *Source: Feedback state map: offer.enabling*

Decisions: D-78 (the approved screens and app logic)

<a id="offer-07"></a>
### offer-07 · What does the app show in offer.enabled, and how does it recover?

- offer.enabled: — — Go to Home (no toast needed; Profile shows it's on) — *Source: Feedback state map: offer.enabled*

Decisions: D-78 (the approved screens and app logic)

<a id="offer-08"></a>
### offer-08 · What does the app show in offer.cancelled, and how does it recover?

- offer.cancelled: None — OS prompt cancelled → back to the offer, no message (D-61) — *Source: Feedback state map: offer.cancelled*

Decisions: D-61

<a id="offer-09"></a>
### offer-09 · What does the app show in offer.failed, and how does it recover?

- offer.failed: Notice — Enrolment failed → stays on the offer: `offer.enableFailed` "Couldn't turn on faster sign-in." · Try again · Not now (D-61, D-65) — *Source: Feedback state map: offer.failed*

Decisions: D-61, D-65

<a id="offer-10"></a>
### offer-10 · What does the app show in offer.offline, and how does it recover?

- offer.offline: Notice — `offer.offline` "You're offline. Check your connection." (D-66) — *Source: Feedback state map: offer.offline*

Decisions: D-66

<a id="offer-11"></a>
### offer-11 · What does the app show in offer.unavailable, and how does it recover?

- offer.unavailable: Notice — Phone answers "unavailable" at Turn on → stays on the offer, unchanged (tile and three points shown); warning notice in the bar, `alert-triangle`, `unlock.unavailable` "Faster sign-in isn't available on this phone right now."; the primary reads **Continue** (`offer.continue`) → Home; Not now hidden. Not enabled; recorded as offered; can be turned on later in Profile (D-93). Picture `offer_unavailable` approved (D-93 revised); in since the D-94 refresh — *Source: Feedback state map: offer.unavailable*

Decisions: D-93, D-94

<a id="offer-12"></a>
### offer-12 · What does the app show in offer.not-now, and how does it recover?

- offer.not-now: None — → Home; re-offer per OQ-023; can be turned on later in Profile (D-69) — *Source: Feedback state map: offer.not-now*

Decisions: D-69

<a id="offer-13"></a>
### offer-13 · What does the app show in offer.screen-lock, and how does it recover?

- offer.screen-lock: None — No fingerprint or face set up → offer uses the phone's screen lock (PIN / pattern / password) (D-64) — *Source: Feedback state map: offer.screen-lock*

Decisions: D-64

<a id="offer-14"></a>
### offer-14 · What does the app show in offer.unsupported, and how does it recover?

- offer.unsupported: — — Phone has no screen lock at all → screen skipped entirely (D-64) — *Source: Feedback state map: offer.unsupported*

Decisions: D-64

## Returning unlock

| # | Topic | Question |
|---|---|---|
| [unlock-01](#unlock-01) | App rules | What is the rule for "Returning unlock"? |
| [unlock-02](#unlock-02) | App rules | What is the rule for "Wording follows the phone"? |
| [unlock-03](#unlock-03) | App rules | What is the rule for "Wording follows the phone"? |
| [unlock-04](#unlock-04) | States and feedback | What does the app show in unlock.pending, and how does it recover? |
| [unlock-05](#unlock-05) | States and feedback | What does the app show in unlock.cancelled, and how does it recover? |
| [unlock-06](#unlock-06) | States and feedback | What does the app show in unlock.platform-retry, and how does it recover? |
| [unlock-07](#unlock-07) | States and feedback | What does the app show in unlock.unavailable, and how does it recover? |
| [unlock-08](#unlock-08) | Limits and timings | What is the value of "returningUnlockFallbackAfter"? |
| [unlock-09](#unlock-09) | Prototype stand-ins | The prototype fakes this: "Tries". What do we build? |
| [unlock-10](#unlock-10) | Prototype stand-ins | The prototype fakes this: "Use OTP instead sends a code to the remembered". What do we build? |

<a id="unlock-01"></a>
### unlock-01 · What is the rule for "Returning unlock"?

- Returning unlock: the phone's own prompt; 3 failed tries → fall back to OTP `[MOCK]`. "Not you? Switch account" → sign-in. The footer is the action bar; the content above it scrolls. If unavailable: "Faster sign-in isn't available on this phone right now." is a standing state, so the neutral notice stays at the top of the panel; **Use OTP instead** is the main button in the bar. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-02"></a>
### unlock-02 · What is the rule for "Wording follows the phone"?

- Wording follows the phone ("Face ID" / "fingerprint"); never suggest Truemeds stores biometric data. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-03"></a>
### unlock-03 · What is the rule for "Wording follows the phone"?

- Wording follows the phone ("Face ID" / "fingerprint"); never suggest Truemeds stores biometric data. — *Source: App logic §2.*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-04"></a>
### unlock-04 · What does the app show in unlock.pending, and how does it recover?

- unlock.pending: L1 + OS prompt — No concurrent authentication request — *Source: Feedback state map: unlock.pending*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-05"></a>
### unlock-05 · What does the app show in unlock.cancelled, and how does it recover?

- unlock.cancelled: None — Return to unchanged screen; cancellation is not failure — *Source: Feedback state map: unlock.cancelled*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-06"></a>
### unlock-06 · What does the app show in unlock.platform-retry, and how does it recover?

- unlock.platform-retry: OS-owned — Use supported native retry guidance — *Source: Feedback state map: unlock.platform-retry*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-07"></a>
### unlock-07 · What does the app show in unlock.unavailable, and how does it recover?

- unlock.unavailable: N1 (neutral info, not an error — D-47 amendment) — "Use OTP instead" becomes the primary; notice copy "Faster sign-in isn't available on this phone right now." (no repeat of the button text, D-47); preserve account context — *Source: Feedback state map: unlock.unavailable*

Decisions: D-47

<a id="unlock-08"></a>
### unlock-08 · What is the value of "returningUnlockFallbackAfter"?

- [MOCK] 3 in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: 3 failed tries → OTP (checklist 4.3). — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-09"></a>
### unlock-09 · The prototype fakes this: "Tries". What do we build?

- [MOCK] Tries (setting, ) → OTP · unavailable → standing neutral notice at the top of the panel, Use OTP instead is the primary · Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="unlock-10"></a>
### unlock-10 · The prototype fakes this: "Use OTP instead sends a code to the remembered". What do we build?

- [MOCK] Use OTP instead sends a code to the remembered number at the tap and opens OTP; Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

## Home

| # | Topic | Question |
|---|---|---|
| [home-01](#home-01) | App rules | What is the rule for "While Setting… or Adding…"? |
| [home-02](#home-02) | App rules | What is the rule for "Set availability"? |
| [home-03](#home-03) | App rules | What is the rule for "Time added"? |
| [home-04](#home-04) | App rules | What is the rule for "End availability"? |
| [home-05](#home-05) | App rules | What is the rule for "Log out confirm"? |
| [home-06](#home-06) | App rules | What is the rule for "Home answers "Am I taking cases right now, and"? |
| [home-07](#home-07) | App rules | What is the rule for "Set availability"? |
| [home-08](#home-08) | App rules | What is the rule for "Time remaining"? |
| [home-09](#home-09) | App rules | What is the rule for "Request a case"? |
| [home-10](#home-10) | App rules | What is the rule for "Add time"? |
| [home-11](#home-11) | App rules | What is the rule for "End availability"? |
| [home-12](#home-12) | App rules | What is the rule for "Window ends during a case"? |
| [home-13](#home-13) | App rules | What is the rule for "Prescriptions today"? |
| [home-14](#home-14) | App rules | What is the rule for "Result notices on Home"? |
| [home-15](#home-15) | App rules | What is the rule for "Checking…"? |
| [home-16](#home-16) | App rules | What is the rule for "No cases"? |
| [home-17](#home-17) | App rules | What is the rule for "Notifications bell, Help and Profile icons on Home; the"? |
| [home-18](#home-18) | App rules | What is the rule for "Profile page"? |
| [home-19](#home-19) | App rules | What is the rule for "Faster sign-in toggle (D-70)"? |
| [home-20](#home-20) | App rules | What is the rule for "One phone active at a time"? |
| [home-21](#home-21) | App rules | What is the rule for "Source"? |
| [home-22](#home-22) | States and feedback | What does the app show in home.setup, and how does it recover? |
| [home-23](#home-23) | States and feedback | What does the app show in home.setting, and how does it recover? |
| [home-24](#home-24) | States and feedback | What does the app show in home.setup-failed, and how does it recover? |
| [home-25](#home-25) | States and feedback | What does the app show in home.active, and how does it recover? |
| [home-26](#home-26) | States and feedback | What does the app show in home.requesting, and how does it recover? |
| [home-27](#home-27) | States and feedback | What does the app show in home.no-cases, and how does it recover? |
| [home-28](#home-28) | States and feedback | What does the app show in home.request-failed, and how does it recover? |
| [home-29](#home-29) | States and feedback | What does the app show in home.offline, and how does it recover? |
| [home-30](#home-30) | States and feedback | What does the app show in home.near-expiry, and how does it recover? |
| [home-31](#home-31) | States and feedback | What does the app show in home.add-open, and how does it recover? |
| [home-32](#home-32) | States and feedback | What does the app show in home.adding, and how does it recover? |
| [home-33](#home-33) | States and feedback | What does the app show in home.add-failed, and how does it recover? |
| [home-34](#home-34) | States and feedback | What does the app show in home.added, and how does it recover? |
| [home-35](#home-35) | States and feedback | What does the app show in home.end-confirmation, and how does it recover? |
| [home-36](#home-36) | States and feedback | What does the app show in home.stop-pending, and how does it recover? |
| [home-37](#home-37) | States and feedback | What does the app show in home.expired-pending, and how does it recover? |
| [home-38](#home-38) | States and feedback | What does the app show in home.unknown-result, and how does it recover? |
| [home-39](#home-39) | Limits and timings | What is the value of "nearExpiryWarning"? |
| [home-40](#home-40) | Limits and timings | What is the value of "availabilityMinimum"? |
| [home-41](#home-41) | Limits and timings | What is the value of "availabilityStep"? |
| [home-42](#home-42) | Limits and timings | What is the value of "earningsPerConfirmedRx"? |

<a id="home-01"></a>
### home-01 · What is the rule for "While Setting… or Adding…"?

- **While Setting… or Adding…** the wheel, the duration chips, Cancel and × are disabled (D-81 F9). — *Source: App logic §3.*

Decisions: D-81

<a id="home-02"></a>
### home-02 · What is the rule for "Set availability"?

- **Set availability** stays pinned to the bottom of the screen in every state, with or without a notice (D-81 F12, D-43), **inside the action bar**. The content above the bar scrolls on short phones (at 360×640 the timer and the wheel are never clipped); the bar never covers the last content; toasts sit above the bar. — *Source: App logic §3.*

Decisions: D-81, D-43

<a id="home-03"></a>
### home-03 · What is the rule for "Time added"?

- **Time added:** 5:00 + 30 min shows 35:00 (D-81 F10). — *Source: App logic §3.*

Decisions: D-81

<a id="home-04"></a>
### home-04 · What is the rule for "End availability"?

- **End availability** is greyed out while offline; the offline notice explains (D-81 F13). — *Source: App logic §3.*

Decisions: D-81

<a id="home-05"></a>
### home-05 · What is the rule for "Log out confirm"?

- **Log out confirm:** "Stay signed in" is quiet text, like "Keep available" (D-81 F11, RULES §9.4). — *Source: App logic §3.*

Decisions: D-81

<a id="home-06"></a>
### home-06 · What is the rule for "Home answers "Am I taking cases right now, and"?

- Home answers "Am I taking cases right now, and what do I do next?" Nothing is pushed: the doctor **requests** a case (pull model). — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-07"></a>
### home-07 · What is the rule for "Set availability"?

- **Set availability:** quick picks 15 / 30 / 45 min, 1 / 2 / 3 hours, plus the wheel (hours and minutes, 15-minute steps). Minimum **15 minutes**, any start time, no maximum (24/7). Confirm starts the countdown. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-08"></a>
### home-08 · What is the rule for "Time remaining"?

- **Time remaining:** h:mm:ss from one hour up (1:00:00), m:ss below (9:42). Shows 0:00 when it has ended (D-53, 2026-10-15). The label and the timer do not move when **+ Add time** appears; Add time sits on the value row. Labels are 14 px grey. — *Source: App logic §3.*

Decisions: D-53

<a id="home-09"></a>
### home-09 · What is the rule for "Request a case"?

- **Request a case** while time remains. A request made before the window ends is honoured even if the case arrives after. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-10"></a>
### home-10 · What is the rule for "Add time"?

- **Add time:** shown when time is running low (near expiry, `[MOCK]` 5 min); same picker in a sheet; "Time added" toast. An error in the add-time sheet sits 16 above its button, as on the page. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-11"></a>
### home-11 · What is the rule for "End availability"?

- **End availability:** confirmation sheet. If a request is pending: no new requests, the pending one is honoured, availability ends after it resolves and any assigned case closes ("Ending availability", no time row). — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-12"></a>
### home-12 · What is the rule for "Window ends during a case"?

- **Window ends during a case:** the case is never interrupted. The ending card then offers only **Back to Home**; Home shows the ended state. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-13"></a>
### home-13 · What is the rule for "Prescriptions today"?

- **Prescriptions today:** a count only, no earnings. A case counts when its prescription is confirmed. It stays visible after availability ends. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-14"></a>
### home-14 · What is the rule for "Result notices on Home"?

- **Result notices on Home** ("Availability ends soon", setup / add / request failures) sit inside the action bar, above its button. "No cases right now" and offline are the bar's own action, so they sit inside the bar above the button. Screen-wide standing notices (idle-expired, manually ended, expired-pending, stop-pending) stay at the top of the panel. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-15"></a>
### home-15 · What is the rule for "Checking…"?

- **Checking…** status line in the bar is centred in the button's slot, as on the case page. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-16"></a>
### home-16 · What is the rule for "No cases"?

- **No cases:** neutral notice "No cases right now. Try again in a minute." Auto re-check `[OPEN OQ-019]`. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-17"></a>
### home-17 · What is the rule for "Notifications bell, Help and Profile icons on Home; the"?

- Notifications bell, Help and Profile icons on Home; the bell never inside a case. Help's content is not designed yet (backlog). — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-18"></a>
### home-18 · What is the rule for "Profile page"?

- **Profile page** (D-70: a page, not a sheet — task header with Back, no logo; content ported from the current app with design-system fixes, D-69; full redesign later): doctor name and role · today's earnings (earned, incentive) · User manual · **Faster sign-in on/off** · **Log out** (destructive). During an open case Log out is replaced by "You can log out after this case is closed." Log out is the last item in the content (not pinned). Cards are 16 apart and Log out is 16 below the last card. The group label "Today's earnings" is 16 semibold, like the other group labels. Log out asks first in a **sheet**: "Log out? — You'll stop getting cases until you sign in again." · Log out · Stay signed in. — *Source: App logic §3.*

Decisions: D-70, D-69

<a id="home-19"></a>
### home-19 · What is the rule for "Faster sign-in toggle (D-70)"?

- **Faster sign-in toggle (D-70):** turning it **off** just switches it off (no prompt; OTP from the next sign-in). Turning it **on** opens the phone's prompt, as on the offer screen; if that fails, the toggle stays off and the page shows "Couldn't turn on faster sign-in."; cancelling leaves it off with no message. Hidden if the phone has no screen lock at all (D-64). — *Source: App logic §3.*

Decisions: D-70, D-64

<a id="home-20"></a>
### home-20 · What is the rule for "One phone active at a time"?

- One phone active at a time. Session stays valid through an open case (no OTP over a live case). — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-21"></a>
### home-21 · What is the rule for "Source"?

- **Source:** approved screens in; reference behaviour in. — *Source: App logic §3.*

Decisions: D-78 (the approved screens and app logic)

<a id="home-22"></a>
### home-22 · What does the app show in home.setup, and how does it recover?

- home.setup: None — Wheel + presets, minimum reminder once — *Source: Feedback state map: home.setup*

Decisions: D-78 (the approved screens and app logic)

<a id="home-23"></a>
### home-23 · What does the app show in home.setting, and how does it recover?

- home.setting: L1 — Keep selected duration; only start after confirmation — *Source: Feedback state map: home.setting*

Decisions: D-78 (the approved screens and app logic)

<a id="home-24"></a>
### home-24 · What does the app show in home.setup-failed, and how does it recover?

- home.setup-failed: F2 — Retain duration, retry known failure — *Source: Feedback state map: home.setup-failed*

Decisions: D-78 (the approved screens and app logic)

<a id="home-25"></a>
### home-25 · What does the app show in home.active, and how does it recover?

- home.active: None — Timer and Request a case — *Source: Feedback state map: home.active*

Decisions: D-78 (the approved screens and app logic)

<a id="home-26"></a>
### home-26 · What does the app show in home.requesting, and how does it recover?

- home.requesting: L1 — One in-flight request; stable headline and CTA — *Source: Feedback state map: home.requesting*

Decisions: D-78 (the approved screens and app logic)

<a id="home-27"></a>
### home-27 · What does the app show in home.no-cases, and how does it recover?

- home.no-cases: N1 — Check again; remain available until deadline — *Source: Feedback state map: home.no-cases*

Decisions: D-78 (the approved screens and app logic)

<a id="home-28"></a>
### home-28 · What does the app show in home.request-failed, and how does it recover?

- home.request-failed: F2 — Retry confirmed failure; distinguish unknown result — *Source: Feedback state map: home.request-failed*

Decisions: D-78 (the approved screens and app logic)

<a id="home-29"></a>
### home-29 · What does the app show in home.offline, and how does it recover?

- home.offline: F2 or N1 — Preserve state; reconnect and reconcile pending request — *Source: Feedback state map: home.offline*

Decisions: D-78 (the approved screens and app logic)

<a id="home-30"></a>
### home-30 · What does the app show in home.near-expiry, and how does it recover?

- home.near-expiry: W1 — Keep Add time placement; last-second requests valid — *Source: Feedback state map: home.near-expiry*

Decisions: D-78 (the approved screens and app logic)

<a id="home-31"></a>
### home-31 · What does the app show in home.add-open, and how does it recover?

- home.add-open: None — Wheel sheet; same duration controls, no repeated helper — *Source: Feedback state map: home.add-open*

Decisions: D-78 (the approved screens and app logic)

<a id="home-32"></a>
### home-32 · What does the app show in home.adding, and how does it recover?

- home.adding: L1 — Keep sheet/selection; prevent repeat addition — *Source: Feedback state map: home.adding*

Decisions: D-78 (the approved screens and app logic)

<a id="home-33"></a>
### home-33 · What does the app show in home.add-failed, and how does it recover?

- home.add-failed: F2 — Keep sheet/selection and original deadline; retry confirmed failure — *Source: Feedback state map: home.add-failed*

Decisions: D-78 (the approved screens and app logic)

<a id="home-34"></a>
### home-34 · What does the app show in home.added, and how does it recover?

- home.added: T1 — Confirmed deadline update; dismiss sheet, preserve Home — *Source: Feedback state map: home.added*

Decisions: D-78 (the approved screens and app logic)

<a id="home-35"></a>
### home-35 · What does the app show in home.end-confirmation, and how does it recover?

- home.end-confirmation: Confirmation, not error — Existing pending-request decision; no new error component — *Source: Feedback state map: home.end-confirmation*

Decisions: D-78 (the approved screens and app logic)

<a id="home-36"></a>
### home-36 · What does the app show in home.stop-pending, and how does it recover?

- home.stop-pending: N1 + L1 — Finish request/assigned case before stop. Subtitle "You won't get new cases." (not a repeat of the notice). **No "Time remaining" row**; quiet "Ending…" without spinner (D-47) — *Source: Feedback state map: home.stop-pending*

Decisions: D-47

<a id="home-37"></a>
### home-37 · What does the app show in home.expired-pending, and how does it recover?

- home.expired-pending: N1 + L1 — Honour request already submitted; do not interrupt case — *Source: Feedback state map: home.expired-pending*

Decisions: D-78 (the approved screens and app logic)

<a id="home-38"></a>
### home-38 · What does the app show in home.unknown-result, and how does it recover?

- home.unknown-result: N1 + L1 — Reconcile operation ID before retry; do not invent failure or success — *Source: Feedback state map: home.unknown-result*

Decisions: D-78 (the approved screens and app logic)

<a id="home-39"></a>
### home-39 · What is the value of "nearExpiryWarning"?

- [MOCK] 5 min in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: app-logic §3 near-expiry. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="home-40"></a>
### home-40 · What is the value of "availabilityMinimum"?

- 15 min. Agreed rule (app-logic §3). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-78 (the approved screens and app logic)

<a id="home-41"></a>
### home-41 · What is the value of "availabilityStep"?

- 15 min. Agreed rule (app-logic §3 (15-min wheel)). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-78 (the approved screens and app logic)

<a id="home-42"></a>
### home-42 · What is the value of "earningsPerConfirmedRx"?

- 20. Agreed rule (D-81 F10). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-81

## Case page

| # | Topic | Question |
|---|---|---|
| [case-01](#case-01) | App rules | What is the rule for "Stages"? |
| [case-02](#case-02) | App rules | What happens in "Ready to call (call.ready)"? |
| [case-03](#case-03) | App rules | What happens in "Calling — the whole call (call.calling 2 / 7a, call.calling-transfer 11)"? |
| [case-04](#case-04) | App rules | What happens in "Script stays (call still live)"? |
| [case-05](#case-05) | App rules | What happens in "No script — the call has ended (D-58 pt 24)"? |
| [case-06](#case-06) | App rules | What happens in "No script — the call has ended (D-58 pt 24)"? |
| [case-07](#case-07) | App rules | What happens in "Closed (completed / unavailable)"? |
| [case-08](#case-08) | App rules | What is the rule for "Empty case (D-80 pt 4, D-81 F23, D-83)"? |
| [case-09](#case-09) | App rules | What is the rule for "Call ended, outcome card (D-81 F26, retired D-83)"? |
| [case-10](#case-10) | App rules | What is the rule for "Bar and card rules"? |
| [case-11](#case-11) | App rules | What is the rule for "Leaving a case"? |
| [case-12](#case-12) | App rules | What is the rule for "End-of-call script"? |
| [case-13](#case-13) | App rules | What is the rule for "Launch B, Pilot live call"? |
| [case-14](#case-14) | App rules | What is the rule for "Transfer"? |
| [case-15](#case-15) | App rules | What is the rule for "Forward"? |
| [case-16](#case-16) | App rules | What is the rule for "Everything else"? |
| [case-17](#case-17) | App rules | What is the rule for "After a failed transfer / no Health Advisor free"? |
| [case-18](#case-18) | App rules | What is the rule for "How a call works (first release)"? |
| [case-19](#case-19) | App rules | What is the rule for "Gate time is a setting"? |
| [case-20](#case-20) | App rules | What is the rule for "Talk time adds up"? |
| [case-21](#case-21) | App rules | What is the rule for "Attempted call"? |
| [case-22](#case-22) | App rules | What is the rule for "Launch B, Pilot live call"? |
| [case-23](#case-23) | App rules | What is the rule for "All other cases"? |
| [case-24](#case-24) | App rules | What is the rule for "Before the gate, never show"? |
| [case-25](#case-25) | App rules | What is the rule for "Patient-side failure"? |
| [case-26](#case-26) | App rules | What is the rule for "Transfer"? |
| [case-27](#case-27) | App rules | What is the rule for "A call that's too short"? |
| [case-28](#case-28) | App rules | What is the rule for "No call result"? |
| [case-29](#case-29) | App rules | What is the rule for "Callback on a live call is refused by the backend"? |
| [case-30](#case-30) | App rules | What is the rule for "Vendor terms are mapped by Engineering"? |
| [case-31](#case-31) | App rules | What is the rule for "State table (final, 2026-10-24 — D-58 points 14–22; rows changed by the calling round are per D-83, see §14)"? |
| [case-32](#case-32) | App rules | What happens in "call.ready" (state 1)? |
| [case-33](#case-33) | App rules | What happens in "call.calling" (state 2)? |
| [case-34](#case-34) | App rules | What happens in "call.not-through" (state 3)? |
| [case-35](#case-35) | App rules | What happens in "call.doctor-missed" (state 4)? |
| [case-36](#case-36) | App rules | What happens in "call.result-wait" (state 5)? |
| [case-37](#case-37) | App rules | What happens in "call.ended-early" (state 6)? |
| [case-38](#case-38) | App rules | What happens in "call.still-on-call" (state 7b)? |
| [case-39](#case-39) | App rules | What happens in "call.checking" (state 7c)? |
| [case-40](#case-40) | App rules | What happens in "call.result-missing" (state 7d)? |
| [case-41](#case-41) | App rules | What happens in "—" (state 7e)? |
| [case-42](#case-42) | App rules | What happens in "call.submitted" (state 7f)? |
| [case-43](#case-43) | App rules | What happens in "call.valid" (state 8a)? |
| [case-44](#case-44) | App rules | What happens in "call.valid" (state 8b)? |
| [case-45](#case-45) | App rules | What happens in "case.confirm-blocked" (state 8c)? |
| [case-46](#case-46) | App rules | What happens in "call.patient-unavailable" (state 9)? |
| [case-47](#case-47) | App rules | What happens in "—" (state 10a)? |
| [case-48](#case-48) | App rules | What happens in "—" (state 10b)? |
| [case-49](#case-49) | App rules | What happens in "call.calling-transfer" (state 11)? |
| [case-50](#case-50) | App rules | What happens in "call.transfer-ready" (state 12)? |
| [case-51](#case-51) | App rules | What happens in "—" (state 13)? |
| [case-52](#case-52) | App rules | What happens in "call.transferred" (state 14)? |
| [case-53](#case-53) | App rules | What happens in "call.transfer-failed" (state 15)? |
| [case-54](#case-54) | App rules | What happens in "—" (state 15 (after the hang-up))? |
| [case-55](#case-55) | App rules | What happens in "retired (D-83, CW-E3)" (state 15b)? |
| [case-56](#case-56) | App rules | What happens in "call.transfer-missed" (state 16)? |
| [case-57](#case-57) | App rules | What happens in "call.skip-ha-wait" (state 17)? |
| [case-58](#case-58) | App rules | What is the rule for "A call that ends after the gate and before"? |
| [case-59](#case-59) | App rules | What is the rule for "Retired"? |
| [case-60](#case-60) | App rules | What is the rule for "Update 2026-10-23 (D-58 point 14, temporarily approved)"? |
| [case-61](#case-61) | App rules | What is the rule for "Dependency (Engineering)"? |
| [case-62](#case-62) | App rules | What is the rule for "Later, not this version"? |
| [case-63](#case-63) | App rules | What is the rule for "Confirming… / Transferring… (D-81 F24–F25)"? |
| [case-64](#case-64) | App rules | What is the rule for "Launch = Fallback B (D-83, D-85)"? |
| [case-65](#case-65) | App rules | What happens in "—"? |
| [case-66](#case-66) | App rules | What happens in "HA skipped (by customer, system, or the doctor's Skip HA)"? |
| [case-67](#case-67) | App rules | What happens in "Value meds, HA required"? |
| [case-68](#case-68) | App rules | What happens in "Non-value meds, HA required"? |
| [case-69](#case-69) | App rules | What is the rule for "7d follows the route (D-83)"? |
| [case-70](#case-70) | App rules | What is the rule for "Skip HA"? |
| [case-71](#case-71) | App rules | What is the rule for "Cat4 never shows anything about HA"? |
| [case-72](#case-72) | App rules | What is the rule for "Transfer vs forward"? |
| [case-73](#case-73) | App rules | What is the rule for "Confirm"? |
| [case-74](#case-74) | App rules | What is the rule for "Analytics"? |
| [case-75](#case-75) | App rules | What is the rule for "✅ Flag 5"? |
| [case-76](#case-76) | App rules | What is the rule for "Callback"? |
| [case-77](#case-77) | App rules | What is the rule for "Date"? |
| [case-78](#case-78) | App rules | What is the rule for "Missing choice → field error "Pick a date and"? |
| [case-79](#case-79) | App rules | What is the rule for "Confirm callback"? |
| [case-80](#case-80) | App rules | What is the rule for "Available only on 6 Call too short and 7d Result not received"? |
| [case-81](#case-81) | App rules | What is the rule for "Patient unavailable"? |
| [case-82](#case-82) | App rules | What is the rule for "Automatic"? |
| [case-83](#case-83) | App rules | What is the rule for "By the doctor"? |
| [case-84](#case-84) | App rules | What is the rule for "Status card "Patient unavailable" with a neutral icon; medicines"? |
| [case-85](#case-85) | App rules | What is the rule for "✅ Flag 6"? |
| [case-86](#case-86) | App rules | What is the rule for "Keyboard rule (D-81)"? |
| [case-87](#case-87) | App rules | What is the rule for "Keyboard type"? |
| [case-88](#case-88) | App rules | What is the rule for "Order details ⓘ"? |
| [case-89](#case-89) | App rules | What is the rule for "View Rx"? |
| [case-90](#case-90) | App rules | What is the rule for "Notes & symptoms"? |
| [case-91](#case-91) | App rules | What is the rule for "Loading"? |
| [case-92](#case-92) | App rules | What is the rule for "Notices"? |
| [case-93](#case-93) | App rules | What is the rule for "Follow the feedback map exactly"? |
| [case-94](#case-94) | Layout | What is the rule for "Sheets over the bar and pinned actions (Round 6)"? |
| [case-95](#case-95) | Layout | What is the rule for "Busy states (B-01, B-02, B-03)"? |
| [case-96](#case-96) | Layout | What is the rule for "Header edge (B-07, Round 5)"? |
| [case-97](#case-97) | States and feedback | What does the app show in case.back-before-call, and how does it recover? |
| [case-98](#case-98) | States and feedback | What does the app show in case.releasing, and how does it recover? |
| [case-99](#case-99) | States and feedback | What does the app show in case.back-blocked, and how does it recover? |
| [case-100](#case-100) | States and feedback | What does the app show in case.closed, and how does it recover? |
| [case-101](#case-101) | States and feedback | What does the app show in case.closed-availability-ended, and how does it recover? |
| [case-102](#case-102) | States and feedback | What does the app show in case.reopened, and how does it recover? |
| [case-103](#case-103) | States and feedback | What does the app show in case.loading, and how does it recover? |
| [case-104](#case-104) | States and feedback | What does the app show in case.load-failed, and how does it recover? |
| [case-105](#case-105) | States and feedback | What does the app show in case.offline, and how does it recover? |
| [case-106](#case-106) | States and feedback | What does the app show in case.confirm-busy, and how does it recover? |
| [case-107](#case-107) | States and feedback | What does the app show in case.confirm-failed, and how does it recover? |
| [case-108](#case-108) | States and feedback | What does the app show in case.release-failed, and how does it recover? |
| [case-109](#case-109) | States and feedback | What does the app show in case.callback-failed, and how does it recover? |
| [case-110](#case-110) | States and feedback | What does the app show in rx.load-failed, and how does it recover? |
| [case-111](#case-111) | States and feedback | What does the app show in case.no-medicines, and how does it recover? |
| [case-112](#case-112) | States and feedback | What does the app show in case.long-content, and how does it recover? |
| [case-113](#case-113) | States and feedback | What does the app show in call.waiting-for-hangup, and how does it recover? |
| [case-114](#case-114) | States and feedback | What does the app show in call.transfer-failed, and how does it recover? |
| [case-115](#case-115) | States and feedback | What does the app show in call.skipHa, and how does it recover? |
| [case-116](#case-116) | States and feedback | What does the app show in case.callback-refused, and how does it recover? |
| [case-117](#case-117) | States and feedback | What does the app show in case.result-missing-pilot, and how does it recover? |
| [case-118](#case-118) | Limits and timings | What is the value of "gate"? |
| [case-119](#case-119) | Limits and timings | What is the value of "minCountedCall"? |
| [case-120](#case-120) | Limits and timings | What is the value of "talkWindow"? |
| [case-121](#case-121) | Limits and timings | What is the value of "noResultTimeout"? |
| [case-122](#case-122) | Limits and timings | What is the value of "stillOnCallRepeat"? |
| [case-123](#case-123) | Limits and timings | What is the value of "callRecordWait"? |
| [case-124](#case-124) | Limits and timings | What is the value of "holdRetryGap"? |
| [case-125](#case-125) | Limits and timings | What is the value of "holdRetryAttempts"? |
| [case-126](#case-126) | Limits and timings | What is the value of "pollingInterval"? |
| [case-127](#case-127) | Limits and timings | What is the value of "attemptGap"? |
| [case-128](#case-128) | Prototype stand-ins | The prototype fakes this: "A case only arrives while the doctor is available". What do we build? |
| [case-129](#case-129) | Prototype stand-ins | The prototype fakes this: "The backend sends these in the real app; the". What do we build? |
| [case-130](#case-130) | Prototype stand-ins | The prototype fakes this: "Callback times". What do we build? |
| [case-131](#case-131) | Prototype stand-ins | What decides Cat4 vs Pilot, value vs non-value medicines, HA required and HA-skip eligibility? |

<a id="case-01"></a>
### case-01 · What is the rule for "Stages"?

- **Stages** (calling stages follow the state table in §5; state IDs in brackets): — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-02"></a>
### case-02 · What happens in "Ready to call (call.ready)"?

- Ready to call (`call.ready`) — Order details + View Rx, medicines, notes (no script card before Call — D-58 pt 18, D-71): **Call patient** · Header Back → "Leave this case?" sheet: **Release case** / **Stay** (D-58 pt 20, OQ-024; label D-84 CA-22) — *Source: App logic §4.*

Decisions: D-58, D-71, D-84

<a id="case-03"></a>
### case-03 · What happens in "Calling — the whole call (call.calling 2 / 7a, call.calling-transfer 11)"?

- Calling — the whole call (`call.calling` 2 / 7a, `call.calling-transfer` 11) — End-of-call script in the slot under Order details, above the medicines, from the tap (D-58 pt 18): Status line "Calling {name}…" (D-74) **only — no Callback on a live call** (D-83). No separate Connecting / On call states (D-58 pt 14). **No End call** — the doctor ends the call on the phone · Header Back hidden from the tap on Call patient / Call again (D-80, D-81 F21); phone back → toast "Finish this case first. Then you can go back to Home." (`a-back-blocked`) — *Source: App logic §4.*

Decisions: D-58, D-74, D-83, D-80, D-81

<a id="case-04"></a>
### case-04 · What happens in "Script stays (call still live)"?

- Transfer ready (`call.transfer-ready` 12) — Script stays (call still live): **Confirm & transfer** · Skip HA — shown only once the backend confirms gate time since the patient answered and the call is live (D-58 pt 14) · Blocked — *Source: App logic §4.*

Decisions: D-58

<a id="case-05"></a>
### case-05 · What happens in "No script — the call has ended (D-58 pt 24)"?

- Call not valid (`call.ended-early` 6, `call.result-missing` 7d) — No script — the call has ended (D-58 pt 24): 6: notice · **Call again** · Callback (no Unavailable, D-58 pt 23) · 7d (Cat4): notice · **Confirm prescription** · Callback + Unavailable (reason sheet, D-75) · 7d (Pilot): **Confirm & forward** · Callback + Unavailable, no Skip HA · Blocked — *Source: App logic §4.*

Decisions: D-58, D-75

<a id="case-06"></a>
### case-06 · What happens in "No script — the call has ended (D-58 pt 24)"?

- Valid, call ended (`call.valid` 8a / 8b) — No script — the call has ended (D-58 pt 24): 8a: **Confirm prescription** only · 8b: **Confirm & forward** · ⏭ **Skip HA** full width (only when allowed, §6). No Callback · Blocked — *Source: App logic §4.*

Decisions: D-58

<a id="case-07"></a>
### case-07 · What happens in "Closed (completed / unavailable)"?

- Closed (`completed` / `unavailable`) — Outcome card directly under Order details (where the script was, D-58 point 16); content read-only and muted: **Request next case** · Back to Home (only **Back to Home**, as primary, if availability ended) · Header Back hidden; phone back → Home — *Source: App logic §4.*

Decisions: D-58

<a id="case-08"></a>
### case-08 · What is the rule for "Empty case (D-80 pt 4, D-81 F23, D-83)"?

- **Empty case (D-80 pt 4, D-81 F23, D-83):** no **Call patient**. An amber notice at the top of the panel says "No medicines on this order. Our Ops team will check it." (D-84; was "This order has no medicines. Release it — our Ops team will check it.") (where the released case goes is open, OQ-035). The main button is **Release case**, which releases directly (Releasing…, no sheet) and returns the doctor to Home. Header Back does the same. When Order details is hidden, View Rx is left-aligned. — *Source: App logic §4.*

Decisions: D-80, D-81, D-83, D-84

<a id="case-09"></a>
### case-09 · What is the rule for "Call ended, outcome card (D-81 F26, retired D-83)"?

- **Call ended, outcome card (D-81 F26, retired D-83):** the "End the call to get your next case." warning is retired with state 15b; after the hang-up the card is title only, neutral (MAIN-CHECK 2, D-85; `call.forwardedAfterHangup` retired, §14). — *Source: App logic §4.*

Decisions: D-81, D-83, D-85

<a id="case-10"></a>
### case-10 · What is the rule for "Bar and card rules"?

- **Bar and card rules:** a bar notice that is the result of an action ("Couldn't confirm…", "Prescribe or disable…") sits inside the action bar above its button. Cards on the case page and Prescribe are 16 apart; the end-of-call script card has 16 padding below in every state. The callback-scheduled card uses the calendar icon and the patient-unavailable card the phone-off icon, the same icons as their buttons. A two-line patient name makes the header taller, not tighter. Long medicine titles wrap balanced. — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-11"></a>
### case-11 · What is the rule for "Leaving a case"?

- **Leaving a case:** the back-blocked toast breaks between its two sentences. An **attempted call** = leg 2 answered (the patient picked up) (D-58). Once a call is attempted, leaving is blocked until the case is closed (callback, unavailable, confirm). Before that, header **Back** opens the "Leave this case?" sheet — **Release case** (the case returns to the queue) or **Stay** (D-58 point 20, OQ-024; label D-84 CA-22; on Ready and states 3 and 4 only). Header Back is on 1, 3 and 4 only, while the patient has never been reached. It is hidden from the **Call patient** / **Call again** tap, incl. Calling 7a, the 7b question, Transfer, and the callback sheets, and never returns once the patient answered, also on a later 3 / 4 (D-80 pt 1, D-81 F21). Behind the leave sheet, Releasing… and Release failed the screen is **Ready** (D-81 F22). The backend refuses Release once our call request is accepted, unless the result is 3 or 4 (D-80). Release returns the doctor to Home. If the patient answered just before the tap, the backend refuses the release and the doctor stays on the case (`a-release-failed`, "Couldn't release this case. You're still on it."). The unassign action itself is a backend dependency (OQ-024). Help stays available at every stage and is the way to reach Doctor Ops when something keeps failing. App closed or phone off mid-case → reopening goes straight back into the case `[OPEN OQ-025, backend]`. — *Source: App logic §4.*

Decisions: D-58, D-84, D-80, D-81

<a id="case-12"></a>
### case-12 · What is the rule for "End-of-call script"?

- **End-of-call script** (D-58 points 18, 21, 24 — copy keys in `messages.json`). Shown from the tap on Call while a call may be live; **hidden once the call has ended** (no one to read it to), except after a failed transfer (15) and B3, where the doctor is still on the line: — *Source: App logic §4.*

Decisions: D-58

<a id="case-13"></a>
### case-13 · What is the rule for "Launch B, Pilot live call"?

- Launch B, Pilot live call (B1, neutral): `call.scriptNeutral` — "I'm writing your prescription now. Our Health Advisor will help you with the next steps." — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-14"></a>
### case-14 · What is the rule for "Transfer"?

- Transfer (Pilot, Value Meds, version A — later): `call.scriptTransfer` — "I'm writing your prescription now. Please stay on the line — I'll connect you to our Health Advisor." — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-15"></a>
### case-15 · What is the rule for "Forward"?

- Forward (Pilot, Non-Value Meds, version A — later): `call.scriptForward` — "I'm writing your prescription now. Our Health Advisor will call you to help with the next steps." — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-16"></a>
### case-16 · What is the rule for "Everything else"?

- Everything else (Cat4, HA skipped): `call.scriptCat4` — "I'm writing your prescription now. You can track your order in the Truemeds app." — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-17"></a>
### case-17 · What is the rule for "After a failed transfer / no Health Advisor free"?

- After a failed transfer / no Health Advisor free: `call.forwardedTell` — "I've written your prescription. Our Health Advisor will call you back to help with the next steps." (one patient script for 15 and B3; the patient is never told about Health Advisor capacity). — *Source: App logic §4.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-18"></a>
### case-18 · What is the rule for "How a call works (first release)"?

- **How a call works (first release).** One telecom partner at a time (Ozonetel or Knowlarity), click-to-call. Doctor taps **Call patient** → the partner rings the **doctor's phone first** (leg 1) → then the **patient** (leg 2). The doctor talks and ends the call **on the phone**; there is **no End call in the app**. The partner reports leg 1 and leg 2 separately. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-19"></a>
### case-19 · What is the rule for "Gate time is a setting"?

- **Gate time is a setting** (today 50 s). Every message reads it — no "50" hard-coded in copy. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-20"></a>
### case-20 · What is the rule for "Talk time adds up"?

- **Talk time adds up** across connected calls on the same case (each at least ~10 s, within ~30 min) — D-58 point 22. The doctor is never shown the count. — *Source: App logic §5.*

Decisions: D-58

<a id="case-21"></a>
### case-21 · What is the rule for "Attempted call"?

- **Attempted call** = leg 2 answered. A failed request, a doctor who didn't answer, or a patient who didn't answer is not an attempted call. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-22"></a>
### case-22 · What is the rule for "Launch B, Pilot live call"?

- **Launch B, Pilot live call:** our app counts from the moment the patient answers, while the call is live; at the gate time **Confirm prescription** (B1) appears on the live call. Our count is the truth; the partner's duration is stored for reporting only. (**Transfer cases** — Confirm & transfer on the live call, Pilot Value Meds — are version A, later.) — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-23"></a>
### case-23 · What is the rule for "All other cases"?

- **All other cases** (Cat4, HA skipped, and Pilot calls that end before the gate or have no result): the next actions unlock only when the partner's call result arrives after the call ends. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-24"></a>
### case-24 · What is the rule for "Before the gate, never show"?

- **Before the gate, never show:** Confirm prescription, Confirm & transfer, Confirm & forward, Skip HA. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-25"></a>
### case-25 · What is the rule for "Patient-side failure"?

- **Patient-side failure** (leg 2: no answer, busy, rejected, switched off, unreachable, invalid number), whenever it is detected: the case closes as **Patient unavailable** (state 9) by itself and goes on **hold**; the system retries it by hangup cause. **Doctor-side failure** (the doctor's leg, or a request refused for a reason that isn't the patient's number) stays on 3 / 4. The doctor gets **Request next case** on 9. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-26"></a>
### case-26 · What is the rule for "Transfer"?

- **Transfer** (15, B3): 15 = the transfer couldn't start (no HA free, or the request failed); the doctor is still on the line. An HA who doesn't pick up is 14 for the doctor. While the call is live, 15 and B3 show only "Waiting for the call to end…"; after the hang-up, **Request next case · Back to Home**. A forward (15, B3) is confirmed only on the partner's result. **Launch: Fallback B first**. — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-27"></a>
### case-27 · What is the rule for "A call that's too short"?

- **A call that's too short** (state 6) offers **Call again · Callback** (D-58 point 23). No retry limit. **Callback is offered only after the call: on 6 and on 7d**. The backend refuses a callback unless the patient answered (leg 2). — *Source: App logic §5.*

Decisions: D-58

<a id="case-28"></a>
### case-28 · What is the rule for "No call result"?

- **No call result** (state 7, D-58 point 20): at 3 min the bar asks "Are you still on the call?" **only when the app can't know the call has ended**; when the partner has already reported the hang-up, the 3-min timeout goes straight to 7c. After "Call ended" and a backend check with nothing found: **Confirm prescription** (Cat4) or **Confirm & forward** (Pilot), with **Callback · Unavailable**. Confirm there shows "Waiting for the call record" until the record arrives (D-68); a record under the gate, or no record after a wait time, means the prescription is **not confirmed** → hold and retry. Nothing goes to Ops. A late result updates the screen by itself. Repeated problems → the doctor uses **Help** on the case. — *Source: App logic §5.*

Decisions: D-58, D-68

<a id="case-29"></a>
### case-29 · What is the rule for "Callback on a live call is refused by the backend"?

- **Callback on a live call is refused by the backend** unless the patient answered (leg 2); the sheet then shows "Couldn’t schedule a callback. The patient wasn’t reached.". — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-30"></a>
### case-30 · What is the rule for "Vendor terms are mapped by Engineering"?

- **Vendor terms are mapped by Engineering** to the buckets in the table (Ozonetel `CustomerStatus`, Knowlarity hangup causes — ). — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-31"></a>
### case-31 · What is the rule for "State table (final, 2026-10-24 — D-58 points 14–22; rows changed by the calling round are per D-83, see §14)"?

- **State table (final, 2026-10-24 — D-58 points 14–22; rows changed by the calling round are per D-83, see §14).** One row per state. Copy keys in `foundation/messages.ts`. During every call the End-of-call script shows under Order details. Callback is offered only on 6 and 7d (D-83). — *Source: App logic §5.*

Decisions: D-58, D-83

<a id="case-32"></a>
### case-32 · What happens in "call.ready" (state 1)?

- 1 — `call.ready`: Ready to call · Case opened · Call patient · header Back (leave sheet) · `t01-ready` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-33"></a>
### case-33 · What happens in "call.calling" (state 2)?

- 2 — `call.calling`: Calling (whole call) = 7a · Doctor taps Call; until a result · "Calling {name}…" status line only · no Callback · no header Back (D-81 F21) · `t02-calling` / `s7a-calling` — *Source: App logic §5.*

Decisions: D-81

<a id="case-34"></a>
### case-34 · What happens in "call.not-through" (state 3)?

- 3 — `call.not-through`: Didn't go through · Request refused, or leg-1 network/vendor error · Red notice · Call again · header Back · `t03-not-through` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-35"></a>
### case-35 · What happens in "call.doctor-missed" (state 4)?

- 4 — `call.doctor-missed`: You didn't answer · Leg 1 not answered / busy / rejected · Amber notice · Call again · header Back · `t04-doctor-missed` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-36"></a>
### case-36 · What happens in "call.result-wait" (state 5)?

- 5 — `call.result-wait`: Getting call result · Partner reported the hang-up (Pilot), result not in yet. Cat4 never reaches 5 · "Getting call result…" status line only · no Callback · `t05-result-wait` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-37"></a>
### case-37 · What happens in "call.ended-early" (state 6)?

- 6 — `call.ended-early`: Call too short · Result: total talk time on the case under the gate · Amber "Call too short…" · Call again · Callback (no Unavailable — D-58 point 23) · `t06-ended-early` — *Source: App logic §5.*

Decisions: D-58

<a id="case-38"></a>
### case-38 · What happens in "call.still-on-call" (state 7b)?

- 7b — `call.still-on-call`: Still on the call? · 3 min after the tap with no result (repeats every 3 min) · Grey "Are you still on the call?" · Still talking + Call ended · no header Back (D-81 F21) · `s7b-still-on-call` — *Source: App logic §5.*

Decisions: D-81

<a id="case-39"></a>
### case-39 · What happens in "call.checking" (state 7c)?

- 7c — `call.checking`: Checking call result (logic step) · Doctor tapped "Call ended", or the 3-min timeout after a reported hang-up; the app asks the backend for the call record — found → result path, nothing found → 7d · **Same screen as 5** (D-91): "Getting call result…" status line (`call.resultWait`), normal bar height, no script, no buttons · `t05-result-wait` — *Source: App logic §5.*

Decisions: D-91

<a id="case-40"></a>
### case-40 · What happens in "call.result-missing" (state 7d)?

- 7d — `call.result-missing`: Result not received · Backend check found nothing; the call has ended · Amber notice · Cat4: **Confirm prescription** · Callback + Unavailable · Pilot (`s7d-result-missing-pilot`): **Confirm & forward** · Callback + Unavailable · no Skip HA. Unavailable opens the reason sheet (D-75); **the chosen reason is saved with the case** for Ops monitoring (D-73) · `s7d-result-missing` / `s7d-result-missing-pilot` — *Source: App logic §5.*

Decisions: D-75, D-73

<a id="case-41"></a>
### case-41 · What happens in "—" (state 7e)?

- 7e — —: Leave this case? · Back in 1, 3, 4 only (D-80, D-83) · Approved sheet: Release case / Stay. Release returns to Home · `s7e-leave-sheet` — *Source: App logic §5.*

Decisions: D-80, D-83

<a id="case-42"></a>
### case-42 · What happens in "call.submitted" (state 7f)?

- 7f — `call.submitted`: Waiting for the call record · Confirm in 7d (or Confirm & forward on the Pilot route) · Grey card "Waiting for the call record · Your prescription is saved. We'll confirm it once the record arrives." (D-68); On the Cat4 route it becomes "Prescription confirmed" (10a) when the record arrives; on the Pilot route (Confirm & forward on 7d) it becomes **10b Forwarded to Health Advisor** (D-89, Q-A). **Under the gate, the patient never answered, or no record after a wait time (setting)** → not confirmed, back through hold and retry; no Ops review queue · Request next case · Back to Home · `s7f-submitted` — *Source: App logic §5.*

Decisions: D-68, D-89

<a id="case-43"></a>
### case-43 · What happens in "call.valid" (state 8a)?

- 8a — `call.valid`: Valid call (Cat4 / HA skipped) · Result: total talk time ≥ gate · Confirm prescription only · no Callback · no script (call has ended) · `t08a-valid-cat4` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-44"></a>
### case-44 · What happens in "call.valid" (state 8b)?

- 8b — `call.valid`: Valid call (forward) · Same · Confirm & forward · Skip HA (full width) · no Callback · no script · `t08b-valid-forward` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-45"></a>
### case-45 · What happens in "case.confirm-blocked" (state 8c)?

- 8c — `case.confirm-blocked`: Confirm tapped with Pending medicines · Tap on any confirm button while a medicine is Pending (Flag 5) · Confirm prescription only, plus a red line "Prescribe or disable {n} medicines first."; page scrolls to the first Pending medicine; button stays tappable; no Callback · `t08c-confirm-blocked` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-46"></a>
### case-46 · What happens in "call.patient-unavailable" (state 9)?

- 9 — `call.patient-unavailable`: Patient unavailable (automatic) · Leg 2 failed · Grey card · Request next case · Back to Home · `t09-patient-unavailable` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-47"></a>
### case-47 · What happens in "—" (state 10a)?

- 10a — —: Prescription confirmed · Confirm (Cat4) · Green card · Request next case · Back to Home · `t10a-confirmed` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-48"></a>
### case-48 · What happens in "—" (state 10b)?

- 10b — —: Forwarded to HA · Confirm & forward · Green card · same · `t10b-forwarded` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-49"></a>
### case-49 · What happens in "call.calling-transfer" (state 11)?

- 11 — `call.calling-transfer`: Calling, transfer case (later version A) · Tap on Call; until the backend confirms validity · "Calling {name}…" status line only · no Callback · no header Back (D-81 F21) · `t11-calling-transfer` — *Source: App logic §5.*

Decisions: D-81

<a id="case-50"></a>
### case-50 · What happens in "call.transfer-ready" (state 12)?

- 12 — `call.transfer-ready`: Confirm & transfer · Backend: gate time since `customerAnswered`, call live · Confirm & transfer · Skip HA (full width) · no Callback · `t12-transfer-ready` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-51"></a>
### case-51 · What happens in "—" (state 13)?

- 13 — —: Transferring · Tap on Confirm & transfer · "Transferring…" busy · Skip HA greyed and disabled (full width, K13) · no Callback · `t13-connecting-ha` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-52"></a>
### case-52 · What happens in "call.transferred" (state 14)?

- 14 — `call.transferred`: Transferred · Transfer succeeded · Green card · Request next case · Back to Home · `t14-transferred` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-53"></a>
### case-53 · What happens in "call.transfer-failed" (state 15)?

- 15 — `call.transfer-failed`: Health Advisor unavailable · Transfer couldn't start: no HA free, or the request failed; doctor still on the line · Amber card "Forwarded to Health Advisor · Read the script, then end the call." (`call.transferFailed`) + script. **Live: "Waiting for the call to end…" only** · `t15-ha-no-join` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-54"></a>
### case-54 · What happens in "—" (state 15 (after the hang-up))?

- 15 (after the hang-up) — —: **Neutral grey card (info icon), title only** "Forwarded to Health Advisor", no body line (D-85); **no script card**; Medicines card moves up · Partner reports the hang-up · Request next case · Back to Home · `t15-after-hangup` — *Source: App logic §5.*

Decisions: D-85

<a id="case-55"></a>
### case-55 · What happens in "retired (D-83, CW-E3)" (state 15b)?

- 15b — retired (D-83): — · — · Retired: the line "End the call to get your next case." and its button are gone; 15 and B3 wait for the hang-up instead. · `t15b-end-call-first` removed — *Source: App logic §5.*

Decisions: D-83

<a id="case-56"></a>
### case-56 · What happens in "call.transfer-missed" (state 16)?

- 16 — `call.transfer-missed`: Ended before the transfer · Ozonetel hang-up after the gate, not transferred · Amber notice naming who ended the call (doctor / patient / unknown) · Confirm & forward · Skip HA · no script · `t16-transfer-missed` (doctor) · `t16b-…-patient` · `t16c-…-unknown` — *Source: App logic §5.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-57"></a>
### case-57 · What happens in "call.skip-ha-wait" (state 17)?

- 17 — `call.skip-ha-wait`: Skip HA during a transfer call · Skip HA confirmed · Grey "Health Advisor call will be skipped. End the call when you’re done." (`call.skipHa`, D-85) · status line "Getting call result…" only (no "Calling {name}…", no buttons, no header Back), then Confirm prescription on the result · no Callback · `t17-skip-ha-wait` — *Source: App logic §5.*

Decisions: D-85

<a id="case-58"></a>
### case-58 · What is the rule for "A call that ends after the gate and before"?

- A call that ends after the gate and before Confirm → 16. Transfer path in B reuses 13–15. — *Source: App logic §5.*

Decisions: D-83, D-58, D-85

<a id="case-59"></a>
### case-59 · What is the rule for "Retired"?

- Retired: `b-missed-call`, `b-didnt-connect` (sheets) — replaced by the automatic close and the notices. `a-leave-sheet` / `s7e-leave-sheet` is the approved Release sheet (D-58 point 20). The old state name **hold** for "didn't connect" is retired (old Flag 4). — *Source: App logic §5.*

Decisions: D-58

<a id="case-60"></a>
### case-60 · What is the rule for "Update 2026-10-23 (D-58 point 14, temporarily approved)"?

- **Update 2026-10-23 (D-58 point 14, temporarily approved):** no separate Connecting / On call states; the app shows the call status within about 5 s of the partner reporting it (method: Engineering). Transfer button only after the backend confirms the call is valid. — *Source: App logic §5.*

Decisions: D-58

<a id="case-61"></a>
### case-61 · What is the rule for "Dependency (Engineering)"?

- **Dependency (Engineering):** the app gets call status by polling the backend (D-58 pt 19). Hiding Back once the patient answers and the transfer count both need **live** leg events from the partner during the call (leg 1 answered, leg 2 answered / Ozonetel `customerAnswered`), not only the result at the end (OQ-030). — *Source: App logic §5.*

Decisions: D-58

<a id="case-62"></a>
### case-62 · What is the rule for "Later, not this version"?

- **Later, not this version:** in-app calling (VoIP) with real call controls; the demo may show both modes with a switch (D-56). — *Source: App logic §5.*

Decisions: D-56

<a id="case-63"></a>
### case-63 · What is the rule for "Confirming… / Transferring… (D-81 F24–F25)"?

- **Confirming… / Transferring… (D-81 F24–F25):** medicine rows and notes are read-only and muted, with no arrows. View Rx stays the outlined button (D-76). — *Source: App logic §6.*

Decisions: D-81, D-76

<a id="case-64"></a>
### case-64 · What is the rule for "Launch = Fallback B (D-83, D-85)"?

- **Launch = Fallback B (D-83, D-85).** Pilot live call → **Confirm prescription** (B1) → B2 checks for an HA → free: Transferring → **Transferred** (14) · none: **Forwarded** (B3). Pilot call ended before Confirm (16) or 7d → **Confirm & forward**. Skip HA → 17 → result path → Confirm prescription. Non-Value Meds go through the same HA check. The table below is **version A (later)**, where the route is known at call start. — *Source: App logic §6.*

Decisions: D-83, D-85

<a id="case-65"></a>
### case-65 · What happens in "—"?

- Cat4 — —: Confirm prescription · Prescription confirmed — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-66"></a>
### case-66 · What happens in "HA skipped (by customer, system, or the doctor's Skip HA)"?

- Pilot — HA skipped (by customer, system, or the doctor's Skip HA): Confirm prescription · Prescription confirmed — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-67"></a>
### case-67 · What happens in "Value meds, HA required"?

- Pilot — Value meds, HA required: Confirm & transfer · Transferred to Health Advisor — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-68"></a>
### case-68 · What happens in "Non-value meds, HA required"?

- Pilot — Non-value meds, HA required: Confirm & forward · Forwarded to Health Advisor — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-69"></a>
### case-69 · What is the rule for "7d follows the route (D-83)"?

- **7d follows the route (D-83):** Cat4 / HA skipped → **Confirm prescription**; Pilot with an HA call → **Confirm & forward** (the transfer is no longer possible once the call has ended). Secondaries: **Callback + Unavailable**; no Skip HA on 7d. **Skip HA** on 8b, 12 and 16 sits full width under the main button (D-83, K1). — *Source: App logic §6.*

Decisions: D-83

<a id="case-70"></a>
### case-70 · What is the rule for "Skip HA"?

- **Skip HA** only after the gate, for **both Pilot types** (Value and Non-Value Meds) whenever an HA call follows the doctor call and it isn't already skipped — no other conditions (D-59). Opens the reason sheet: Patient declined HA call · Clinically not required · Repeat patient, familiar with the medicines — Counselled in an earlier order (D-70 item 3; title and sub-line). Choosing a reason applies it at once. On a call with a result the final button becomes **Confirm prescription**; during a live transfer call the case then waits for the call result (state 17, D-58 point 14). Skip HA is also offered after a missed transfer (state 16, D-58 point 24). — *Source: App logic §6.*

Decisions: D-59, D-70, D-58

<a id="case-71"></a>
### case-71 · What is the rule for "Cat4 never shows anything about HA"?

- Cat4 never shows anything about HA. HA-skipped Pilot never shows Transfer or Forward. — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-72"></a>
### case-72 · What is the rule for "Transfer vs forward"?

- **Transfer vs forward** (D-57): transfer = the patient is handed to an HA on the same call; forward = an HA calls the patient back separately. A failed transfer goes as a forward; after Transferring (13) the doctor sees state 15 `call.transfer-failed` — amber card "Forwarded to Health Advisor" with "Read the script, then end the call." (`call.transferFailed`) + script `call.forwardedTell` (§5, D-58 pts 17, 21, 23; MAIN-CHECK 2, D-85). A forward (15, B3) is confirmed only on the partner's result. — *Source: App logic §6.*

Decisions: D-57, D-58, D-85

<a id="case-73"></a>
### case-73 · What is the rule for "Confirm"?

- Confirm: button shows "Confirming…", everything else disabled, no second submit. Failure: notice in the bar "Couldn't confirm. Nothing was lost." (D-65). **Unclear result** (no answer from the server): the button stays on "Confirming…" — the same screen as `a-confirm-busy` — while the app checks; then it shows the confirmed card or the failure notice, never a second submit (D-69). An unclear result is checked before retrying (no double confirm). — *Source: App logic §6.*

Decisions: D-65, D-69

<a id="case-74"></a>
### case-74 · What is the rule for "Analytics"?

- **Analytics:** the four rows are four different outcomes and must stay separate events — never worked out from the button text (Cat4 and HA-skipped share a label). Event names are Engineering's choice `[LOCKED D-50]`. — *Source: App logic §6.*

Decisions: D-50

<a id="case-75"></a>
### case-75 · What is the rule for "✅ Flag 5"?

- ✅ **Flag 5 — answered:** Confirm is blocked while any medicine is Pending. The button stays tappable; on tap a notice in the bar says "Prescribe or disable {n} medicines first." and the page scrolls to the first Pending medicine. Applies to all three confirm buttons; Callback, Skip HA and Unavailable stay allowed. — *Source: App logic §6.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-76"></a>
### case-76 · What is the rule for "Callback"?

- **Callback** (sheet "Schedule callback"; button "Callback", icon from the design system, D-54) — *Source: App logic §7.*

Decisions: D-54

<a id="case-77"></a>
### case-77 · What is the rule for "Date"?

- Date: Today · Tomorrow. Time `[MOCK]`: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM. Real slots come from the backend. — *Source: App logic §7.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-78"></a>
### case-78 · What is the rule for "Missing choice → field error "Pick a date and"?

- Missing choice → field error "Pick a date and a time." / "Pick a date." / "Pick a time." — *Source: App logic §7.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-79"></a>
### case-79 · What is the rule for "Confirm callback"?

- **Confirm callback** closes the case (status card "Callback today at 3:00 PM"). The case goes to the callback pool, not back to this doctor (D-36) `[MOCK: the app treats it as closed for this session]`. Save failure: notice in the sheet, choices kept. — *Source: App logic §7.*

Decisions: D-36

<a id="case-80"></a>
### case-80 · What is the rule for "Available only on 6 Call too short and 7d Result not received"?

- **Available only on 6 Call too short and 7d Result not received** (D-83). Never on a live call. The sheet opens over that post-call state, never over Calling. The backend refuses a callback unless the patient answered (leg 2): error "Couldn’t schedule a callback. The patient wasn’t reached." (K3). — *Source: App logic §7.*

Decisions: D-83

<a id="case-81"></a>
### case-81 · What is the rule for "Patient unavailable"?

- **Patient unavailable** (D-51) — *Source: App logic §7.*

Decisions: D-51

<a id="case-82"></a>
### case-82 · What is the rule for "Automatic"?

- **Automatic** when the patient side fails (§5, state 9), whenever detected — the partner's reason is stored; no sheet. The case goes on hold and the system retries it by hangup cause; an invalid number is not retried. Nothing goes to Ops. — *Source: App logic §7.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-83"></a>
### case-83 · What is the rule for "By the doctor"?

- **By the doctor** only in 7d (result not received); state 6 has no Unavailable (D-58 pt 23). **Unavailable** opens the reason sheet "Mark patient unavailable" (D-75): Didn't answer · Not reachable · Wrong number. Choosing a reason closes the case at once (it is the confirmation); × backs out with no change. **The reason is saved with the case** for Ops monitoring (D-73). — *Source: App logic §7.*

Decisions: D-58, D-75, D-73

<a id="case-84"></a>
### case-84 · What is the rule for "Status card "Patient unavailable" with a neutral icon; medicines"?

- Status card "Patient unavailable" with a neutral icon; medicines keep their status (Pending stays Pending). — *Source: App logic §7.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-85"></a>
### case-85 · What is the rule for "✅ Flag 6"?

- ✅ **Flag 6 — answered:** the case does go back to the queue, but the doctor is not told — no queue line anywhere. **Updated D-83:** the case goes on hold and the system retries it by hangup cause; nothing goes to Ops. — *Source: App logic §7.*

Decisions: D-83, D-51

<a id="case-86"></a>
### case-86 · What is the rule for "Keyboard rule (D-81)"?

- **Keyboard rule (D-81):** on Prescribe (Other dose, Additional instructions) and the case page (Chief complaints, Doctor notes) the focused field scrolls into view above the keyboard with its label and helper. The pinned action bar hides while the keyboard is open and returns when it closes (same reason as D-43). — *Source: App logic §9.*

Decisions: D-81, D-43

<a id="case-87"></a>
### case-87 · What is the rule for "Keyboard type"?

- **Keyboard type:** notes fields (Chief complaints, Doctor notes, Additional instructions) open the text keyboard. The Other dose field keeps the number pad with a decimal key, and its error shows a mistake a doctor can really make on that pad. — *Source: App logic §9.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-88"></a>
### case-88 · What is the rule for "Order details ⓘ"?

- **Order details ⓘ** expands in its card: Order created, Expected delivery, Payment. Hidden when the order has none of these. — *Source: App logic §9.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-89"></a>
### case-89 · What is the rule for "View Rx"?

- **View Rx** opens the customer's prescription full screen: zoom (50–400%), rotate, reset, pinch and drag. Load failure: notice + Try again; ✕ always closes. Disabled while confirming. — *Source: App logic §9.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-90"></a>
### case-90 · What is the rule for "Notes & symptoms"?

- **Notes & symptoms** (D-59): Chief complaints / symptoms and Doctor notes, both optional. Editable from the moment the case opens until Confirm; typed text kept if the connection drops. **Saved only when the prescription is confirmed** — a case closed as Callback or Unavailable discards them (they are consultation notes, not a call log). Locked after Confirm. **Symptoms are printed on the prescription; Doctor notes are internal only** (doctor, HA, ops, pharmacy). — *Source: App logic §9.*

Decisions: D-59

<a id="case-91"></a>
### case-91 · What is the rule for "Loading"?

- **Loading** (case): a skeleton shaped like the loaded page: an Order details row, Medicines and Notes blocks, in the same places (D-81 F28). — *Source: App logic §10.*

Decisions: D-81

<a id="case-92"></a>
### case-92 · What is the rule for "Notices"?

- **Notices** wrap balanced, set centrally. — *Source: App logic §10.*

Decisions: D-78 (the approved screens and app logic)

<a id="case-93"></a>
### case-93 · What is the rule for "Follow the feedback map exactly"?

- Follow the feedback map exactly. Summary for the case page: loading = card outlines, no actions · load failed = notice + Try again · offline = yellow notice in the bar "You're offline. Reconnect to call or confirm." (D-54) · an action tried offline fails with one error notice, nothing lost · release failed = notice, doctor stays on the case. — *Source: App logic §10.*

Decisions: D-54

<a id="case-94"></a>
### case-94 · What is the rule for "Sheets over the bar and pinned actions (Round 6)"?

- **Sheets over the bar and pinned actions.** A sheet always covers the pinned action bar of the screen behind it; the bar takes no tap while a sheet is open. When a sheet is taller than the space, its header and its buttons stay pinned and the content between them scrolls (RULES §9.4). Buttons stay fully visible and tappable at 390×844 and 360×640. — *Source: App logic §13*

Decisions: D-78 (the approved screens and app logic)

<a id="case-95"></a>
### case-95 · What is the rule for "Busy states (B-01, B-02, B-03)"?

- **Busy states.** Busy bars keep their height and the button's place: Transferring… keeps the Skip HA row, greyed and disabled, with no Callback (D-83 K13); Confirming… keeps its row. The status line takes the buttons' row in the confirm fallback (B2). 7c shows the same screen as 5 at normal bar height — no empty tray (D-91). The end-of-call script card has 16 padding below in every state. — *Source: App logic §13*

Decisions: D-83, D-91

<a id="case-96"></a>
### case-96 · What is the rule for "Header edge (B-07, Round 5)"?

- **Header edge.** In the compact task header, the edit header (Prescribe) and the viewer header (Rx), Back / ✕ is a 48px target whose glyph starts on the 16px margin; the title starts 54px from the edge on all three, the same as the sheet ✕ and the compact header. — *Source: App logic §13*

Decisions: D-78 (the approved screens and app logic)

<a id="case-97"></a>
### case-97 · What does the app show in case.back-before-call, and how does it recover?

- case.back-before-call: Confirmation sheet — Only on Ready and states 3 and 4 (no call attempted). Back (header or phone gesture) opens "Leave this case?" · "It goes back to the queue for another doctor." From the Call tap the header Back is hidden and never returns once the patient answered (D-80 pt 1, D-81 F21). Sheet sits over Ready (D-81 F22). — *Source: Feedback state map: case.back-before-call*

Decisions: D-80, D-81

<a id="case-98"></a>
### case-98 · What does the app show in case.releasing, and how does it recover?

- case.releasing: L1 — Release pending over Ready; one request; primary shows the busy state (L2). Failure keeps the doctor on the case with an F2 notice. Backend refuses Release once our call is accepted, unless the result is 3 or 4 (D-80). — *Source: Feedback state map: case.releasing*

Decisions: D-80

<a id="case-99"></a>
### case-99 · What does the app show in case.back-blocked, and how does it recover?

- case.back-blocked: N1 (not an error) — Call attempted or connected, case not closed. Header Back hidden from the call tap on; phone back gesture shows "Finish this case first. Then you can go back to Home." (D-81 F21). — *Source: Feedback state map: case.back-blocked*

Decisions: D-81

<a id="case-100"></a>
### case-100 · What does the app show in case.closed, and how does it recover?

- case.closed: None — End of case: confirmation at the top of the content, titled by path ("Prescription confirmed" / "Transferred to HA" / "Forwarded to HA"); pinned bar **Request next case** (primary) + **Back to Home** (secondary), stacked. Header Back hidden; phone back → Home. Case content read-only and muted (D-51). — *Source: Feedback state map: case.closed*

Decisions: D-51

<a id="case-101"></a>
### case-101 · What does the app show in case.closed-availability-ended, and how does it recover?

- case.closed-availability-ended: None — Availability ended during the case: only **Back to Home**; Home shows the expired state. — *Source: Feedback state map: case.closed-availability-ended*

Decisions: D-78 (the approved screens and app logic)

<a id="case-102"></a>
### case-102 · What does the app show in case.reopened, and how does it recover?

- case.reopened: None — App reopened with a case open → straight back into the case. — *Source: Feedback state map: case.reopened*

Decisions: D-78 (the approved screens and app logic)

<a id="case-103"></a>
### case-103 · What does the app show in case.loading, and how does it recover?

- case.loading: L1 — Skeleton shaped like the loaded page: an Order details row, Medicines and Notes blocks, in the same places; no text, no actions until loaded (D-81 F28). — *Source: Feedback state map: case.loading*

Decisions: D-81

<a id="case-104"></a>
### case-104 · What does the app show in case.load-failed, and how does it recover?

- case.load-failed: F2 — Error notice "Couldn't load this case." + primary **Try again**; nothing else on the page. *Copy approved (D-53).* — *Source: Feedback state map: case.load-failed*

Decisions: D-53

<a id="case-105"></a>
### case-105 · What does the app show in case.offline, and how does it recover?

- case.offline: W1 → F2 — Warning notice (D-54: offline blocks the main action) "You're offline. Reconnect to call or confirm." while browsing; an action attempted offline fails with one error notice "No connection. Nothing was lost. Try again when you're back online." Typed notes are kept. *Copy approved (D-53).* — *Source: Feedback state map: case.offline*

Decisions: D-54, D-53

<a id="case-106"></a>
### case-106 · What does the app show in case.confirm-busy, and how does it recover?

- case.confirm-busy: L1 — Final CTA busy (L2), label **"Confirming…"**; every other action disabled; medicine rows and notes read-only and muted; View Rx stays the outlined button (D-81 F24–F25). No second submit. *Copy approved (D-53).* — *Source: Feedback state map: case.confirm-busy*

Decisions: D-81, D-53

<a id="case-107"></a>
### case-107 · What does the app show in case.confirm-failed, and how does it recover?

- case.confirm-failed: F2 — Error notice above the bar "Couldn't confirm. Nothing was lost. Try again."; CTA back to normal. An uncertain result is reconciled before retry (no duplicate confirm). *Copy approved (D-53).* — *Source: Feedback state map: case.confirm-failed*

Decisions: D-53

<a id="case-108"></a>
### case-108 · What does the app show in case.release-failed, and how does it recover?

- case.release-failed: F2 — Sheet closes over Ready; doctor stays on the case; error notice "Couldn't release this case. You're still on it. Try again."; Back works again. *Copy approved (D-53).* (D-81 F22) — *Source: Feedback state map: case.release-failed*

Decisions: D-53, D-81

<a id="case-109"></a>
### case-109 · What does the app show in case.callback-failed, and how does it recover?

- case.callback-failed: F2 — Error notice inside the sheet "Couldn't schedule the callback. Your time is kept. Try again."; chosen date and time kept. *Copy approved (D-53).* — *Source: Feedback state map: case.callback-failed*

Decisions: D-53

<a id="case-110"></a>
### case-110 · What does the app show in rx.load-failed, and how does it recover?

- rx.load-failed: F2 — Inside the viewer: notice "Couldn't load the prescription." + **Try again**; ✕ still closes. *Copy approved (D-53).* — *Source: Feedback state map: rx.load-failed*

Decisions: D-53

<a id="case-111"></a>
### case-111 · What does the app show in case.no-medicines, and how does it recover?

- case.no-medicines: Standing state (top of the panel) — Amber notice "No medicines on this order. Our Ops team will check it." (`case.noMedicines`, D-84) above the medicines card, which shows no text; no Call patient; main button **Release case**, which releases directly (no sheet) and returns to Home; header Back does the same (D-80 pt 4, D-81 F23, D-83). — *Source: Feedback state map: case.no-medicines*

Decisions: D-84, D-80, D-81, D-83

<a id="case-112"></a>
### case-112 · What does the app show in case.long-content, and how does it recover?

- case.long-content: — — Long patient name (two lines in the header) and long medicine names, checked at 360. — *Source: Feedback state map: case.long-content*

Decisions: D-78 (the approved screens and app logic)

<a id="case-113"></a>
### case-113 · What does the app show in call.waiting-for-hangup, and how does it recover?

- call.waiting-for-hangup: Status line — "Waiting for the call to end…" (`call.waitingForHangup`) in the bar, where the buttons would be, while a forward or a failed transfer is still live (15, B3; D-83 K8, K9). After the hang-up: Request next case · Back to Home. — *Source: Feedback state map: call.waiting-for-hangup*

Decisions: D-83

<a id="case-114"></a>
### case-114 · What does the app show in call.transfer-failed, and how does it recover?

- call.transfer-failed: Card body (live) — "Read the script, then end the call." (`call.transferFailed`) in the amber card under "Forwarded to Health Advisor" while the call is live on 15 and B3. The patient script (`call.forwardedTell`): "I’ve written your prescription. Our Health Advisor will call you back to help with the next steps." Copy never says the Health Advisor is unavailable (MAIN-CHECK 2 item 2). — *Source: Feedback state map: call.transfer-failed*

Decisions: D-78 (the approved screens and app logic)

<a id="case-115"></a>
### case-115 · What does the app show in call.skipHa, and how does it recover?

- call.skipHa: Grey note in the bar — "Health Advisor call will be skipped. End the call when you’re done." on 17 (`t17-skip-ha-wait`), with the no-HA script and the status line "Getting call result…" (D-85). No Calling line, no buttons. — *Source: Feedback state map: call.skipHa*

Decisions: D-85

<a id="case-116"></a>
### case-116 · What does the app show in case.callback-refused, and how does it recover?

- case.callback-refused: F2 — Error notice inside the Schedule callback sheet "Couldn’t schedule a callback. The patient wasn’t reached." (`callback.notReached`) when the backend refuses a callback without leg 2 answered (D-83). Choices kept. — *Source: Feedback state map: case.callback-refused*

Decisions: D-83

<a id="case-117"></a>
### case-117 · What does the app show in case.result-missing-pilot, and how does it recover?

- case.result-missing-pilot: Same as 7d — Pilot 7d: "We didn’t get the call result." notice; **Confirm & forward** · Callback + Unavailable; no Skip HA (D-83). — *Source: Feedback state map: case.result-missing-pilot*

Decisions: D-83

<a id="case-118"></a>
### case-118 · What is the value of "gate"?

- 50 s. Agreed rule (D-58 pt 14, OQ-001). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-58

<a id="case-119"></a>
### case-119 · What is the value of "minCountedCall"?

- 10 s. Agreed rule (D-58 pt 22 (~10 s)). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-58

<a id="case-120"></a>
### case-120 · What is the value of "talkWindow"?

- 30 min. Agreed rule (D-58 pt 22 (~30 min)). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-58

<a id="case-121"></a>
### case-121 · What is the value of "noResultTimeout"?

- 3 min. Agreed rule (D-58 pt 20). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-58

<a id="case-122"></a>
### case-122 · What is the value of "stillOnCallRepeat"?

- 3 min. Agreed rule (D-83). Read it from configuration; copy reads the value, never a typed number. — *Source: Setting (agreed rule)*

Decisions: D-83

<a id="case-123"></a>
### case-123 · What is the value of "callRecordWait"?

- [MOCK] 30 min in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: D-73 (30 min); OQ-033 wait time to agree. — *Source: Prototype setting [MOCK]*

Decisions: D-73

<a id="case-124"></a>
### case-124 · What is the value of "holdRetryGap"?

- [MOCK] 15 min in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: gap between retries; Engineering to agree. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-125"></a>
### case-125 · What is the value of "holdRetryAttempts"?

- [MOCK] 3 in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: attempts before plain hold. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-126"></a>
### case-126 · What is the value of "pollingInterval"?

- [MOCK] 3 s in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: inside D-58 pt 14 (about 5 s). — *Source: Prototype setting [MOCK]*

Decisions: D-58

<a id="case-127"></a>
### case-127 · What is the value of "attemptGap"?

- [MOCK] 60 s in the prototype. Keep configurable (a server or config value, never typed into a screen); not a production promise. Note: review tool: gap between scheduled call attempts. — *Source: Prototype setting [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-128"></a>
### case-128 · The prototype fakes this: "A case only arrives while the doctor is available". What do we build?

- [MOCK] A case only arrives while the doctor is available: a fixture keeps the session's availability, or starts 30 min. Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-129"></a>
### case-129 · The prototype fakes this: "The backend sends these in the real app; the". What do we build?

- [MOCK] The backend sends these in the real app; the doctor never sets quantity (D-04, D-06). values throughout. Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-130"></a>
### case-130 · The prototype fakes this: "Callback times". What do we build?

- [MOCK] Callback times (app-logic §7) —: real slots come from the backend. Values are 24 h times; labels as the Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="case-131"></a>
### case-131 · What decides Cat4 vs Pilot, value vs non-value medicines, HA required and HA-skip eligibility?

-  — *Source: App logic §6*
- [MOCK] The prototype reads them as fields on the sample case (case type, HA status). Keep them as backend fields; the app never works them out. — *Source: Prototype [MOCK]*

Decisions: D-50

## Prescribe

| # | Topic | Question |
|---|---|---|
| [rx-01](#rx-01) | App rules | What is the rule for "On the case page"? |
| [rx-02](#rx-02) | App rules | What is the rule for "What the doctor can do"? |
| [rx-03](#rx-03) | App rules | What is the rule for "Header"? |
| [rx-04](#rx-04) | App rules | What is the rule for "How often"? |
| [rx-05](#rx-05) | App rules | What doses can be picked for Tablet? |
| [rx-06](#rx-06) | App rules | What doses can be picked for Capsule? |
| [rx-07](#rx-07) | App rules | What doses can be picked for Syrup? |
| [rx-08](#rx-08) | App rules | What doses can be picked for Drops? |
| [rx-09](#rx-09) | App rules | What doses can be picked for Inhaler? |
| [rx-10](#rx-10) | App rules | What doses can be picked for Injection? |
| [rx-11](#rx-11) | App rules | What doses can be picked for Cream? |
| [rx-12](#rx-12) | App rules | What is the rule for "Dose grids"? |
| [rx-13](#rx-13) | App rules | What is the rule for "Duration picker"? |
| [rx-14](#rx-14) | App rules | What is the rule for "Option labels"? |
| [rx-15](#rx-15) | App rules | What is the rule for "Rx failed notice"? |
| [rx-16](#rx-16) | App rules | What is the rule for "Every X hours"? |
| [rx-17](#rx-17) | App rules | What is the rule for "SOS only"? |
| [rx-18](#rx-18) | App rules | What is the rule for "Duration"? |
| [rx-19](#rx-19) | App rules | What is the rule for "Food (optional)"? |
| [rx-20](#rx-20) | App rules | What is the rule for "Checks before Prescribe"? |
| [rx-21](#rx-21) | App rules | What is the rule for "An error on Prescribe scrolls the screen to the first error"? |
| [rx-22](#rx-22) | App rules | What is the rule for "Prescribe"? |
| [rx-23](#rx-23) | App rules | What is the rule for "A disabled medicine"? |
| [rx-24](#rx-24) | App rules | What is the rule for "✕ with changes"? |
| [rx-25](#rx-25) | App rules | What is the rule for "Disable"? |
| [rx-26](#rx-26) | App rules | What is the rule for "Printed line"? |
| [rx-27](#rx-27) | App rules | What is the rule for "Keyboard rule (D-81)"? |
| [rx-28](#rx-28) | App rules | What is the rule for "Keyboard type"? |
| [rx-29](#rx-29) | States and feedback | What does the app show in prescribe.dose-error, and how does it recover? |
| [rx-30](#rx-30) | States and feedback | What does the app show in prescribe.disabled, and how does it recover? |
| [rx-31](#rx-31) | States and feedback | What does the app show in prescribe.keyboard, and how does it recover? |
| [rx-32](#rx-32) | Prototype stand-ins | The prototype fakes this: "The backend's default for Ongoing". What do we build? |
| [rx-33](#rx-33) | Prototype stand-ins | Does Prescribe or Disable save to the server, and what shows if that save fails? |

<a id="rx-01"></a>
### rx-01 · What is the rule for "On the case page"?

- **On the case page**: each row = icon by form, name + strength, **Qty** and status tag (Prescribed = green · Pending = yellow · Disabled = grey). No dose or duration on the case page (D-54). Tap → Prescribe. Closed case: rows read-only, no arrow. — *Source: App logic §8.*

Decisions: D-54

<a id="rx-02"></a>
### rx-02 · What is the rule for "What the doctor can do"?

- **What the doctor can do**: prescribe (set the schedule) or disable a medicine. The doctor **cannot add medicines** and **does not set quantity** (backend) `[LOCKED D-04, D-06]`. Qty appears only on the case page rows (read-only); the Prescribe screen shows no Qty (D-56). — *Source: App logic §8.*

Decisions: D-04, D-06, D-56

<a id="rx-03"></a>
### rx-03 · What is the rule for "Header"?

- Header: ✕, medicine name + form, **Disable**. Pinned "On prescription" line shows exactly what will print, updated on every tap. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-04"></a>
### rx-04 · What is the rule for "How often"?

- **How often:** Daily · Every X hours · Alt days · Weekly · Monthly · SOS only. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-05"></a>
### rx-05 · What doses can be picked for Tablet?

- Daily slots (M / A / N): 0 · ½ · 1 · 2 · Single dose options: ½ · 1 · 2 · Other: — — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-06"></a>
### rx-06 · What doses can be picked for Capsule?

- Daily slots (M / A / N): 0 · 1 · 2 · Single dose options: 1 · 2 · Other: — — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-07"></a>
### rx-07 · What doses can be picked for Syrup?

- Daily slots (M / A / N): 0 · 2.5 · 5 · 10 ml · Single dose options: 2.5 · 5 · 10 ml · Other: Other (ml) — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-08"></a>
### rx-08 · What doses can be picked for Drops?

- Daily slots (M / A / N): 0 · 1 · 2 · 3 · Single dose options: 1 · 2 · 3 · Other: — — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-09"></a>
### rx-09 · What doses can be picked for Inhaler?

- Daily slots (M / A / N): 0 · 1 · 2 puffs · Single dose options: 1 · 2 · Other: — — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-10"></a>
### rx-10 · What doses can be picked for Injection?

- Daily slots (M / A / N): 0 · 1 · 2 · 3 · Single dose options: 1 · 2 · 3 (D-54) · Other: Other (units) — *Source: App logic §8.*

Decisions: D-54

<a id="rx-11"></a>
### rx-11 · What doses can be picked for Cream?

- Daily slots (M / A / N): — / Apply · Single dose options: Apply · Other: — — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-12"></a>
### rx-12 · What is the rule for "Dose grids"?

- **Dose grids:** a single-row dose grid uses the M / A / N column width, so every option grid on the screen has one chip size (D-55). The M / A / N letters sit on the "Dose" label's left edge. The unit label is "Dose (units)" for every form that counts units. — *Source: App logic §8.*

Decisions: D-55

<a id="rx-13"></a>
### rx-13 · What is the rule for "Duration picker"?

- **Duration picker:** number and unit chips sit inside the same inset as the field text, with 8 between the two rows. The "On prescription" band keeps a number and its unit together: "6 months" never splits. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-14"></a>
### rx-14 · What is the rule for "Option labels"?

- **Option labels:** "(optional)" is grey regular on Food and on Additional instructions. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-15"></a>
### rx-15 · What is the rule for "Rx failed notice"?

- **Rx failed notice:** 16 below the header, as elsewhere. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-16"></a>
### rx-16 · What is the rule for "Every X hours"?

- **Every X hours:** 4 · 6 · 8 · 12 h (helper "4 times a day, round the clock"). — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-17"></a>
### rx-17 · What is the rule for "SOS only"?

- SOS only: dose + **Max doses a day** 1–4. Other schedules: optional **Also as needed (SOS)** with its own dose and **Max extra doses a day** 1–4. — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-18"></a>
### rx-18 · What is the rule for "Duration"?

- **Duration:** numbers 1–7, 10, 14, 15 + Days / Weeks / Months, or **Ongoing** (prints the backend default, `[MOCK]` 6 months). Shows "Default" or "Changed from default". — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-19"></a>
### rx-19 · What is the rule for "Food (optional)"?

- **Food (optional):** After food · Before food · Empty stomach (tap again to clear). **Additional instructions (optional)**, with the helper "Printed on the prescription." (D-81 F19). — *Source: App logic §8.*

Decisions: D-81

<a id="rx-20"></a>
### rx-20 · What is the rule for "Checks before Prescribe"?

- **Checks before Prescribe:** daily schedule with no dose at all → "Choose a dose for at least one time of day." · Other picked with no valid number → "Enter the dose in ml/units." or "Use numbers only, e.g. 7.5 units." (only plain positive numbers: 7, 7.5,.5). — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-21"></a>
### rx-21 · What is the rule for "An error on Prescribe scrolls the screen to the first error"?

- **An error on Prescribe scrolls the screen to the first error.** The M / A / N "choose a dose" error is field text under the grid, not a tinted box; other errors sit under their field (D-81 F16). — *Source: App logic §8.*

Decisions: D-81

<a id="rx-22"></a>
### rx-22 · What is the rule for "Prescribe"?

- **Prescribe** saves, marks the medicine Prescribed (and re-enables it if it was disabled). — *Source: App logic §8.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-23"></a>
### rx-23 · What is the rule for "A disabled medicine"?

- **A disabled medicine** opens with the note "Disabled: {reason}. Prescribing it will enable it again." (state `d-disabled`, D-81 F17, D-20). — *Source: App logic §8.*

Decisions: D-81, D-20

<a id="rx-24"></a>
### rx-24 · What is the rule for "✕ with changes"?

- **✕ with changes** → "Discard changes?" sheet: **Discard** (red outline) on top, Keep editing below (D-54). No changes → closes at once. — *Source: App logic §8.*

Decisions: D-54

<a id="rx-25"></a>
### rx-25 · What is the rule for "Disable"?

- **Disable** → sheet "Disable {name}" with reasons: Can’t prescribe remotely · Contraindicated for patient · Duplicate medication · Patient declined · Wrong strength. Choosing a reason disables it at once (status Disabled). A disabled medicine is **removed from the order**; the order ships without it. If no medicine is left, the order is cancelled later (ops/backend). No extra warning for the last medicine — the reason sheet is the friction (D-59). — *Source: App logic §8.*

Decisions: D-59

<a id="rx-26"></a>
### rx-26 · What is the rule for "Printed line"?

- **Printed line** = schedule · duration · food (if chosen) · instructions (if written), e.g. "1-0-1 + SOS 1 tablet (max 1 tablet/day) · 6 months · After food". **SOS limit (D-80 pt 3, D-81 F14):** the daily total in the medicine's unit: "2 puffs as needed (max 8 puffs/day)"; a total of 1 is singular ("max 1 tablet/day"); cream prints "Apply as needed (max 3 times/day)". — *Source: App logic §8.*

Decisions: D-80, D-81

<a id="rx-27"></a>
### rx-27 · What is the rule for "Keyboard rule (D-81)"?

- **Keyboard rule (D-81):** on Prescribe (Other dose, Additional instructions) and the case page (Chief complaints, Doctor notes) the focused field scrolls into view above the keyboard with its label and helper. The pinned action bar hides while the keyboard is open and returns when it closes (same reason as D-43). — *Source: App logic §9.*

Decisions: D-81, D-43

<a id="rx-28"></a>
### rx-28 · What is the rule for "Keyboard type"?

- **Keyboard type:** notes fields (Chief complaints, Doctor notes, Additional instructions) open the text keyboard. The Other dose field keeps the number pad with a decimal key, and its error shows a mistake a doctor can really make on that pad. — *Source: App logic §9.*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-29"></a>
### rx-29 · What does the app show in prescribe.dose-error, and how does it recover?

- prescribe.dose-error: F1 — "Choose a dose for at least one time of day." as field text under the M / A / N grid; the screen scrolls to the first error (D-81 F16). — *Source: Feedback state map: prescribe.dose-error*

Decisions: D-81

<a id="rx-30"></a>
### rx-30 · What does the app show in prescribe.disabled, and how does it recover?

- prescribe.disabled: N1 — "Disabled: {reason}. Prescribing it will enable it again." (`d-disabled`; D-81 F17, D-20). — *Source: Feedback state map: prescribe.disabled*

Decisions: D-81, D-20

<a id="rx-31"></a>
### rx-31 · What does the app show in prescribe.keyboard, and how does it recover?

- prescribe.keyboard: none — Focused field (Other dose, Additional instructions; Chief complaints, Doctor notes on the case page) scrolls above the keyboard with its label and helper; the pinned bar hides while the keyboard is open (D-81 F20). — *Source: Feedback state map: prescribe.keyboard*

Decisions: D-81

<a id="rx-32"></a>
### rx-32 · The prototype fakes this: "The backend's default for Ongoing". What do we build?

- [MOCK] The backend's default for Ongoing Keep configurable; the real value or answer comes from the backend. — *Source: Prototype [MOCK]*

Decisions: D-78 (the approved screens and app logic)

<a id="rx-33"></a>
### rx-33 · Does Prescribe or Disable save to the server, and what shows if that save fails?

- [MOCK] No server call: the prototype keeps each Prescribe and Disable on the phone with the case, and everything is sent once, with the case's confirm button (Confirming…; an unclear result is checked, never sent twice, D-69). So Prescribe has no save-failure state. Keep it that way; if the backend later saves each medicine on its own, a save-failure state needs design first. — *Source: Prototype [MOCK]*

Decisions: D-69


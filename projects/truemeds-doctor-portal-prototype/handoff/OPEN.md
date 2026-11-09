# OPEN — Sign-in

Still open. Build with the **current assumption**, keep it easy to change, and ask the named owner. If your question is in neither DECIDED.md nor here, it is genuinely new: ask it.
Generated from the product rules — do not edit by hand.

| # | Question | Who answers |
|---|---|---|
| [o01](#o01) | How long are the OTP issue window, the number lock and the code life in production? | Backend + Product |
| [o02](#o02) | How long is the "Try again in m:ss" wait after too many attempts? | Backend |
| [o03](#o03) | Send OTP again for the same number while the resend wait is still running: what does the server answer? | Backend |
| [o04](#o04) | More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message? | Product |
| [o05](#o05) | Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)? | Product |
| [o06](#o06) | When the "Try again in m:ss" countdown ends, does the notice stay until the number changes, or go away? | Product |
| [o07](#o07) | Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)? | Product |
| [o08](#o08) | Android back gesture on Sign-in (the first screen): leave the app, or stay? | Product |
| [o09](#o09) | The prototype draws a number keyboard in its pictures. Do we draw one? | — (prototype only; no action) |
| [o10](#o10) | Coming back from OTP (Change): is the number kept, and does the first typed digit replace it? | Product |
| [o11](#o11) | Terms, Privacy and support links: final URLs, and where are they configured? | Product + Ops |
| [o13](#o13) | The busy spinner's ring is drawn in a raw white (#fff) in the design system. Which token? | Design |
| [o12](#o12) | How long does a signed-in session last before OTP is asked again? | Backend + Product |

<a id="o01"></a>
### o01 · How long are the OTP issue window, the number lock and the code life in production?

- **Current assumption:** **Safe placeholder:** 5 min code life, resend 30 s → 1 min → 2 min, 15 min number lock after the decided 5 wrong tries; session 24 h; ops approval timing still unconfirmed. `[MOCK ASSUMPTION]` — *OQ-017*
- **Who answers:** Backend + Product
- **References:** OQ-017, D-34, D-35

<a id="o02"></a>
### o02 · How long is the "Try again in m:ss" wait after too many attempts?

- **Current assumption:** The server sends the time the wait ends; the prototype uses otpWindow, otpLock, resendWaits, tooManyTriesWait as stand-ins (mock values, not product promises). — *Sign-in build*
- **Who answers:** Backend
- **References:** OQ-017, D-35

<a id="o03"></a>
### o03 · Send OTP again for the same number while the resend wait is still running: what does the server answer?

- **Current assumption:** Assumed: no new code is sent; OTP opens on the running wait and the code already sent stays valid. — *Sign-in build*
- **Who answers:** Backend

<a id="o04"></a>
### o04 · More than 10 digits that aren't a +91 or 0 prefix: cut silently or show a message?

- **Current assumption:** Current build: extra digits are cut silently (no message); see d01. **For review:** "That’s more than 10 digits. Check the number." instead of silently cutting an 11+ digit entry that isn't a +91 / 0 prefix. Not built until approved. — *D-39*
- **Who answers:** Product
- **References:** D-39

<a id="o05"></a>
### o05 · Should Sign-in show an offline notice before the doctor taps Send OTP (passive offline)?

- **Current assumption:** Current build: the offline notice appears only after Send OTP. signin.offline: F2 after action; N1 passive — Restore connectivity, retry; retain number; one message — *Feedback state map: signin.offline*
- **Who answers:** Product
- **References:** D-65

<a id="o06"></a>
### o06 · When the "Try again in m:ss" countdown ends, does the notice stay until the number changes, or go away?

- **Current assumption:** Current build: when the wait ends the button returns to Send OTP and the notice goes away: `if (clock.now() >= m.until) { m.button = "default"; m.notice = null; }` — *Sign-in build*
- **Who answers:** Product

<a id="o07"></a>
### o07 · Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)?

- **Current assumption:** The web build measures 16 from the top of the screen area (a browser has no status bar). No rule names the safe area for this screen. **Logo lockup size and place.** Every home-base screen with the "truemeds for doctors" lockup (`foundation/logo/truemeds-for-doctors.svg`, project level, §2.8) draws it **166px wide** (height follows the 220×54 artwork), **16px from the top**, and the logo→title gap stays as in §8.3 (L6). Nothing else sets the lockup size. — *Design rules 8.13*
- **Who answers:** Product
- **References:** D-61

<a id="o08"></a>
### o08 · Android back gesture on Sign-in (the first screen): leave the app, or stay?

- **Current assumption:** Root of the entry journey: phone back stays in the app — *Sign-in build*
- **Who answers:** Product

<a id="o09"></a>
### o09 · The prototype draws a number keyboard in its pictures. Do we draw one?

- **Current assumption:** No: the pictures show the phone's own number keyboard; the app uses the system keyboard (type tel). — *Sign-in build*
- **Who answers:** — (prototype only; no action)

<a id="o10"></a>
### o10 · Coming back from OTP (Change): is the number kept, and does the first typed digit replace it?

- **Current assumption:** A pasted or pre-filled number is replaced by the first typed digit. — *Sign-in build*
- **Who answers:** Product

<a id="o11"></a>
### o11 · Terms, Privacy and support links: final URLs, and where are they configured?

- **Current assumption:** **Safe placeholder:** Terms/Privacy point to a "link pending" page. `[MOCK ASSUMPTION]` — *OQ-021*
- **Who answers:** Product + Ops
- **References:** OQ-021

<a id="o13"></a>
### o13 · The busy spinner's ring is drawn in a raw white (#fff) in the design system. Which token?

- **Current assumption:** Assumption [RECOMMENDED]: tokens.color.content.inverse, the token the busy button's label uses (white). The ring's open quarter is transparent. L2 — Loading primary buttons: brand-blue fill, white label, white spinner, on every screen (sign-in "Sending OTP", OTP "Verifying", any future loading primary). — *Design rules L2*
- **Who answers:** Design
- **References:** D-46

<a id="o12"></a>
### o12 · How long does a signed-in session last before OTP is asked again?

- **Current assumption:** **Confirmed 2026-10-12:** Signed-in session remains valid until the case is closed; no OTP prompt over a live case. Technical token renewal must not interrupt the doctor. Re-authentication after case closure remains open; the 24 h session value above is only a mock placeholder. — *OQ-017*
- **Who answers:** Backend + Product
- **References:** OQ-017


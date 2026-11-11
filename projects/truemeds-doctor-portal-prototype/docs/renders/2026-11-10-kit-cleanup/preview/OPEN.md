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
| [o07](#o07) | Is the logo's 16 from the top measured from the screen edge or from the safe area (status bar, notch)? | Product |
| [o08](#o08) | Android back gesture on Sign-in (the first screen): leave the app, or stay? | Product |
| [o09](#o09) | The prototype draws a number keyboard in its pictures. Do we draw one? | — (prototype only; no action) |
| [o10](#o10) | Coming back from OTP (Change): is the number kept, and does the first typed digit replace it? | Product |
| [o11](#o11) | Terms, Privacy and support links: final URLs, and where are they configured? | Product + Ops |
| [o15](#o15) | Send OTP API: endpoint, request and the shape of each answer (sent, locked, not registered, couldn't send, too many attempts, inactive). Does "too many attempts" return an end time or seconds left? | Backend |
| [o16](#o16) | How long does the app wait for Send OTP before showing "Couldn't send the code."? | Backend + Product |
| [o17](#o17) | On the phone, does Sign up open the system browser or a browser inside the app? | Product |
| [o18](#o18) | If the doctor changes the number and then types the old one back, should its earlier answer (too many attempts, inactive) show again without a new Send OTP? | Product |
| [o19](#o19) | Some web styles have no native equivalent: balanced line breaks for titles and notices (iOS), the subtitle's 31-character width limit, and the 2px focus ring for hardware keyboards. Drop or approximate? | Design |
| [o21](#o21) | Is "New to Truemeds? Sign up" a link inside a sentence (exempt from the 48 tap target) or a standalone link (48 tall)? | Design |
| [o22](#o22) | Should text grow with the phone's font-size setting (dynamic type), and is there a dark mode? | Design + Product |
| [o23](#o23) | Expo or bare React Native CLI, and which navigation library? | App team |
| [o24](#o24) | How fast does the busy spinner turn, and does it stop when the phone's reduce-motion setting is on? | Design |
| [o25](#o25) | "New to Truemeds?" and "Sign up" are two copy entries; the space between them is typed in code. One entry with a {link} placeholder instead? | Product |
| [o26](#o26) | What does "Call Doctor Ops" do on a device that can't make calls (tablet, no SIM)? | Product + Ops |
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

- **Current assumption:** Sign-up URL and the Doctor Ops number are answered (d11, d12); only Terms and Privacy are open, and all links must be configurable. **Safe placeholder:** Terms/Privacy point to a "link pending" page. `[MOCK ASSUMPTION]` — *OQ-021*
- **Who answers:** Product + Ops
- **References:** OQ-021

<a id="o15"></a>
### o15 · Send OTP API: endpoint, request and the shape of each answer (sent, locked, not registered, couldn't send, too many attempts, inactive). Does "too many attempts" return an end time or seconds left?

- **Current assumption:** The web build fakes the server; it receives an end time for the wait. No contract exists yet. — *Sign-in build*
- **Who answers:** Backend
- **References:** D-35

<a id="o16"></a>
### o16 · How long does the app wait for Send OTP before showing "Couldn't send the code."?

- **Current assumption:** No timeout is defined; the web build answers at once. — *Sign-in build*
- **Who answers:** Backend + Product

<a id="o17"></a>
### o17 · On the phone, does Sign up open the system browser or a browser inside the app?

- **Current assumption:** On the web it opens a new tab. signin.signupLink: onboarding page, new tab (OQ-021) — *Message rules*
- **Who answers:** Product
- **References:** OQ-021

<a id="o18"></a>
### o18 · If the doctor changes the number and then types the old one back, should its earlier answer (too many attempts, inactive) show again without a new Send OTP?

- **Current assumption:** No: the build remembers nothing per number; the answer shows again only after Send OTP (the server answers again). — *Sign-in build*
- **Who answers:** Product

<a id="o19"></a>
### o19 · Some web styles have no native equivalent: balanced line breaks for titles and notices (iOS), the subtitle's 31-character width limit, and the 2px focus ring for hardware keyboards. Drop or approximate?

- **Current assumption:** Titles and notices wrap balanced (L8, d26); focus ring on buttons and links (d21). — *Design rules*
- **Who answers:** Design
- **References:** D-47

<a id="o21"></a>
### o21 · Is "New to Truemeds? Sign up" a link inside a sentence (exempt from the 48 tap target) or a standalone link (48 tall)?

- **Current assumption:** Build: the link is about 20 tall; the visual must not change either way. **Tap targets:** **48px minimum** for everything tappable that is not a link inside a sentence: icon buttons (✕, ?, Back, zoom), buttons, chips, rows, toggles, standalone links. Enlarge the hit area, not the text. Meets Android (48dp) and iOS (44pt); WCAG 2.5.8's floor is 24px. Links inside a sentence follow WCAG 2.5.8's inline exception. — *Design rules 8.6*
- **Who answers:** Design

<a id="o22"></a>
### o22 · Should text grow with the phone's font-size setting (dynamic type), and is there a dark mode?

- **Current assumption:** Out of scope for the design system unless the project opts in; tokens are light only and fixed sizes. Dark mode · large text / dynamic type (tested in the native app) · haptics and animation detail (native) · desktop layouts beyond §7. — *Design rules 9.9*
- **Who answers:** Design + Product

<a id="o23"></a>
### o23 · Expo or bare React Native CLI, and which navigation library?

- **Current assumption:** Not set by the kit: the app team owns the components, screens and project set-up. Sign-in hands off to OTP (or locked OTP) after Send OTP (d10, d25). — *Kit*
- **Who answers:** App team

<a id="o24"></a>
### o24 · How fast does the busy spinner turn, and does it stop when the phone's reduce-motion setting is on?

- **Current assumption:** No motion token exists. The web turns it once every 0.8 s and stops it under reduce motion. Animations (sheets, toasts) respect the phone's reduce-motion setting. — *Design rules 9.8*
- **Who answers:** Design

<a id="o25"></a>
### o25 · "New to Truemeds?" and "Sign up" are two copy entries; the space between them is typed in code. One entry with a {link} placeholder instead?

- **Current assumption:** Two keys today: signin.signup and signin.signupLink. — *Message rules*
- **Who answers:** Product

<a id="o26"></a>
### o26 · What does "Call Doctor Ops" do on a device that can't make calls (tablet, no SIM)?

- **Current assumption:** Not defined. The support number also takes WhatsApp (d11). — *Kit*
- **Who answers:** Product + Ops
- **References:** OQ-021

<a id="o12"></a>
### o12 · How long does a signed-in session last before OTP is asked again?

- **Current assumption:** **Confirmed 2026-10-12:** Signed-in session remains valid until the case is closed; no OTP prompt over a live case. Technical token renewal must not interrupt the doctor. Re-authentication after case closure remains open; the 24 h session value above is only a mock placeholder. — *OQ-017*
- **Who answers:** Backend + Product
- **References:** OQ-017


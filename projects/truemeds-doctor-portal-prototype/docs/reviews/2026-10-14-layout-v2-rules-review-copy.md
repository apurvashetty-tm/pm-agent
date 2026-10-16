# Review copy — Layout v2 rules (2026-10-14)

Status: **DRAFT FOR APURVA'S REVIEW. Nothing below has been applied to the real files yet.**
Source of the decisions: working session 2026-10-13/14 and concepts in `docs/concepts/2026-10-14-layout-v2/`.

How to read this: each section is one file. **[NEW]** = text to add. **[CHANGED]** = text that replaces an existing passage (the old text is quoted underneath as *Replaces:*). Unmarked files are not touched.

---

## Decisions taken in review (2026-10-14 02:30–02:38)
1. **This folder is the design system's source of truth.** SALT (the design team's Figma file) is the base it was built from; SALT updates are merged in deliberately and never overwrite what we've added.
2. **Screen title style:** 32/40 **semibold**, added to the design system.
3. **Blue text one step darker** (blue-600) so every blue link passes contrast; blue buttons, surfaces and logo unchanged.
4. **Placeholder text gets its own, darker grey.**
5. **16px body text gets 24px line spacing.**

---

## 1. `docs/context/decision_log.md`

### [NEW] D-42 · Two header types; logo only on home-base screens — 2026-10-14
- **Decision (Apurva):** the app has two header types, used by screen type.
  - **Home-base header** — logo on the left (D-02 lockup), actions on the right. Used on **sign-in** and **Home** (all its states).
  - **Task header** — Back + screen title, **no logo**. Used on **OTP**, the **faster sign-in offer**, **returning unlock**, the **case page** and every other step or task screen.
- **Why:** consistency comes from a predictable header per screen type, not from repeating the logo. Sign-in needs the logo for trust before a doctor types their number; Home is the screen doctors return to all day. On step and task screens the space is worth more for the task (OTP fits above the keyboard only without the logo; the case page needs it for patient context).
- **Rejected:** logo on every screen (costs space where it's needed most); logo on no screen (loses trust on sign-in and identity on Home).
- **Changes:** D-33 "Look" — the blue band + white panel stays shared with OTP and returning unlock, but the logo no longer appears on those screens. D-02 (which lockup) unchanged.

### [NEW] D-43 · Screen layout and type scale — 2026-10-14
- **Decision (Apurva):** every mobile screen follows the central layout rules in `design-system/RULES.md` §8:
  - **Type scale, 4 levels:** L1 screen title 32/40 semibold · L2 key content 16/24 · L3 supporting 14/20 secondary colour · L4 fine print 12/16 secondary colour. Only the screen title is large; buttons keep their design-system style.
  - **Spacing:** one side margin (24) on every screen; only three gaps — tight 8 (label↔field, field↔helper), related 16 (within a group), section 32 (between groups). Spare space goes between content and a pinned button, never inside a group.
  - **Button placement:** on screens where the doctor types (sign-in, OTP), the main button sits **inline, directly under the content**, so it stays visible above the keyboard without moving. On screens without typing (faster sign-in offer, Home), the main button is **pinned to the bottom**.
- **Why:** spacing and text sizes had been set by eye per screen, so screens drifted and nothing led the eye. A pinned button on typing screens either jumps with the keyboard or leaves a gap above it (tested in concepts v2a).
- **Rejected:** pinned bottom button on sign-in/OTP; auto-opening the keyboard on sign-in (D-33 layout kept as approved).

### [NEW] D-44 · OTP screen v2 — 2026-10-14
- **Decision (Apurva):**
  - **Header:** task header (D-42). Title "Verify your number"; one line "Sent to +91 98765 43210 · **Change**".
  - **Code:** four boxes over one real input (no visible "Verification code" label; the screen-reader label stays).
  - **Keyboard:** opens when the screen loads and **stays open** after the 4th digit.
  - **No auto-verify:** the doctor taps **Verify & sign in**.
  - **Wrong code:** the entered digits **stay visible** with red borders and the error below; no blue focus box. The **first new keystroke replaces the whole code** and clears the error. Keyboard stays open.
  - **Notice:** directly under the boxes. **Resend line** under the notice, one centred line: while waiting "Didn't receive it? **Resend in 0:30**" (timer slightly heavier, fixed-width digits, not tappable); when available "Didn't receive it? **Resend code**" (brand link, 44pt tap area).
  - **When to show resend:** whenever the doctor can still act (typing, wrong code, couldn't verify, expired — on expired "Resend code" is available at once). **Hidden** when resend is blocked (too many resends) or the number is locked.
  - **Consent line** (Terms / Privacy) sits directly above the button and shows **only when Verify is possible** — hidden when locked.
  - **Locked:** keyboard closes, boxes disabled, warning notice carries the countdown and "call Doctor Ops", Verify shown disabled so nothing jumps when the lock ends. No resend line, no consent line.
  - **Faster sign-in card removed** from OTP (see D-45).
- **Why:** the old screen stacked 11 items of similar weight above the button and floated the button mid-screen. Keeping the wrong digits lets the doctor spot a typo or an old SMS; replace-on-first-keystroke keeps retyping instant.
- **Rejected:** auto-verify on the 4th digit; closing the keyboard on the 4th digit; clearing the boxes on a wrong code (empty red boxes signal an error with nothing in them, and blue + red sends mixed signals); keeping the logo on OTP.
- **Changes:** D-38 "keyboard closes … on the 4th code digit" and "faster-sign-in card … ticked" are replaced. `concepts/2026-10-09-otp-screen-spec.md` is historical for layout. D-34, D-35, D-39 unchanged.

### [NEW] D-45 · Faster sign-in offered on its own screen after sign-in — 2026-10-14
- **Decision (Apurva):** after the **first successful OTP sign-in on a device**, if the phone supports it and faster sign-in isn't on, show one screen: "Skip the OTP next time" with three short reassurances, **Turn on faster sign-in** (primary, pinned) and **Not now** (quiet).
  - Turn on → phone's own prompt → Home. Cancelled or failed prompt → Home, no error (D-37 still holds: no nagging on Home).
  - Not now → Home. Offered again later (when: OQ-023) and always available in Profile.
  - Wording matches the phone: "Face ID" on Face-ID iPhones, "fingerprint" on fingerprint phones; never suggest Truemeds stores biometric data.
- **Why:** it can't go unnoticed, so it drives adoption (the point is cutting SMS OTP cost); a pre-ticked or easy-to-miss checkbox on OTP risks a sneaky opt-in; the phone's prompt makes sense right after a deliberate "Turn on". It also declutters OTP.
- **Rejected:** checkbox card on OTP (approved 2026-10-09, now replaced); light opt-in row on OTP.
- **Changes:** replaces the OTP opt-in in D-38 and the OTP spec. D-32's original "offered once after the first OTP sign-in" idea is effectively restored, as a native screen.

### [CHANGED] D-38 — add a pointer line at the top
> **Partly replaced by D-44 (OTP keyboard, wrong code, layout) and D-45 (faster sign-in moved off OTP), 2026-10-14.**

---

## 2. Design system (central — applies to all projects)

### 2a. `design-system/RULES.md`

**[CHANGED] Opening "Source of truth" paragraph**
> *Replaces:* "**Source of truth:** SALT — "TRUEMEDS Design Library (App)" in Figma (…). This folder is a code copy of it. If SALT and this folder disagree, SALT wins: re-export and rebuild (see README)."

**[NEW]** "**Source of truth: this folder.** It was built from SALT — the "TRUEMEDS Design Library (App)" Figma file from the design team (`figma.com/design/DcOIxZidim4Opva4DaDDRO`) — and extends it with Truemeds decisions listed in `beyond-salt.md`. When the design team sends an updated SALT file, merge it in deliberately (see README); it never overwrites anything in `beyond-salt.md` or `tokens/truemeds.json`. Changes to the design system are approved by Apurva."

**[NEW] §8. Mobile screen layout**
1. **Type scale — four levels per screen.**
   | Level | Use | Style |
   |---|---|---|
   | L1 | Screen title | `.tm-text-title-lg` 32/40 semibold |
   | L2 | Key content (values, names, the thing acted on) | `.tm-text-body-lg` 16/24 (or `-strong` where emphasis matters) |
   | L3 | Supporting text (descriptions, helper, status lines) | `.tm-text-body-md` 14/20, `--tm-content-secondary` |
   | L4 | Fine print (consent, legal) | `.tm-text-body-sm` 12/16, `--tm-content-secondary` |
   Only the screen title is large; buttons keep their component style. Don't introduce in-between sizes.
2. **Side margin:** `--tm-space-xl` (24) on every mobile screen. Every block — fields, notices, cards, code boxes, buttons — shares the same left and right edges.
3. **Three gaps only:** tight `--tm-space-sm` (8): label↔field, field↔helper · related `--tm-space-lg` (16): items within a group · section `--tm-space-2xl` (32): between groups. Spare vertical space goes between the content and a pinned button, never inside a group.
4. **Main button placement:**
   - **Screens with text entry:** the primary button sits inline directly under the content, so it stays visible above the keyboard without moving.
   - **Screens without text entry:** the primary button is pinned to the bottom with the safe-area inset; a secondary/quiet action sits below it.
5. **Two header types** (each product decides which screens use which):
   - **Home-base header:** product logo/lockup left, icon actions right.
   - **Task header:** Back + screen title, no logo.
6. **Tap targets:** 44pt minimum for standalone links and icon buttons (enlarge the hit area, not the text). Links inside a sentence follow WCAG 2.5.8's inline exception.
7. **Contrast:** all text meets WCAG AA (4.5:1; 3:1 for 24px+ or 18.66px+ bold) on the surface it sits on, including tinted bands and notices. Blue means "tap me" (§2.5): links are always `--tm-content-brand`, never grey-and-underlined.

**[CHANGED] §5 Design review checklist — add**
- [ ] Four text levels only, from §8.1?
- [ ] One side margin and only the three gaps from §8.3?
- [ ] Main button placed per §8.4 (inline on typing screens, pinned otherwise)?
- [ ] All text passes AA contrast on its actual background (§8.7)?

**§6 Known gaps — unchanged.** The contrast issues are fixed in 2b, so they are not added as gaps.

### 2b. `design-system/tokens/truemeds.json` **[NEW FILE]** — the Truemeds layer on top of SALT
Kept separate from the SALT exports so a SALT re-export can never wipe it. `scripts/build.py` applies it last.

| Token / style | SALT value | Truemeds value | Why |
|---|---|---|---|
| `--tm-content-brand` (blue **text**, links, outline/ghost/link buttons, selected-chip text, blue icons) | blue-500 `#266CE1` | **blue-600 `#1D5DCF`** | blue-500 fails AA on the light-blue band (4.50) and the amber notice (4.19). Blue-600: 5.97 on white, 5.51 on light blue, 5.14 on amber. Blue buttons/surfaces (`--tm-surface-brand-default`) and the logo are unchanged. |
| `--tm-content-placeholder` **[NEW]** | — (used `--tm-content-tertiary`, grey-400, 3.0:1) | **grey-500 `#6B7280`** (4.83:1) | Placeholder must be readable; still clearly lighter than typed text (grey-900). `--tm-content-tertiary` stays for decorative uses. |
| `.tm-text-title-lg` **[NEW]** | — (mobile headings stop at 20) | **32 / 40 / semibold** | Clear screen-title hierarchy (D-43). Uses the existing `--tm-font-size-title-lg` token. |
| `.tm-text-body-lg` / `-strong` | 16 / **20** | 16 / **24** | 20px line height is tight once 16px text wraps; 24 is the readable standard. Affects every screen using this style. |

### 2c. `design-system/src/components.css` **[CHANGED]**
- Placeholder rule: `.tm-field__control ::placeholder { color: var(--tm-content-placeholder); }` (was `--tm-content-tertiary`).

### 2d. `design-system/scripts/build.py` **[CHANGED]**
- Read `tokens/truemeds.json` after the SALT layers: override listed semantic tokens, add new tokens, add/override text styles. The same values flow into `native/` (React Native tokens) through the existing build.

### 2e. `design-system/beyond-salt.md` **[CHANGED]**
- New intro: "Everything below is a **Truemeds decision on top of SALT, owned here** (approved by Apurva). Share it with the SALT designers so Figma can catch up; the native app team treats it as final, not as proposals."
- Add the four rows from 2b, plus: "Mobile layout rules (RULES.md §8)".
- Remove "Faster sign-in option card" from screen patterns (dropped by D-45); add "Task header (Back + title)".

### 2f. `design-system/README.md` **[CHANGED]** "Updating it" table
- "SALT colours, spacing, radius or type changed" → "Merge the new SALT export into `tokens/Core.tokens.json` / `Default.tokens.json`, run `python3 scripts/build.py`, then check `preview.html` against `beyond-salt.md` — Truemeds values in `tokens/truemeds.json` always win."
- Add row: "Truemeds token or text-style change → edit `tokens/truemeds.json`, list it in `beyond-salt.md`, run `python3 scripts/build.py`."
- Header line "code copy of SALT" → "Truemeds design system (built on SALT)".

### After applying
Rebuild (`python3 scripts/build.py`), open `preview.html` to check, and republish the Truemeds Design System artifact so Claude-made mockups pick up the change.

---

## 3. `docs/feedback-rules.md` (version 1.0 → 1.1)

### [CHANGED] §4 Trigger, persistence and recovery
Replace the bullet
> *Replaces:* "Server wrong/expired response clears on a new attempt; network failures retain input."

with
- **[NEW]** Server wrong-code response: the entered code **stays visible** with field-error borders and message; the **first new keystroke replaces the whole code** and clears the error. Expired: same, and Resend code is available at once. Network failures retain input. (D-44)

### [CHANGED] §4 — remove the sentence about the opt-in
> *Replaces (in OTP rows and §4 where it says "retain code/opt-in"):* "opt-in" — there is no opt-in on OTP after D-45.

### [NEW] §6 Layout and state invariants — add
- Main button placement follows `design-system/RULES.md` §8.4 (D-43): inline on sign-in and OTP; pinned on the faster sign-in offer and Home.
- OTP: keyboard opens on load and stays open except when locked. Resend line shows whenever the doctor can act; hidden on too-many-resends and locked. Consent line shows only when Verify is possible. (D-44)
- A focus highlight never appears together with an error state on the same code input.

---

## 4. `docs/feedback-state-map.md`

### [CHANGED] OTP table — rows that change
| State | Pattern | Behaviour (new) |
|---|---|---|
| otp.default | None | Keyboard open on load; box 1 focused; resend timer running |
| otp.wrong-code | F1 | Code stays visible, red borders, no focus box; first keystroke replaces whole code; keyboard open |
| otp.two-tries-left | F1 | Same as wrong code, with remaining-tries count |
| otp.resend-available | None | "Resend code" brand link, 44pt tap area |
| otp.code-expired | F1 | Code stays visible; "Resend code" available at once; Verify of the same code blocked |
| otp.couldnt-verify | F2 | Retain code; resend line shown |
| otp.too-many-resends | W1 | Resend line hidden; last unexpired code can still verify |
| otp.locked | W1 | Keyboard closed; boxes and Verify disabled; resend and consent lines hidden |

All OTP rows: drop "preserve opt-in" (no opt-in on OTP after D-45).

### [NEW] section — Faster sign-in offer (D-45)
| State | Pattern | Behaviour |
|---|---|---|
| offer.shown | None | After first successful OTP sign-in on a supported device where faster sign-in is off |
| offer.enabling | L1 + OS prompt | One request at a time; primary shows progress |
| offer.enabled | — | Go to Home (no toast needed; Profile shows it's on) |
| offer.cancelled | None | OS prompt cancelled → Home, no error |
| offer.failed | None | Enrolment failed → Home, no error; OTP next time |
| offer.not-now | None | → Home; re-offer per OQ-023 |
| offer.unsupported | — | Screen skipped entirely |

---

## 5. `docs/context/open_questions.md`

### [NEW] OQ-023 — When to offer faster sign-in again after "Not now"
Options: after the next N OTP sign-ins on the same device (e.g. 3); after N days; never (Profile only). Needs product + SMS-cost input.

---

## 6. `ui-screens/README.md`

### [NEW] note at the top
> **2026-10-14 — Layout v2 (D-42–D-45):** OTP, returning unlock and sign-in references are **superseded pending re-approval** (logo rule, type scale, OTP v2). Home keeps its header. A new flow folder `faster-signin-offer/` will be added once approved. Until replacements are approved, the existing PNGs remain the last approved state.

---

## 7. `CLAUDE.md` (project)

### [NEW] under "Feedback and render contract — D-41"
> **Layout v2 — D-42 to D-45.** Read `design-system/RULES.md` §8 (type scale, spacing, button placement, header types) before any screen work. Logo only on home-base screens (sign-in, Home). OTP v2 and the faster sign-in offer screen are defined in D-44 and D-45.

---

## 8. Not changed in this pass
- `ui-screens/feedback/messages.json` — no feedback copy changes. ("Resend code" and the offer-screen copy are screen labels, not feedback messages.)
- HTML / React Native source — rebuilt in the render loop after these rules are approved.
- PRD — updated after the new screens are approved.
- `docs/context/session_handoff.md` — updated when the rules are applied.

## 2026-10-15 — A–D promoted to ui-screens/ (single copy of pictures; old material in docs/_superseded/)

- Screens: `ui-screens/sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/`, `home/` (A–C, fixed in place) and `ui-screens/case/case.html` (D, moved from the concept). Pictures: one copy in `ui-screens/` (263 files moved from `docs/renders/…/final/`). Phase text in `ui-screens/_qa/`.
- Old 13 Oct screenshots and reviews: `docs/_superseded/ui-screens-2026-10-13/`.
- QA: 222 of 228 pictures identical to the baseline; 6 differ inside the busy-button spinner only (decision for Apurva). Guard 0 failures; sources check PASS; 0 console errors. Report: `docs/renders/2026-10-15-standards/promotion-report.md`.
- Still open: native `messages.ts`; Profile / Logout sheet; keyboard check on a device; `index.html` rebuild from `ui-screens/case/case.html`.

---

## 2026-10-15 — Round 17 (last D fixes from the full-size audit)

- Executed `docs/reviews/2026-10-15-round-17-fixes.md` (R17-1 to R17-4). Report: `docs/renders/2026-10-15-standards/round-17-report.md`; measured proofs: `round-17-proofs/proofs.json`.
- Call card moves up only while live or after the HA question; hidden when empty (ended early). Duration units are a wrapping chip group; numbers grid at the shared chip size; picker scrolled into view for capture; local time-chip padding removed.
- Full guard round 17: 0 failures (A, B, C, D; 114 states × 390 / 360 / 430). Captured: D round 17 (56 states × 390 / 360). `D/final/` refreshed with contact sheets.
- Still open: native `messages.ts` regeneration (native team).

---

## 2026-10-15 — Round 16: D-54 open items approved (D-55)

- D-55 recorded. Done: option grids at M/A/N chip width starting at the label edge; R3 exemptions (icon-led text, right-aligned helper, centred titles); "Call didn't connect" keeps the case open (app `timeout` path); superseded renders moved to `docs/_superseded/`.
- Not done here: grid-chip padding for four-column grids (design team, `design-system/`); native `messages.ts` regeneration (native owner); Profile/Logout sheet (not in Home files, not built).
- Guard round 16: A 0, B 0, C 0, D 4 (duration picker, central item). Report: `docs/renders/2026-10-15-standards/round-16-report.md`.

---

## 2026-10-15 — Round 15 (D-54 fixes): report in renders

- Executed `docs/reviews/2026-10-15-round-15-fixes.md`. Result per item: `docs/renders/2026-10-15-standards/round-15-report.md` (PASS/FAIL with proof files; measured proofs in `round-15-proofs/proofs.json`).
- Done: D1–D16, A1–A3, the new Prescribe states, call-did-not-connect, injection doses, bar and row fixes, checks R1–R7 in the guard.
- Guard round 15: 94 failures (B R3 72, C R3 15, D 5.4 6, D 5.3 1). A clean.
- Open for Apurva (`<phase>/NEEDS-APURVA.md`): grid chip sizes vs indent rule; duration picker clipped "Ongoing" at 360 (central chip padding); R3 designs (offer points, unlock greeting, wheel helper); Profile/Logout sheet not in Home files; didn't-connect path; native messages not regenerated; old renders not moved (D-54 #10).
- Not edited: index.html, design-system, RULES.md, decision log, native. No git, no deletes.

---

## 2026-10-15 — Standards pass, round 10 (D-53): guards pass

**Status: Reviewed — yet to be approved by Apurva. Not promoted. `index.html` not edited. Nothing committed.**

- Decision log: D-53 added. Timer h:mm:ss from one hour (Home only; OTP m:ss). Approved copy kept (2 tries left; unlock unavailable). The ten new-state copy approved (metadata marks changed). Back to Home primary only when availability ended. Offline and confirm-failed notices inside the pinned bar. Concept loads `concept-styles.css` (styles.css copy with central restyles removed).
- Central changes used (design system, not edited): field gap 8, field control 48, read-only classes, notice icon 20, chip grid --3, compact task header, link 48.
- Guard: zero failures at 390, 360 and 430 for A–D (round 14); zero console errors.
- Codex: one check per changed journey (case/call ×3 rounds, sheets/Prescribe, endings/new/stress, sign-in/OTP, Home). Last check of the case/call journey was the third run; its blockers were fixed; no further check was run on the last change to it (hidden chevrons, 5.6). Stated honestly in changes.md.
- Open for Apurva (`<phase>/NEEDS-APURVA.md`): 360 secondaries stack (18px labels); local 8px padding on time chips until the central chip padding changes; index.html rebuild (to retire styles.css); native messages.ts regeneration; design-system RULES §9.7 timer text; keyboard device check.
- Next step: Apurva decides the open items. Then rebuild index.html from the concept, or fix the central chip padding first.

---

## 2026-10-15 — Standards pass, phases A–D (layout v2, final render)

**Status: Reviewed — yet to be approved by Apurva. Not promoted to `ui-screens/`. `index.html` not edited. Nothing committed.**

- Guard: `ui-screens/feedback/check-locked-specs.py` now runs every checklist "auto" line on every state at 390, 360 and 430 (failures tagged with the checklist line). Coverage matrix: `docs/renders/2026-10-15-standards/README.md` (104 states, each once).
- Renders: `docs/renders/2026-10-15-standards/<A|B|C|D>/round-N/` (rounds 1–9), capture with `capture.py`, contact sheets with `contact.py`, checklist results with `results.py`. Finals: `<phase>/final/` (contact sheets grouped by journey, PNGs, metrics, guard JSON, `changes.md`, `NEEDS-APURVA.md`).
- Guard result (round 9): **B and C pass every auto line. A fails 2 (central: sign-in field gap, notice icon). D fails 3 kinds: 5.5 tag reserved width and 4.1 other-dose input (central gaps), 5.12 (19 `styles.css` rules, which index.html shares, plus 2 concept rules).** Nothing claims more than the guard shows.
- Codex (read-only, per journey): rounds 1–7; each blocker either fixed, rejected with reason, or routed to Apurva as copy or a central gap (see `changes.md`).
- Central gaps reported, not edited (`design-system/` off limits): tag reserved width; `.tm-field` gap 4 vs 8; `.tm-notice` icon size; `.tm-field__control input` height; four-column chip padding (time slots wrap); read-only variant for closed cases; compact task header class. Details: `<phase>/NEEDS-APURVA.md`.
- Decisions taken this pass (confirm): End call = call-end (solid red, D-52); HA notice stays dropped; offline/confirm-failed notices at the top of content, not under the pinned bar; Back to Home quiet in all endings; Try again pinned in the bar on load/Rx failure; order details + View Rx on one white card; Cat4 mock dates 14/17 Oct 2026; B12 Rx line monthly.
- Copy: nine proposed case/Rx strings added to `ui-screens/feedback/messages.json` (+ `metadata.json`), built into `messages.js`. `ui-screens/native/messages.ts` was restored by hand (rule: no native changes), so it is out of date: `home.added` and the new keys need regenerating by the native owner.
- Next step: Apurva decides the Needs Apurva items (central gaps first, then copy: "2 tries left", unlock unavailable, rx.loadFailed). After the central fixes, rerun `capture.py --round N`, `results.py`, then `contact.py --final`.

---

## 2026-10-12 — Format-check timing on sign in and OTP (D-39)

- `phoneFormatError()` orders checks empty → first digit → length; first digit 1–5 errors live; leading 0 allowed.
  Once a format error shows (sign in or OTP) it is re-checked live until valid. e2e 556/556 pass.
- For review: "more than 10 digits" error (`docs/renders/2026-10-12/01`); entries are still cut to 10 until approved.

---

## 2026-10-12 — Sign-in, OTP and returning unlock built (draft branch)

- Built the approved sign-in (12 states), OTP (13 states) and returning-unlock (3 variants) screens into
  `index.html` / `app.js` / `styles.css` (D-38). Old 6-digit OTP, Request access and fingerprint set-up screens removed.
- `goApp()` screens are now signin, otp, unlock, home. `?start=otp` opens OTP for 9876543210. Per-number OTP state
  lives in `localStorage['tmd.otp.v1']`; session in `tmd.auth.v1`. Demo controls list the test numbers and codes.
- Tests: e2e (app flow rewritten) 536/536 pass on 390 and 1280; `docs/layout_check.py` updated for the inline-button
  auth layout, all pass.
- Not merged to `main`: Home is still the interim D-31 screen. Next step: Home state 1 ("Not taking cases") review.

---

## 2026-10-12 — Inactive sign-in filed; faster-sign-in recovery sheet dropped

- Added Inactive account to approved `ui-screens/sign-in/sign-in.html` selector and saved `sign-in_inactive.png` at
  390 × 844, 2×. Red notice reads “This account is inactive.”; primary action reads “Call Doctor Ops.” The Ops
  number remains an implementation dependency. Other sign-in states are unchanged.
- Apurva removed the “Finish setting up faster sign-in” Home sheet from native-app scope. Updated D-37, OTP spec and
  Home jobs. The interrupted draft stayed outside the project and was discarded; no sheet entered `ui-screens/`.
- Next step: Home state 1 (“Not taking cases”) remains next screen for review.

---

## 2026-10-12 — Production platform: React Native

- Production doctor app is native Android + iOS in React Native. Prototype and `ui-screens/` are design references.
- Passkeys via Credential Manager / Authentication Services; the "Finish setting up faster sign-in" sheet is
  web-prototype only. Crash reports: Sentry + Crashlytics. Contacts: sign-up URL and Doctor Ops number in OQ-021.
- Platform notes added to the OTP spec and Home jobs doc.

---

## 2026-10-12 — Home scope agreed (jobs to be done)

- Final Home jobs, rules, states and open questions in `docs/concepts/2026-10-12-home-jtbd.md`; summary in D-36.
  The 2026-10-09 Home draft is marked superseded.
- Callbacks go to the pool (no callback card on Home). Help icon on Home and in the case header; bell on Home only;
  WhatsApp support hand-off v1; today's count = prescriptions generated.
- New open questions OQ-019 … OQ-022. No Home screens rendered or built yet.
- Next step: render Home state 1 ("Not taking cases" + end-time sheet) for review.

---

## 2026-10-12 — Returning doctor unlock variants approved

- Apurva approved Fingerprint, Face ID, and Screen lock variants. Added one editable source at `ui-screens/returning-unlock/returning-unlock.html` and three 390 × 844, 2× PNGs. Each final-source Chrome capture matches its reviewed image by SHA-256.
- Layout keeps “Hello, Dr. Apurva.” on one line at standard phone width, uses a larger greeting and subtitle, adds space between “Ready when you are” and Unlock, and tightens Unlock to “Use OTP instead.” A 320 × 640 view was checked without clipped controls.
- The approved Face ID glyph now lives in the shared icon library as `[PROPOSED]` `face-id`; the handoff HTML uses that icon. Its capture remains pixel-identical to the approved PNG. Buttons are visual references; authentication behavior is not implemented here.
- Next step: continue approved auth-screen handoff or move to Home screen design; do not build auth behavior from the mockup alone.

---

## 2026-10-10 — Five wrong OTP submissions lock mobile number

- Apurva set the number-lock threshold at 5 server-confirmed wrong OTP submissions. Updated D-34, OTP spec, OQ-017, and `ui-screens/README.md`; older handoff references to 5 as a mock placeholder are superseded.
- Wrong-try count survives code resend and sign-in restart. Counting/reset window and lock duration remain backend/ops decisions. No approved screen visual changed.

---

## 2026-10-10 — OTP locked number approved

- Apurva approved Locked number. Added it to `ui-screens/otp/otp.html` and `otp_locked.png`; saved PNG matches reviewed capture by SHA-256. `ui-screens/README.md` updated.
- Clarified separate controls: D-35 limits issued OTP codes (initial 4 per number/window); D-34 locks code verification after too many wrong entries on the attempted mobile number. Too many resends leaves the last valid code usable; number lock disables entry and verification until countdown ends. Wrong-entry threshold remains backend/ops open (5 is mock placeholder).
- Remaining OTP spec states are passkey setup cancelled/failed (doctor still lands on Home) and SMS autofill (OS behavior). Neither has an approved visual render yet.

---

## 2026-10-10 — OTP too many resends approved; number lock in review

- Apurva approved Too many resends. Added it to `ui-screens/otp/otp.html` and `otp_too-many-resends.png`; saved PNG matches reviewed capture by SHA-256. `ui-screens/README.md` updated.
- D-35 records configurable OTP issue cap, initially 4 codes per mobile number within a server-enforced window (initial send plus up to 3 resends). Window length and reset rule remain open; sign-in restart must not bypass the cap. Updated OTP spec and OQ-017.
- Next review render: too many wrong OTP attempts lock attempted number; entry, faster sign-in card, and Verify button are disabled until countdown expires. Change number stays available. Review PNG stays outside `ui-screens/` pending approval.
- Next step: await Apurva's verdict on Locked, then add only that approved state.

---

## 2026-10-10 — OTP couldn't verify approved; too many resends in review

- Apurva approved Couldn't verify. Added it to `ui-screens/otp/otp.html` and `otp_couldnt-verify.png`; saved PNG matches reviewed capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: too many resends shows a yellow notice, resend wait, and Doctor Ops action; the last valid code remains usable. Review PNG stays outside `ui-screens/` pending approval.
- CTA copy decision: keep sentence case “Verify & sign in” for consistency with “Send OTP.”
- Next step: await Apurva's verdict on Too many resends, then add only that approved state and render the following state.

---

## 2026-10-10 — OTP code expired approved; couldn't verify in review

- Apurva approved Code expired. Added it to `ui-screens/otp/otp.html` and `otp_code-expired.png`; saved PNG matches reviewed capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: after a network or server error, entered `4827` and faster sign-in selection remain; red notice offers retry with Verify & sign in. Review PNG stays outside `ui-screens/` pending approval.
- Next step: await Apurva's verdict on Couldn't verify, then add only that approved state and render the following state.

---

## 2026-10-10 — OTP new code sent approved; code expired in review

- Apurva approved New code sent. Added it to `ui-screens/otp/otp.html` and `otp_new-code-sent.png`; saved PNG matches reviewed capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: expired code `4827` stays visible in red field with “This code has expired. Get a new one.” and an immediate Resend code action. Review PNG stays outside `ui-screens/` pending approval.
- Next step: await Apurva's verdict on Code expired, then add only that approved state and render the following state.

---

## 2026-10-10 — OTP resend available approved; new-code-sent in review

- Apurva approved Resend available. Added it to `ui-screens/otp/otp.html` and `otp_resend-available.png`; PNG matches reviewed direct capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: after tapping Resend code, a green “New code sent.” confirmation appears below the field and resend wait restarts at 01:00. Temporary image remains outside `ui-screens/` until approval.
- Validation: direct capture is 780 × 1688; `git diff --check` passes.
- Next step: await Apurva's verdict on New code sent, then file it and render the next state.

---

## 2026-10-10 — OTP two-tries-left approved; resend available in review

- Apurva approved two tries left. Added it to `ui-screens/otp/otp.html` and `otp_two-tries-left.png`; PNG matches reviewed direct capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: after resend timer expires, “Resend code” replaces countdown as a semantic button. Review PNG stays temporary until approval.
- Validation: review capture is 780 × 1688; `git diff --check` passes.
- Next step: await Apurva's verdict on resend available, then file it and render the next state.

---

## 2026-10-10 — OTP wrong-code approved; two-tries-left in review

- Apurva approved Wrong code. Added it to `ui-screens/otp/otp.html` and `otp_wrong-code.png`; PNG matches the reviewed direct capture by SHA-256. `ui-screens/README.md` updated.
- Next review render: two remaining OTP tries. Rejected code clears, keyboard reopens, faster sign-in stays selected, and field says “That code isn’t right. 2 tries left.” Review PNG remains temporary until approval.
- Validation: direct capture is 780 × 1688; `git diff --check` passes.
- Next step: await Apurva's verdict on two-tries-left, then file it and render the next state.

---

## 2026-10-10 — OTP verifying approved; wrong-code state in review

- Apurva approved the OTP verifying state. Added it to `ui-screens/otp/otp.html` and `otp_verifying.png`; PNG matches the reviewed direct Chrome render by SHA-256. `ui-screens/README.md` updated.
- Next review render: server rejects the code. Entry clears, code field shows “That code isn’t right. Try again.”, keyboard reopens, and faster sign-in selection remains checked. Review image stays temporary until approved.
- Validation: approved source capture is 780 × 1688 and pixel-identical to reviewed image; `git diff --check` passes.
- Next step: await Apurva's verdict on wrong-code state, then file it and render the next state.

---

## 2026-10-10 — OTP two-digit state approved; verifying in review

- Apurva approved the too-short OTP state shown with “48.” Added it to `ui-screens/otp/otp.html` and `otp_too-short.png`; PNG matches the reviewed direct capture. `ui-screens/README.md` updated.
- Next review render: verifying a complete four-digit code. Selected faster sign-in card, code field and button show locked/progress states. Review image stays temporary until approved.
- Validation: approved two-digit PNG matches reviewed image by SHA-256; verifying capture is 780 × 1688; `git diff --check` passes.
- Next step: await Apurva's verdict on verifying, then file it and render the next OTP error state.

---

## 2026-10-10 — OTP empty-code state approved; two-digit state in review

- Apurva approved the empty-code OTP error. Added it to `ui-screens/otp/otp.html` selector and `otp_empty-tap.png`; PNG is pixel-identical to the reviewed capture. Default PNG remains pixel-identical after the HTML update. `ui-screens/README.md` updated.
- Next review render: Verify tapped with two digits (“48”) shows “Enter all 4 digits.”, keeps entered digits, focuses the field, and opens the numeric keyboard. Temporary PNG remains outside `ui-screens/` until approval.
- Validation: both approved captures match reviewed images by SHA-256; next review capture is 780 × 1688 pixels; `git diff --check` passes.
- Next step: await Apurva's verdict on the two-digit state, then file it and render the following state.

---

## 2026-10-10 — OTP default approved; empty-tap state in review

- Apurva approved the OTP default screen. `ui-screens/otp/otp.html` and `ui-screens/otp/otp_default.png` now form its editable source and matching 390 × 844, 2× capture. The PNG is pixel-identical to the approved direct Chrome render. `ui-screens/README.md` indexes it.
- Next review render: tapping Verify with no code focuses the code field, shows “Enter the 4-digit code.” and the numeric keyboard. This review PNG is temporary, outside `ui-screens/`; it is not approved yet.
- Validation: approved source opened with all local assets resolved; direct Chrome capture confirmed 780 × 1688 pixels; `git diff --check` passes.
- Next step: await Apurva's verdict on the empty-tap state, then add only that approved state to the OTP handoff source and move to the following state.

---

## 2026-10-10 — OTP number lock; default screen in review

- D-34 locks only the attempted mobile number after too many wrong OTPs. Change number remains available; another number signs in only after Doctor Ops approves it for that doctor. Updated OTP spec and narrowed OQ-017 accordingly.
- Rendered the OTP default state from `docs/concepts/2026-10-09-otp-v2.html` at 390 × 844 CSS pixels (2× capture) for Apurva's review. The capture is temporary and has not been added to `ui-screens/`.
- Validation: screenshot inspected; logo, shared styles, icons and 4-digit field are visible. `git diff --check` passes.
- Known gap: this concept still has exploratory local styles and placeholder legal links. OTP error states and final handoff source remain unapproved.
- Next step: wait for Apurva's review of the OTP default render; revise or approve it, then move to the next state one at a time.

---

## 2026-10-10 — OTP concept source repaired

- Repaired `docs/concepts/2026-10-09-otp-v2.html`: shared CSS and icons now resolve from the repository, logo uses the approved project lockup, and the file shows its default biometric card when opened directly.
- Back and Change number now navigate to the approved sign-in reference; the verification label targets its input. This is a source repair, not an approved OTP screen or a new auth flow.
- Validation: all local asset links resolve, `git diff --check` passes, and the default concept rendered in Chrome with styles, logo, and icons present.
- Known gap: the concept still has local exploratory CSS and placeholder Terms/Privacy links. Final approved OTP handoff should use shared components and confirmed destinations.
- Next step: resume OTP UI/UX and design-system review findings with Apurva before rendering states, one at a time.

---

## 2026-10-09 — Sign-in screen approval in progress

- Apurva approved first-time default, keyboard-open, empty-tap, too-short, wrong-first-digit, pasted-and-cleaned, Sending OTP, Not registered, Offline, Couldn’t send, and Too many tries states. `ui-screens/sign-in/sign-in.html` switches among all eleven and generates one PNG for each (390 × 844 CSS pixels, 2× capture).
- Other sign-in states remain unapproved and outside the handoff set.
- Locked sign-in subtitle recorded in D-33: “Your partner in thoughtful, affordable care.”
- Next step: review the Inactive state; add it only after approval.

---

## 2026-10-09 — Approved UI screen handoff folder

- Created `ui-screens/README.md` as the approved screen index. No mockups or PNGs added yet.
- Future screen states: render, review with Apurva, then add PNG plus editable HTML and note viewport/behavior.
- `docs/renders/` remains historical review archive; current app behavior and auth implementation were not changed.
- Next step: re-render first sign-in state for review; store it only after explicit approval.

---

# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** Captures all decisions, agreements, and pending work so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-10-08
**Session status:** Prescribe redesign built; pinned main action (D-22); UI audit fixes done (D-23 … D-26). Open: medicine form icon (audit #11) — options in docs/concepts/2026-10-08-medicine-form-icons.png, Apurva's call.
**Why things are the way they are:** `docs/context/decision_log.md` (D-01 … D-32) — read it before changing any
screen it covers. This file says what is built; the decision log says why.
**Case page main action (2026-10-08, D-22):** `#case-actionbar` (`.tm-actionbar`) pinned to the bottom holds
`#call-initiate-btn` and `#main-cta-btn`; `syncCaseActionBar()` hides the bar when both are hidden and sets `--ab-h`
(page bottom padding, toast offset). `scrollToActionZone()` replaces `scrollIntoView` (which also scrolled the desktop
frame and pushed the header out of view). `layout_check.py` checks both.
**UI audit fixes (2026-10-08, D-23/D-24):** every sheet = title + `.sheet-close` (`tm-btn--quiet tm-btn--icon`),
no handle; callback chips in `.chip-grid` (`--cols`); action card closed state = `#az-closed` notice (text from
`DOCTOR_STATE.closedNote`); `#next-order-btn` pinned only when unavailable. No black toasts at all (D-27).
**App shell (2026-10-09, D-31, D-32):** the app opens on Sign in (or Welcome back with fingerprint, or Home if signed
in). `goApp(screen)` shows one `.app-screen` (`#scr-signin`, `#scr-otp`, `#scr-signup`, `#scr-signup-done`,
`#scr-bio-setup`, `#scr-unlock`, `#scr-home`) or the order page (`case`) via `body[data-app]`. Doctors pull orders:
`requestNextOrder()` → order page, or Home "No orders right now". Session in `localStorage['tmd.auth.v1']`.
`?start=case` opens the order page directly (used by `layout_check.py` and the e2e tests). App demo controls:
left panel on desktop, top of the demo bar on phones.
**All call actions pinned (2026-10-08, D-28):** `#case-actionbar` = `#ab-secondary` (pre-gate callback, Mark
Unavailable, Schedule Callback, Skip HA — side by side) + the main button. `#action-zone` has no buttons; no
auto-scroll (`scrollToActionZone` removed). `#az-phase2` removed.
**Call didn't connect (2026-10-08, D-26):** `#az-missed` notice + `#az-unavail-btn` in the Call card and "Call Again"
pinned for `no_answer` / `hold`; no call timer in the doctor UI (`#cs-timer-badge` removed; demo controls keep theirs).
**Renders (every session):** every image shown in a review is saved in `docs/renders/YYYY-MM-DD/NN_name.png` and
listed in `docs/renders/README.md` in the same turn. Doctor research files: `docs/research/`.
**Live link:** https://doctor-portal-prototype.netlify.app — Netlify deploys every push to `main` (base = repo root,
publish = this folder). The root `netlify.toml` copies `design-system/` next to `index.html` at deploy time so the
`../../design-system/…` links resolve. Work on a branch, then merge to `main` to update the live link.

---

> **2026-10-08 — Sticky header fix.** The app header always stays on top; once the patient block scrolls away, a compact
> patient strip (name, age/gender, order, order value, View Rx) appears under it. The strip now OVERLAYS the content
> (absolute, fades in) instead of being inserted into the page: inserting it changed the header height, shifted the page
> and made the browser jump the scroll position by ~50–70px (header looked "half closing" when scrolling up, on phone
> widths). `docs/layout_check.py` now fails on any such jump.
> Same day: the case page no longer scrolls on past the Call / Confirm actions. `#main-scroll` had a permanent 144px
> bottom padding; it is now 32px (as on the Prescribe screen), with the extra room added only while the "Order Confirmed"
> snackbar is showing. `docs/layout_check.py` checks the scroll ends right after the last action.

---

> **Prescribe screen — CURRENT STATE (agreed with Apurva 2026-10-07/08, built 2026-10-08).** Reasons and rejected
> options: `decision_log.md` D-10 … D-20. Concept render (pre-review): `docs/concepts/2026-10-07-prescribe-screen.png`.
> Full-screen view over the case (inside the phone frame), one scroll area, every section open with backend defaults.
> 1. App bar: cross (close) · medicine name with the form in grey under it ("Tablet") · small red "Disable".
> 2. "On prescription" (was "Prints as"; D-25): the exact printed line, live, pinned under the app bar in one header
>    block (`#ps-top` = `#ps-bar` + `#ps-rx`), 16px semibold on a brand-blue band, flashes on change (`setPrintLine()`).
>    Ongoing prints its period ("6 months"); on screen "Ongoing (6 months)".
> 3. How often: Daily · Every X hours (4/6/8/12 h, round the clock) · Alt days · Weekly · Monthly · SOS only.
> 4. Dose: heading "Dose"; unit shown only where the form doesn't say it ("Dose (ml)" syrups, "Dose (puffs)" inhalers).
>    Daily = M / A / N rows (no evening slot). Choices: tablet/capsule 0 ½ 1 2; syrup 0 2.5 5 10 ml (single-dose
>    schedules add "Other" = number in ml); inhaler 0 1 2; drops 0 1 2 3; injection 1 (+ "Other" = units); cream Apply / —.
> 5. Also as needed (SOS): switch + helper "Extra doses only when needed, on top of the schedule above"; when on, its
>    own Dose and "Max extra doses a day" (1–4). "SOS only" asks Dose + "Max doses a day". Prints "1-0-1 + SOS 1 tablet (max 2/day)".
> 6. Duration: dropdown-style field (value + "Default"/"Changed from default" + chevron); tap the row to open/close the
>    picker: 1–7, 10, 14, 15 + Days · Weeks · Months · Ongoing. Always has a value.
> 7. Food (optional): After food · Before food · Empty stomach, one row, single-select, tap again to clear, no default,
>    printed only if chosen. Shown for every form.
> 8. Additional instructions: optional, printed (tapers, "shake well", "stop if rash"…).
> 9. Prescribe (primary, large) in a bottom bar pinned to the screen, always active (D-22). Body is grey with one
>    white card per block (Schedule · SOS · Duration · Food · Additional instructions), like the case page.
> Errors (only two, inline, on Prescribe): 0-0-0 → notice under the dose grid; empty "Other" → field error.
> Closing: instant if nothing changed, otherwise "Discard changes?" (Discard / Keep editing). Tab stays inside the
> screen; choice groups labelled for screen readers. Disabled medicine: warning note "Disabled: reason. Prescribing it
> will enable it again." and no Disable button. Disable opens the reason sheet over the screen; cancel returns to it.
> Code: `#prescribe-screen` (index.html), "PRESCRIBE SCREEN" (styles.css), "PRESCRIBE SCREEN — model + text" and
> "MEDICINE EDIT" (app.js). Chips use `.tm-chip--lg` (design system [PROPOSED]).
> Demo data: no food preselected; Antacid daily slots in ml (0-10-10); Salbutamol = SOS only, 2 puffs, max 4/day;
> B12 = 1 dose monthly. View Rx shows each medicine's frozen `rx_line` (customer's Rx). `docs/layout_check.py` covers
> the screen (fills frame, scrolls, Prescribe reachable).
> Still open: OQ-014 (pack vs dose units for quantity, non-tablet forms).

---

> **2026-10-07 — Prescription changes, part 1 (quantity and price).** Agreed with Apurva and built:
> (1) the medicine editor has no quantity at all (stepper removed; the doctor never sees prescription quantity);
> (2) the medicine row shows the customer's cart "Qty" read-only, unchanged by doctor edits, and no longer shows a
> line-item price; (3) Add medicine (button, sheet, code) is removed — the doctor cannot add medicines;
> (4) order value (patient block and compact strip) and View Rx are unchanged. Backend rule: frequency and duration are
> preselected for the configured maximum (6 months, Ongoing), the backend stores the quantity, and recalculates and prints
> it on the prescription if the doctor changes frequency or duration. Deferred: OQ-014 (pack vs dose units for non-tablet
> forms) and OQ-015 (per-medicine detail view with price and image). Frequency and duration: see Part 2 above. Note: the restyle rollback restores pre-restyle files, so it would also undo these product changes.
> Product doubt to raise: the disable reason "Wrong strength" hints "Will disable and add correct one", but adding is gone.

---

> **2026-10-07 — medicine-form icons and audit withdrawal.** Apurva clarified that visible Rx is customer-uploaded
> source material, not a live prescription generated by the doctor. The Codex source-only UI/UX audit that called
> flows broken was withdrawn; do not use it as a defect backlog. Medicine-form icons (final): tablet = round scored
> `tablet-round` ([PROPOSED] custom icon built in `design-system/scripts/build-icons.mjs`), capsule = Tabler `pill`
> (diagonal). The earlier `capsule-horizontal` + divider experiment was rejected and removed. Desktop layout: see the
> PHONE FRAME note below (supersedes any earlier desktop-layout wording).

---

> **2026-10-07 — design system change.** The prototype's local design system is
> superseded by the central Truemeds design system (`../../design-system/`, from SALT).
> **Update (restyle done):** `index.html` / `styles.css` / `app.js` are now on `truemeds.css` + `icons.js`
> (see RESTYLE note below). Call Patient was NOT pinned (decision D4). Remaining UI work is functional
> and awaits product answers: login + working hours, end-of-session extend/logout, Prescription changes (part 1 done, see top note).

---

> **2026-10-07 — RESTYLE VISUALLY COMPLETE (visual migration only).** Scope authorised by Apurva:
> design-system restyle only; every behaviour, the five scenarios, the 50s gate, CTA routing,
> callback, medicine edits, notes, Rx viewer and demo controls are unchanged.
> Branch `doctor-portal-restyle`. Verified: 212 checks x 390px/1280px, 0 page errors, static token/font/emoji audit clean. Decisions D1–D12 recorded in `docs/reviews/2026-10-07-restyle-audit.md`.
>
> ### ROLLBACK — say: "revert doctor portal restyle"
> Checkpoint tag: `checkpoint/doctor-portal-pre-restyle` = commit `3fa1fc8` (pushed to origin).
> When Apurva says that phrase, run this from the `pm-agent` root (via `device_bash`) — nothing else:
>
> 1. `git rev-parse checkpoint/doctor-portal-pre-restyle^{commit}` must print a hash starting `3fa1fc8`.
> 2. `git diff --stat checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES>` — show her what will be undone.
> 3. `git checkout checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES>`
> 4. `git diff --quiet checkpoint/doctor-portal-pre-restyle -- <RESTYLE FILES> && echo RESTORED`
> 5. Delete only the files in **Files created by the restyle** below (needs delete permission; ask once).
> 6. Tell her what was restored. Do NOT commit unless asked.
>
> **Never** use `git reset`, `git clean`, `git stash`, `git checkout .` or `git restore .` — the repo holds unrelated
> uncommitted work (AGENTS.md hunks, root CLAUDE.md, Roadmap, PRD workflows, ceo-discussions, valuemeds, post-order-aop,
> Claude outputs, and the untracked audit file) that must not be touched.
>
> **RESTYLE FILES** (paths relative to pm-agent root; keep this list current after every batch):
> `projects/truemeds-doctor-portal-prototype/index.html`
> `projects/truemeds-doctor-portal-prototype/styles.css`
> `projects/truemeds-doctor-portal-prototype/app.js`
> `design-system/src/components.css` `design-system/truemeds.css` `design-system/preview.html`
> `design-system/icons/icons.txt` `design-system/icons/icons.js` `design-system/RULES.md`
>
> **Files created by the restyle:** `projects/truemeds-doctor-portal-prototype/docs/layout_check.py` (layout regression check). Also `design-system/logo/truemeds-logo.svg` (same official file), `design-system/logo/truemeds-icon.svg` (icon-only, from Figma), `projects/truemeds-doctor-portal-prototype/brand/` (approved "truemeds for doctors" lockup `truemeds-for-doctors.{svg,png}` + `-preview.png`, developed with Codex; `brand.lock.json` and `check_lockup.py` lock it), `design-system/logo/logo.lock.json` + `design-system/scripts/check_logo.py` (logo lock: blue #1B69DE, green #22B573) and the logo rule 8 added to `design-system/RULES.md` (add RULES.md to the restore list).
>
> `[PROPOSED]` central design-system additions (flag to design owner): `.tm-btn--busy`, `.tm-tag--md` (12px), `.tm-snackbar`, `.tm-section-title` 16/24, 16 new Tabler icons.
>
> **LAYOUT (current, 2026-10-07) — PHONE FRAME.** Below 768px the app is the screen (window scrolls). At 768px and up it is a
> centred 9:16 phone frame (height = clamp(640px, 100vh - 48px, 800px)) with ONE scroll area (`#main-scroll`) and the header pinned.
> Bottom sheets, the Rx viewer and toasts live INSIDE the frame (they are DOM children of `#mobile-column`, which is a transform
> containing block), so they anchor to the frame bottom, never the browser window. The demo panel (>=1100px) floats beside the frame.
> Rule: `design-system/RULES.md` §7. Regression check: `python3 projects/truemeds-doctor-portal-prototype/docs/layout_check.py`.
> Earlier wordings ("720px consultation page", "centred dialogs", "430px column with window scroll") are WRONG and removed.
> **Logo:** the header uses the approved "truemeds for doctors" lockup, `projects/truemeds-doctor-portal-prototype/brand/truemeds-for-doctors.svg` (sha256 starts 51981c12; project-level, not a design-system file), via `<img>` at 147x36. It embeds the official Truemeds logo unchanged. The header no longer shows the separate "Doctor Portal" text; the canonical plain logo lives only in `design-system/logo/truemeds-logo.svg` (sha256 starts 1953a94b); the browser tab title is "Truemeds for Doctors".
>
> Docs (this handoff, audit, CLAUDE.md) are intentionally NOT rolled back.

---

## 1. What has been built (current state)

**Architecture:** the prototype is now **three files**, not one — `index.html` (structure), `styles.css` (all cosmetics), `app.js` (all logic). This is a deliberate `[USER-PROVIDED]` change from the original single-file V1 rule; see `docs/design_system.md` for why (button-style drift across the single file was the trigger). `CLAUDE.md` and `frontend_engineer.md` have been updated to match — see their diffs from this same pass.

- Central Truemeds design system (`../../design-system/truemeds.css`, `icons.js`) — restyle done 2026-10-07
- All 5 mock scenarios switchable via demo bar (mobile) / side panel (desktop)
- Valid-call gate at 50 seconds `[LOCKED, working]`
- CTA routing matrix `[LOCKED, working]` — Confirm Order / Confirm & Transfer / Confirm & Forward
- Pre-call briefing strip `#pre-call-brief` — Pilot + HA required only, two copy variants (value/non-value meds), hidden once the call ends early (bug fix this pass — briefing script used to stay visible after an early hangup)
- `#ha-attention-banner` — fully **removed from the DOM** (not just CSS-hidden as an earlier handoff stated)
- Rx overlay with dummy prescription, zoom/rotate/pan/pinch
- Desktop side panel with scenario switcher + demo webhook simulator (mirrors mobile demo bar)
- Fast-forward to 50s demo button — stuck-on-"Submitting" bug fixed (root cause: `innerHTML` replacement was destroying child spans the render function depended on)
- Bottom sheets: Hold, No Pickup, Skip HA, Schedule Callback, Disable reason, Discard changes. Medicine editing is the full-screen Prescribe screen (above); Add medicine was removed 2026-10-07
- Medicine cards: **entire card is tappable** (not just an edit icon), chevron (`›`) affordance, no separate edit button
- Sticky compact strip, patient detail block with `ⓘ` order-details expand, profile sheet with earnings/logout

### 1.1 Button / design system (HISTORY — superseded 2026-10-07 by the central design system; do not use `.btn`)

Every CTA now comes from one shared system: `class="btn btn-{size} btn-{variant}"` in `styles.css`, icons from one `ICONS` map in `app.js`. Full reference: `docs/design_system.md` — **read that file before adding any new CTA**, don't hand-roll button CSS again.

This replaced ~8 bespoke per-button CSS blocks that had drifted out of sync — the direct trigger was Schedule Callback having three different fonts/colors/icons across three placements. Do not reintroduce per-button cosmetic CSS.

### 1.2 Schedule Callback feature (new this pass)

- **Pre-gate, during live call**: quiet text link (`btn-sm btn-text`) below "End Call" — an escape hatch so a doctor doesn't have to wait for the gate to schedule instead.
- **Pre-gate, after an early hangup** (call ended before 50s): becomes a ghost button (`btn-md btn-ghost`) paired with a "Call Again" primary — this is the recovery path, see 1.3.
- **Post-gate**: compact chip (`btn-sm btn-ghost`) — paired side-by-side with Skip HA Call when both apply (label shortens to "Schedule"), full-width alone when Skip HA doesn't apply.
- **Confirming a callback is `[MOCK ASSUMPTION]` terminal** — it ends the doctor's session for that order: consultation state → `completed`, a success toast shows "Callback Scheduled — moved to callback queue," and the doctor proceeds via "Next Order." **This is not confirmed backend truth** — whether a scheduled callback should actually remove the case from this doctor's queue, or how a "callback queue" would really work, is unverified. See OQ-012.

### 1.3 Early call-end recovery flow (new this pass)

Previously: ending a call before the 50s gate reset to "assigned" with no distinct guidance. Now: consultation state tracks `DOCTOR_STATE.endedEarly`, and the idle call button becomes **"Call Again"** with the Schedule Callback ghost button appearing alongside it as an explicit second path. The closing-script briefing strip is hidden during this state (it re-appears once the doctor dials again) — this was a bug (`[FIXED]`, briefing strip used to keep showing stale script copy after the call had already ended).

This flow is a `[MOCK ASSUMPTION]` / `[RECOMMENDED]` UX pattern, not locked product truth — `project_truth.md` doesn't currently describe early call-end behavior at all. There's no retry limit implemented. See OQ-013.

### 1.4 Completed-state UI (changed this pass)

The old full-page blocking "Completed Overlay" is **gone**, replaced with a non-blocking **success toast** (`#success-toast`, `showSuccessToast(title, desc)`) anchored to the mobile column's actual position (fixes a desktop bug where the old overlay centered on the full viewport instead of the mobile column). Carries a "Next Order →" button. Used for both the normal Confirm-Order completion path and the Schedule-Callback terminal path (1.2).

---

## 2. Sections 2–4 (prior work, still accurate — condensed)

Structural rebuild (sticky header/compact strip, patient block with `ⓘ` expand, new medicine data format with M-A-N + qty + price (row shows cart qty only; price kept in data for the deferred OQ-015 detail view), edit/disable medicine sheets (add removed 2026-10-07), action zone phase1/phase2 merge, profile sheet with earnings/logout) — all complete and unchanged since the 2026-06-09 handoff. Pre-call briefing strip replacing the old post-call HA banner — complete, see 1.0 above for the one behavior fix (briefing strip now hides on early call-end).

Full original scope list preserved in git history (`c0e0ab2`, `2d2ad71`, `0a0fa4e` commits) if line-by-line detail is ever needed.

---

## 3. What must NOT be changed without explicit instruction

- `resolveCTA()` — CTA routing matrix
- `haSkipApplicable()` — Skip HA eligibility
- Valid-call gate at 50 seconds in `startCallTimer()`
- All 5 scenario IDs and their `case_type`, `ha_status`, `meds_type` fields
- Rx overlay, zoom, rotate, pan, pinch logic
- Success confirmation card (`showSuccessToast`). The black toast (`showToast`) was removed on Apurva's instruction (D-27); do not bring it back
- `switchScenario()` function structure
- Sheet overlay alignment in `openSheet()` using `getBoundingClientRect()`
- The `.btn` button system in `styles.css` and `ICONS` map in `app.js` — cosmetic changes go here, once, not per-button. See `docs/design_system.md`.

---

## 4. Design system

**Moved to `docs/design_system.md`** — that file is now the single source of truth for tokens, button sizes/variants, icons, and component patterns. Do not duplicate the token list here again; it will drift. Read `docs/design_system.md` before adding any new UI element.

Light theme is confirmed. Do not revert to dark theme.

---

## 5. Open questions status

Full detail in `docs/context/open_questions.md`.
- OQ-001 to OQ-011: still open, untouched by this pass.
- OQ-012 (new): Callback scheduling terminal behavior — `[MOCK ASSUMPTION]`, unverified against real backend.
- OQ-013 (new): Early call-end retry limit — unresolved, no cap implemented.

---

## 6. Git setup

- Remote: `git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git`
- Branch: `main`
- SSH key fingerprint: `SHA256:rpNSUQGp1H2ojI66wb9PTj4DiFCmVCau2MprBpJZKlU`
- Push: `git add . && git commit -m "message" && git push`
- New machine: `git clone git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git` + new SSH key

*(Unverified this pass — carried forward from the prior handoff as-is.)*

---

## 7. How to resume in a new session

1. Read this file (`session_handoff.md`), then `docs/context/project_truth.md`, `docs/context/open_questions.md`, `docs/design_system.md`.
2. Confirm current git state (`git status --short`) before assuming the working tree matches this handoff.
3. Continue from the "next step" below unless the user gives newer instructions.

**Next step:** No pending build work queued. Awaiting next user request — likely either (a) resolving OQ-012/OQ-013 with the user, or (b) new feature/polish requests on top of the current button-system baseline.

---

## 8. What is still NOT built

- Any multi-scenario state persistence across page reloads
- Any backend integration (intentionally out of scope for V1)
- Retry-limit logic for early call-end "Call Again" (OQ-013)
- Real callback-queue backend semantics (OQ-012)
- `?nodemo` URL param to hide demo controls for real-feel mobile testing (mentioned once by user, deferred — "this can be later")


## 2026-10-13 — Home alternatives saved; full flow review rendered

- User explicitly requested both wheel/tap availability renders saved. Exact PNGs in `ui-screens/home/`, SHA-256 verified. Alternatives for doctor testing; final control selection not locked.
- 43 new draft states and browsable image gallery: `docs/renders/2026-10-13-home-flow/index.html`. State manifest, FLOW.md and reproduction source included. Drafts are not approved renders.
- Proposed extension uses bottom sheet, adds selected duration to current deadline, and explicitly switches to restart wording if already expired. Pending requests remain protected through stop/expiry. Existing case-page Next order replacement documented in FLOW.md; clinical case UI not modified.
- Source limitation: programmatic PNGs, not browser captures or interactive prototypes. No browser file-policy workaround. Matching component HTML/RN remains necessary before complete engineering handoff.
- Validation: reviewed contact sheets; corrected stale secondary actions on ended states and loading feedback. New account/device policies remain proposals, not locked product changes. App code untouched.
- Next: Apurva reviews grouped states, tests doctor comprehension, chooses duration control; build matching interactive source before interaction testing.

## 2026-10-13 — Active Home/add sheet saved after audit

User accepted happy-flow screens2/3 and requested wheel version. Saved active Home and tap sheet byte-identical; generated/saved wheel alternative with footer pixel-identical, taller sheet. Exact new wheel visual awaits review. Existing setup files untouched and hashes verified. Setup CTA is56px lower than current Home and prescription typography differs; reported, not silently fixed. Audit in ui-screens/home/AUDIT-2026-10-13.md. Toast not approved/saved. Interactive tests and editable component source still missing.

## 2026-10-13 — Home editable source/native handoff repaired
User identified missing HTML/native linkage. Inspected actual sign-in and OTP HTML plus shared native README, tokens.ts/icons.ts. Added three Home HTML entries and shared JS/CSS, NATIVE-HANDOFF.md and home.native.ts contract. Reuses native exports; not a new CSS-only system or production RN screen. JS syntax, CSS token references, final relative paths checked. Original PNG hashes preserved. Browser visual parity and native runtime/accessibility checks remain outstanding.


## 2026-10-13 — Native UI handoff and scoped reminder correction

- User approved add-availability wheel. Approval recorded in ui-screens/home/manifest.json.
- Added actual TSX components under ui-screens/native for 12 sign-in, 12 OTP, 3 unlock and 5 Home/setup/add-time references. Shared native tokens/icons and canonical SVG used. No app dependency files changed.
- Corrected scope: setup keeps Minimum 15 minutes once; add-time sheet removes reminder. Four PNG replacements differ only in reminder region; active PNG unchanged. HTML and native copy aligned.
- Validation: strict TypeScript, duration/normalization/countdown/expiry-addition tests and Home JS syntax passed. Source audit: ui-screens/home/SOURCE-PARITY-2026-10-13.md.
- Gaps: browser local-file policy prevented visual parity review; HTML wheel remains listbox stand-in. Native font bundle, simulator/device rendering, gestures/accessibility, services and OS auth not validated. Setup CTA remains 56 points lower than active Home; no unapproved layout change made.
- Next: integrate native references in app sandbox with native fonts, compare device captures to approved PNGs, and close wheel/HTML visual parity before production handoff.


## 2026-10-13 — Wheel final; feedback consistency audit

- D-40: user selected wheel as sole availability control. Removed two tap PNGs from ui-screens/home, HTML tap states and native stepper branch; quick presets retained. Current handoff has 30 approved visual references.
- Source checks: wheel-only HTML syntax, native TypeScript, manifest/path checks. No new image render or device validation claimed.
- Saved docs/reviews/2026-10-13-feedback-consistency-audit.md. Reviewed all auth/Home source states and 16 historical Home draft states; visual spot checks explicitly listed. Consultation flow was not re-audited.
- Main findings: sign-in/OTP/native notice specs differ; field-border thickness differs; accessibility associations missing; native generic button errors lack shared ownership; native countdown enables before explicit eligibility and leading-zero normalisation differs from D-39. These remain recommendations/fixes pending review, not implemented changes to auth.
- Recommendation: two error structures (field and action/status notice), independent of before/after CTA timing; preserve D-39. Next: review representative error examples and then synchronize shared source/render/native specifications.


## 2026-10-13 — D-41 feedback rules and render policy

- Added docs/feedback-rules.md (canonical feedback, timing, toast, layout, copy ownership and QA contract), docs/feedback-state-map.md (auth/Home states and behavior combinations), and docs/renders/RENDER-README-TEMPLATE.md.
- Linked mandatory references from CLAUDE.md, render index, approved UI README and native README. Updated per-state PNG rule to representative capture policy; historical approvals retained.
- No renders, auth/UI behavior changes or shared design-system edits performed. Target shared copy registry is documented, not implemented.
- Next: migrate shared feedback/copy and repair audited source mismatches; create batch README before captures; review representative field/notice/toast examples. Initial mapping proposes up to nine captures, reusing existing proofs where sufficient; copy-only states stay in source fixtures.

## 2026-10-13 — Feedback source repair, visual review pending

- User authorized D-41 implementation. Batch README created before any capture attempt at `docs/renders/2026-10-13-feedback-review/README.md`.
- Added `ui-screens/feedback/` single copy registry, metadata, generated web/native adapters and source checker. Shared design-system CSS now has proposed four-slot OTP and neutral notice components; native Notice/Toast mirror token anatomy.
- Updated all approved sign-in and OTP HTML states plus returning unlock and Home editable references. OTP has four compact visual slots over one actual input. Home source includes representative setup/request/add failure, near-expiry and compact toast fixtures. React Native components consume same messages and correct locked/expired/leading-zero behavior.
- Passed registry build, 12 sign-in/12 OTP selector and asset checks, HTML/JS syntax, strict React Native type check and pure duration/number logic tests. Detailed audit: `docs/reviews/2026-10-13-feedback-repair-qa.md`.
- No new PNGs captured or promoted. Prior browser file-policy rejection barred local source capture and alternate capture workarounds. Existing approved PNGs are historical; changed HTML/native pixel parity, small screen/large text, native autofill and screen reader remain unverified. Proposed copy IDs marked in feedback metadata.
- Next: source-derived R01–R09 representative visual review when authorized browser capture is available. Replace only images that pass visual review; preserve copy-only siblings as fixtures. Host team must wire authoritative backend states and onActionError callbacks.

## 2026-10-13 — Feedback render review loop (3 rounds), approval pending

- README corrected: page-load smoke recorded as Pass (outside headless-Chromium check, 33 states, zero console/page errors); earlier "HTML/native copy and state mapping: Pass" marked as given before the `msg()` crash fix, now re-based on the page-load check.
- Captured R01–R09 from real HTML (`file://`, headless Chromium, playwright in scratchpad) at 390×844 @2×, 360 width and large text ×1.3. Folders: `docs/renders/2026-10-13-feedback-review/round-1..3/` (each with `metrics.json`, `codex-review.md`, `changes.md`). Round-3 is final.
- Codex (read-only) review: round 1 and 2 raised real blockers; round 3 reported BLOCKERS: none.
- Fixed in source (ui-screens/home only; no feedback copy or registry change):
  - Add-time wheel: native select replaced by centred shaded band + divider (matches approved `add-availability_wheel.png`). Shared by setup and add.
  - Add-time error: footer kept in approved position; notice slot between wheel and CTA. Error variant only: picker top 108px, adjust margins 12px.
  - Home toast raised to ~14px above Request a case.
- Rejected Codex claims: "+ Add time" missing on R08/R09 (by design: near-expiry ≤15 min only); preset corner shape (central chip component, out of feedback scope).
- Harness bugs found and fixed in scratchpad capture (360 frame width; compounding large-text scaling; metrics relative to #phone). Round-1 360/large frames superseded.
- Not promoted to `ui-screens/`. Not committed. Approved PNGs untouched. `decision_log.md` untouched.
- build-messages.mjs and check-sources.mjs: PASS after final change.
- Needs Apurva (also in batch README): (1) four-slot OTP anatomy approval; (2) add-time error-sheet spacing variant; (3) sheet CTA 4px variance vs approved (y=704 vs ≈708); (4) seven proposed copy IDs in metadata.json; (5) representatives for R08 toast / R09 request-failed; (6) preset corner treatment (central chip).
- Next exact step: Apurva reviews `round-3/*_w390.png` (and `_w360`, `_w390-large`) against `ui-screens/` approved references, decides Needs Apurva items, then approved representatives are promoted in a separate step.

## 2026-10-14 — Layout v2 loop, Step 0 partly applied, stopped on verification gate

- Loop: `docs/reviews/2026-10-14-layout-v2-loop.md`. Step 0 applied from `docs/reviews/2026-10-14-layout-v2-rules-review-copy.md`:
  - `docs/context/decision_log.md`: D-42, D-43, D-44, D-45 added; D-38 pointer line added.
  - `design-system/RULES.md`: §8 added; §5 checklist (3 lines) and §6 known gaps (2 bullets) added.
  - `design-system/src/components.css`: `.tm-text-title-lg` [PROPOSED] added; `build.py` run (truemeds.css, preview, native regenerated; logo lock OK).
  - `docs/feedback-rules.md` → v1.1 (§4 wrong-code bullet, §6 invariants). `docs/feedback-state-map.md` (OTP rows, opt-in wording removed, faster sign-in offer section).
  - `docs/context/open_questions.md`: OQ-023 added. `ui-screens/README.md`: layout-v2 and delegated-approval notes at top. `CLAUDE.md`: layout v2 line under D-41.
- **Blocked (not applied, asked Apurva):** loop Step 0.2 verification fails:
  - `--tm-content-brand` = `--tm-core-blue-500` (#266CE1, SALT). Loop expects blue-600.
  - `.tm-text-body-lg` = 16/20 in SALT (`extras.json`). RULES §8.1 L2 says 16/24.
  - `--tm-content-placeholder` does not exist; review copy uses `--tm-content-tertiary`.
  - `design-system/tokens/truemeds.json` (review says NEW) not created: build reads Core/Default/extras only.
- Not committed. Nothing promoted to `ui-screens/`. Steps 1–6 not started.

## 2026-10-14 — Layout v2 Step 0 applied (final copy)

- Applied final review copy (`docs/reviews/2026-10-14-layout-v2-rules-review-copy.md`) and loop (`…-loop.md`). Decisions: design-system folder is source of truth; brand text blue-600; placeholder grey-500; title 32/40 semibold; body-lg 16/24.
- `design-system/tokens/truemeds.json` (new), applied last by `scripts/build.py` and `scripts/build_native.py`. Buttons/surfaces stay blue-500 (SALT).
- Verified in build: `--tm-content-brand` = blue-600; `--tm-content-placeholder` = grey-500; `.tm-text-title-lg` 32/40/600; `.tm-text-body-lg` 16/24 (CSS and native `bodyLg`). Logo lock OK.
- RULES.md: opening (folder is source of truth), §8 (incl. §8.7 contrast), §5 checklist line added. `beyond-salt.md` and `design-system/README.md` updated.
- Decision log D-42–D-45 added (D-43 wording fixed); D-38 pointer. feedback-rules v1.1; state map OTP rows + offer section; OQ-023; CLAUDE.md line.
- ui-screens/README.md: layout-v2 note only; delegated-approval note removed (per Apurva).
- Not committed. Nothing promoted.

## 2026-10-14 — Layout v2 Step 1 done (coverage matrix), Step 2 not started

- `docs/renders/2026-10-14-layout-v2/README.md`: coverage matrix, 66 rows (sign-in 12, OTP 17, offer 8, unlock 7, Home 18, case 4); 36 planned own captures at 390×844 plus 360 checks where text wraps.
- Codex (read-only, one check): added unlock.cancelled / unlock.platform-retry, split Home idle-expired / manually-ended, corrected counts. Its blockers on otp.wrong-code, otp.default and home.no-cases are current-source gaps, so they are Step 2 build items, not matrix errors.
- Next exact step: Step 2 phase A. Update `ui-screens/otp/otp.html` (task header, four slots with digits visible on wrong code, keyboard open on load, resend line, consent line rules), then `ui-screens/sign-in/sign-in.html` (logo kept, inline button, title 32/40). Run `node ui-screens/feedback/check-sources.mjs`. Then Step 3 capture (Playwright installed outside the project, not yet installed).

## 2026-10-14 — Layout v2 phase A reviewed (awaiting Apurva OK before phase B)

- Built: `ui-screens/otp/otp.html` (task header, one-line "Sent to", four boxes over one input, keyboard open on load, replace-on-first-keystroke, one-line resend, consent only when Verify possible, offer card removed, five extra states added to the selector). `ui-screens/sign-in/sign-in.html` (title 32/40, 14/20 subtitle, gaps 8/16/32, sending button readable).
- Central changes (design-system, need Apurva OK): `.tm-field__helper` 14/20; `.tm-otp-slots` digits 16/24, boxes flex with 16px gap. Rebuilt; logo lock OK.
- Renders: `docs/renders/2026-10-14-layout-v2/A/` — rounds 1–3 + round-3-fix, contact sheets `contact-otp.png` and `contact-sign-in.png`, `NEEDS-APURVA.md`.
- Codex: round 3 no open blockers; rejected points in Needs Apurva. Sign-in gap fix after round 3 verified by DOM, not re-reviewed.
- Not committed. Not promoted to `ui-screens/`. Phase B waits for Apurva's OK.

## 2026-10-14 — Layout v2: phase A closed (D-46), phase B reviewed, phase C reviewed, phase D blocked

- Phase A: locked specs L1–L6 applied centrally (`design-system/src/components.css`, RULES §8 "Locked specs"), guard `ui-screens/feedback/check-locked-specs.py` (PASS: 17 OTP, 12 sign-in, 7 Home states). D-46 recorded. Final renders `A/round-4/`; Needs Apurva closed.
- Phase B: `ui-screens/faster-signin-offer/faster-signin-offer.html` (new), `ui-screens/returning-unlock/returning-unlock.html` (task header, pinned footer, pending busy, unavailable). Renders `B/round-1..3`; Needs Apurva `B/NEEDS-APURVA.md`. Codex round 3: no blockers.
- Phase C: `ui-screens/home/home.html`, `home-reference.js/css` rebuilt (19 states, pinned footer, hero gap 48, m:ss timers, 44pt targets). Five proposed + one more feedback messages in the registry. Renders `C/round-1..3`, `C/round-3-fix`. Codex round 3 blockers fixed and verified by measurement (not re-reviewed). Needs Apurva `C/NEEDS-APURVA.md`.
- Phase D: BLOCKED. `index.html` scr-home mixes the Home greeting with case sections. Need decisions: which screen is the case page, its title, and its Back target. Not started.
- Nothing committed. Nothing promoted to `ui-screens/`.


## 2026-10-14 — Final review decisions recorded (D-47–D-49); loop paused before phase D

- Apurva reviewed phases A–C with Claude (chat) and decided: L7 helper alignment, L8 balanced titles, L9 value display 32/40; no full stops on titles; no Back on the faster sign-in offer or returning unlock; neutral offer icons; unlock unavailable copy; Home clip bug fix; no time row on stop-pending; no spinner on quiet "Ending…"; Home copy. Recorded as **D-47**. Review notes: `docs/reviews/2026-10-14-final-review-ABCD.md`.
- Case page: **D-48** (Back by stage; release before the first attempted call with confirmation; blocked during the call; "Request next case" + "Back to Home" at the end; reopen into an open case; "case" wording) and **D-49** (compact blue-tinted sticky header; D-07 strip retired; D-33 plain-white rule replaced).
- Files updated (docs only, no code): decision_log.md, design-system/RULES.md (§8.5 header sizes, §8.10–12, locked L7–L9), feedback-state-map.md (offer/unlock no Back, stop-pending, new "Case page exits"), feedback-rules.md (L7, no clipping, spinner rule), open_questions.md (OQ-024 release backend, OQ-025 restore open case, OQ-026 "order" wording), CLAUDE.md, project_truth.md (leaving-a-case note), ui-screens/README.md.
- Not yet done: registry copy changes (messages.json + metadata) and all code; beyond-salt.md entries for L7–L9 and the compact header (add when built).
- **Next:** one fix pass for phases A–C (D-47) with one Codex check; then phase D **concepts only** for Apurva's review (D-49 process).

## 2026-10-14 — Final CTA labels and tracking (D-50); docs verified

- Apurva: order ID line stays ("Order 12345 · ₹1,240"); final CTAs renamed "Confirm prescription" (Cat4, Pilot HA-skipped), "Confirm & transfer", "Confirm & forward", "Skip HA call"; routing unchanged. The four paths must be distinguishable in analytics (never derived from the label). Recorded as **D-50**; OQ-026 answered (tracking method open for Engineering).
- Updated: decision_log (D-50, D-48 pointer), project_truth §4–5, open_questions OQ-026, CLAUDE.md, final review outcome, loop file phase D row.
- Not yet updated: `docs/Doctor_Portal_Developer_PRD.md` still uses the old labels (Apurva to decide); `index.html` labels change only when the case page is rebuilt after concept approval.
- **Next:** terminal runs the A–C fix pass (D-47) and phase D concepts (D-48–D-50).


## 2026-10-14 — Final pass (D-47) and case-page concepts (D-48–D-50)

- Part 1 (D-47): L7 (helper under OTP boxes, central `:has()` rule), L8 (balanced titles, central `text-wrap: balance`), L9 (`.tm-value-display`), no full stops on titles, offer and unlock have no Back, offer icons neutral grey, Home clipping fixed (minimum helper moved onto the Adjust row; scroll area checked), time remaining as value display, stop-pending has no time row, D-47 copy in `messages.json`. Guard `ui-screens/feedback/check-locked-specs.py` extended (L1–L9, titles, clipping, unlock/offer, 19 Home states): PASS. `check-sources.mjs`: PASS.
- Final renders: `docs/renders/2026-10-14-layout-v2/{A,B,C}/final/` with metrics and contact sheets. One Codex check per phase: no blockers. Batch README and NEEDS-APURVA files updated. Nothing promoted to `ui-screens/`.
- Part 2 (concepts, D-48–D-50): `docs/concepts/2026-10-14-case-page/` — concept.html, 11 states at 390 and 360 wide, contact-sheet.png, metrics.json, README.md. Codex: no blockers. `index.html` and consultation logic untouched.
- Sandbox blocked one cleanup (`rm` via shell variable) — the generated `_sheet*.html` helper files remain in the final folders and concept folder. Harmless; can be deleted by hand.
- Next: Apurva reviews the contact sheets and concept sheet, decides the open points in the concept README; then the case page build is a separate step.

## 2026-10-14 — Amendments applied; case page concept v2 (real page)

- Part 1: Home stop-pending and expired-pending subtitle "You won't get new cases." (notice unchanged). Returning unlock unavailable notice is neutral info (N1). check-locked-specs.py PASS; check-sources.mjs PASS. Changed states re-captured into `A|B|C/final/` (390 + 360) with metrics merged; B and C contact sheets refreshed.
- Part 2: `docs/concepts/2026-10-14-case-page/v2/` — concept.html is a copy of `index.html` (not edited), with the D-49 header, D-48 pieces, D-50 labels and the concept driver. 12 states × 390 and 360, `contact-sheet.png`, `metrics.json`, `README.md` with Needs Apurva. One Codex check: blockers (wording, sentence case) fixed and checked on rendered text.
- First-round README marked REJECTED. First-round files kept (no deletes).
- Open: Apurva's decisions in `v2/README.md` (Needs Apurva items 1–7). Case page build not started; index.html unchanged.
- Sandbox blocked one cleanup (shell-variable rm); `_sheet.html` helper files remain in final and concept folders.

## 2026-10-14 — Phase C wheel restored (D-40), expired-pending copy; case page v2 round 2

- Phase C: approved wheel restored in `ui-screens/home/home-reference.js/css` (one brand-subtle band across both columns with a divider, large brand-blue selected values, grey neighbours, no grey column boxes; tokens only). Used in setup, setup failed, idle expired, manually ended, Add availability (adding, add failed). "Minimum 15 minutes" stays visible on the Adjust row. expired-pending notice: "Your last request is still active." (registry + build).
- Guard `check-locked-specs.py` extended: wheel band and selected value match the tokens; no grey column boxes. Guard PASS; check-sources PASS.
- Re-captured the 9 affected Home states into `C/final/` (390 + 360), metrics merged, `contact-home.png` refreshed. One Codex check on the wheel states: no blockers.
- Case page v2 round 2 (`docs/concepts/2026-10-14-case-page/v2/`): two-line header at fixed 100 px; content row with Order details as one tap target and View Rx on the right; closed cards at the top of the content titled by path ("Prescription confirmed" / "Transferred to HA" / "Forwarded to HA"); pinned exits stacked (Request next case over Back to Home), availability-ended shows only Back to Home; missed-call sheet in sentence case; the scrolled render verified to differ from top. 14 states × 390 and 360, `contact-sheet.png`, `metrics.json`, README with Needs Apurva (6 items). One Codex check: no blockers.
- index.html unchanged; nothing promoted to ui-screens/; no git; no deletes.

## 2026-10-14 — Phase D full concept render (v2/full), for one review — not built

- Design system: success tags use `--tm-content-success-strong` (green-700, 6.7:1); fixes the "Prescribed" tag. Added to `tokens/truemeds.json` and `components.css`; rebuilt.
- Part 1 earlier this round: wheel restored to the approved look (guard checks it), expired-pending copy, Home C/final re-captured, contact-home refreshed, one Codex check (no blockers).
- Phase D: `docs/concepts/2026-10-14-case-page/v2/` — concept.html (copy of index.html; index.html and app.js untouched) with the full matrix (groups A–E, 34 states × 390/360, 68 renders), `full/metrics.json`, group sheets `full/contact-A-A-case-page.png`, `contact-B-B-call.png`, `contact-C-C-sheets.png`, `contact-D-D-prescribe.png`, `contact-E-E-end-of-case.png`. Codex: round 1 nine batches, round 2 two batches (cap 2); round 1 blockers fixed; round 2 one blocker fixed and DOM-verified. Coverage matrix and 13 Needs Apurva items in `v2/README.md`.
- Not reachable / not in page: HA transfer banner is desktop-only (side panel); transfer-failed alert has no page path; no on-screen keyboard in the page (focus states only).
- Stopped for Apurva's review. Nothing built into index.html; nothing promoted to ui-screens/; no git; no deletes (sandbox blocked one shell-variable cleanup; `_sheet*.html` helper files remain in full/ and v2/).

## 2026-10-14 — Phase D review decisions applied (D-51), concept v2 round 3

- Concept only (`docs/concepts/2026-10-14-case-page/v2/`): bar order (primary on top, secondaries below in one row, 44 px); closed case has no header Back, content muted and read-only (no chevrons, nothing tappable), card and bar live; Prescribe white header (proposal rejected), Duration label gap 24; "On prescription" band normal colour in every state; HA banner neutral above medicines on Pilot HA-required; patient unavailable is an end card (neutral icon, no sheet); callback card "Callback today at 3:00 PM"; no blue sheet outline, no Calling glow; Order details labels sentence case.
- Design system: `.tm-band--brand` (AA pair) added to `components.css`, rebuilt.
- 68 renders in `v2/full/` (390 + 360), five group sheets refreshed, `metrics.json`. One Codex check: two blockers, both fixed and checked in the DOM.
- `v2/README.md` updated: resolved Needs Apurva items removed; open: transfer-failed spec, keyboard states on device, desktop side panel.
- index.html and app.js unchanged; nothing promoted; no git; no deletes (the earlier `d-header-proposal_*` renders are superseded by `d-header-white_*`, not deleted).

## 2026-10-14 — Phase D reviewed from concept.html (D-51 addendum), three rounds

- Decision log: D-51 addendum — concepts approved; phase D rendered from `docs/concepts/2026-10-14-case-page/v2/concept.html`; `index.html` untouched and to be rebuilt fresh after A–D approval (keeping the existing logic).
- concept.html changes: End call full-width destructive on top, Schedule callback below; HA notice copy by meds type; Rx hint as its own row; closed fields read-only; Duration gap 8 px; injection heading "Dose"; bar focus rule restored; 24 px side margins (case, Prescribe, sheets); closed View Rx and Order details muted; releasing button full opacity, close and stay disabled while releasing; closed endings use "Medicines".
- Design system: destructive outline now `--tm-border-error-strong` (WCAG 1.4.11); rebuilt; checks PASS.
- Renders: `docs/renders/2026-10-14-layout-v2/D/round-1..3` (review rounds) and `D/final/` (68 renders, metrics, five contact sheets: contact-case-page, contact-call, contact-sheets, contact-prescribe, contact-end-of-case). Codex: nine batches per round, read-only; round 3 (cap) had one blocker, the mock-data alignment of the Rx and order dates, raised as Needs Apurva.
- Coverage matrix and Reviewed status: `docs/renders/2026-10-14-layout-v2/README.md` (section Phase D). Open decisions: `D/NEEDS-APURVA.md` (8 items).
- Nothing committed; nothing promoted to ui-screens/; index.html and app.js unchanged; no deletes (sandbox blocked one shell-variable cleanup; `_sheet-*.html` helper files remain in D/final/).

## 2026-10-15 — Design system review adopted (D-52)

- Central (`design-system/`): RULES.md §2.6, §2.8 (brand hex fixed), §3 table, §5 checklist, §8.5 (edit-screen and viewer headers, compact header with hidden Back), §8.6 (48px tap targets), new **§9 Components and states**; `beyond-salt.md` lists each rule with its implementation status (**pending** in `src/components.css`).
- Project: decision_log **D-52** (doctor-portal specifics, D-27 adjusted for dark toasts, D-51 HA notice dropped, phase D audit fixes, missing states); feedback-rules.md (toast spec and use); feedback-state-map.md (new "states still to design" table); CLAUDE.md pointer.
- Review copy: `docs/reviews/2026-10-15-design-system-review.md`.
- Not done yet: CSS implementation of §9, re-check of A–D, rendering of the missing D states. A–C promotion paused; A–D promote together after Apurva's approval. Nothing committed.
- **Update (same night): central implementation done by Claude.** `design-system/src/components.css` implements RULES §8.5, §8.6 and §9 (roles incl. `.tm-btn--call-end`, tertiary/ghost → quiet, 48px targets, `.tm-chip-group` / `.tm-chip-grid`, `.tm-row--readonly`, `.tm-tag--neutral` / `--fixed`, `.tm-status-card`, sheet template `.tm-sheet__*` + `.tm-option`, dark 14/20 toast, `.tm-btn-pair`, actionbar stacking, `.tm-header-edit`, `.tm-header-viewer`, focus ring, reduced motion). Rebuilt `truemeds.css` + `native/`; `preview.html` shows every role; renders in `design-system/build/preview-2026-10-15/`; contrast all AA. Truemeds Design System artifact republished (v5). Artifact build output now at `design-system/build/artifact-2026-10-15b/` (old `build/artifact/` and `build/artifact-2026-10-15/` are stale; deletes were blocked).
- **Effect on screens:** these central changes also change A–D screens (button roles, 48px heights, actionbar margins, toast). The A–D pass must re-render and run `check-locked-specs.py` / `check-sources.mjs` (could not run from this session: no Playwright here, and the mount layout breaks relative paths).

## 2026-10-16 — App logic draft and calling model
- `ui-screens/app-logic.md` drafted (not committed, not approved): every rule from the old prototype, checked against project_truth and D-01–D-55. Flags 2, 3, 5, 6 answered by Apurva.
- Calling: first release = Knowlarity click-to-call (doctor ends the call on the phone); VoIP later (OQ-027). Calling screens to be redesigned in a new thread, then the from-scratch rebuild (one prototype, demo switch between the two calling modes).

# Doctor portal — prototype build plan

**Status:** DRAFT v2 for Apurva's approval (2026-10-29). Nothing is built until this plan and the rebuild checklist (`docs/reviews/2026-10-29-rebuild-checklist.md`) are agreed.
**Scope of this document:** how the *prototype* is built (D-72 point 5). Not the production HLD/LLD — that is Engineering's.
**Inputs (frozen):** `ui-screens/` pictures (after promotion) · `ui-screens/app-logic.md` · `ui-screens/feedback/messages.json` · `docs/feedback-state-map.md` · `design-system/` (RULES §7–10) · decision log D-01–D-73.

> **v2 — what changed.** Merged from the independent reviews (`docs/reviews/2026-10-29-build-plan-review/claude-report.md`, `codex-report.md`) and the settled points (P4, P5, P6). Changed or new parts are marked **[v2]**. Reviewer points not adopted are listed in §9.

---

## 1. What we're building

A clean, modular rebuild of the doctor app prototype, from the approved screens, at a new Netlify link (D-56, D-72).

| | Full prototype (review mode) | Phone demo (demo mode) |
|---|---|---|
| Who it's for | Apurva, design team, Engineering | Anyone testing touch and feel on a phone |
| Order types | Cat4, Pilot Value Meds, Pilot Non-Value Meds, HA skipped (customer / system / doctor), fallback B | Cat4 only |
| States | Every state in app-logic and every approved picture | Happy path: sign-in → OTP → Home → case → call → Prescription confirmed → next case |
| Controls | Review panel beside the phone frame | None |
| Call gate | Real 50 s (a setting), with fast-forward **[v2]** | Short demo call, about 8 s — the whole demo clock runs faster, so the call still counts as valid **[v2]** |
| Installable | — | Yes: Add to Home Screen, opens full screen |

The old `index.html` / `app.js` / `styles.css` stay frozen and the current site keeps serving them until Apurva approves the new one.

## 2. Start gate

The build starts only when all of these are true:
1. **Promotion closed and merged** — `ui-screens/` final, every guard passing, pictures re-baselined, Apurva's sign-off on the close-out report (D-73 point 4). **[v2]**
2. **`app-logic.md` approved** — marked approved at the screens freeze (the promotion thread owns this file; §4 is already fixed there). **[v2]**
3. **`feedback-state-map.md` in line with app-logic** — its faster sign-in offer rows still send a failed or cancelled prompt to Home; app-logic (D-61, D-65) keeps the doctor on the offer. Fixed at the freeze by the promotion thread; until then app-logic wins. **[v2]**
4. **This plan and the rebuild checklist approved.**

## 3. How it's built

| # | Choice | Recommendation | Why | Rejected |
|---|---|---|---|---|
| B1 | Technology | Plain HTML, CSS and JavaScript modules; no framework, no app build. A small **deploy step** copies the shared files in (§4) — packaging, not a build **[v2]** | The production app is React Native, so prototype code is not reused — it has to be easy to read and change | A framework + bundler: a second toolchain for no gain |
| B2 | Location | New folder `app/` inside the project; old files untouched | Clean start, old demo keeps working | Rewriting `index.html` in place |
| B3 | Structure | One file per screen, one per sheet, plus a small core: navigation, app state, copy (`MSG()`), mock server, clock, mock phone unlock | Each journey can be built, checked and frozen on its own | One big file (the reason for the rebuild) |
| B4 | States and addressing **[v2]** | One **state map** file listing every state: journey, state ID (app-logic), scenario, render ID, picture, build step, transitions to test. Every state opens with one URL form, `?s=<render-id>`; the old `?capture=` / `?state=` forms are mapped in the table. Opening a state directly proves it looks right; transitions are tested by playing the journey | Pictures, states and tests stay linked one to one; nothing left out | Free-form screen logic; three URL forms |
| B5 | Look | Only `truemeds.css`, `icons.js`, `--tm-*` tokens and `.tm-*` components; markup lifted from the approved `ui-screens/` files | The pictures come out the same | Restyling per screen |
| B6 | Copy | Every word through `MSG()` from `messages.json`, button labels included (backlog §3). Missing text is added to the registry first, marked proposed. Sheet labels typed in the pictures (accepted for now, D-73 point 4) move into the registry in steps 5–6 **[v2]** | One source of copy for HTML and native | Text typed in the code |
| B7 | Server and polling **[v2]** | A mock server module plays the backend. The app **polls** it (D-72 point 4, `[MOCK ASSUMPTION]`): one polling loop per case and call; stale or duplicate answers ignored; polling restarts and re-reads the case **as soon as the app comes back to the front** — during a real call the doctor is in the phone's dialler and the app is in the background | Same shape as the real system; survives being backgrounded mid-call | Faking each screen separately |
| B8 | Clock and gate **[v2]** | One app clock. The gate is worked out from **time stamps** (patient answered → now), never a running counter, so a backgrounded app is still right when it returns. Gate = 50 s setting; demo mode speeds up the clock as a whole | Phones pause timers in the background | Tick counters |
| B9 | Data | Synthetic only: the five app-logic scenarios + fallback B + stress cases (10 medicines, long names) | No real patient, phone or doctor data | — |
| B10 | Remembering **[v2]** | The installed app remembers sign-in, faster sign-in, availability **and an open case** (medicines reviewed, notes typed, deadlines). Demo and review keep **separate** storage; capture mode writes nothing; Reset and Log out clear it. On iPhone the home-screen app has its own storage, separate from Safari | Reopening must feel real (unlock → Home, or back into the open case) | Starting from sign-in every time |
| B11 | Phone back **[v2]** | Every screen and sheet is a step in the app's history, so the phone's back gesture does the app's back: sheet closes → case → Home. In a case it follows app-logic §4 (leave sheet before the first attempted call; toast after it); it never closes the app mid-case | Otherwise back closes the installed app | — |
| B12 | Phone unlock **[v2]** | Fingerprint / face / screen lock is a **mock**: the review panel picks the outcome (success, cancelled, failed, unavailable); the demo succeeds. No system prompt drawn beyond the approved pictures. Real unlock is the native team's | A browser can't use the phone's unlock the way the native app will | Imitating the OS prompt |
| B13 | Checks **[v2]** | Playwright, for tests only. Step 0 points the layout check at the new app on a local web server; adds the screenshot compare (reusing the promotion round's compare script) and journey tests | The current layout check tests the old `index.html` | Hand checks only |

## 4. Modes, install and hosting

- **Demo mode** (the installed app, and the link's default): Cat4 happy path, no review controls. The call runs by itself: Calling… → result → Confirm prescription. The installed app always opens in demo mode; review settings in a link are ignored there. **[v2]**
- **Review mode** (`?review=1`): panel beside the frame (RULES §7.5) — scenario, call outcome, phone-unlock outcome, jump to any state, fast-forward, offline / failure switches, width 360 / 390, reset, and an event log of the four confirm outcomes as separate events, once per completed confirm (D-50).
- **Capture mode** (`?capture=1`): no panel, screen width only, fixed clock date, animations frozen — for the picture comparison. **[v2]**
- **Running it locally [v2]:** needs a local web server (`python3 -m http.server`); opening the file directly doesn't work for JavaScript modules. The deploy step and the local run use the same folder layout, so shared-file paths work the same in both.
- **Install [v2]:** web app manifest (id, name "truemeds for doctors", short name, opens in demo mode, scope, standalone, portrait, theme and background colours); icons 180 / 192 / 512 PNG made from `design-system/logo/truemeds-icon.svg` unchanged, on a solid background (P6b); iPhone home-screen tags and touch icon; safe areas (notch, home bar); screen height that follows the browser bars. Android: install from the browser menu (the prompt isn't guaranteed); iPhone: Share → Add to Home Screen. **No offline cache in the first build** — installing doesn't need it, and a cache can keep testers on an old version; the app's offline states are shown with the review panel. Pages always check for a new version. The link is hidden from search engines.
- **Hosting [v2]:** a second Netlify site, **`truemeds-doctor-app-preview`**, deploying the project branch. It gets **its own Netlify settings file inside `app/`**, so the current site's settings stay untouched. Its deploy step copies only what the app uses (design-system styles, icons, fonts, logo, the "truemeds for doctors" lockup, the copy registry) into the published folder; those copies are never committed. Only `app/` is public on the new link — not `docs/`. Checked on a deploy preview before the link is shared. Apurva creates the site herself — step-by-step guide when we get there.

## 5. Build order — journey by journey

Each step: build → automatic checks → self-audit side by side with the pictures at 360 and 390 → Apurva reviews → frozen. The next step starts only when the previous one is frozen. A change to the shared core re-runs the checks of every frozen journey. **[v2]**

| Step | Journey | Pictures it must match | Done when |
|---|---|---|---|
| 0 | Shell: phone frame, navigation and phone back, app state and storage, clock, `MSG()`, mock server, mock phone unlock, state map, review panel, install, checks, Netlify link **[v2]** | — | Layout check passes on `app/`; installs on Apurva's phone; new link live |
| 1 | Sign-in, OTP, faster sign-in offer, returning unlock | `sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/` | Every state matches |
| 2 | Home, availability, add time, end availability, Profile, Log out | `home/` (incl. Profile pictures, D-70) | Every state matches |
| 3 | Case page: header, order details, Rx viewer **incl. Rx failed**, medicines, notes, loading / offline / errors, leave sheet **[v2]** | `case/` `a-*`, `s-*`, `prescribe/d-rx-failed` | Every state matches |
| 4 | Prescribe and Disable | `prescribe/` `d-*` (except Rx failed) | Every state matches |
| 5 | Calling, Cat4 and HA skipped: states 1–10a, 7b–7f, 8c, callback, patient unavailable, **plus Request next case → next case** **[v2]** | `t01`–`t10a` (except `t08b`, `t10b`), `s7*`, `c-callback*`, `e-callback-scheduled` | Every state matches · **phone demo ready** |
| 6 | Pilot: forward (**incl. `t08b`, `t10b`**), transfer, Skip HA, failed / missed transfer, fallback B **[v2]** | `t08b`, `t10b`, `t11`–`t17` (incl. 15b, 16b, 16c), `c-skip-ha`, `g1`, `g2`, `g3b` | Every state matches |
| 7 | Across journeys: availability ends during a case, reopening into an open case, app backgrounded during a call, session kept through a case **[v2]** | `e-availability-ended` + app-logic §3–4 | Every scenario runs end to end |
| 8 | Final pass, incl. copy parity with the native copy file **[v2]** | All | Whole checklist passes; Apurva approves → frozen |

## 6. Who does what

- **Main thread (Claude):** this plan, the checklist, briefs for each step, self-audit, decision log and handoff.
- **Builders (Claude or a terminal / Codex sub-session, one step per brief):** build and run the checks; report under NEEDS-APURVA; never write the decision log or record approvals.
- **Apurva:** approves each step; creates the Netlify site; tests the demo on her phone.

## 7. Not in this build

Production architecture · real backend or telecom partner · in-app calling (VoIP) · native app and real phone unlock · offline cache **[v2]** · token inspector (next, D-72) · PRD · next-design-round items (Profile redesign, Help content, tab bar).

## 8. Points to agree

| # | Question | Status / recommendation |
|---|---|---|
| P1 | Start gate (§2) | Both reviewers agree. **[v2]** Gate now includes the promotion close-out and the feedback-map fix |
| P2 | Plain HTML/JS, no framework | Both reviewers agree |
| P3 | What the bare link opens | **Open — yours.** Recommendation: demo mode; review via `?review=1`; the installed app is always demo (both reviewers agree technically) |
| P4 | Demo call length | **Settled:** about 8 s, demo only; review keeps the 50 s gate |
| P5 | Netlify site | **Settled:** second site, `truemeds-doctor-app-preview` (check the name is free when creating it) |
| P6 | Home-screen icon | **Settled:** `design-system/logo/truemeds-icon.svg`, used as is |
| P6b **[v2]** | Icon background — the mark is transparent; phones need a solid background | **Open — yours.** Recommendation: **white**, the logo's own background; a brand-blue tile would hide the blue part of the mark |
| P7 | Event log in the review panel | Both reviewers agree |
| P8 | After approval, does the new link replace the current site? | **Open — yours.** Recommendation: yes, as its own change after approval. Phones that installed the preview keep the preview link |
| P9 **[v2]** | Help button — in every picture, content not designed | **Open — yours.** Recommendation: shows in place; tapping opens a plain placeholder marked `[OPEN DECISION]`, listed in open questions |

## 9. Reviewer points not adopted **[v2]**

- **Sharing rules code with the native files** (`native/logic.ts`): not reused — it's TypeScript and would need a build. Copy parity is checked instead (step 8); rule parity goes to the engineering hand-off pack (PRD stage).
- **`docs/` public on the current live site** (its settings publish the whole project folder): real, but outside this build — logged in the backlog for Apurva. The new site doesn't repeat it.
- **Production call handling while the app is in the background** (native call session): production architecture, parked.

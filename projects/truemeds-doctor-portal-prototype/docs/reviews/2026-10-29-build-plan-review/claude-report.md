# Claude Code review — prototype build plan + rebuild checklist

Reviewer: Claude Code (terminal) · Date: 2026-10-29 · Read-only review; no drafts, decision log, backlog, open questions or screens edited.
Drafts reviewed: `docs/proposals/2026-10-29-prototype-build-plan.md` (BP) and `docs/reviews/2026-10-29-rebuild-checklist.md` (CL).

## 1. Verdict

**Approve with changes.** The shape is right (journey-by-journey, pictures as the test, Netlify link alongside the live site). Seven blockers below would stop the build or make the checks meaningless as written; fix them in the drafts before Apurva approves.

## 2. Blockers (must change before building)

**B1 — Second Netlify site does not work as the plan says.**
- Source: repo `netlify.toml` — `publish = "projects/truemeds-doctor-portal-prototype"`; `command` copies `design-system` into `projects/truemeds-doctor-portal-prototype/design-system`. BP §4 says "publish `app/`" in the Netlify UI.
- Problem: values set in `netlify.toml` override UI build settings (Netlify docs, from memory — **unverified** here). So publishing `app/` from the UI is ignored, and the design-system copy lands in the wrong folder for `app/` (`/design-system/` would be missing on the new site).
- Second problem: the publish folder is the whole project folder, so `docs/` (decision log, open questions, handoffs), `ui-screens/`, `reference/` are already public on the current site. The new link repeats that.
- Change: choose one and write it into BP §4:
  - (a) **Simplest:** keep the current config; new site uses the same publish folder; prototype served at `…/app/`. No config change. The `docs/` exposure stays (already true today) — say so to Apurva.
  - (b) **Clean:** a branch-scoped block in `netlify.toml` (e.g. `[context.<project-branch>]`) with `publish` = a clean output folder and a command that copies only `app/` plus the needed design-system parts into it. Does not expose `docs/`. Unverified until a deploy preview runs.
  - Either way: add a deploy-preview check before the site is announced. Add `app/design-system/` (or the output folder) to the project `.gitignore` — today only `/design-system/` (anchored) is ignored (`projects/.../.gitignore`).

**B2 — Local run and design-system paths are not defined.**
- Source: BP B1/B2 ("plain HTML, ES modules"); the `ui-screens/*.html` files use `../../design-system`; `docs/layout_check.py` uses `file://`.
- Problem: ES modules do not load over `file://`, so the app needs a local HTTP server — the plan never says how Apurva or the team opens it. The relative path `../../design-system` means the repo root from the current folders, but on Netlify it resolves to `/design-system` (clamped at root). From `app/` the depth changes, so the same string points at the wrong place locally.
- Change: BP §3 or §4 must state (1) the local run command (e.g. `python3 -m http.server` from the project folder), (2) one path convention for design-system assets that works both locally and on the site (decide: copy into the served folder for local too, or use root-relative paths with a local server rooted at the same place).

**B3 — The 50-second gate and polling assume a foreground app.**
- Source: `ui-screens/app-logic.md` §5 ("Transfer cases: our app counts from the moment the patient answers"; "Gate time is a setting"); BP B7 (polling), B8 (gate setting).
- Problem: during a real call the doctor is on the phone dialer, so the installed app goes to the background. iOS Safari and Android Chrome suspend or throttle JS timers in background tabs and standalone apps. A tick-counter gate would run late or stop; polling would stop until the app is foregrounded. Gate and call state must not depend on a timer that keeps running.
- Change: BP B7/B8 — the gate is computed from wall-clock timestamps (`Date.now()` of `customerAnswered` from the mock server); polling resumes on `visibilitychange`/`pageshow` and re-reads state; checklist 4.10 gets a run case "app backgrounded for 60 s during call, returns to correct state". Device test (5.5 / 5.6) must include this.

**B4 — Home-screen icon: SVG only, transparent background, no PNG set.**
- Source: `design-system/logo/truemeds-icon.svg` (hash matches `logo.lock.json`; root `fill="none"`, no background shape, marks in `#1B69DE` and `#22B573`); BP §4 and P6; CL 5.4.
- Problem: installed-app icons need raster PNGs (Android manifest icons 192 and 512; iOS `apple-touch-icon` 180 PNG, which iOS does not take as SVG). A transparent icon shows black behind the mark on iOS. "Used as is" (brief P6) can still hold if the mark is rasterised unchanged on a background — but **the background colour is a brand decision** (white, brand blue, or other) and is not in the design system.
- Change: add an icon step to BP §5 step 0 — PNG 180/192/512 (512 maskable with safe zone) generated from the SVG by a script, background colour decided by Apurva (add to NEEDS-APURVA). CL 5.4 "How: device" stays, plus an auto check that the manifest and icons exist and load.

**B5 — Phone back gesture is unhandled in the installed app.**
- Source: `ui-screens/app-logic.md` §5 and §4 (leave sheet; "blocked after the first attempted call (toast on phone back)"); CL 4.7.
- Problem: in standalone mode, Android back gesture and iOS edge swipe trigger history navigation. Without a history entry per screen/sheet, back closes the app mid-case. Nothing in BP covers this.
- Change: BP B3/B4 — navigation keeps history state (`pushState`/`popstate`); phone back maps to the in-app back (sheet → case → Home), and the rule from app-logic §4 is implemented in that handler. Add a CL line: "phone back on each screen does the app-logic action; never exits during a case".

**B6 — The checklist's automatic checks cannot run as written.**
- Source: `docs/layout_check.py` — `URL = file://…/index.html?start=case` (tests the old prototype; needs Playwright and a Chromium path); CL 2.3 "ALL PASS" and the "auto" column; CL header "compare".
- Problems:
  1. `layout_check.py` checks the frozen old `index.html`, not `app/`. CL 2.3 would pass or fail for the wrong app.
  2. No test harness is chosen. "auto" and "run" need one (Playwright is the implied choice; the workspace has no test runner per CLAUDE.md). This is a Node/Python toolchain decision — BP B1 says "no build step", so say the harness is test-only.
  3. "compare" has no metric. The promotion round needed a case-by-case "accepted" list (spinner frames, anti-alias, clock date) — see `docs/renders/2026-10-28-promotion/REPORT.md`. CL 2.2 must define: capture settings (animation freeze, fixed clock date per D-72 pt 4, same fonts), tolerance (pixel threshold and region rules), and where accepted differences are recorded.
- Change: BP §5 step 0 adds the harness, re-points the layout check to `app/` served over HTTP, and CL 2.1/2.2 get a measurable definition. Keep "eye" for things a machine cannot judge.

**B7 — "Phone demo ready" at step 5 is not reachable.**
- Source: BP §4 demo ("sign-in → OTP → Home → case → call → Prescription confirmed → next case"); BP §5 step 5 ("phone demo ready"); step 7 holds "next case"; CL 4.16 "Request next case".
- Problem: the demo's happy path ends with "next case", which is built in step 7. Step 5 cannot be the demo milestone as written.
- Change: move the Cat4 "Request next case → next case" loop (and the Home availability it needs, step 2) into step 5, or move "phone demo ready" to after step 7's next-case part and say so.

## 3. Should change

**S1 — Build step copies the whole design system to a public site.** `netlify.toml` copies all of `design-system/` (including `scripts/`, `RULES.md`, `preview.html`, `native/`). Copy only what the app uses: tokens, `truemeds.css`, `icons.js`, fonts, logo. (Source: `netlify.toml` `command`; `design-system/` contents.)

**S2 — Service worker and caching.** BP B3/§4 "offline cache for the app shell" needs: a versioned cache name per deploy (commit SHA), an update path (new build replaces old on next open), and `Cache-Control: no-cache` for `app/` HTML/JS/manifest in a Netlify `[[headers]]` block, because module file names are not fingerprinted. Without it a stale build can run after a deploy. (Source: BP B7/§4; Netlify headers — unverified here.) Add a CL line: "after a new deploy, installed app loads the new build on next open".

**S3 — Installable-app checklist gaps (manifest and iOS).** BP §4 "Install" names only manifest fields. Add:
- manifest: `name`, `short_name`, `start_url` and `scope` (match the chosen path, see B1), `display` (`standalone` keeps the status bar; `fullscreen` hides it — choose), `orientation: portrait`, `theme_color`, `background_color`, icons (see B4);
- iOS: `<meta name="apple-mobile-web-app-capable">`, `apple-mobile-web-app-title`, `apple-mobile-web-app-status-bar-style` (`black-translucent` only if the header handles the status bar), `apple-touch-icon` (180 PNG);
- `<meta name="viewport" content="… viewport-fit=cover">` — without it `env(safe-area-inset-*)` is zero on iPhone and CL 5.6 cannot pass;
- standalone detection: `matchMedia('(display-mode: standalone)')` plus `navigator.standalone` (iOS);
- iOS has no install prompt: the plan's "Add to Home Screen" instruction is the only path there (already in BP §4 — keep it).
- Use `100dvh`/inset layout, not `100vh`, so the iOS toolbar does not cut the bottom bar (device check 5.6).
- Inputs at 16 px or larger, or the iPhone zooms on focus (OTP boxes) (unverified against current iOS).
(Source: BP §4; CL 5.4–5.6.)

**S4 — iOS storage is separate from Safari, and may be evicted.** B10 says the app remembers sign-in and availability "on the phone between visits". On iPhone the home-screen app has its own storage — a sign-in done in Safari is not there, and the reverse. Eviction rules for script storage in home-screen apps are **unverified**. Say in B10: the remembered state lives in the installed app only; add a device check that reopening the installed app after several days still resumes (5.5).

**S5 — Gate for step 1 (promotion close-out) is not written in full.** BP §2 gate lists "promotion merged" and "app-logic approved". Add: guard 5.12 passing; the `s7b` icon regression (promotion REPORT stop item); `a-releasing` clock date; the three Profile pictures re-baselined (REPORT: "did not re-baseline"); the NEEDS-APURVA list (callback and Skip HA copy, "HA call" wording, Log out icon, profile name). Without these, step 1–4 pictures are not final.

**S6 — Checklist state IDs do not match app-logic §5.** CL 4.10 says "states 1–17, 7b–7f, 15b, fallback B". The app-logic table (§5) has rows 1–17 with sub-rows 7b–7f, 8a–8c, 10a/10b, 15b, 16b/16c, and fallback g1–g3b. Rows 8a–8c, 10a/10b, 16b/16c are not in the range. Replace with the list of render IDs (app-logic §5 "Render id" column) — also gives the 1.1 link to the pictures.

**S7 — Step 4 and step 3 ordering.** Prescribe (step 4) is reached from the case page (step 3) — fine. But `e-availability-ended` (step 3 family `e-*` is not in step 3; it is in step 7). Confirm `e-callback-scheduled` belongs to step 5 (it is listed there) and `e-availability-ended` to step 7 — state both in the table. Minor, but the picture-family rule in BP §5 says each family goes in one step.

**S8 — Parity with native handoff is not in the plan or checklist.** `docs/feedback-rules.md` §10 "Before handoff: HTML/native message-ID and copy parity". `ui-screens/native/` holds `logic.ts`, `messages.ts`, `test-logic.cjs`, `VALIDATION.md`; `ui-screens/home/NATIVE-HANDOFF.md`. BP says the build is "handed to a React Native team" but does not say: does the prototype reuse `native/logic.ts` (or test against `test-logic.cjs`) so two copies of the rules do not drift? Add a step-8 item and a CL line for copy parity (`feedback/check-sources.mjs` exists; reuse it).

**S9 — URL/state addressing has three conventions.** Existing pictures use `?capture=` (sign-in, OTP, unlock, offer), `?state=` (Home), `?s=…&start=case&capture=1` (case). BP B4 uses `?s=t12-transfer-ready`. Pick one for the new app and map the old ones in a table, because the capture tool and CL 1.1 depend on it.

**S10 — Help button has no target.** `ui-screens/README.md` "Not in these pictures: Help"; `docs/reviews/2026-10-15-standards-checklist.md` 7.4 says "Help always present" on the D header. BP §7 excludes Help. The button appears in pictures but has no behaviour. Say: renders, opens a placeholder marked `[OPEN DECISION]`, listed in open questions.

**S11 — Copy-registry dependency.** CL 3.1 ("every word through MSG()") cannot pass for step 5 callback and Skip HA sheets: the copy is not in `ui-screens/feedback/messages.json` (README "Open items"; D-72 pt 4 accepts typed copy "for now"). BP B6 says add missing text first, marked proposed — but the callback copy is on the NEEDS-APURVA list. Name it as a dependency of step 5/6, or CL 3.1 must accept the proposed-keys list.

**S12 — CL 2.x `430` column.** CL header says "auto at 360, 390 and 430"; there are no 430 pictures. Say 430 is layout/overflow only (auto), never compare.

**S13 — CL 1.1 includes non-state files.** `contact-*.png`, `case/contact-call.png`, `ui-screens/_qa/` (A–D) are not states. Exclude them explicitly; ask what `_qa/` is for (not mentioned in either draft).

**S14 — Unclear CL line 7.1.** "one project per commit" does not say what is checked. Rewrite (e.g. "commits touch only `projects/truemeds-doctor-portal-prototype/` and `design-system/` if the step needs it").

**S15 — BP and CL out of date with the settled points.**
- BP P5 row still says "name e.g. `truemeds-doctor-app` — your call"; settled name is `truemeds-doctor-app-preview` (brief note, 2026-10-29).
- BP P6 row says the icon "not yet approved… kept in `brand/`"; settled: official square mark `design-system/logo/truemeds-icon.svg`, used as is (the `brand/` path is wrong).
- BP §3 B1 "no build step" vs BP §4 hosting copy step — say the copy is a deploy-time step, not an app build.
- Name availability for `truemeds-doctor-app-preview.netlify.app` is **unverified** (checked only that the name is a valid subdomain: lowercase, hyphens). Apurva should see it free in the Netlify site-name box before the step.

## 4. Nice to have

- Add `<meta name="robots" content="noindex">` and `robots.txt` to the prototype (public link, synthetic data).
- Reuse `feedback/check-sources.mjs` and `check-locked-specs.py` in CL 3.x instead of new checks (both exist).
- CL 6.4 "no real phone numbers…" — say how (regex over build output, allowlist for mock numbers).
- BP §5 "Pictures it must match" should cite the render-ID list, not folder names.

## 5. P1–P8

| Point | Agree / disagree / can't judge | Why |
|---|---|---|
| P1 Start gate (wait for promotion + app-logic approval) | **Agree**, with S5 added to the gate | Pictures are not final until the close-out items in S5 are done. |
| P2 Plain HTML/JS, no framework | **Agree** | Simple, no toolchain. Needs B2 (local server) — ES modules do not load from `file://`. |
| P3 Bare link opens demo mode | **Agree** | Installed app's `start_url` must be demo-only, so review mode is never the saved entry (technical reason). |
| P4 Demo call shorter (about 8 s) | **Can't judge** (product) | No technical objection if the gate is wall-clock (B3). Demo-only mock setting is fine. |
| P5 Second Netlify site; name `truemeds-doctor-app-preview` | **Agree** (site and name) | Valid subdomain. Second site works only with B1 settled. Availability unverified. |
| P6 Home-screen icon: official square mark, as is | **Agree in principle; needs decision** | Technically, a PNG rasterised unchanged on an opaque background is needed (B4). The background colour is Apurva's call. |
| P7 Event log in review panel | **Agree** | Cheap; helps Engineering see the four outcomes (D-50). Review mode only. |
| P8 New link replaces the current site after approval | **Can't judge** (product) | Technical note: replacement means changing the root `netlify.toml` publish path for the live site — do it as its own commit after approval, not in the same deploy. |

## 6. Parked (out of scope)

- Token inspector (next, D-72 pt 1 order) — separate brief.
- PRD and OQ-030 to OQ-033 (D-72 pt 4) — PRD work.
- Native call session (CallKit / ConnectionService) for backgrounding during a live call — production architecture (`docs/Doctor_Portal_Developer_PRD.md`), not the prototype. Relevant to B3 only as a constraint.
- In-app VoIP calling (OQ-027) — later (app-logic §5).
- Profile redesign, User manual link, Help content, tab bar (D-69 pt 7; ui-screens README "Next design round").
- Push notifications and real backend — out of this build.

---
Unverified items (not checked here): Netlify precedence of `netlify.toml` over UI settings and branch-context syntax; iOS storage eviction for home-screen apps; Chrome install criteria for the current release; iOS icon handling of manifest vs `apple-touch-icon`; name availability on Netlify.

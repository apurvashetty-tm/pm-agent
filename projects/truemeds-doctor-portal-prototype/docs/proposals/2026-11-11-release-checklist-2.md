# Release checklist 2 — Home v3, one band, visible-gap spacing, copy batch (2026-11-11)

Decisions: **D-106** (Home v3), **D-107** (band), **D-108** (visible-gap spacing + screen standard), **D-109** (copy, sheet subtitle, unlock prompt). Every row is a place that must change. The build run ticks each row with evidence; the main thread checks every tick before the release PR. "Shared" rows go to `main` first on one `shared/` PR (rule: shared changes land before the project uses them).

## S · Shared (design system, on `main` first)
| # | Where | Change |
|---|---|---|
| S1 | `design-system/RULES.md` §8.3 | Replace the gap rule with D-108 (visible edges; 8 join / 16 group / 32 different things; tap areas and reserved lines add no visible space; notice placement). Remove "home-base hero gap 48". |
| S2 | `RULES.md` locked table L6, §8.13 | L6 → "logo → title 16 on every screen with the logo" (D-107); §8.13 reference updated. |
| S3 | `RULES.md` §8 / §9 | Add the band spec (D-107) and the screen standard (screens-audit §1 with D-108 values) as one section "Entry and home screens". |
| S4 | `design-system/src/components.css` `.tm-sheet__subtitle` | Subtitle 8 under the title inside the header (D-109 §2). Check every sheet that uses it. |
| S5 | `design-system/src/components.css` link | Inline link with a 48 hit area that adds no height (`::after`) as a reusable class (OTP Change, Sign up). |
| S6 | Visible-gap checker | A shared script (`design-system/scripts/`) that measures visible edges (text ink boxes, borders, filled shapes) and fails on any gap not allowed by S1. Unit-tested on a page with a 48 link and a reserved line. |
| S7 | `beyond-salt.md` | Record S4, S5 as beyond-SALT changes. |

## P · Prototype screens (`app/`)
| # | Screen | Change |
|---|---|---|
| P1 | Band (all 5 screens) | One shared band block used by sign-in, OTP, offer, unlock, Home (D-107); remove the five local versions. |
| P2 | Sign-in | Logo → title 16; helper "We'll send you an OTP by SMS."; field+helper → 32 → Send OTP; error "Couldn't send the OTP." 16 under field, 32 above Send OTP; Sign up as a real link (S5); drop the subtitle's 31ch cap. |
| P3 | OTP | "Change" inline link (S5); boxes (+ message line) → 32 → Resend line → 32 → legal → 8 → Verify; locked / expired-limited: boxes → 16 → notice → 32 → Verify; "New code sent."; every OTP error state rechecked. |
| P4 | Faster sign-in offer | Title "Skip OTPs next time"; point 1 copy (3 variants); point titles semibold; hero → 32 → points (16 apart). |
| P5 | Returning unlock | Prompt opens by itself once on arrival; cancel = today's screen; tile → 8 → caption (RULINGS 11:32, D-108 corrected); long-name title may wrap. |
| P6 | Home setup | D-106 setup; wheel hours 0–10; "Available until {time}" caption; no range text; ended Home count row above the picker when > 0. |
| P7 | Home available | D-106 card; + Add time always (greyed offline); Rx row → Profile; titles/subtitles per D-106 / D-107 for every Home state (requesting, no cases, request failed, offline, near expiry, unknown result, ending, ended, expired-pending "Availability ended"). |
| P8 | Add-time sheet | Title "Add time"; Quick picks / Custom picker; wheel tops out at what's left, hint "Up to 10 hours in total"; "Add 9 h 45 min" format; error in the pinned actions 16 above Add. |
| P9 | End-availability / log-out sheets | "won't get new cases"; subtitle placement (S4). |
| P10 | Review panel state names | Update names for changed / new states (offer, unlock auto-prompt, Home v3). |

## R · Rules and copy (project)
| # | Where | Change |
|---|---|---|
| R1 | `ui-screens/app-logic.md` §1–3 | Sign-in, OTP, offer, unlock (auto-prompt), Home v3 (A-09, A-10, 10-hour cap, Add time always, Rx → Profile, ended count row, copy). |
| R2 | `docs/feedback-state-map.md` → regenerate `app/state-map.js`, `docs/state-map.md` | Changed / new states and copy. |
| R3 | `ui-screens/feedback/messages.json`, `metadata.json`, `visible-strings.json` → regenerate `messages.js` (both copies) and `messages.ts` | Every copy change in D-106, D-107, D-109. |
| R4 | `docs/context/backlog.md` §2n | Tick done rows; 7 AM–11 PM window stays open. |

## U · Approved screens and pictures (`ui-screens/`)
| # | Where | Change |
|---|---|---|
| U1 | `ui-screens/sign-in/`, `otp/`, `faster-signin-offer/`, `returning-unlock/`, `home/` HTML | Same changes as P2–P9 (the approved references must match the app). |
| U2 | Re-render every state of those screens at 360 / 390 (and 430 where the set has it) in real-size frames (sign-in 360 in a 640 frame) | New pictures for Apurva's approval, with before/after sheets. |
| U3 | `ui-screens/README.md` counts; review sheets | Updated. |
| U4 | Old native files (`ui-screens/native/`), old prototype (`index.html`, `app.js`) | **Leave** — superseded by the kit / frozen. |

## T · Tests and checks
| # | What |
|---|---|
| T1 | Visible-gap check (S6) on every in-scope screen and state, 360 × 640 and 390 × 844 — all pass. |
| T2 | Entry journeys: unlock auto-prompt (opens once, cancel, retry, 3 failures → sign-in prefilled), OTP states, sign-in errors. |
| T3 | Home: wheel 0–10 h edges, add-time cap, "Add 9 h 45 min", Add time offline, Rx row → Profile and back, ended count row, every Home state. |
| T4 | Keyboard at 360: sign-in and OTP keep the field and main button visible, 16 clear (F-05). |
| T5 | `run-checks`, `check-sources`, `layout_check --app`, `check-locked-specs` (update L6), token guard, `check-state-map`, PRD check. |
| T6 | Picture compare against the new approved pictures (U2). |
| T7 | Codex: write tests first for T2–T3, then one review of the build vs D-106–D-109 and this checklist; one fix pass. |

## K · Hand-off kit
| # | What |
|---|---|
| K1 | Regenerate (`node scripts/build-handoff.mjs`), `--check`, `tests/codex/handoff/`. DECIDED, "When this shows", screen files, shots. |
| K2 | Kit notes: SMS auto-fill on device (Android SMS User Consent / Retriever, iOS one-time-code); the spacing rule (D-108) and band spec (D-107) in the foundations page; unlock auto-prompt. |

## D · PRD
| # | What |
|---|---|
| D1 | `docs/prd/PRD.md` §5.2–5.5 and `PRD.confluence.md`: copy, 10-hour cap, Add time always, Rx → Profile, unlock auto-prompt; screen links still resolve. `check-prd.mjs` passes. Confluence push only on "sync". |

## F · Finish
| # | What |
|---|---|
| F1 | Side-by-side sheet: every in-scope screen and state at one size — Apurva looks once. |
| F2 | Apurva's phone check (one sitting): band, sign-in / OTP spacing, unlock prompt on arrival, Home setup + available, wheel, add time, keyboard. |
| F3 | Main thread: verify every row above, then the release PR from `main` with `[deploy]` (final deploy), live check incl. `/calling-flow/` and `/kit`. |
| F4 | PRD calling-flow link → new site; Confluence on "sync"; session handoff + CHECKIN; archive tag after Apurva approves everything; GitLab last. |

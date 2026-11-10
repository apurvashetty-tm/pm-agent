# Run d104 — report (unattended, 2026-11-10)

Brief: `TERMINAL-BRIEF.md` (this folder). RULINGS read first: nothing in them about this run.

## 1 · D-104 in the prototype — done
- **`app/core/faster-signin.js`:** a count `offerCount` replaces the `offered` flag. An old stored `offered: true` reads as 1. `afterSignIn` shows the offer while `offerCount < fasterOfferMax`, the phone has a screen lock and faster sign-in was never turned on. The count is still remembered per number in the mode's storage.
- **New setting `fasterOfferMax`:** value 3, source "rule", ref D-104, in `app/core/settings.js`. Its plain name, "Faster sign-in offer: times shown", is in `app/review/labels.js`, so it shows in the panel's Timings and limits.
- **`app/screens/faster-signin-offer.js`:** each live showing counts once. A `counted` flag is saved into the nav history step, so re-rendering the same step doesn't count again. "Not available" (Continue) is counted because the showing is. Not now, Continue and phone Back no longer write anything.
- **Unchanged:** returning unlock, the Profile switch, and a phone with no screen lock (offer skipped and not counted).
- **Tests (`tests/entry-journeys.mjs`):** F1 unit, F3, F4 and F5d were rewritten for D-104 (the old "offered once" checks are superseded; these are test edits, not disputes).
  - F1: offer at sign-ins 1–3, Home at the 4th; old `offered:true` reads as 1; turned on once means never again; no screen lock is not counted.
  - F4: three Not nows, then the 4th OTP sign-in goes straight to Home, and the stored count is 3.
  - F5d: "not available" counts (1), and the next sign-in offers again (count 2).
- **Docs:** `ui-screens/app-logic.md` §2 had a stale "offered again later `[OPEN OQ-023]`" in the offer line; it now reads "offered again at the next OTP sign-in, up to `fasterOfferMax` times in total (D-104)". OQ-023 was also removed from the §-list of open questions.
- **Kit:** in `scripts/build-handoff.journeys.mjs`, o28 (OQ-023) is out of OPEN and `fasterOfferMax` is now the offer journey's setting. Regenerated with `node scripts/build-handoff.mjs`. DECIDED now has the D-104 rule (offer-02 and §1) and offer-15 `fasterOfferMax` = 3; the offer screen has nothing open.
- **Side change (needed for P5):** the new setting made the review panel 7 px too tall at 1280 × 800 with Timings open (807 px). The settings row line in `app/shell/shell.css` went from 16 to 15 px, leaving 784 px. This follows the same pattern as the call grid's 3 columns; there is no scroll container.

## 2 · Calling-flow page on the preview site — done (not deployed)
- **New `scripts/copy-calling-flow.sh`** copies these into `app/`:
  - `calling-flow/` page files → `app/calling-flow/`
  - `ui-screens/feedback/messages.js` → `app/ui-screens/feedback/`
  - `ui-screens/case/*_w390.png` → `app/ui-screens/case/`
  - the app icon → `app/favicon.ico`. The page names no icon, so browsers ask for `/favicon.ico` and got a 404. This also covers `/kit/`.
- **The design-system CSS** is already copied by `copy-shared.sh`. The page's `../../../design-system/truemeds.css` resolves to `/design-system/truemeds.css` on the site.
- **`app/netlify.toml`:** the build command now runs `copy-shared.sh && copy-calling-flow.sh && kit copy`. The copies are git-ignored in `.gitignore`. **The page itself is unchanged**, so it still works from the project folder.
- **No `/calling-flow` → `/calling-flow/` redirect rule.** Netlify matches both forms as the same path, so such a rule would loop, and Netlify already serves the folder's `index.html`.
- **Check:** `tools/check-calling-flow-site.mjs` builds a temp copy as Netlify would and serves `app/` as the site root. It opens `/calling-flow/` headless and clicks both tabs. Result: **PASS**, with 0 × 404, 0 console errors, 28 pictures resolving, the font loaded and messages.js loaded (`logs/calling-flow-site.log`).

## Checks
| Check | Result |
|---|---|
| `tests/entry-journeys.mjs` | 61 / 61 (`logs/entry-journeys.log`) |
| `tests/run-checks.mjs` | 95 / 95, after the panel fix; it was 94 / 95, failing on P5 (`logs/run-checks.log`) |
| `check-sources.mjs` | PASS |
| `layout_check.py --app` | ALL PASS (`logs/layout-check-app.log`) |
| `check-locked-specs.py` | PASS, 0 failures, 149 states × 3 viewports (`logs/check-locked-specs.log`) |
| Token check (`check_tokens.py`) | clean |
| PRD check | 17 / 17 |
| Kit `--check` | up to date (629 generated files) |
| `tests/codex/handoff/` | 38 / 38 |

- **Browser:** the tests' Playwright 1.58.2 browser isn't installed on this Mac, and the download timed out. The tests already accept `CHROME` / `CHROMIUM`, so `tools/with-chrome.mjs` and `tools/with_chrome.py` point them at the installed Google Chrome. No test was changed for this. The kit build already falls back to that Chrome by itself.
- **Codex review:** one correctness review against D-104 and this brief (`codex-review.log`) found **no blockers**, so there was no fix pass.

## Readings taken (nobody to ask)
- **"Until it's turned on":** once faster sign-in is turned on (offer or Profile), the offer never comes back, even if Profile turns it off later. It is stored as `turnedOn`. This is a reading of D-104, not a new decision. If Apurva wants the offer to come back after Profile turns it off, it is a one-line change in `afterSignIn`. **NEEDS-APURVA** (confirm only).
- **The count is taken when the offer is shown**, not when Not now is tapped, so a doctor who closes the app on the offer has still used one of the 3.
- **Kit CHANGES.md** also lists `d-notes-keyboard` as changed. That screen wasn't touched by this run; it is capture churn from the regenerated kit.
- **`design-system/scripts/check_tokens.py`:** its build-copy exception list (`UNSCANNED`) doesn't name `app/calling-flow`, `app/ui-screens` or `app/kit`. That only matters if someone runs the copy scripts locally and lints with `--scoped`, since the copies are never committed. Left alone: the file is central, not this project's.

## Not done
- **No deploy**, as the brief says. `/calling-flow/` goes live with the next `[deploy]` merge.

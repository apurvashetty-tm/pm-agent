# Brief — prototype build, step 0 (staleness fixes + shell)

Owner: main Claude thread · Runner: Claude Code (terminal), with Codex as critic · 2026-11-06
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch). The main `pm-agent` folder is read-only.

**Definition of done = the approved documents.** Read first and follow exactly:
- `docs/proposals/2026-11-05-prototype-build-plan-v3.md` (APPROVED v3.2, D-90) — §3 B1–B15, §4, §5 step 0
- `docs/reviews/2026-11-05-rebuild-checklist-v3.md` (APPROVED v3.2) — every line whose Step column includes **0**
- `docs/reviews/2026-11-05-plan-v3-review/MERGE.md` §4 (stale lines)
- Project `CLAUDE.md`, `../../design-system/RULES.md` §7–9, `ui-screens/README.md`, `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, `calling-flow/data.js`, decision log D-80 → D-90

If anything here conflicts with those documents, the documents win — note it under NEEDS-APURVA.

---

## Part A — staleness fixes (do first; text only)

Fix the 12 lines in MERGE.md §4 so each matches the decision already taken. **No rule changes, no picture changes.** For each: quote the old line, the new line, and the decision it now matches, in the report.
- Item 12 (Pilot 7d → 10b, D-89) changes `calling-flow/data.js` (C7f / B7d → J2 → E10b for the Pilot route) and app-logic §5 row 7f. After it, run `node calling-flow/check-coverage.mjs` (must pass) and open `calling-flow/index.html` locally to confirm the Pilot 7d path draws correctly.
- Item 1 (Back rule) wording: "Header Back on 1, 3 and 4 only, while the patient has never been reached; hidden from the tap on Call patient / Call again; never returns once the patient answered" (D-80 pt 1).
- Item 6 copy: use `MSG` key text from `messages.json`, don't retype it.
- After Part A run the four guards (below). All must pass before Part B.

## Part B — the shell (`app/`)

Build plan §5 step 0. No journey screens yet. Guidance (the plan has the reasons):

1. **Layout.** `app/index.html` (one entry), `app/core/` (navigation + history, state, storage, clock, settings, `MSG()`, mock server, call simulator, mock unlock, play-link codec), `app/review/` (desktop panel, phone drawer, "Test on phone" + QR), `app/screens/` (empty, one file per screen later), `app/data/` (scenarios, test numbers from app-logic §11), `app/state-map.js` (generated), `app/manifest.webmanifest`, `app/icons/`. Plain ES modules, no framework, no bundler.
2. **Shared files.** `app/scripts/copy-shared.sh` copies `../../design-system` (minus `build/`), the lockup `brand/truemeds-for-doctors.svg` and `ui-screens/feedback/messages.js` into `app/` so every path resolves inside `app/`. Same script locally and on Netlify. Add the copies to `.gitignore`. Local run: copy script, then `python3 -m http.server` from `app/`.
3. **Settings** (`app/core/settings.js`): every value in plan B10, each labelled rule or `[MOCK ASSUMPTION]`; one demo scale factor applied to every time value. Nothing hard-coded elsewhere (checklist 3.2 — write the scan).
4. **State map** (`scripts/build-state-map.mjs` → `app/state-map.js` + `docs/state-map.md` table): all 149 pictures with one owning step (plan §5 table, ↗ marks), behaviour-only states with IDs (checklist 1.2), calling rows from `data.js` with the normalising step (plan B4), retired keys dropped, version-A rows tagged. A drift check (`scripts/check-state-map.mjs`) fails on any mismatch with `data.js` or `ui-screens/`. Then compare the calling rows with app-logic §5 by eye and list any doubt.
5. **`?s=<id>`** opens any state. Until its step is built, it shows the **approved picture** inside the frame with a small "not built yet" label (review only) — so the shell can be clicked through end to end.
6. **Modes:** review (bare link: panel beside the frame on desktop; phone drawer on a narrow screen), demo (`?demo=1`, no controls), capture (`?capture=1`), play (`?play=<code>`). Separate storage per mode; capture writes nothing; Reset clears. Review panel never inside the frame, never a scroll container (RULES §7).
7. **Call simulator** with every outcome in plan B9; **mock server** with polling, stale / duplicate answers ignored, answers tagged with their case (plan B7). Event log in the panel.
8. **Play link:** encode the full story (scenario + every simulator choice + unlock outcome) into `?play=`; decode identically; unreadable → review + notice. QR from a vendored library (no CDN; licence noted). Drawer handle per checklist 5.11.
9. **Install:** manifest and icons per plan §4 (icon PNGs made from `design-system/logo/truemeds-icon.svg` unchanged, on white, safe padding; script it). Hidden from search engines. Always fetch the latest version (no offline cache).
10. **Checks:** tooling in `tests/` (its own `package.json`, `node_modules` ignored — never inside `app/`). `docs/layout_check.py` pointed at `app/` on a local server (keep the old check working for `index.html` too). Screenshot-compare harness (390 + 360, fixed clock, frozen animations, spinner mask — reuse `docs/renders/2026-11-03-calling-round/capture-method-cap.py`'s settings). Journey-test runner, with the generated one-test-per-edge list ready for steps 5–6. Play-link round-trip test.
11. **Preview site — prepare only.** `app/netlify.toml` (base `app/`, publish `.`, build = copy script, same `ignore` rule as the root file: builds only when the latest commit message contains `[deploy]`). Write `docs/guides/preview-site-setup.md`: simple numbered steps for Apurva to create `truemeds-doctor-app-preview` in Netlify (base directory, production branch = `project/truemeds-doctor-portal-prototype`). Don't create the site or deploy. Checklist 5.5 / 5.10 deploy checks are marked "pending site".

## Checks before you call it done

- Four guards on `ui-screens/` unchanged and passing: `python3 ui-screens/feedback/check-locked-specs.py` · `node ui-screens/feedback/check-sources.mjs` · `python3 docs/layout_check.py` · `python3 brand/check_lockup.py`. Plus `node calling-flow/check-coverage.mjs`.
- Every checklist line with Step 0: pass / fail / pending, with evidence (command output or screenshot path).
- Old `index.html`, `app.js`, `styles.css` unchanged (`git diff --stat`). No file in `ui-screens/` changed except text fixes from Part A (none expected there besides README / app-logic).
- 0 console errors on: bare link, `?demo=1`, `?capture=1`, a `?play=` link, and `?s=` for 10 states across journeys, at 390 and 360 and on a 1280-wide desktop.
- Screenshots of review (desktop), the phone drawer open and closed (390), the Test-on-phone QR panel and a play link opened at 390 → `docs/renders/2026-11-06-step0/`.

## Codex critique (after your checks pass)

Run Codex read-only, saving its answer:
`codex exec --sandbox read-only --output-last-message docs/renders/2026-11-06-step0/codex-critique.md "Read docs/renders/2026-11-06-step0/BRIEF.md. You are the critic. Check the step 0 build in app/, scripts/, tests/ and the Part A text fixes against the approved plan v3.2 and checklist v3.2 lines with Step 0. Report: blockers, should-fix, nice-to-have, each with file and line and the checklist line it fails. Read-only; write no files."`
Fix every valid blocker and should-fix; for anything you don't adopt, say why. Re-run the checks.

## Report and stop

Write `docs/renders/2026-11-06-step0/REPORT.md`: Part A table (old → new → decision); files created; checklist Step-0 results table; Codex points adopted / not adopted; known gaps; **NEEDS-APURVA** (only real product questions — expect none). Then tell Apurva it's done and stop.

**Don't:** commit or push (the main thread does), write the decision log or backlog, record approvals, build any journey screen, change a picture, deploy, or touch other projects.

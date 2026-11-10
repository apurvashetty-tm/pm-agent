# Brief — D-104 faster sign-in re-offer + calling-flow page on the preview site (small run)

Folder: the project folder (project branch). Evidence: this folder. **Aim: an hour or two.** Read `docs/runs/RULINGS.md` first, then D-104 in `docs/context/decision_log.md`, `ui-screens/app-logic.md` §2 (offer line, updated) and PRD §5.3.

## 1 · D-104 in the prototype
- The offer comes back at each later **OTP sign-in** while faster sign-in is off, until it's turned on, **at most `fasterOfferMax` times in total** (new setting, default 3, in `app/core/settings.js` with the other settings, visible in the panel's Timings and limits). "Not available on this phone" counts as shown. Remembered per number in the mode's storage, as today (`app/core/faster-signin.js`: replace the `offered` flag with a count; old stored `offered: true` reads as 1).
- Returning unlock, Profile switch, phone with no screen lock: unchanged.
- Smallest tests: 1st sign-in → offer; Not now → 2nd OTP sign-in → offer; 3 Not nows → 4th sign-in → Home, no offer; turned on → never again; not-available counts. Update any existing test that asserted "offered once" (old rule, superseded by D-104 — a test edit, not a dispute).
- Regenerate the hand-off kit (`node scripts/build-handoff.mjs`; app-logic changed, so DECIDED changes) and run `tests/codex/handoff/` and `--check`.

## 2 · Calling-flow page on the preview site
- Publish `calling-flow/` at `/calling-flow/` on `truemeds-doctor-app-preview` (base `app/`): extend the build command in `app/netlify.toml` (as the kit at `/kit/`) so the page and everything it loads (design-system CSS, `ui-screens/feedback/messages.js`, pictures) resolve there — copy what it needs at build; never commit the copies (`.gitignore`). Don't change the page itself unless a path must change; if so, keep it working from the project folder too.
- Check: build locally into a temp copy as Netlify would and open `/calling-flow/` headless — no 404s, no console errors, pictures load.

## Checks
entry-journeys, run-checks, `check-sources.mjs`, `layout_check.py --app`, `check-locked-specs.py`, token check, PRD check (`node docs/prd/check-prd.mjs`, 17/17). One Codex review (correctness vs D-104 and this brief), one fix pass. No deploy.

## End
Short `REPORT.md` here. Append `DONE d104` (or `STOPPED d104: <reason>`) to `docs/runs/STATUS.md`, publish with `bash ../../scripts/publish.sh -m "..." <files>`, stop.

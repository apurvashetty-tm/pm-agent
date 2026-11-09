# Brief — Sign-in follow-ups from D-101 (small run)

Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch). Evidence: this folder.
**Aim: under an hour.** Read `docs/runs/RULINGS.md` first, then D-101 in `docs/context/decision_log.md`, `ui-screens/app-logic.md` §2, `docs/feedback-state-map.md` (sign-in rows).

## Change only these (prototype, `app/` + copy registry)
1. **o04:** an entry over 10 digits that isn't a +91 / 0 prefix shows the field error **"That’s more than 10 digits. Check the number."** (new key in `ui-screens/feedback/messages.json` + metadata, regenerated with `build-messages.mjs`), same error style and place as `signin.short`. Prefix cleaning (+91 / 0) unchanged.
2. **o10:** back from OTP via Change: the number stays and edits normally; remove the "first typed digit replaces it" behaviour.
3. **o11:** Terms and Privacy links on OTP point to the D-101 URLs, read from one config value each (not typed in the screen).
4. **o25:** `signin.signup` + `signin.signupLink` become one entry with a `{link}` placeholder (link text kept as its own key if the renderer needs it); the screen looks identical.
5. Update `app-logic.md` §2 and the sign-in rows of `docs/feedback-state-map.md` for 1, 2 and 4 (main-thread ruling: this run may edit those two files for D-101 only).

Nothing else. Not the kit (`handoff/` is the next run's).

## Checks
Smallest test per change (add to `tests/` as a sign-in journey test). Then: `entry-journeys`, step-1 compare (exact / accepted; the new o04 error state is new — capture it at 360 and 390 into this folder for Apurva's phone walkthrough), `check-sources.mjs`, `layout_check.py --app`, `check-locked-specs.py`, `check_lockup.py`, token check. One Codex review (correctness vs D-101 only), one fix pass.

## End
Short `REPORT.md` here. Append `DONE signin-d101` (or `STOPPED signin-d101: <reason>`) to `docs/runs/STATUS.md`, publish with `bash ../../scripts/publish.sh -m "..." <files>` (must print "Pushed to …"), stop. No deploys.

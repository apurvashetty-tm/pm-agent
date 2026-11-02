# Review brief — prototype build plan + rebuild checklist

Owner: main Claude thread · Reviewers: Claude Code (terminal) and Codex, **separately** · Date: 2026-10-29

## One window: Claude Code runs Codex (do this first, Claude Code)
Codex must review **before** your report exists, so the two stay independent.
1. From this project folder, start Codex in the background, read-only, with its answer saved to its report:
   `codex exec --sandbox read-only --output-last-message docs/reviews/2026-10-29-build-plan-review/codex-report.md "Read docs/reviews/2026-10-29-build-plan-review/BRIEF.md and do exactly what it says. You are the Codex reviewer. Your final message is your report in the brief's format; it is saved for you, so write no files. Do not read claude-report.md."`
   If a flag is rejected, check `codex exec --help` and use the equivalent; if `codex` isn't installed or signed in, stop and tell Apurva.
2. While it runs, do your own review and write `claude-report.md`. Don't open `codex-report.md` until yours is written.
3. When Codex finishes, check `codex-report.md` exists and is in the brief's format (don't edit its content). Then tell Apurva both reports are ready, and stop. The main thread merges them.

Apurva wants an independent technical review before she approves. You review; you do not decide.

## Already settled — don't flag (2026-10-29)
- `app-logic.md` §4 is already fixed by the promotion thread (leave sheet before the first attempted call, no script card before Call). It gets marked approved at the screens freeze. Don't suggest edits to it.
- P4: shorter demo call in the phone demo only; review mode keeps the real 50 s gate.
- P5: Netlify site name `truemeds-doctor-app-preview` (Apurva, 2026-10-29). Check it works technically; don't propose another name.
- P6: the home-screen icon is the official square mark `design-system/logo/truemeds-icon.svg`, used as is (no redrawing or cropping).

## Review these two drafts
- `docs/proposals/2026-10-29-prototype-build-plan.md`
- `docs/reviews/2026-10-29-rebuild-checklist.md`

## Read first (the ground truth)
`CLAUDE.md` (project) · `docs/context/decision_log.md` D-56, D-58, D-69 → D-72 · `docs/context/backlog.md` §2d, §3 · `ui-screens/app-logic.md` · `ui-screens/README.md` · `docs/feedback-rules.md` · `docs/feedback-state-map.md` · `../../design-system/RULES.md` §7–10 · `docs/reviews/2026-10-15-standards-checklist.md` · `docs/renders/2026-10-28-promotion/REPORT.md` · repo `netlify.toml`. Look at the old `index.html` / `app.js` only to see what went wrong; don't review them.

## Questions to answer
1. **Soundness:** Are B1–B10 sound for a prototype that is rebuilt journey by journey, checked against pictures, installable from a Netlify link and handed to a React Native team? Name anything that will break or hurt later (e.g. module loading on Netlify, service worker caching stale builds, design-system copy at deploy, state-ID scheme, polling mock).
2. **Hosting:** Will a second Netlify site from the same repo, deploying the project branch with `app/` published, actually work with the design-system copy step? What exactly has to be set? Any simpler route?
3. **Installable app:** What is missing for "opens full screen from the home screen" on Android Chrome and iPhone Safari (manifest fields, icons and sizes, standalone detection, safe areas, iOS limits)?
4. **Completeness:** Does the build order (§5) cover every state in app-logic and every picture family? Anything missing, in the wrong step, or depending on a later step?
5. **Checklist:** Is every line testable as written, with the right "How"? Lines that are vague, duplicated, missing, or impossible to check automatically?
6. **Conflicts:** Anything in the drafts that contradicts the decision log, app-logic, RULES or project CLAUDE.md?
7. **P1–P8:** for each, agree / disagree / can't judge, one line why. P3, P4, P5, P6 and P8 are product calls for Apurva — give a view only if there is a technical reason.

## Rules
- **Read-only.** Write only your report file. Don't edit the drafts, the decision log, the backlog, open questions or any screen. Don't commit, push or open a PR.
- Stay in scope: the prototype build. No production architecture, no redesign of approved screens, no new product logic. Out-of-scope ideas go in a short "Parked" list.
- Every finding cites the file and section it relies on. Say "unverified" when you couldn't check something.
- Never write decisions or approvals in Apurva's name.

## Report
Claude Code → `docs/reviews/2026-10-29-build-plan-review/claude-report.md`
Codex → `docs/reviews/2026-10-29-build-plan-review/codex-report.md`

Format, short:
1. **Verdict:** ready to approve / approve with changes / not ready — one line.
2. **Blockers** (must change before building) — numbered: finding · source · suggested change.
3. **Should change** — same format.
4. **Nice to have** — one line each.
5. **P1–P8** — table: point · agree/disagree/can't judge · why.
6. **Parked** (out of scope).
Then stop.

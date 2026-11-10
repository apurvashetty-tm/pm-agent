# Brief — Home building blocks: Codex critique + best-practice research (no build, no render)

Folder: the project folder (project branch). Evidence: this folder. **Aim: 30–45 minutes. Read and write reports only — change no app, screen, kit, PRD or design-system file.**

Input: `docs/proposals/2026-11-11-home-building-blocks.md` (Setup and Available screens, wireframes, 3 open questions). Context: `ui-screens/home/home_setup-wheel_w390.png`, `home_active_w390.png` (today), `docs/renders/2026-11-10-home-concepts/v2/` (round 2), `design-system/RULES.md` §8–9, `ui-screens/app-logic.md` §3 (Home), D-36, D-40, D-46 in `docs/context/decision_log.md`, and the case page's View Rx row (`app/screens/case.js` `tools()`, `case.css` `#case-tools`) as the row pattern being reused.

## 1 · Research (you, with web search if you have it; otherwise from known guidelines — say which)
Best practice for: (a) choosing a duration on mobile — chips vs wheel vs stepper, showing a min/max range, both at once (Material 3 time/duration pickers, Apple HIG pickers, comparable "go online for N hours" flows in gig / driver / telehealth provider apps); (b) a status card with a running countdown and a count, an inline action on a row (HIG / Material list items with trailing actions); (c) label wording for a doctor's own output ("prescriptions written / created / generated / issued today"). Keep it to findings that change a decision; cite each source.

## 2 · Codex critique (one read-only review)
Write `codex-prompt.txt` and run `codex exec -s read-only "$(cat codex-prompt.txt)" < /dev/null > codex-review.log 2>&1` here. Ask Codex, as a senior mobile UX/UI reviewer who has NOT seen the earlier debate, to judge the building blocks against the design rules and the research: what is wrong, what is missing (states: offline, near expiry, setting…, failures, 360 × 640 fit, accessibility of the wheel and the chips together), and what it would do better — concrete, with the block it changes. It must also answer the doc's 3 open questions with reasons.

## 3 · Report
`REPORT.md` here, short and plain:
- **Research findings** (each with source and which block it supports or challenges).
- **Codex findings**, each marked: *agree / disagree / needs Apurva*, with one line why. Codex lacks context — don't adopt points that reopen approved decisions unless they fix a real problem; say so.
- **Recommended changes to the building blocks** (a short list), and the three answers with the evidence.
**Next (not this run):** after Apurva agrees the blocks, a separate render run makes several options, self-audits them and gets a Codex critique of the renders. Don't render anything here.

Append `DONE home-blocks-review` (or `STOPPED …`) to `docs/runs/STATUS.md`, publish this folder and STATUS with `bash ../../scripts/publish.sh -m "..." <files>`, stop.

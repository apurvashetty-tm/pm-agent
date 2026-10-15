# Layout v2 — build, render and review loop (instructions for Claude Code)

Owner: Apurva · Written 2026-10-14 · Run from `~/src/pm-agent/projects/truemeds-doctor-portal-prototype`

Give Apurva short plain-language progress updates. She may be reading on her phone.

## Roles (non-negotiable)
- **Claude (you)** is the only one who edits files and the only one who takes screenshots.
- **Codex (ChatGPT)** is a **read-only reviewer**. Always call it in the foreground as
  `codex exec --sandbox read-only "<prompt>"`, with a 10-minute limit per call. Never run it in the background.
  Tell Codex in every prompt: *you are only reviewing; do not render, capture, open a browser or edit files.*
  Check `codex exec --help` once for how to attach images; if possible attach PNGs, otherwise give paths.
- **Reviewers: Claude + Codex.** A state is **reviewed** when Claude's self-audit and Codex's review both report
  **no blockers**. It then waits as **"Reviewed — yet to be approved by Apurva"**. Apurva glances at everything once at
  the end and approves or calls out gaps. Nothing goes into `ui-screens/` before her approval.
- Never `git commit`, `git push` or delete files.

## Read first
`CLAUDE.md`, `docs/reviews/2026-10-14-layout-v2-rules-review-copy.md`, `docs/context/decision_log.md`,
`docs/feedback-rules.md`, `docs/feedback-state-map.md`, `../../design-system/RULES.md`,
`docs/concepts/2026-10-14-layout-v2/` (README + PNGs + concept.html — the agreed visual direction),
`docs/context/session_handoff.md` (latest entries).

---

## Step 0 — Apply the approved rules (once)
1. Apply every **[NEW]** / **[CHANGED]** item in `docs/reviews/2026-10-14-layout-v2-rules-review-copy.md`
   exactly as written, in one pass: decision log (D-42–D-45 + D-38 pointer), design system (RULES.md opening + §8 +
   checklist, new `tokens/truemeds.json`, `src/components.css` placeholder, `scripts/build.py`, `beyond-salt.md`,
   README), `feedback-rules.md` (→ v1.1), `feedback-state-map.md`, `open_questions.md` (OQ-023),
   `ui-screens/README.md`, `CLAUDE.md`.
2. Rebuild the design system: `python3 ../../design-system/scripts/build.py`. Confirm in the generated
   `truemeds.css` and `native/tokens.ts` that `--tm-content-brand` = blue-600, `--tm-content-placeholder` exists,
   `.tm-text-title-lg` = 32/40/600 and `.tm-text-body-lg` = 16/24. Run `python3 ../../design-system/scripts/check_logo.py`.
3. Report to Apurva in 3–5 lines what was applied, then continue. If anything in the review copy can't be applied as
   written, stop and ask — don't improvise.

## Step 1 — Coverage matrix (before any build or capture)
Create `docs/renders/2026-10-14-layout-v2/README.md` from `docs/renders/RENDER-README-TEMPLATE.md`, with a
**coverage matrix**: every screen × every state, from `feedback-state-map.md`, the decision log and the
`ui-screens/*.html` state selectors. For each state record: ID, what triggers it, pattern (F1/F2/W1/N1/S1/T1/L1),
keyboard open/closed, and whether it gets **its own capture** or is **covered by** a named representative
(copy-only siblings). Default: capture every state that has a distinct layout, keyboard state, control state or
message length; copy-only siblings share a representative but stay in the matrix.

Scope — all of these, phase by phase:

| Phase | Screens | Notes |
|---|---|---|
| A | Sign-in (all 12 states), OTP (all 12 states + combinations in the state map: resending, resend failed, offline, cooldown reconciling, expired + resend limited) | Keyboard open and closed where both occur |
| B | **Faster sign-in offer (new, D-45):** shown (fingerprint and Face ID wording), enabling (OS prompt pending), and the exits (cancelled / failed / not now → Home: show the Home they land on); Returning unlock: fingerprint, Face ID, screen lock, pending, unavailable (OTP fallback) | New flow folder `ui-screens/faster-signin-offer/` |
| C | Home: setup, setting, setup failed, active, requesting, no cases, request failed, offline, near expiry, add sheet (wheel), adding, add failed, time added (toast), and every end / expiry / pending state in the state map | Home keeps the home-base header (D-42) |
| D | Case page — **superseded by D-48, D-49, D-50:** concept renders only in `docs/concepts/2026-10-14-case-page/`, no edits to `index.html` until Apurva approves | Do not change consultation logic, CTA routing or the locked flow (CLAUDE.md); CTA labels per D-50 |

Self-check the matrix against the state map and every HTML state selector (nothing missing, nothing duplicated), have
Codex check it once for gaps (read-only), save it, tell Apurva the counts in one line, and **continue** — don't wait.

## Step 2 — Build (per phase)
- Update the source HTML in `ui-screens/<flow>/` (and `index.html` for phase D) to follow D-42–D-45 and RULES.md §8,
  matching the agreed concepts. Shared design-system classes and tokens only — no per-screen hacks, no raw values.
  Every state stays reachable from the screen's state selector and `?capture=<state>` (or `?state=` for Home).
- Copy changes go through `ui-screens/feedback/messages.json` + `node ui-screens/feedback/build-messages.mjs`.
- After any change: `node ui-screens/feedback/check-sources.mjs`; for `index.html`/styles also
  `python3 docs/layout_check.py` (must say ALL PASS).
- React Native files in `ui-screens/native/` are **not** changed in this loop; they follow after Apurva approves the visuals.

## Step 3 — Capture (per phase)
- Headless Playwright from the real HTML (file:// URLs, no server). Install Playwright/Chromium only in a temp folder
  outside the project. Fonts loaded before capture.
- Every planned state at **390×844 @2x**, plus **360 wide** (really 360 — verify the frame width) for every state with
  text that can wrap or controls side by side.
- **No large-text captures in this loop.** Large-text behaviour is defined and tested later in the React Native app.
- Any console error, page error or missing file = failed capture; fix and re-capture.
- Save to `docs/renders/2026-10-14-layout-v2/<phase>/round-N/` with `metrics.json`: errors, horizontal overflow,
  clipped text, text contrast per element (AA), tap-target sizes, primary-button position, keyboard top, notice
  positions, distinct type styles used.
- Build one **contact sheet per flow** (all states side by side, labelled) for quick review on a phone.

## Step 4 — Self-audit, then Codex review (per phase)
1. **Your own audit first** (Apurva's standing rule): duplicates (same info shown twice), thumb reach, layout
   quality, RULES.md §5 checklist, §8 rules, D-42–D-45, feedback-rules v1.1, contrast, tap targets, keyboard fit.
   Fix what fails before Codex sees it.
2. **Codex review in batches of at most 4 states** (390 PNGs + a short text summary of that batch's metrics,
   360-wide findings). Ask for **BLOCKERS** and **SUGGESTIONS**, each with state ID, rule/decision ID
   and a concrete reason. Save each reply to `round-N/codex-review-<batch>.md`.
3. Fix real blockers in shared source. **Never change a decision in the decision log** — if Codex asks for that,
   list it under **Needs Apurva**. Record every rejected Codex point with the reason.
4. Write `round-N/changes.md`: what was flagged, fixed, rejected and why.
5. Next round. **Stop a phase** when Codex reports no blockers, or after **3 rounds**.

## Step 5 — Mark reviewed and continue (per phase)
- A state is **reviewed** when Claude's self-audit and Codex's latest review both report no blockers. Mark it
  **"Reviewed — yet to be approved by Apurva"** in the batch README coverage matrix. Keep all PNGs in
  `docs/renders/2026-10-14-layout-v2/`; **do not touch `ui-screens/` PNGs**.
- **Needs Apurva:** any state still blocked after 3 rounds, and any point that would change a decision-log entry.
- Fill the QA table in the batch README, update `docs/context/session_handoff.md`, then **go straight to the next phase**.

## Step 6 — Final report (once, after phase D)
- Give Apurva one plain-language summary, **screen by screen, one at a time, with what each screen does**: reviewed
  states, anything not reviewed and why, the contact-sheet paths for her one-glance review, and the **Needs Apurva**
  list (each item: the question, the options, Claude's recommendation).
- Then **wait** for her approval or gap call-outs.

## Step 7 — After Apurva approves (only then)
- Fix any gaps she calls out (re-review those states with Codex).
- Promote approved states: replace PNGs in `ui-screens/<flow>/` in place (no "v2" files), create
  `ui-screens/faster-signin-offer/` for the new flow, update `ui-screens/README.md` entries (date, "Approved by Apurva",
  one-line change note, source fingerprint), and record the approval in the decision log.

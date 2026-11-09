# Brief — native hand-off kit, pilot on Sign-in (D-96)

Owner: main Claude thread · Runner: Claude Code (terminal), Codex as critic · 2026-11-09
Folder: `~/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (project branch).
Output folder for evidence: `docs/renders/2026-11-09-handoff-kit/` (this folder).

## Before you start

- **Runs in parallel with the prototype build** (step-1 session 6, fast build runs A / B, the PRD tab) in the same
  folder. That is safe because this job writes only its own new files and Sign-in is already built. Rules:
  commit only your own files, named; on a `.lock` file, wait and retry (never delete it); never touch files
  another tab is changing. If D-94 replaces the Sign-in pictures while you run, just regenerate (section 8).
- **Aim: a few hours, not days.** This is a pilot. Be careful on the **foundation**, because every later journey
  reuses it: the web → native token map, the screen-file structure, the `DECIDED` / `OPEN` format and the AI
  pack. Keep the viewer plain.
- **Definition of done:** the done-checklist in `docs/proposals/2026-11-09-native-handoff-kit.md` §6 (all lines
  except the last, which happens after Apurva's review). Read the whole proposal first; it is the scope.
- Read: `../../design-system/README.md`, `../../design-system/native/README.md`, `../../design-system/RULES.md`
  §2, §8, §9; `ui-screens/README.md`; `ui-screens/sign-in/`; `app/screens/sign-in.*` and the shell it uses;
  `ui-screens/app-logic.md` §2; `docs/feedback-state-map.md` (sign-in rows); `ui-screens/feedback/messages.json`
  + `build-messages.mjs`; `docs/context/decision_log.md` (every entry that touches sign-in, incl. D-42 to D-47,
  D-61, D-65, D-81, D-82, D-84); `docs/context/open_questions.md`.

## Hard rules

- **Read-only:** `app/`, `ui-screens/`, `../../design-system/`. If something there is wrong, list it under
  NEEDS-APURVA; don't fix it here.
- **You may write:** `handoff/` (new), `scripts/build-handoff.*` (new), this evidence folder,
  `tests/codex/handoff/` (Codex only). Nothing else.
- **Generated, not typed:** every token, size, colour, copy string and screen fact in the kit comes from the
  sources by script. Only `README.md`, `AGENTS.md`, `CLAUDE.md`, the skill and `FONTS.md` are written by hand.
- **The kit is for an outside team.** No internal working notes in it: no render rules, git, Netlify, Codex,
  terminal briefs, review history, credentials or people's details. Decisions are cited by number (D-xx) with
  the decision itself, not the debate.
- Plain words for engineers. "case", never "order" for the doctor's unit of work.
- Never write to the decision log or record approvals in Apurva's name; report under NEEDS-APURVA.
- Git: `scripts/publish.sh -m "..." <files>` only; it must print "Pushed to …". Commit after each section
  (checkpoint). No deploys. On this Mac: `CHROME=` / `CHROMIUM=` for browsers, `< /dev/null` on `codex exec`,
  `git -C`, never `cd && git`.

## 0 · Codex writes the checks first (before any build)

Codex tests from the proposal, so the build doesn't grade itself (D-95 way, use Codex fully):
`codex exec --sandbox workspace-write --output-last-message docs/renders/2026-11-09-handoff-kit/codex-tests.md "You are the tester for docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md. From docs/proposals/2026-11-09-native-handoff-kit.md §6, this brief, ../../design-system/native/tokens.ts, ui-screens/native/messages.ts, ui-screens/sign-in/, ui-screens/app-logic.md §2 and docs/feedback-state-map.md only, write (a) tests/codex/handoff/CASES.md: every check the kit must pass, each with its source line; (b) node tests in tests/codex/handoff/*.mjs that check a built handoff/ folder: every native token name exists in tokens.ts; every copy key exists in messages.ts; every element of every one of the 12 Sign-in states is in screens/sign-in.json; every raw (non-token) value in the sign-in CSS is flagged; nothing internal leaked (git, Netlify, Codex, brief, render rules, names other than the sample doctor); AGENTS.md / CLAUDE.md / skill exist and point to the right files; fonts present with sha256; --check fails when a source changes. Don't read or change app/ code. Write only under tests/codex/handoff/." < /dev/null`
Commit as they are. A failing Codex test means fixing the kit, unless the test contradicts the proposal: then
don't edit it; list it in `test-disputes.md` with the source line for the main thread.

## 1 · Kit layout

`handoff/` is built to be opened on its own (or copied to the root of the team's repo):

```
handoff/
  README.md            start here (people): what's in the kit, how to open the viewer, setup steps
  AGENTS.md            for any AI tool: what the app is, where things are, hard rules, how to use the kit
  CLAUDE.md            one line: @AGENTS.md
  .claude/skills/truemeds-native-ui/SKILL.md   how to build a Truemeds screen in RN with this kit
  DECIDED.md           questions already answered: question (engineer's words) → answer → source (D-xx / app-logic §)
  OPEN.md              still open: question → current assumption → who answers (Product / Backend / Ops)
  CHANGES.md           what changed since the last generation (tokens, blocks, screens)
  foundation/          tokens.ts, tokens.json, icons.ts, messages.ts (copied from their generated sources), fonts/
  components/<block>.json   one per building block used on Sign-in
  screens/sign-in.json      every state, every element
  viewer/index.html    the people-facing kit (opens from disk, no server)
```

Put the AI files at `handoff/`'s root, never at the project root (the project `CLAUDE.md` is our internal rules).

## 2 · Token names

- Every token is shown by its **native name** (`tokens.color.content.primary`), with the web name
  (`--tm-content-primary`) beside it. Build the web → native map from `../../design-system/scripts/` (the same
  code that writes `native/tokens.ts`), not by string guessing. Every native name must exist in `tokens.ts`.
- Decide which token an element uses from the **CSS rule that applies** (the `var(--tm-…)` actually referenced),
  never by matching a computed value back to a token: several tokens share a value.
- A value that isn't a token (raw px, hex, rgba) is **flagged**: red in the viewer, `"raw": true` in JSON, with
  file and line. Sign-in's CSS has a few; list each.

## 3 · Building blocks (`components/`)

Every block the 12 Sign-in states use (find them from the markup, e.g. field, button roles, notice variants,
spinner, logo header, sign-up option, action bar / band if present). For each: parts (container, label, icon,
border…) × states (default, pressed, disabled, busy, error, focus — only those that exist) → native token; sizes
and spacing tokens; rules from RULES §9 (targets, one primary, icon size by button size); a suggested RN name
and variant (`<Button variant="primary">`), marked `[RECOMMENDED]`, same name as the web block. A picture of each
state: crop it from `../../design-system/preview.html` or an approved picture; don't build new renders.

## 4 · Screen file (`screens/sign-in.json`)

Per state: id, approved picture paths (360 / 390), the app-logic / feedback-map rule that leads to it. Per
element: id, block + variant, tokens per property, spacing tokens to neighbours, copy key (must exist in
`messages.ts`), behaviour reference, accessibility notes (target size, label). Keep the structure simple and
document it in `AGENTS.md`.

## 5 · Viewer (`viewer/index.html`)

Static page, opens by double-click. Sections: Start here · Foundation · Building blocks · Screens.
Screens: all 12 Sign-in states, **inspectable at 390** in the built `app/` (the 360 approved pictures shown beside
it, not inspectable); **tap any element → panel with block, variant, tokens (native + web), spacing, copy key, behaviour link**; a "tokens used"
table per state and for the screen; raw values in red. It may use `truemeds.css` for its own look (copy it in).
Plain is fine: it must be correct and readable on a phone, not polished.

## 6 · DECIDED.md and OPEN.md

From app-logic §2, the feedback map, the decision log and open questions, limited to Sign-in. Write them as
the questions an RN engineer (or their AI) would ask: validation, limits and lockouts, what is server-side,
keyboard, paste, offline, errors, sign-up redirect, copy, accessibility, fonts, safe areas. Each `[MOCK
ASSUMPTION]` in the sign-in build goes to OPEN with the assumption. Don't invent answers; anything you can't
source goes to OPEN and NEEDS-APURVA.

## 7 · Fonts

Plus Jakarta Sans **static TTF**, weights 400 / 500 / 600 / 700, from the official Google Fonts repo
(github.com/google/fonts, OFL). Include `OFL.txt`, source URL and sha256 per file in `FONTS.md`, plus setup
for iOS and Android (family name and weight mapping) in plain steps.

## 8 · One command + stale check

`node scripts/build-handoff.mjs` (or `.py`) regenerates everything generated and `CHANGES.md`;
`--check` exits non-zero if `handoff/` is out of date with its sources. Run both.

## 9 · Fresh-AI test (the main proof)

Copy only `handoff/` to a temp folder outside the repo. In that folder, run a fresh session with no other
context, once with Claude Code (`claude -p`) and once with Codex (`codex exec --sandbox read-only … < /dev/null`):

> "We're building the Truemeds doctor app in React Native. Build the Sign-in screen with all its states. First
> list every question you need answered before you can build it; then write the code."

Save both transcripts in `fresh-ai/round-<n>/`. Score:
- every question it asks: **answered in DECIDED** (kit failure — make the answer easier to find), **in OPEN**
  (fine), or **genuinely new** (add to OPEN and NEEDS-APURVA; don't invent an answer);
- its code: no hex, no raw sizes, no typed user-facing text; all from `tokens.*` / `messages.*`.

Fix the kit and repeat, up to 2 more rounds. Pass = zero DECIDED questions asked and clean code in the last
round, for both tools. Keep every round's transcript. This is the main proof: don't shorten it.

## 10 · Codex critique

`codex exec --sandbox read-only --output-last-message docs/renders/2026-11-09-handoff-kit/codex-critique.md
"Read docs/renders/2026-11-09-handoff-kit/TERMINAL-BRIEF.md and docs/proposals/2026-11-09-native-handoff-kit.md.
You are the critic. Review handoff/ and scripts/build-handoff.* against proposal §6 and this brief. Check token
names against design-system/native/tokens.ts, copy keys against messages.ts, and that nothing internal leaked
into handoff/. Report blockers, should-fix, nice-to-have with file and line. Read-only; write no files." < /dev/null`
Also ask it to list `CASES.md` checks with no passing test. Fix valid blockers and should-fix (note any not
adopted, and why, in `codex-response.md`); re-run once if it raised blockers (`codex-critique-2.md`). If Codex hits
its usage limit, say so in REPORT.md and carry on.

## 11 · Report and stop

1. One `sheet.png` in this folder: viewer start page, one block spec, the inspector with an element tapped,
   the tokens-used table, a raw-value flag (phone width).
2. `REPORT.md`: proposal §6 line by line, pass / fail with evidence; fresh-AI scores per round; files written;
   NEEDS-APURVA (new questions, anything wrong in the read-only folders) — short, pointed.
3. Don't write `docs/context/` (other tabs work there); put the lines for the main thread in REPORT.md.
   Publish everything with `scripts/publish.sh`; stop.

**Then the main thread reviews before Apurva sees it:** Codex's tests, disputes, critique and response, and the
fresh-AI transcripts. It judges each Codex finding (adopt only valid ones), and brings Apurva only the kit and
pointed questions.

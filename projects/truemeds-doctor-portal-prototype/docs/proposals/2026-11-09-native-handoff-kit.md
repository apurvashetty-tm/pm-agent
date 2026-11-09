# Native hand-off kit — pilot on the Sign-in screen

**Status:** approved by Apurva 2026-11-09 (D-96; amended same day: fast-build way, see brief) · **Date:** 2026-11-09 · **Backlog:** §2e step 5 (token inspector), now widened to a hand-off kit

## 1. Why

The React Native team is new and the app is new. They asked which tokens each screen uses. Past projects show
two failure modes this kit must avoid:

- **Guessing.** A token list (like the SALT file we received) says *what* exists, not *where* to use it.
- **Generic AI questions.** Handed only a PRD, the engineers' Claude asks broad questions that were already
  answered, because it can't tell what is decided from what is open.

We are also not on the same Claude account, so nothing can rely on shared artifacts or projects. Everything has
to travel as **files in the repo** the team receives.

## 2. What we give them

One folder, `handoff/`, in the doctor-app repo copy. Two audiences, same facts:

**For people — the kit (a page they open in the browser)**
1. **Parts box:** `tokens.ts`, `icons.ts`, `messages.ts` (all already generated) + Plus Jakarta Sans font files
   in the format phone apps need (TTF, 4 weights) + a one-page setup note.
2. **Building blocks:** each component the screen uses (field, button, notice, logo header, spinner, sign-up
   option) — picture, parts, states (normal, pressed, disabled, busy, error), the native token for each, sizes,
   and its rules from `design-system/RULES.md` §9. Same names on web and native.
3. **Screen viewer:** all 12 Sign-in states at 360 and 390; tap anything → which block, which tokens, which
   spacing. A "tokens used" table per screen. Any value that isn't a token shows in red.
4. **Behaviour:** each state links to its rule in `app-logic.md` and its message in the feedback map.
5. **What changed:** a list of tokens, blocks and screens that moved since the last drop.

**For their AI — the AI pack (files their Claude, Codex or Cursor read on their own)**
1. **`AGENTS.md` + `CLAUDE.md`** at the root of `handoff/` (the folder the team opens or copies to their repo root — not the project root, whose `CLAUDE.md` holds our internal working rules): what the app is, where things are, the hard rules (tokens
   only, copy only from `messages.ts`, "case" not "order", one primary button). `CLAUDE.md` simply points to
   `AGENTS.md`, so every AI tool reads the same text.
2. **A skill**, `.claude/skills/truemeds-native-ui/`: "how to build a Truemeds screen in React Native" — step by
   step, using the files below. Skills committed in the repo load for anyone who opens it, whatever account
   they use.
3. **One data file per screen** (`handoff/screens/sign-in.json`): every element → block → tokens → copy key →
   behaviour rule. Facts, not prose, so the AI copies instead of guessing.
4. **`DECIDED.md` and `OPEN.md`** — the key piece. Every question already answered (with the decision number),
   and the short list that is truly open, with who answers it. The AI is told: check `DECIDED.md` before asking;
   ask only what is in `OPEN.md` or genuinely missing.

Everything above is **generated** from files we already maintain (design system, prototype, messages, decision
log), except the skill and `AGENTS.md` text, which are written once. Nothing is copied by hand, so nothing goes
stale — the October hand-written RN screens went stale within three weeks.

## 3. How we prove it works (before showing FE)

1. **Fresh-AI test:** a new AI session that has only the `handoff/` folder and the prompt "Build the Sign-in
   screen in React Native" — no other context. We record every question it asks.
   - Pass: zero questions already answered in `DECIDED.md`; any question it asks is in `OPEN.md`.
   - Its code uses only `tokens.*` and `messages.*` — no typed colours, sizes or words.
2. **Person test:** Apurva shows the kit to one FE engineer (30 min) and asks what is still unclear. Their doubts
   become fixes to the kit, not one-off answers.

## 4. Not in this pilot

Other screens (added journey by journey once the rebuild finishes them) · writing the team's RN components or
screens (they own the code; we own the contract) · Figma · hosting on Netlify (the kit opens locally from the
repo; deploy only if Apurva asks) · any change to `app/`, `ui-screens/` or `design-system/`.

## 5. Decisions for Apurva

1. **Ownership:** the app team builds and owns the RN components and screens; we hand over the kit. *Recommended: yes.*
2. **Old RN files:** the October TSX and hand-off notes in `ui-screens/native/` are marked "don't use — see
   `handoff/`" once the kit is approved (logged in the backlog, done separately). *Recommended: yes.*
3. **Pilot screen:** Sign-in (12 states, already rebuilt). *Recommended: yes.*

## 6. Done-checklist (pass/fail)

- [ ] Every token shown uses its native name and matches `design-system/native/tokens.ts`.
- [ ] Every block on Sign-in has a spec: parts × states → token, size, rules.
- [ ] All 12 states inspectable at 390 (360 shown as the approved pictures); a "tokens used" table exists.
- [ ] Zero raw values unflagged.
- [ ] Font files (TTF, 4 weights) and setup note included.
- [ ] `sign-in.json` covers every element in every state; each copy key exists in `messages.ts`.
- [ ] `DECIDED.md` and `OPEN.md` cover every rule in `app-logic.md` that touches Sign-in, with decision numbers.
- [ ] Fresh-AI test passes (§3.1).
- [ ] One command regenerates the kit and the "what changed" list; a check fails if the kit is out of date.
- [ ] Nothing in `app/`, `ui-screens/` or `design-system/` changed.
- [ ] FE engineer walkthrough done; their doubts logged as fixes (§3.2) — after Apurva's review.

## 7. How it gets built (after approval)

A terminal brief (`TERMINAL-BRIEF-handoff-kit.md`) runs the build with a Codex critique; Claude does the final
review against §6; Apurva then reviews the kit and shows it to FE.

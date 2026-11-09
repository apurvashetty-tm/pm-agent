# Fresh-AI test — scores

Prompt (`prompt.txt`, verbatim from brief §9): "We're building the Truemeds doctor app in React Native. Build the Sign-in screen with all its states. First list every question you need answered before you can build it; then write the code."

Setup: a copy of `handoff/` only, in a temp folder outside the repo, per tool per round.
- Claude: `claude -p … --setting-sources project --strict-mcp-config --mcp-config '{"mcpServers":{}}' --permission-mode acceptEdits --allowedTools Read Write Edit Glob Grep --no-session-persistence` (no user settings, plugins, hooks or MCP; reads the kit's `CLAUDE.md` → `AGENTS.md` and the kit skill). Wrote code into its folder (`claude-code/`).
- Codex: `codex exec --sandbox read-only --skip-git-repo-check --ephemeral -C <copy> … < /dev/null`. Read-only, so its code is in its final message (`codex-final.md`).

Per round: `claude-transcript.jsonl` (full stream), `claude-final-and-notes.md` (its text), `claude-code/`, `codex-transcript.txt`, `codex-final.md`.

Scoring: each question it asks → **DECIDED** (already answered in `DECIDED.md`: kit failure), **OPEN** (fine), **new** (added to OPEN + NEEDS-APURVA). Code → hex / rgb, numbers in styles outside tokens or the one constants file, typed user-facing text.

## Round 1

| Tool | Questions asked | DECIDED | OPEN | New | Code |
|---|---|---|---|---|---|
| Claude | 7 new + 9 OPEN listed | **1** — "field error and notice at the same time?" (d06 answer was a cryptic code comment) | 9 (o01–o03, o04–o08, o10, o11, o13) | 6: logo SVG embeds an image (RN may not draw it) · Send OTP API contract · request timeout · Sign up in system vs in-app browser · re-typed old number · native limits (balanced wrap, 31ch, focus ring) | Conditional (see verdict): no hex/rgb; sizes only in `constants.ts`; strings from `messages` except `+91` and the logo name (the two strings the kit lists as having no key) |
| Codex | 6 OPEN groups | **0** | all | 0 | Conditional, same two literals in `layout.ts` |

Kit fixes after round 1: d06 rewritten (what changing the number does); new d27 (error vs notice: one spot); o14–o19 added for the six new questions.

## Round 2

| Tool | Questions asked | DECIDED | OPEN | New | Code |
|---|---|---|---|---|---|
| Claude | 5 new + 14 OPEN listed | **2** (answer existed in the sources but not plainly in the kit): "waits ≥ 1 hour: 75:00 or hours?" (m:ss everywhere, D-46) · "drop a leading 91 from a real 10-digit 91… number?" (build drops 91 only above 10 digits) | 14 | 3: notice gap rule 8 vs 16 measured · placeholder colour (kit gap: `::placeholder` rule not captured) · Sign up tap target (inline vs standalone) | Conditional (see verdict): no hex/rgb; raw sizes and the two literals only in `ui/layout.ts`; logo artwork size there too |
| Codex | OPEN groups only | **0** | all | 0 | Conditional, same two literals in `layout.ts` |

Kit fixes after round 2: d01 shows the 91 rule from the build; d08 shows the m:ss formatter (75:00, rounded up); d28 placeholder colour; the builder now captures `::placeholder` rules (field-input carries `tokens.color.content.placeholder`); o20 (notice gap 8 vs 16) and o21 (sign-up target) added.

## Round 3 (last round of the first brief)

| Tool | Questions asked | DECIDED | OPEN | New | Code |
|---|---|---|---|---|---|
| Claude | 3 new + all OPEN items listed; states it did not re-ask DECIDED topics | **0** | o01–o08, o10–o21 | 3: dynamic type (text size setting) · dark mode · Expo vs CLI and navigation library | No hex / rgb (one hit is a comment). Copy only from `messages`. Sizes without a token and the two literals (`+91`, logo name) in `layout.ts` only |
| Codex | OPEN items only, grouped by owner | **0** | all | 0 | Same: no hex / rgb; only `layout.ts` holds the token-less sizes and the two literals |

Kit fixes after round 3 (not re-tested; the brief allows three rounds): o22 (dynamic type / dark mode, quoting design rules §9.9) and o23 (project set-up: app team) added to OPEN.

## Verdict

- **Questions: PASS for both tools in the last round** — zero questions already answered in DECIDED.md; every question asked is in OPEN.md or genuinely new (now added to OPEN).
- **Code: CONDITIONAL.** Neither tool typed a colour or a user-facing sentence. Both put the values that have **no token or message key in the sources** — border width 1, focus ring 2, logo width 166 (and its 220×54 artwork ratio), icon 20, spinner 16, the `+91` prefix and the logo's accessible name — in one constants file, as `AGENTS.md` tells them to. By the strict brief wording (tokens / messages only) that is not clean, and the kit can't make it clean without new tokens in `design-system/` and new keys in `messages.json` (both read-only for this job). See NEEDS-APURVA in `REPORT.md`.

## Round 4 (fix brief, D-98) — strict code rule: no hex, no typed sizes, no typed words, no constants file

| Tool | DECIDED | OPEN | New | Code (strict) |
|---|---|---|---|---|
| Claude | **0** | o01–o05, o07, o08, o10, o11, o15–o19, o21–o23 | 3: spinner turn speed / reduce motion (no motion token) · "New to Truemeds?" + "Sign up" as two keys (space typed in code) · Call Doctor Ops on a device that can't call | **FAIL** on 2 values: `aspectRatio: 220 / 54` (logo) — **the kit's AGENTS.md told it to type this**; `SPINNER_TURN_MS = 800` — no motion token exists. Otherwise clean: no hex / rgb, every word from `messages` (incl. `signin.phonePrefix`, `signin.logoAlt`), every size from `tokens` (incl. the new D-98 tokens), no constants file. |
| Codex | **0** | all, grouped by owner | 0 | **FAIL** on the same logo ratio (`aspectRatio: 220 / 54`, kit-instructed) and a typed spinner step (30° every 67 ms). Otherwise clean. |

Kit fixes after round 4 (not re-tested: the fix brief runs one round): AGENTS.md now says take the logo's height from the PNG itself (`Image.resolveAssetSource`), never type the artwork's numbers; the spinner animation is marked `timing: true` ("no motion token yet, don't type it", OPEN o24) instead of a layout value; o24–o26 added for the three new questions.

**Verdict round 4:** questions PASS (both 0 DECIDED). Strict code FAIL — one cause was the kit (fixed), one is a missing motion token (needs a decision; see REPORT-2).

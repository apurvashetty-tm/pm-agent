# Truemeds doctor app — React Native hand-off kit

This folder is everything the app team needs to build the doctor app's screens in React Native from the same design tokens, copy and product rules as the approved design. **Pilot: the Sign-in screen** (12 states). More screens are added journey by journey.

## Start here

1. **Open the viewer:** double-click `viewer/index.html` (any browser, no server, works offline). Four sections:
   - **Start here** — what's in the kit and every token Sign-in uses.
   - **Foundation** — every token with its native name (`tokens.color.content.primary`) beside its web name (`--tm-content-primary`).
   - **Building blocks** — button, field, notice, spinner, logo header, sign-up option, entry layout: parts × states → token, sizes, rules, pictures.
   - **Screens** — all 12 Sign-in states. Tap any element on the 390-wide picture: block, variant, tokens (native and web), spacing, copy key, behaviour, accessibility. The approved 360 and 390 pictures sit beside it. A "tokens used" table for each state. **Red = not a token.**
2. **Read `DECIDED.md`** (questions already answered) and **`OPEN.md`** (still open, with who answers).
3. **Set up fonts:** `foundation/fonts/FONTS.md`.
4. **If you use an AI coding tool** (Claude, Cursor or another): it reads `AGENTS.md` (and `CLAUDE.md`, which points to it) and the skill in `.claude/skills/truemeds-native-ui/`. Copy this folder to the root of your repo, or open it as a folder, so the tool finds them.

## What's in the folder

| Path | For |
|---|---|
| `foundation/` | `tokens.ts`, `tokens.json`, `token-map.json`, `icons.ts`, `messages.ts`, `fonts/`, `logo/` |
| `components/` | One spec per building block (`*.json`) and cropped pictures |
| `screens/` | `sign-in.json` (every element of every state) and the approved pictures |
| `DECIDED.md`, `OPEN.md` | Product answers, and what is still open |
| `CHANGES.md` | What changed since the last version |
| `viewer/` | The browser viewer |
| `AGENTS.md`, `CLAUDE.md`, `.claude/` | Instructions for AI tools |

## Rules in one line each

Tokens only (no hex, no raw sizes) · words only from `messages` · "case", never "order" · one primary button per screen · the server enforces limits, the app shows them · check `DECIDED.md` before asking.

## Who owns what

You own the React Native components and screens. The kit is the contract: if something in it is wrong or missing, tell us and we fix the kit (not a one-off answer), so the next screen gets it too. Everything except this README, `AGENTS.md`, `CLAUDE.md`, the skill and `FONTS.md` is generated from the design system and the product rules: don't edit it by hand; ask for a new version.

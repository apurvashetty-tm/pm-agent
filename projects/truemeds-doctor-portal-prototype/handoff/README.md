# Truemeds doctor app — React Native hand-off kit

This folder is everything the app team needs to build the doctor app's screens in React Native from the same design tokens, copy and product rules as the approved design: Sign-in, OTP, Faster sign-in offer, Returning unlock, Home (with Profile), the Case page, Prescribe and calling — 149 approved states.

## Start here

1. **Open the viewer:** double-click `viewer/index.html` (any browser, no server, works offline). Start with **Screens**, tap anything, check **DECIDED** before asking.
   - **Start here** — how to use it, what's in the kit, and the downloads (the whole kit as a .zip, or single files).
   - **Foundation** — every design value with its native name (`tokens.color.content.primary`) beside its web name; tick "Only values used on …" to see one screen's values.
   - **Building blocks** — each reusable part with every version of it, its rules, and **Where it's used** (each state opens on Screens with that part selected).
   - **Screens** — a tab per screen. The phone on the left (390 wide; the smallest supported phone is 360 wide): tap any part. On the right: **When this shows** (what causes the state, what happens next, and the answered questions), then the tapped part's block, design values, spacing, text and screen-reader label.
2. **Read `DECIDED.md`** (answers, by screen) and **`OPEN.md`** (the few questions still open, with who answers).
3. **Set up fonts:** `foundation/fonts/FONTS.md`.
4. **If you use an AI coding tool** (Claude, Cursor or another): it reads `AGENTS.md` (and `CLAUDE.md`, which points to it) and the skill in `.claude/skills/truemeds-native-ui/`. Copy this folder to the root of your repo, or open it as a folder, so the tool finds them.

## What's in the folder

| Path | For |
|---|---|
| `foundation/` | `tokens.ts`, `tokens.json`, `token-map.json`, `icons.ts`, `messages.ts`, `fonts/`, `logo/`, `brand/` |
| `components/` | One spec per building block (`*.json`) and cropped pictures |
| `screens/` | One file per screen (every element of every state) and the approved pictures |
| `DECIDED.md`, `OPEN.md` | Product answers, and what is still open |
| `CHANGES.md` | What changed since the last version |
| `viewer/` | The browser viewer and the downloads |
| `AGENTS.md`, `CLAUDE.md`, `.claude/` | Instructions for AI tools |

## Rules in one line each

Tokens only (no hex, no raw sizes) · words only from `messages` · "case", never "order" · one primary button per screen state · the server enforces limits and decides case type, the app shows them · `[MOCK]` answers are the prototype's own: build them configurable · check `DECIDED.md` before asking.

## Who owns what

You own the React Native components and screens. The kit is the contract: if something in it is wrong or missing, tell us and we fix the kit (not a one-off answer), so every screen gets it. Everything except this README, `AGENTS.md`, `CLAUDE.md`, the skill and `FONTS.md` is generated from the design system, the built prototype and the product rules: don't edit it by hand; ask for a new version.

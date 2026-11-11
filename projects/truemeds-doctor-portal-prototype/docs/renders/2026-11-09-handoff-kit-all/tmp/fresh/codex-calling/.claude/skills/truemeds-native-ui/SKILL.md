---
name: truemeds-native-ui
description: Build a Truemeds doctor-app screen or component in React Native from the hand-off kit (tokens, messages, block specs, screen JSON, DECIDED / OPEN). Use for any UI work in this app, including the Sign-in screen.
---

# Build a Truemeds screen in React Native

All paths are relative to the kit folder (the folder that holds `AGENTS.md`). Read `AGENTS.md` first.

## 1. Before you ask anything

1. Read `DECIDED.md`. If your question is there, use the answer; don't ask it.
2. Read `OPEN.md`. If it is there, build the **current assumption**, isolate it (one constant or one function), and list the question for its owner.
3. Only a question that is in neither file is new. Ask it, and say it is new.

Typical questions already answered in `DECIDED.md`: input cleaning and paste, validation order and timing, when errors clear, every server answer and its notice, the busy button, too-many-attempts countdown format, limits and what the server enforces, locked numbers, inactive accounts, sign-up link, keyboard type and behaviour, offline, copy source, "case" wording, logo size and spacing, type sizes, accessibility, fonts, tokens, buttons.

## 2. Set up once

- Fonts: follow `foundation/fonts/FONTS.md` (iOS and Android steps; family name `tokens.font.family`).
- Import `tokens` from `foundation/tokens.ts`, `messages` / `message` from `foundation/messages.ts`, `icons` from `foundation/icons.ts` (render with `SvgXml` from `react-native-svg`, `color` prop = a `tokens.color.*` value).
- Logo: the PNG exports in `foundation/brand/` (@1x / @2x / @3x), `tokens.logoLockup.width` wide, label `messages['signin.logoAlt']` (see `AGENTS.md` → "Logo on the phone").
- No constants file: every size has a token and every word a key (see `AGENTS.md` → "Every value has a token or a key").

## 3. Build the blocks

For each file in `components/` used by the screen (`button.json`, `field.json`, `notice.json`, `spinner.json`, `logo-header.json`, `sign-up-option.json`, `entry-layout.json`):

1. Look at `pictures` (cropped from the approved screens).
2. For each `parts.<part>.states.<state>.styles[]`: use `tokens[*].ts` (TypeScript form, e.g. `tokens.space['2xl']`) for the property. `inherited: true` → put it on the `Text`.
3. `pressed` and `focus` states list only what changes from `default`.
4. Follow every line in `rules` (one primary button, 48 tap targets, busy label ends with "…", notice text 14/20, and so on).
5. Name the component as in `rn` (`[RECOMMENDED]`), and expose the states as props (`busy`, `disabled`, `error`, `tone`).

## 4. Build the screen

Open `screens/sign-in.json`:

1. One React Native screen; its states come from data and server answers, not from 12 separate screens. `states[].rule` says when each state happens; `states[].rule.decided` points to the answers.
2. For each element: block + variant + `blockState` → the component and its props; `copyKey` / `copyKeys` → `messages[...]` or `message(key, values)` (e.g. `signin.submitWait` with `{ time }`); `spacing.above.setBy[].tokens` → the margin or gap that places it; `icon.iconTs` → the icon.
3. Accessibility: use `accessibility` (role, label from the copy key, `aria-*` → `accessibilityState` / `accessibilityLiveRegion`; notices with role `alert` announce; the field error announces). Tap targets 48.
4. Keyboard: the system number keyboard (`keyboardType="phone-pad"`, `textContentType="telephoneNumber"`, `autoComplete="tel-national"` where supported). The `keyboard` element is the phone's own; don't draw it.
5. Compare each state with `screens/pictures/sign-in_<state>_w390.png` and `_w360.png`.

## 5. Check before you finish

- No `#`, `rgb(`, `rgba(` in your code. No number in a style that isn't `tokens.*` (layout values like `flex: 1` are fine).
- No quoted user-facing text, including `+91` and the logo's label: every string is `messages['…']` / `message('…', …)`.
- "case", never "order", in anything the doctor reads.
- One primary button on the screen.
- Every assumption you took from `OPEN.md` is in one place and named after its `OPEN.md` id (e.g. `// OPEN o06`).

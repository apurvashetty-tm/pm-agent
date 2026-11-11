# AGENTS.md — Truemeds doctor app, React Native hand-off kit

Read this whole file before writing code or asking questions. Every AI tool reads the same text (`CLAUDE.md` only points here).

## What the app is

The Truemeds doctor app is a phone app for doctors who review patients' medicine requests, call the patient and confirm a prescription. The doctor's unit of work is a **case** — always say "case", never "order" (the customer's order — "Order details", the order ID — is the only place "Order" appears). This kit covers every approved screen: **Sign-in**, **OTP**, **Faster sign-in offer**, **Returning unlock**, **Home** (with Profile and Log out), the **Case page** (incl. leaving / releasing a case, the prescription viewer and the closed card), **Prescribe / Disable**, and **calling** (Cat4, HA skipped, and the launch Pilot flow; the calling states are in the case page file).

The web prototype behind this kit runs on a fake backend. Where the backend's real answer isn't known yet, the kit gives the prototype's own value, marked `[MOCK]`: build it, keep it configurable, and don't treat it as a production promise.

You build the React Native components and screens. This kit is the contract: tokens, copy, building blocks, every state of every screen, and the product answers.

## Where things are

| Path | What it is |
|---|---|
| [`foundation/tokens.ts`](foundation/tokens.ts) | Every design token as plain values (`tokens.color.*`, `tokens.space.*`, `tokens.radius.*`, `tokens.font.*`, `tokens.text.*`, `tokens.shadow.*`). `tokens.json` is the same data. |
| [`foundation/token-map.json`](foundation/token-map.json) | Web name → native name for every token (`--tm-content-primary` → `tokens.color.content.primary`). |
| [`foundation/messages.ts`](foundation/messages.ts) | Every word the app shows, by key (`messages['signin.welcome']`), with `message(key, values)` for `{placeholders}`. |
| [`foundation/icons.ts`](foundation/icons.ts) | Every icon as an SVG string; render with `react-native-svg` `SvgXml`, stroke colour from the `color` prop. |
| [`foundation/fonts/`](foundation/fonts/FONTS.md) | Plus Jakarta Sans, 4 static TTF weights, licence and iOS / Android setup. |
| [`foundation/brand/`](foundation/brand/logo.json) | The "truemeds for doctors" lockup as PNG @1x / @2x / @3x for the phone (`logo.json`: source and sha256). `foundation/logo/` holds the source SVG. Never redraw or recolour. |
| [`components/`](components/button.json) | One JSON spec per building block: parts × states → tokens, sizes, rules, and `usedIn` (every state that uses it). |
| [`screens/`](screens/sign-in.json) | One file per screen: `sign-in.json`, `otp.json`, `faster-signin-offer.json`, `returning-unlock.json`, `home.json`, `case.json` (case page and calling), `prescribe.json`. Every element of every state. Facts, not prose: copy these. |
| [`screens/pictures/`](screens/pictures/sign-in_default_w390.png) | The approved pictures of each state at 360 and 390 wide. 360 is the smallest supported phone. |
| [`DECIDED.md`](DECIDED.md) | Questions already answered, by screen, each with its source and decision number (D-xx). |
| [`OPEN.md`](OPEN.md) | The few Product questions still open, the current assumption, and who answers. |
| [`CHANGES.md`](CHANGES.md) | What changed since the last version of the kit. |
| [`viewer/index.html`](viewer/index.html) | The same facts for people: open it in a browser (no server). |
| [`.claude/skills/truemeds-native-ui/SKILL.md`](.claude/skills/truemeds-native-ui/SKILL.md) | Step by step: how to build a Truemeds screen with this kit. |

## Hard rules

1. **Tokens only.** Every colour, space, radius, font size, line height, weight and shadow comes from `tokens` (imported from `foundation/tokens.ts`). No hex, no `rgb()`, no number that duplicates a token. Use semantic tokens (`tokens.color.*`), never `tokens.palette.*`.
2. **Copy only from `messages`.** Every user-facing string comes from `foundation/messages.ts` by key. Never type a label, error or button text. Placeholders use `message(key, { time })`.
3. **"Case", never "order"** for the doctor's unit of work.
4. **One primary button per screen state.** The pinned action bar holds the main action on Home, the case page, Prescribe, the offer and unlock; Sign-in and OTP keep it under the field.
5. **Same names as web.** Blocks are called what the web calls them (`Button`, `Field`, `Notice`, `Sheet`, …). The names are suggestions; you own the components.
6. **Server-side limits and decisions.** The app shows limits (attempts, waits, locks) and the server enforces them. Case type (Cat4 / Pilot), value vs non-value medicines, HA required and HA-skip eligibility are backend fields: never work them out in the app.
7. **Don't guess product behaviour.** Check `DECIDED.md` first. If the answer is in `OPEN.md`, build the current assumption and keep it easy to change. Ask only questions that are in `OPEN.md` or in neither file.

## Every value has a token or a key

Every size, colour and word comes from `tokens` or `messages`, including border widths (`tokens.borderWidth.default`), the focus ring (`tokens.focusRing.width` / `.offset`), icon and spinner sizes (`tokens.iconSize.*`, `tokens.spinner.size` / `.ring`), the logo width (`tokens.logoLockup.width`), the `+91` prefix (`messages['signin.phonePrefix']`) and the logo's accessible name (`messages['signin.logoAlt']`). **Never create a constants file of numbers or strings.** If you need a value that has neither, it's a question, not a constant.

- Layout values (`flex`, `center`, `nowrap`, `100%`, `0`) aren't tokens and don't need to be: they are shown plainly (`layout: true`).
- Text styles: a `.tm-text-*` class on the web is a `tokens.text.*` style; its numbers are listed as exceptions that name the token (use the token).
- Documented exceptions (`exception` on a style, listed in each screen file's `rawValues.exceptions`): a few typed values the design system accepts on purpose (thin lines, ≤3px optical nudges), the subtitle's `31ch` text measure, and the mock prescription paper (sample content standing in for the customer's prescription image — the app shows the image, it doesn't draw it).
- One value has no token yet: the busy spinner's turn speed (`timing: true`). Don't type it.
- `rawValues.builtApp` in each screen file lists anything typed that is not a token (red in the viewer). It is empty today.
- Numbers shown as text (doses, counts, the wheel) are values, not copy (`copy[].data`).

## Logo on the phone

Use the PNG exports in `foundation/brand/` (`truemeds-for-doctors.png` in three densities, suffixes `@1x` / `@2x` / `@3x`; React Native picks the right one): width `tokens.logoLockup.width`, height from the image's own shape (`const src = Image.resolveAssetSource(require('./truemeds-for-doctors.png'))`, then `aspectRatio: src.width / src.height`), `accessibilityLabel={messages['signin.logoAlt']}`. Don't type the artwork's numbers. Never redraw or recolour the logo. Which screens show it: the `logo` element in each screen file (see also `DECIDED.md`).

## Screen files — `screens/<screen>.json`

```
{
  screen, name, widthMeasured: 390,
  states: [ {
    id, name,                                      // id = the approved picture's id (e.g. "otp_locked", "t02-calling")
    when: { shows, next },                         // plain words: what causes this state · what happens next
    pictures: { w360, w390, built390 }, built390,  // approved pictures; built390 = the measured screen
    built?: false, later?,                         // three version-A calling states are not in the launch build (picture only)
    rule: { feedbackMap, pattern, appLogic, decided: ["otp-03", …] },   // why it exists; decided = DECIDED.md ids
    elements: [ {
      id,                                          // the web build's part name (BEM class), stable across states
      block, part, variant, blockState,            // which building block (components/<block>.json), part and state
      rn,                                          // suggested component name
      box: { x, y, w, h }, boxFull?,               // inside the 390 × 844 screen, points (boxFull: its full size past the fold)
      tokens: { "<css property>": ["tokens.…"] }, // the token each property uses (native names)
      styles: [ { property, value, tokens: [ { native, ts, web, value } ], from: { selector, file, line },
                  inherited?, raw?, kind?, layout?, exception?, timing? } ],
      spacing: { above: { neighbour, px, setBy: [ … ] }, inside: [ … ] },
      copy: [ { slot, copyKey | literal | data, values? } ], copyKey?, copyKeys?,
      icon?: { name, size, iconTs },
      behaviour: { decided: ["DECIDED.md#…"], state },
      accessibility: { role, name, size, target?, aria-*, … }
    } ],
    tokensUsed: [ "tokens.…" ]
  } ],
  tokensUsed: [ { native, ts, web, value, states, elements } ],   // whole screen
  rawValues: { builtApp: [ … ], exceptions: [ … ] }
}
```

Notes:
- CSS words map to React Native styles in the usual way: `padding` → `padding*`, `gap` → `gap` / `rowGap`, `border-*` → `border*Width` / `border*Color`, `font-size` / `line-height` / `font-weight` → `fontSize` / `lineHeight` / `fontWeight`, `box-shadow` → the `tokens.shadow.*` object (`ios` / `android`). Units are points.
- `inherited: true` means the value comes from a parent (text colour, font). In React Native, set it on the `Text` itself.
- `copy[].data` is sample data (names, medicines, times — from the backend in the real app), not copy.
- The `keyboard` / `system-keyboard` element is the phone's own keyboard. Don't draw one.
- `sign-in.json` also keeps `copyKeys` (every Sign-in text key) and `rawValues.approvedReference` (an audit of the approved reference file; not for building).
- Block specs (`components/<block>.json`) hold the same tokens per part × state (`states` lists them), `pressed` / `focus` for the Sign-in button and link, the rules, `usedIn`, and cropped pictures where there are some.

## How to use the kit

1. Search `DECIDED.md` for your screen's section before asking anything; read `OPEN.md` (short).
2. Follow the skill: `.claude/skills/truemeds-native-ui/SKILL.md`.
3. Build blocks first (`components/*.json`), then a screen (`screens/<screen>.json`), state by state; compare against `screens/pictures/`.
4. Before you finish: search your code for `#`, `rgb`, numbers in styles and quoted user-facing strings. Each must be a `tokens.*` / `messages[...]` reference (or a layout value such as `flex: 1`).

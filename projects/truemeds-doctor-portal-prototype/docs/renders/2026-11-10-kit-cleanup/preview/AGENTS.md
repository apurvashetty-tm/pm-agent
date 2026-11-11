# AGENTS.md — Truemeds doctor app, React Native hand-off kit

Read this whole file before writing code or asking questions. Every AI tool reads the same text (`CLAUDE.md` only points here).

## What the app is

The Truemeds doctor app is a phone app for doctors who review patients' medicine requests, call the patient and confirm a prescription. The doctor's unit of work is a **case** — always say "case", never "order" (the customer's order ID is the only place "Order" appears). This kit covers one screen so far: **Sign-in** (enter a mobile number, get a one-time code by SMS). The next screen is OTP; it is not in this kit yet.

You build the React Native components and screens. This kit is the contract: tokens, copy, building blocks, every state of the screen, and the product answers.

## Where things are

| Path | What it is |
|---|---|
| [`foundation/tokens.ts`](foundation/tokens.ts) | Every design token as plain values (`tokens.color.*`, `tokens.space.*`, `tokens.radius.*`, `tokens.font.*`, `tokens.text.*`, `tokens.shadow.*`). `tokens.json` is the same data. |
| [`foundation/token-map.json`](foundation/token-map.json) | Web name → native name for every token (`--tm-content-primary` → `tokens.color.content.primary`). |
| [`foundation/messages.ts`](foundation/messages.ts) | Every word the app shows, by key (`messages['signin.welcome']`), with `message(key, values)` for `{placeholders}`. |
| [`foundation/icons.ts`](foundation/icons.ts) | Every icon as an SVG string; render with `react-native-svg` `SvgXml`, stroke colour from the `color` prop. |
| [`foundation/fonts/`](foundation/fonts/FONTS.md) | Plus Jakarta Sans, 4 static TTF weights, licence and iOS / Android setup. |
| [`foundation/brand/`](foundation/brand/logo.json) | The "truemeds for doctors" lockup as PNG @1x / @2x / @3x for the phone (`logo.json`: source and sha256). `foundation/logo/` holds the source SVG. Never redraw or recolour. |
| [`components/`](components/button.json) | One JSON spec per building block used on Sign-in: parts × states → tokens, sizes, rules, cropped pictures. |
| [`screens/sign-in.json`](screens/sign-in.json) | Every element of every Sign-in state (12 states). Facts, not prose: copy these. |
| [`screens/pictures/`](screens/pictures/sign-in_default_w390.png) | The approved pictures of each state at 360 and 390 wide. |
| [`DECIDED.md`](DECIDED.md) | Questions already answered, with the source decision (D-xx). |
| [`OPEN.md`](OPEN.md) | Questions still open, the current assumption, and who answers. |
| [`CHANGES.md`](CHANGES.md) | What changed since the last version of the kit. |
| [`viewer/index.html`](viewer/index.html) | The same facts for people: open it in a browser (no server). |
| [`.claude/skills/truemeds-native-ui/SKILL.md`](.claude/skills/truemeds-native-ui/SKILL.md) | Step by step: how to build a Truemeds screen with this kit. |

## Hard rules

1. **Tokens only.** Every colour, space, radius, font size, line height, weight and shadow comes from `tokens` (imported from `foundation/tokens.ts`). No hex, no `rgb()`, no number that duplicates a token. Use semantic tokens (`tokens.color.*`), never `tokens.palette.*`.
2. **Copy only from `messages`.** Every user-facing string comes from `foundation/messages.ts` by key. Never type a label, error or button text. Placeholders use `message(key, { time })`.
3. **"Case", never "order"** for the doctor's unit of work.
4. **One primary button per screen.** Sign-in has exactly one: Send OTP (its label changes by state).
5. **Same names as web.** Blocks are called what the web calls them: `Button`, `Field`, `Notice`, `Spinner`, `LogoHeader`, `SignUpOption`, `EntryLayout` (suggestions, marked `[RECOMMENDED]`; you own the components).
6. **Server-side limits.** The app shows limits (attempts, waits, locks); the server enforces them. Never hard-code a wait time: the server sends when the wait ends.
7. **Don't guess product behaviour.** Check `DECIDED.md` first. If the answer is in `OPEN.md`, build the current assumption and keep it easy to change. Ask only questions that are in `OPEN.md` or in neither file.

## Every value has a token or a key

Every size, colour and word on Sign-in comes from `tokens` or `messages`, including border widths (`tokens.borderWidth.default`), the focus ring (`tokens.focusRing.width` / `.offset`), icon and spinner sizes (`tokens.iconSize.*`, `tokens.spinner.size` / `.ring`), the logo width (`tokens.logoLockup.width`), the `+91` prefix (`messages['signin.phonePrefix']`) and the logo's accessible name (`messages['signin.logoAlt']`). **Never create a constants file of numbers or strings.** If you need a value that has neither, it's a question for `OPEN.md`, not a constant.

- Layout values (`flex`, `center`, `nowrap`, `100%`, `0`) aren't tokens and don't need to be: they are shown plainly in the kit (`layout: true`).
- One value has no token yet: the busy spinner's turn speed (`timing: true` in the JSON). Don't type it; it's `OPEN.md` o24 for Design.
- One documented exception: the subtitle's `max-width: 31ch` (a text measure; React Native has no `ch` unit). Leave it out; see `OPEN.md` o19.
- `screens/sign-in.json` → `rawValues.builtApp` lists anything typed that is not a token (red in the viewer). It is empty for Sign-in. `rawValues.approvedReference` audits the approved reference file; it is not for building.

## Logo on the phone

Use the PNG exports in `foundation/brand/` (`truemeds-for-doctors.png` in three densities, suffixes `@1x` / `@2x` / `@3x`; React Native picks the right one): width `tokens.logoLockup.width`, height from the image's own shape (`const src = Image.resolveAssetSource(require('./truemeds-for-doctors.png'))`, then `aspectRatio: src.width / src.height`), `accessibilityLabel={messages['signin.logoAlt']}`. Don't type the artwork's numbers. The SVG embeds an image that react-native-svg can't draw. Never redraw or recolour the logo.

## Screen file — `screens/sign-in.json`

```
{
  screen, widthMeasured: 390,
  states: [ {
    id: "sign-in_<state>", name,
    pictures: { w360, w390, built390 },            // approved pictures; built390 = the measured screen
    rule: { feedbackMap, pattern, appLogic, decided: ["d05", …] },   // why the state exists; decided = DECIDED.md ids
    elements: [ {
      id,                                          // stable across states: screen, logo, hero, title, subtitle, panel,
                                                   // field, field-label, field-control, field-prefix, field-input, field-helper,
                                                   // notice, notice-icon, notice-text, submit, submit-spinner, submit-label,
                                                   // signup, signup-link, keyboard
      block, part, variant, blockState,            // which building block (components/<block>.json), which part, which state
      rn,                                          // suggested component name [RECOMMENDED]
      box: { x, y, w, h },                         // measured at 390 wide, points
      tokens: { "<css property>": ["tokens.…"] }, // the token each property uses (native names)
      styles: [ { property, value, tokens: [ { native, ts, web, value } ], from: { selector, file, line },
                  inherited?, raw?, kind? } ],     // the exact applying rule; ts = how to write it in TypeScript
      spacing: { above: { neighbour, px, setBy: [ { element, property, tokens } ] }, inside: [ … ] },
      copy: [ { slot: text | placeholder | alt | value, copyKey?, values?, literal? } ], copyKey?, copyKeys?,
      icon?: { name, size, iconTs },               // e.g. icons['info-circle'] at 20×20
      behaviour: { decided: ["DECIDED.md#d05", …], state },
      accessibility: { role, name, size, target?, aria-*, … },
      sourceSelector, sourceSelectors, appSelector // audit links to the approved reference file and the web build
    } ],
    tokensUsed: [ "tokens.…" ]
  } ],
  tokensUsed: [ { native, ts, web, value, states, elements } ],   // whole screen
  rawValues: { builtApp: [ … ], approvedReference: [ … ] }
}
```

Notes:
- CSS words map to React Native styles in the usual way: `padding` → `padding*`, `gap` → `gap` / `rowGap`, `border-*` → `border*Width` / `border*Color`, `font-size` / `line-height` / `font-weight` → `fontSize` / `lineHeight` / `fontWeight`. Units are points.
- `inherited: true` means the value comes from a parent (text colour, font). In React Native, set it on the `Text` itself.
- `blockState` names the block's state in that screen state (`default`, `focus`, `error`, `busy`, `disabled`, `read-only (busy)`, notice tones).
- `keyboard` is the phone's own number keyboard. It has no styles: don't draw one.
- Block specs (`components/<block>.json`) hold the same tokens per part × state, plus `pressed` and `focus` states that have no picture, the design rules for the block, and cropped pictures.

## How to use the kit

1. Read `DECIDED.md` and `OPEN.md` (both short).
2. Follow the skill: `.claude/skills/truemeds-native-ui/SKILL.md`.
3. Build blocks first (`components/*.json`), then the screen (`screens/sign-in.json`), state by state; compare against `screens/pictures/`.
4. Before you finish: search your code for `#`, `rgb`, numbers in styles and quoted user-facing strings. Each must be a `tokens.*` / `messages[...]` reference (or a layout value such as `flex: 1`).

# Truemeds Design System (code copy of SALT)

One shared design system for every frontend project in this workspace.
Projects **link** to it; they never copy from it.

```
design-system/
├── truemeds.css        ← the one CSS file projects link (generated)
├── icons/icons.js      ← icon helper (generated, Tabler outline — SALT's set)
├── icons/icons.txt     ← which icons are bundled
├── preview.html        ← every token and component, rendered
├── RULES.md            ← rules every agent/person follows before building UI
├── tokens/             ← SALT export (Core + Default) + extras.json
├── src/components.css  ← component styles (tokens only)
├── src/brandbook.md     ← the brand book shown on the Claude artifact
└── scripts/            ← build.py (CSS), build-icons.mjs (icons), build_artifact.py (Claude copy)
```

## Using it in a project

Read `RULES.md`, then:

```html
<link rel="stylesheet" href="../../design-system/truemeds.css">
<script src="../../design-system/icons/icons.js"></script>
<body class="tm">
```

## Updating it

| Change | Do this |
|---|---|
| SALT colours, spacing, radius or type changed | Re-export variables from Figma → replace `tokens/Core.tokens.json` and `tokens/Default.tokens.json` → `python3 scripts/build.py` |
| Shadow or text style changed in SALT | Edit `tokens/extras.json` → `python3 scripts/build.py` |
| Component look changed / new component | Edit `src/components.css` (tokens only; mark non-SALT ones `[PROPOSED]`) → `python3 scripts/build.py` |
| Need another icon | Add its Tabler name to `icons/icons.txt` → `npm i @tabler/icons` → `node scripts/build-icons.mjs` |

Never edit `truemeds.css` or `icons/icons.js` by hand — they are rebuilt.

After any change, open `preview.html` and check it.

## Also published

A browsable copy lives in Claude as the **Truemeds Design System** artifact
(https://claude.ai/artifact/UVVHsnfEERVJ2GZ5yHXLQL — private until shared), so Claude-made mockups and decks use the same styling.

It is generated from this folder: `python3 scripts/build_artifact.py` writes `build/artifact/project/…`
(brand book from `src/brandbook.md`, tokens and components from the same sources as `truemeds.css`).
Republish those files to the artifact after any change — ask Claude to "republish the Truemeds Design System".
`build/` is generated and not committed.

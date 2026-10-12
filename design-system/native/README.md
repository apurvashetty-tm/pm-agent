# Truemeds design system for React Native

Generated from the **same SALT export** as `truemeds.css`, so the web prototype and the native apps use identical
values. Do not edit these files; change the source and rebuild (see the design-system README).

| File | What it is |
|---|---|
| `tokens.ts` | Every token resolved to plain values, typed `as const`. Import and use `tokens.color.*`, `tokens.space.*`, `tokens.radius.*`, `tokens.text.*`, `tokens.shadow.*`. |
| `tokens.json` | The same object as JSON, for tools or other platforms. |
| `icons.ts` | Every icon the design system bundles, as SVG strings: Tabler outline (SALT's set) plus Truemeds `[PROPOSED]` glyphs (medicine forms, Face ID). |

## Using it

```tsx
import tokens from './design-system/native/tokens';
import icons from './design-system/native/icons';
import { SvgXml } from 'react-native-svg';

<View style={{ padding: tokens.space.lg, borderRadius: tokens.radius.md,
               backgroundColor: tokens.color.surface.primary, ...tokens.shadow.card.ios,
               ...tokens.shadow.card.android }}>
  <Text style={[tokens.text.h1, { color: tokens.color.content.primary }]}>Welcome, Doctor.</Text>
  <SvgXml xml={icons['phone']} width={24} height={24} color={tokens.color.content.brand} />
</View>
```

## Notes for the app team

- **Units:** numbers are density-independent points, the same numbers as the web's px.
- **Colours:** use `tokens.color` (semantic). `tokens.palette` is the raw SALT palette, for reference only.
- **Shadows:** each has `boxShadow` (CSS string, React Native 0.76+ New Architecture), plus `ios` shadow props and an
  approximate Android `elevation` for older versions.
- **Font:** `Plus Jakarta Sans` (SIL OFL). The web copy in `../fonts/` is WOFF2, which React Native can't load.
  Bundle the TTF files (Google Fonts) for weights 400, 500, 600 and 700, and make sure the family name and weight
  mapping resolve on both platforms (Android needs one file per weight or a font family XML).
- **Icons:** stroke uses `currentColor`; set it with the `color` prop on `SvgXml`.
- **Components** (buttons, fields, chips, sheets) are not exported: rebuild them natively from these tokens. Visual
  reference: `../preview.html` and the approved screens in `projects/truemeds-doctor-portal-prototype/ui-screens/`.
- **Not in SALT yet:** see `../beyond-salt.md`.

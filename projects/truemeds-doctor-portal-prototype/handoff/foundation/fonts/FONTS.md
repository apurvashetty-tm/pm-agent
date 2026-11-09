# Fonts — Plus Jakarta Sans

The app's one typeface (`tokens.font.family` = `"Plus Jakarta Sans"`). Licence: SIL Open Font License 1.1 (`OFL.txt`, this folder).

## Files

Static TrueType, one file per weight. These are the four weights the tokens use (`tokens.font.weight.regular` … `.bold`).

| File | Weight | Token | PostScript name | sha256 |
|---|---|---|---|---|
| `PlusJakartaSans-Regular.ttf` | 400 | `tokens.font.weight.regular` | `PlusJakartaSans-Regular` | `bd6276d4060e3b1ebc45047469e0bb86b08f301ba681cdf1ceb6245ea10478d2` |
| `PlusJakartaSans-Medium.ttf` | 500 | `tokens.font.weight.medium` | `PlusJakartaSans-Medium` | `c77bab757d7402ec6d9341d5f7ddaafb2474e17026792697ba4624c7dc89caf7` |
| `PlusJakartaSans-SemiBold.ttf` | 600 | `tokens.font.weight.semibold` | `PlusJakartaSans-SemiBold` | `65dbcedb6596a41c30869729eb31cb57d1f5edfe365684314bba8a1994eaa4cb` |
| `PlusJakartaSans-Bold.ttf` | 700 | `tokens.font.weight.bold` | `PlusJakartaSans-Bold` | `5f5342ef76862b5b5365d1dff1a667629dfa484e388dd602552f647219c3870f` |
| `OFL.txt` | — | — | — | `995c7199cab65954f545996326755daee7b63cc6b42b06c13da1f9502ab08a99` |

Check them: `shasum -a 256 *.ttf OFL.txt` (macOS) or `sha256sum *.ttf OFL.txt` (Linux).

## Where they come from

- Google Fonts lists Plus Jakarta Sans at https://github.com/google/fonts/tree/main/ofl/plusjakartasans. That folder ships only the **variable** font (`PlusJakartaSans[wght].ttf`), which React Native can't select weights from reliably. `OFL.txt` above is copied from it unchanged.
- Its `upstream_info.md` names the font's source repository and the exact commit Google Fonts builds from: https://github.com/tokotype/PlusJakartaSans, commit `18d1cd2f7ea10481919d2f05c1f7064b7307fc26`. The four static files are taken unchanged from `fonts/ttf/` at that commit, e.g. https://raw.githubusercontent.com/tokotype/PlusJakartaSans/18d1cd2f7ea10481919d2f05c1f7064b7307fc26/fonts/ttf/PlusJakartaSans-Regular.ttf.

## Setup

The goal on both platforms: `fontFamily: tokens.font.family` plus `fontWeight: tokens.font.weight.*` picks the right file. Nothing else in a screen names a font file.

### iOS

1. Add the four `.ttf` files to the app target (React Native CLI: `react-native.config.js` → `assets: ['./src/assets/fonts']`, then `npx react-native-asset`; Expo: the `expo-font` config plugin with the four paths).
2. Check `Info.plist` → `UIAppFonts` lists all four file names.
3. iOS matches by **family + weight**: all four files share the family name `Plus Jakarta Sans`, and their weight classes are 400 / 500 / 600 / 700. So `{ fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }` selects `PlusJakartaSans-SemiBold`. No per-weight family names needed.

### Android

Android does not pick a weight from one family name unless you declare the family. Do this once:

1. Copy the files into `android/app/src/main/res/font/` with lower-case names: `plus_jakarta_sans_regular.ttf`, `plus_jakarta_sans_medium.ttf`, `plus_jakarta_sans_semibold.ttf`, `plus_jakarta_sans_bold.ttf`.
2. Create `android/app/src/main/res/font/plus_jakarta_sans.xml`:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <font-family xmlns:app="http://schemas.android.com/apk/res-auto">
     <font app:fontStyle="normal" app:fontWeight="400" app:font="@font/plus_jakarta_sans_regular" />
     <font app:fontStyle="normal" app:fontWeight="500" app:font="@font/plus_jakarta_sans_medium" />
     <font app:fontStyle="normal" app:fontWeight="600" app:font="@font/plus_jakarta_sans_semibold" />
     <font app:fontStyle="normal" app:fontWeight="700" app:font="@font/plus_jakarta_sans_bold" />
   </font-family>
   ```
3. Register it under the **same family name the tokens use**, in `MainApplication` `onCreate()`:

   ```kotlin
   ReactFontManager.getInstance().addCustomFont(this, "Plus Jakarta Sans", R.font.plus_jakarta_sans)
   ```
4. Expo (managed): use the `expo-font` config plugin's Android font-family form with the same four weights, or load each weight under its own name and map weights in one helper. Either way, screens keep using `tokens.font.family` + `tokens.font.weight.*`.

### Check it works

Render one line at each weight (`tokens.font.weight.regular`, `.medium`, `.semibold`, `.bold`) on an iPhone and an Android phone. All four must look different, and none may fall back to the system font.

## Not used

- Italic and the other weights (200, 300, 800): no token uses them.
- The `.woff2` files in the viewer folder are for the browser viewer only. React Native can't load them.

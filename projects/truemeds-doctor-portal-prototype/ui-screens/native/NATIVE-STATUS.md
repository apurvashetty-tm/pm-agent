# React Native hand-off: status and changes since these components (2026-11-03)

**Read this first.** The TSX components in this folder (Sign-in, OTP, Unlock, Home, DurationPicker) were written against the screens approved on 2026-10-15 (D-42 to D-55). The screens have changed a lot since then (D-56 to D-85). **The approved pictures in `ui-screens/` and `ui-screens/app-logic.md` are the source of truth; where a component here disagrees, the pictures win.**

**Plan (D-79 order of work):** the web prototype is built first, Fallback B first. The React Native components are refreshed from the built prototype afterwards, in one pass. Until then, use this file as the list of known gaps. Don't patch the TSX piecemeal.

## Already current
- **Copy:** `messages.ts` is generated from `feedback/messages.json` (`build-messages.mjs`) and includes the copy round (D-84, copy rules v2.1). Always take text from it, never from the TSX.
- **Tokens and icons:** `design-system/native/tokens.ts`, `tokens.json` and `icons.ts` are generated from the same sources as the web CSS.

## Known gaps in the existing components
| Area | What changed | Decision |
|---|---|---|
| All entry screens | Logo lockup 166 px wide, 16 from the top; one shared header spacing for OTP, offer and unlock | D-61, D-81, D-82 |
| OTP | No Back button; terms line stays during Verifying / Checking; a reserved line under the code boxes so Verify never moves for one-line messages; "Wrong code." / "Wrong code. {n} tries left." | D-61, D-81, D-82 |
| Unlock / faster sign-in offer | "Use OTP instead" is the primary when unlock isn't available; offer copy | D-64, D-65, D-66 |
| Home, offer, unlock | The main action sits in the pinned Action bar; content above it scrolls on short phones (360×640) | D-82 |
| Notices | Result of the bar's action (or why its button is disabled, incl. offline) = edge-to-edge band on the bar's top edge; the screen's general situation = notice at the top of the page; inside a sheet = notice box above the sheet's button | D-82 |
| Buttons | Icon size by button size: 56 px → 20, 48 px → 16, icon-only → 20 | D-82 |
| Sheets | Cover the pinned bar; header and actions stay pinned on tall sheets; controls disabled while Adding… / Setting… | D-81, D-82 |
| Home | Set availability pinned in every state; End availability greyed out offline; "Stay signed in" quiet text; page margin 16 | D-43, D-67, D-81 |
| Profile | A page (not a sheet); prescriptions today; earnings ₹20 per confirmed prescription (amount from the backend) | D-69, D-70, D-73, D-82 |
| Long waits | Status line, not a busy button | D-74 |

## Not yet in native at all
Case page, calling states, Prescribe and the outcome cards. Their behaviour is in `app-logic.md` §4–§7 and the decision log (D-56 to D-85, especially D-58, D-83, D-85). They will be written from the built prototype.

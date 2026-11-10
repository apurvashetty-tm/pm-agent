# Test disputes — handoff-kit-all

Codex tests are not edited (ruling 2026-11-10 00:50). Each dispute gives the test line, the source it contradicts, and evidence that everything else in the same test passes (a scratch copy with only the disputed clause relaxed: `tmp/journeys-relaxed.test.mjs`, not committed as a test; result 11 / 11).

## 1. H18 — "Token must be a leaf" for shadow tokens

**Ruled: upheld, test fixed by main thread** (RULINGS 2026-11-10 07:58).

- **Test:** `tests/codex/handoff/journeys.test.mjs` `native()` (line 22): `assert.ok(v===null||typeof v!=='object', 'Token must be a leaf')`, called by H18 for every element's property tokens.
- **Fails on:** `tokens.shadow.bar` (and the other `tokens.shadow.*`) — the action bar, sheets and cards use `box-shadow: var(--tm-shadow-…)`.
- **Why the build is right:** in the canonical `design-system/native/tokens.ts` a shadow is one token with platform parts (`boxShadow`, `ios { shadowColor, shadowOffset, shadowOpacity, shadowRadius }`, `android { elevation }`), built that way by D-98's native build. React Native needs the whole object (`...tokens.shadow.bar.ios` / `elevation`); pointing at one leaf (e.g. `.boxShadow`, a web string) would be wrong for the app. The kit names the token the engineer uses.
- **Asks:** allow `tokens.shadow.*` (composite by design) in `native()`.

## 2. H23 — "order" wording in approved copy, state ids and sample data

**Ruled: upheld, test fixed by main thread** (RULINGS 2026-11-10 07:58).

- **Test:** `tests/codex/handoff/journeys.test.mjs` H23, the loop over lines containing `\border\b` (line 111): every such line must match one of a fixed list of allowed phrasings.
- **Fails on (first hit):** `handoff/CHANGES.md` "Screen state changed: a-order-details"; the same class of line is in `screens/case.json`, `foundation/messages.ts`, `viewer/data.js`, `DECIDED.md`.
- **Why the build is right:** these are the **customer's order**, not the doctor's unit of work, and they are approved and frozen: the copy `case.orderDetails` "Order details", `case.orderCreated` "Order created", `case.orderMeta` "Order {id} · {total}", `case.noMedicines` "No medicines on this order…", `call.scriptCat4` "…track your order…", `skipHa.repeatDesc` "Counselled in an earlier order", `prescribe.reasonStrengthDesc` "The ordered strength isn't right" (D-53, D-84 copy rounds; CLAUDE.md: "the customer order ID line stays"); the approved picture id `a-order-details` (H15 requires the exact ids); app-logic §9 "Order details" quoted in DECIDED. `messages.ts` is copied byte for byte (H02 requires it). The doctor's unit is "case" everywhere the kit speaks for itself (checked: no "order" in any generated sentence of ours that means the case).
- **Asks:** allow "Order details", "Order created", "order {id}", "on this order", "your order", "earlier order", "ordered" (customer-order phrases) and state ids, or limit the loop to the kit's own prose.

## Not disputed (fixed in the build)

H02 (viewer read `s.tokens` → `s["tokens"]`), H03 (sign-up line is one entry `signin.signup` with `{link}`; every `signin.*` key is listed), H06 (a setting's note named a person → cleaned), H10 (text-style classes `.tm-text-*` and the mock Rx paper are documented exceptions, sample numbers are data), H16 (`built390` on each state), H17 (boxes clipped to the 390 × 844 screen, full size kept as `boxFull`), H20 (every block, incl. Sign-in's keyboard, has a spec), H24 (`--check` follows symlinked folders), H25 (tab clicks draw at once).

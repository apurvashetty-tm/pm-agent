# Fix round D-80 + D-81 — summary for Apurva (2026-11-02)

**Result:** done in 2 rounds, **0 failures**. Every fix (F1–F28) and text update (T1–T5) passes, and all six gates pass:
- Only the expected pictures changed.
- The four guards show 0 failures across 145 states.
- No straight apostrophes are left.
- A second render came out identical.
- Nothing outside the scope was touched.

The main thread checked 28 changed pictures independently at full size (at 390, and 5 of them at 360).

**What changed:** 64 screens plus 1 new screen (`d-disabled`), at both widths. Before/after sheets are in `before-after/page-01…08.png`, with before on the left and after on the right, in this order: sign-in, OTP, unlock, Home, Prescribe, case and calling.

**Not committed yet:** everything sits in the project's working folder until you approve.

## Calls made during the round — please confirm

1. **Profile earnings (mock):** ₹150 per confirmed prescription, so 3 prescriptions today = Earned ₹450.00 · Incentive ₹0.00. It is marked as an illustrative assumption; the real amounts come from the backend (D-73).
2. **Disabled wheel:** while Adding… / Setting…, the selected value on the time wheel stays blue and the other values turn grey. The design-system guard requires the selected value to stay readable.
3. **Unlock screen spacing:** the panel's top padding went from 32 to 24 so the fingerprint tile sits in the same place as on the offer screen (F8). The header itself is unchanged.
4. **Icon size:** the Callback / Skip HA / Unavailable icons are now 20 px everywhere. That's the design system's default icon size, set centrally.
5. **RULES wording** added to `design-system/RULES.md` §9:
   - one icon size for secondary bar buttons
   - the "stay" option is quiet text
   - the keyboard rule: the field scrolls above the keyboard and the action bar hides
6. **Back on state 6 ("Call too short"):** hidden. The patient was already reached, so per D-80 Back doesn't come back even though "Call again" is shown.
7. **New screen `d-disabled`:** the example reason is "Patient declined". The header shows no Disable button there, because the medicine is already disabled.
8. **Locked number on sign-in (F6):** written into the rules only, with no new picture. It reuses the existing OTP locked screen.
9. **Calling storyboard** (`docs/renders/2026-10-22-calling/storyboard-final.png`) was rebuilt from the new pictures.

## Seen and accepted

- The "Checking…" / "Sending OTP…" spinner pictures differ by spinner frame only. This is the known, accepted case.
- Part C items are untouched on purpose. For example, "Your selection is saved." on Home is H-04, which is decided in the storyboard review.

## When you approve

Claude records the freeze (D-78 updated, covering D-80 and D-81), commits the round to the project branch, opens the pull request and merges it. Then the storyboard review starts with sign-in, OTP and faster sign-in.

# Claude on Codex's review (round 2)

Codex's round-1 review is `codex-review.md`. I checked it point by point against `measure.json` and the sources. We reached almost the same spec independently:
- 16 everywhere
- subtitle box 20
- panel top 173
- the same five allowed variants in substance
- the same copy, word for word: "Skip OTPs next time", "You can take cases" / "Request a case now, or whenever you're ready.", "Availability ended"

Codex is more complete in four places, and **wrong-for-me in one** (my Home ended mapping).

## Point by point

| Codex point | Verdict | Why |
|---|---|---|
| 1 · Logo → title 48 vs 16 = deliberate rule | **Agree, partly** | It is deliberate (L6 / D-46 vs D-81 F8). I'd add what Codex leaves out: the 48 rested on D-42's home-base / task split, and D-61 removed that split for the logo. The rule is deliberate, but its reason has gone. |
| 2 · Header actions = deliberate, allowed variant | **Agree** | Same as my D5 / V1. |
| 3 · Two-line fixed titles = deliberate (approved copy + L8) | **Partly** | Apurva approved those pictures, so "deliberate" is fair for the copy. L8 only rules *how* a title wraps, though, and no decision chose a 2-line band. I'd still call the band-height effect drift. The fix is the same either way. |
| 4 · Offer wraps at 360 = drift; it breaks D-81 F8 tile alignment with unlock at 360 | **Agree, and I missed the F8 angle** | Measured: offer panel 213 vs unlock 173 at 360. F8's "fingerprint tile in the same place" holds only at 390 today. That is a stronger reason for the shorter title than mine. |
| 5 · OTP subtitle box 48 = drift | **Agree on the diagnosis, disagree on the fix** | Codex drops the 48 minimum and relies on §8.6's inline exception. I'd keep a 48 hit area as inline vertical padding, which doesn't grow the line box (checked in `after.css`: box 20, panel 173). OTP has no Back (D-61 #2), so "Change" is the only on-screen way back to fix a wrong number. It should stay easy to hit. |
| 6 · Sign-in subtitle `31ch` cap = drift; remove | **Agree** | I called it harmless; Codex is right that it is a dead per-screen rule. Once one-line subtitles are the spec, it should go. |
| 7 · OTP subtitle emphasis (number medium, Change brand) = deliberate | **Agree; I missed it** | D-44. It belongs in the spec as an allowed inline emphasis. |
| 8 · State-specific wording = deliberate; meaning varies, spacing doesn't | **Agree** | That is a good one-line rule for the spec. |
| 9 · Home band jumps 245 → 205 in stop-pending = drift | **Agree** | I noted it as "only the title length changes the band" but didn't call it out as a visible jump. The one-line rule fixes it. |
| 10 · Overall depth = combined drift | **Agree** | Same as my D4. |
| Spec table | **Agree** | Identical numbers. Codex's note to keep the logo width as the documented §8.13 exception (no new token) is right. I had marked it `raw-ok` on the same grounds. |
| "Use content flow, not a fixed band height" | **Agree; worth adding** | 173 is the result, not a value to hard-code. |
| Variant: text enlargement wraps naturally; one line is an acceptance check, never `nowrap` | **Agree; I missed it** | Important for accessibility (WCAG 1.4.4 / 1.4.12). It belongs in the conclusion. |
| Variant: long names add 40 (panel ≈ 213) | **Agree** | Same as my V2. |
| Rules to amend: D-46 L6, §8.3, **§8.13's reference**, F8, and Home v3's "Sign-in keeps 48" | **Agree; more complete than mine** | I missed §8.13 ("logo→title gap stays as in §8.3 (L6)") and the Home v3 assumption. |
| Per screen: Home mapping (setup copy for setup-wheel, setting, setup-failed, **idle-expired, manually-ended**; "Your availability has ended" only on expired-pending) | **Agree. I was wrong.** | `measure.json` confirms it: idle-expired and manually-ended show "Consult on your schedule". My §5 "Home ended" row implied all ended states. Only expired-pending gets "Availability ended". |
| Titles table | **Agree** | Same choices. The "your patients" remark on unlock: I agree it isn't worth a change in this audit. |
| "Avoid 'You're taking cases' (implies a case under way)" | **Agree** | This matches the Home v3 review's reasoning. |
| §5 · Task headers: Prescribe = edit header with ✕; sheets = own template | **Agree** | That is more precise than my "Back / ✕ + 20/28 or hero title". The conclusion is the same: no need to match. |
| Questions: two (16 everywhere; the copy) | **Agree; fewer is better** | My separate offer-title question folds into "approve the copy". Codex's F8 reason makes the recommendation clear enough. |

## Where I was wrong or thin
1. **Home ended mapping:** wrong. Fixed in the conclusion.
2. **The F8 tile alignment** at 360: missed.
3. **The OTP emphasis variant, the `31ch` cap, the text-enlargement rule and the §8.13 cross-reference:** missed or under-weighted.

## Where I still disagree
- **OTP "Change" target:** keep a 48 hit area as non-growing inline padding, rather than dropping to the inline-link exception.

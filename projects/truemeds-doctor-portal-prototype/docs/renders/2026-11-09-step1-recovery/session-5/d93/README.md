# D-93 — `offer_unavailable` (session 5, 2026-11-09) — NEW PICTURE, WAITING FOR APURVA'S APPROVAL

Not in `ui-screens/` (README still lists 6 offer states; guards still expect 148 pictures). Promote only after approval.

**State:** the phone answers "unavailable" when the doctor taps **Turn on**. The offer screen shows the neutral notice at the top of the panel
(same component, classes, icon and position as `unlock_unavailable`; text `unlock.unavailable` "Faster sign-in isn't available on this phone right now.").
Turn on and Not now are hidden; **Continue** (`offer.continue`, new key) is the single primary → Home. Not enabled; recorded as offered.

**Judgement made here (for approval with the picture):** the hero tile (fingerprint icon) is hidden too, as `unlock_unavailable` hides its prompt
tile "so only the notice speaks". Title, subtitle and the three points stay (D-93 names only Turn on as hidden). Phone Back = Continue (the only action).

**Files:** `offer_unavailable_w390.png`, `offer_unavailable_w360.png` — rendered from `ui-screens/faster-signin-offer/faster-signin-offer.html?capture=unavailable`
by `capture-d93.py` (same settings as `capture-method-cap.py`: 2×, fixed clock, animations frozen, fonts ready).

**Built app vs picture:** `compare-d93.mjs` → 0 changed pixels at 390 and at 360 (`compare-d93.json`, `pair_offer_unavailable_w*.png`: picture | built | diff).

**Other offer states unchanged:** the six approved states rendered from the edited source vs the pre-edit source (git HEAD), both on this Mac
(`regress/`): 12 / 12 pictures pixel-identical. Two first captures showed the known capture-noise bands (fingerprint 390, screen-lock 360);
each came back identical when re-captured — the same come-and-go noise sessions 3 and 4 recorded.
The step-1 compare (`tests/compare-step1.mjs`) still gives exact 14 · accepted 70 · failed 0.

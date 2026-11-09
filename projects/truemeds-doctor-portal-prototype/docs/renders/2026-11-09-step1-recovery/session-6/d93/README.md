# D-93 revised — `offer_unavailable`, notice in the bar (session 6a, 2026-11-09)

Approved by Apurva (D-93, placement revised). Not in `ui-screens/` yet: the picture joins the D-94 refresh and is copied there at D-94 step 5, after the main thread's go-ahead.

**State:** the phone answers "unavailable" when the doctor taps **Turn on**. The offer screen stays as it was (title, subtitle, fingerprint tile, three points). The bar shows the warning notice `alert-triangle` / `unlock.unavailable` "Faster sign-in isn't available on this phone right now." in the same slot as Offline and "Couldn't turn on". The primary (`#turn-on`) reads **Continue** (`offer.continue`) → Home. Not now is hidden. Phone Back = Continue. Not enabled; recorded as offered.

**Changed:** `ui-screens/faster-signin-offer/faster-signin-offer.html` (top-of-panel notice and the separate Continue button removed; the `unavailable` variant uses the bar notice; the session-5 `id="hero-wrap"` removed again) · `app/screens/faster-signin-offer.js` / `.css` (same) · `ui-screens/app-logic.md` §2 (offer outcomes and the A-19 notice-placement paragraph) · `docs/feedback-state-map.md` row `offer.unavailable` · `docs/layout_check.py --app` (`offer_unavailable` checks `#turn-on`) · `tests/entry-journeys.mjs` F5d (rewritten for the bar), F5 / F5e unchanged in logic.

**Evidence (this folder; all captures use the D-94 capture settings: `capture-d93.py`, `compare-d93.mjs`):**
| Check | Result |
|---|---|
| Built app vs new picture, 390 and 360 (`compare-d93.json`, `pair_*.png`) | **0 px** at both widths |
| Six other offer states: pre-edit source (git HEAD) vs edited source (`regress-head/`, `regress/`, `regress.json`) | **12 / 12 identical** |
| New picture vs approved concept at 390 (`concept-vs-render.json`, `concept-vs-render_w390.png`) | same size · 0 shifted rows · 0 colour bands · 0 moved regions · max channel 102 · 11,396 px over 8/255 (1,915 in the bar, 9,481 above it) · **every one on a glyph or corner edge** (0 pixels changed away from an edge both pictures share; `picdiff.py` with the checks tightened after Codex rounds 1–2) |

**Difference to list (brief 6a.3):** the edge-smoothing count against the concept (11,396 px) is above the session-4 limit (3,000 px). It is spread over the whole screen, including the unchanged title and points, and it is edge-only with no shift and no band. So it comes from how the concept was captured (route not recorded; not the D-94 settings), not from the design. For comparison, the approved `offer_fingerprint` vs its D-94 re-render differs by 111 px. No other difference: same layout, notice, icon, wrap ("Faster sign-in isn't available / on this phone right now."), button and colours.

Sheet: `concept-vs-render_w390.png` (concept | new picture | changed pixels).

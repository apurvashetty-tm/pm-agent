# Run A0 — approved pictures unchanged by the 390 : 844 frame edit

Edits that could touch a picture: `ui-screens/case/case-styles.css` (`--phone-h` clamp to 844 and `100vh - 48px`, `--phone-w` × 390 / 844) and `ui-screens/home/home-reference.css` (desktop `.phone` scales with the same formula). Both are inside `@media (min-width: 768px)`. The sign-in reference was not changed: its preview frame is already 390 × 844 (Round 4 rule, `min-height: 844px; aspect-ratio: auto`); a first edit of its overridden `aspect-ratio` line was reverted (Codex critique).

After the edits every approved picture was re-captured from its approved source with the D-94 settings and compared pixel by pixel with `ui-screens/`:
`CHROMIUM=<Chrome> python3 docs/renders/2026-11-03-calling-round/capture-method-cap.py <scratch>` (fixed Chrome flags, DPR 2, fixed clock, frozen animations), then PIL `ImageChops.difference` per picture.

**Result: 298 captured · 298 identical (0 px different) · 0 page errors.** Per-picture record: `picture-proof.json`; capture log: `picture-proof-capture.log`. The old `index.html` / `styles.css` / `app.js` are unchanged (frozen; the non-app `layout_check.py` keeps asserting their old 9:16 frame).

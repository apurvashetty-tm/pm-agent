# Round 16: D-54 open items approved (D-55)

Status: **Reviewed — yet to be approved by Apurva.** Nothing promoted; `index.html`, `design-system/`, `RULES.md` and `ui-screens/native/` not edited; no git; old renders moved (not deleted).

Guard (round 16, all phases, 390 / 360 / 430): **A 0 · B 0 · C 0 · D 4** (duration picker: 3 × 5.4, 1 × 5.3). Proof files: `guard-round-16.json`, `round-15-proofs/proofs.json`, renders `{A,B,C,D}/round-16/`, finals `{A,B,C,D}/final/`.

| Approved item (D-55) | Done here? | Result |
|---|---|---|
| 1. Option grids: M/A/N chip width, start at label edge | Yes | SOS, Dose and Max-extra chips 63px (same as M/A/N); proof `D6 d-sos-on grids` (labels 54 = grids 54; M/A/N grid unchanged at 76, 63px). Guard 5.4 clear for d-sos-on. |
| 2. Duration picker and time chips at 360 | **No: central work** | Design team to add four-column grid-chip padding in `design-system/`. Duration picker "Ongoing" still clipped at 360 (guard 5.3, `d-duration-picker_w360.png`); the callback time chips keep a local 8px padding. |
| 3. R3 exemptions (icon-led text, right-aligned helper, centred titles) | Yes (guard only) | Guard R3: 0 failures A–D. Designs unchanged. |
| 4. Profile / Logout sheet | Not built | Not in the Home screen files; built only when it exists there (D-54). |
| 5. "Call didn't connect" path | Yes | Uses the app's `timeout` path: case stays open, retry sheet titled "Call didn't connect", bar shows the reason notice (`b-didnt-connect_w360.png`, `_w390.png`; proof `D3 b-didnt-connect`). Bar buttons on this path are Call again and Mark as unavailable (app behaviour; no Callback). |
| 6. Native copy | Not done here | Owned by the native team; `messages.ts` restored, not regenerated. |
| 7. Old renders moved | Yes | Standards rounds 1–14 → `docs/_superseded/2026-10-15-phase-D-rounds/`; 2026-10-14 layout-v2 D renders → `docs/_superseded/2026-10-14-layout-v2-D/`. Current set: `D/final/`, `D/options-case-bar/`, `D/round-15/`, `D/round-16/`. |

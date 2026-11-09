# Run A0 — response to the Codex critique (`codex-critique.md`)

0 blockers, 5 should-fix, 1 nice-to-have. All adopted; no re-run (the brief re-runs only after blockers).

1. **Reference frames not on the §7 formula** — adopted. `case-styles.css` uses `clamp(640px, 100vh - 48px, 844px)`; `home-reference.css` desktop `.phone` scales with the same formula instead of a fixed 390 × 844. The sign-in reference edit was reverted: its overridden line had no effect, and its preview is already 390 × 844 (Round 4 rule). Pictures re-captured again: 298 / 298 identical.
2. **QR quiet zone was 2 modules** — adopted: `qr.js` now passes `cellSize: 2, margin: 8` (4 modules). P7, P17 and P19 decode it.
3. **P15 / P16 didn't cover every value** — adopted: P15c fills every number on sign-in and every code on OTP (desktop). P16b does the same through the opened phone drawer at 390. `test-disputes.md` wording corrected.
4. **No real-server check of Copy link and the advertised address** — adopted: P19 starts the real `scripts/serve.sh` and opens it from localhost and from 127.0.0.1. It checks the link, the jsQR-decoded QR and the clipboard after Copy link (all equal the Mac's address and port), then opens the advertised link, which loads the app in play mode. The preview-site branch (`kind: "site"`, the site's own address) is covered by code inspection only. It is listed as an eye check in REPORT.md.
5. **Picture proof had no record** — adopted: `picture-proof.json` lists every picture with its diff box, `picture-proof-capture.log` holds the capture output, and the command is in `picture-proof.md`. The explanation now names the media-query scope of each edit.
6. **Nice-to-have, P18 could pass without running `storySteps`** — adopted: the import is no longer caught, and the step assertion always runs.

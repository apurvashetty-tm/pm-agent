# Run A0 — shell fixes (D-97): report

Terminal, 2026-11-09. App shell and review tools only. No screen or approved picture changed. **Status: waiting for main-thread review.**

## Done first: D-94 step 5
The main thread gave the go-ahead (SESSION-STATUS 16:20). `session-6/new/` was copied into `ui-screens/` (298 pictures, byte-equal), including `offer_unavailable`, and the REPORT §11 list was done: README, guard states, state map 149, Jump name, `PENDING_PICTURE` removed, `visible-strings.json`. The contact sheets were rebuilt. The anti-aliasing rule was deleted, and the compare gives **exact 80 · listed 6 · failed 0**. Codex found 1 blocker (a check log run without Chrome, re-run 60 / 60) and 2 should-fix (fixed). Details: `../../2026-11-09-step1-recovery/SESSION-STATUS.md` (top note). Pushed separately.

## What changed (items 1–5c)
1. **Frame 390 : 844:** `app/shell/shell.css` uses `clamp(640px, 100vh - 48px, 844px)` × 390 / 844. The frame is exactly 390 × 844 at 1440 × 900 and 1920 × 1080, and 347.5 × 752 at 1280 × 800. The reference pages (`case-styles.css`, `home-reference.css`) use the same formula. The sign-in reference is already 390 × 844. `layout_check.py --app` asserts 390 : 844, exact size when the window allows, and panel top = frame top, at 1920 / 1440 / 1280 / 1024. The non-app check keeps asserting 9:16 for the frozen old `index.html`, because `styles.css` stays frozen per the brief. **Pictures: 298 re-captured with D-94 settings, 298 identical** (`picture-proof.md`, `.json`).
2. **One right-hand column:** "Test on phone" is the first folding row, open by default, with the QR, steps, Wi-Fi line, link and Copy link inside. The left-gutter card is removed. The panel's top edge is the frame's top edge (0 px at all sizes). At 1280 × 800 every row fits when opened, Restart story included, and the panel doesn't scroll (P5). To fit: panel width up to 420, 28 px summaries, and the attempt picker shares a line with Add / Remove.
3. **Phone link:** new `scripts/serve.sh [port]` runs `copy-shared.sh` and prints the Mac and phone URLs. It serves `app/` with python3's http.server handler and adds the Mac's address to the page as `<meta name="tm-network-origin">`. `app/review/phone-link.js` uses that address when the app is opened from localhost / 127.0.0.1, with the line "Phone and Mac on the same Wi-Fi". Without an address the panel explains how to get one ("start the app with scripts/serve.sh"). On the preview site the link uses the site's own address. QR quiet zone is 4 modules. *Differs from the brief's wording:* a plain `python3 -m http.server` can't tell the page the address, so the server is a 10-line handler on the same module. A config file was tried first, but its 404 on every other server broke the "0 console errors" checks.
4. **Default story = happy path:** the default call attempt is "patient answers, over the gate". Record over the gate, Cat4, sign-in and "Saves" were already the defaults. The short-link codec now writes a call field when it differs from the default (`3~A0` = didn't answer). **Old short links made before today with no `A` token now play the happy path.** QR steps: Opens at sign-in · OTP · Faster sign-in · Cat4 case · Call · "Confirm prescription → Prescription confirmed → next case".
5. **Summaries wrap** to two lines (line clamp 2, no ellipsis on one line; P13).
5b. **Test numbers and codes** in Sign-in answers, built from `app/data/test-numbers.js` with the app-logic §11 results in words. Tapping a line fills it the way it would be typed (first key, then the rest). The phone drawer shows both lists on sign-in and OTP only.
5c. **"Timings and limits"** under a quiet "Advanced" label with Event log, at the bottom. Each line has a plain name, a value in s / min (counts plain, earnings ₹), a **Rule / Stand-in** tag and its reference on hover or tap. The summary reads "Valid-call minimum 50 s · 11 rules, 15 stand-ins". To fit 1280 × 800, the 4 review-tool values (server answer, cooldown check, phone prompt, fast-forward) share one line tagged Stand-in, labelled "Review tool only, not product rules". `settings.js`: the three OQ-017 references were made distinct (code window / lock / resend waits). Values unchanged.
Order: Test on phone · Story · Jump to a state · Sign-in answers · Home and case answers · Call simulator · Advanced (Timings and limits, Event log), then Restart story / Fast-forward.

## Checks (`checks/`, run with `../run-checks.sh`)
entry-journeys 60 / 60 · run-checks **90 / 90** (P5–P8b updated; new P11–P19) · layout and `--app` ALL PASS · locked specs 0 failures / 149 × 3 · check-sources · lockup · scan 0 · state map drift 0 · compare exact 80 · listed 6 · failed 0 · old `index.html` / `app.js` / `styles.css` unchanged.

## Codex
- **Tests:** written from the spec before the build (`tests/codex/run-A0/`, `codex-tests.md`). Result: 2 pass (summaries, settings), 9 fail. All 9 are in `test-disputes.md`, with their spec lines: the layout tests measure the first row instead of the panel's top; the inputs tests use an unanchored `/0000/` that also matches 9000000001–05; the network test picks the row's chevron svg instead of the QR; the happy-path test is steps 2–5 (A1 / A2) and expects a "Send code" button where the approved label is "Send OTP". Adapter gaps were fixed in the app, not in the tests.
- **Critique:** 0 blockers, 5 should-fix, 1 nice-to-have, all adopted (`codex-critique.md`, `codex-response.md`).

## Review shots
`1280x800-story.png`, `1280x800-call.png`, `1440x900-story.png`, `1440x900-call.png`, `1920x1080.png` (before | after). Panel and drawer shots from run-checks: `checks/shots/`.

## Eye checks for the main thread
Scan the QR with a real phone on the same Wi-Fi (`sh projects/truemeds-doctor-portal-prototype/scripts/serve.sh`). Check the preview-site link branch once deployed (no deploy made). Check the phone drawer's test list with a thumb.

## `[MOCK ASSUMPTION]` / `[OPEN DECISION]`
None added. Lines for the main thread (not written to `docs/context/`): `session_handoff.md` (A0 done, waiting for review), the D-97 "done" note, and that old pre-D-97 short links now default to the happy-path call.

## Commits
D-94 step 5: "Doctor portal: D-94 step 5 — re-rendered pictures promoted…". Run A0: "Doctor portal: Run A0 (D-97) — …". Both pushed to `project/truemeds-doctor-portal-prototype`, with no PR and no deploy.

## Left
Port 8080 on this Mac is held by a plain `http.server` from another terminal (started 16:22). It was not touched. Use `serve.sh 8092` until that terminal is closed. Next: Run A1 after the main-thread review.

# D-94 baseline check — old approved pictures vs new renders (session 6, 2026-11-09)

Old = `ui-screens/` (128 old-Mac pictures + 20 D-92 new-Mac). New = `session-6/new/`, rendered from the approved sources with the D-94 capture
(`capture-method-cap.py`: fixed flags `--font-render-hinting=none --disable-gpu --disable-lcd-text --force-color-profile=srgb
--disable-font-subpixel-positioning --disable-partial-raster --disable-skia-runtime-opts --hide-scrollbars`, DPR 2 from the page, fixed clock,
animations frozen, fonts loaded + two frames). Measured by `picdiff.py` (per picture: changed px, px over 8/255, max channel, shifted rows,
colour bands, changed pixels away from edges, locally moved regions). **Same design** = same size, 0 shifted rows, 0 colour bands,
**0 flat-area changes** (no pixel changed by more than 2/255 unless BOTH pictures have an edge within 1 px), **0 moved regions** (no 2-D shift of up to 4 px explains a changed region),
≤ 3,000 px over 8/255 and max ≤ 110 (session-4 limits). `picdiff.py --selftest <png>` asserts (exit 1 otherwise) that an added 6×6 grey box,
an added 20-px grey rule, a white → RGB(250,250,250) fill and a text block moved 2 px are each DIFFERENT, caught by the named check
(box, rule, fill: inside the numeric limits); run on 7 pictures, all pass (Codex session 6, blockers 1–2, should-fix 2).

## Repeatable capture (step 1)

All 298 pictures captured twice with the D-94 settings (`session-6/new/` vs a second run; `offer_unavailable` with `d93/capture-d93.py`, same settings, three runs): **{"identical": 298}** (`repeat-check.json`). The compare (`tests/compare-step1.mjs`) uses the same flags and captures each picture once (retry loop removed).

Two things had to change to get there:
- **Flags.** `--force-device-scale-factor=2` (an example flag in the brief) re-scales text on top of the page DPR and moved every glyph:
  ~23,000–48,000 px over 8/255 with shifted rows on every picture. It is not used. `--disable-gpu` is the flag that matters: GPU raster
  gave come-and-go noise between captures (seen in sessions 3–5), and software raster is also much closer to the old-Mac pictures
  (sign-in 1,660 → 65 px).
- **One source race (`ui-screens/case/case.html`, `a-confirm-busy`).** The secondary row (greyed Callback) was hidden or shown depending
  on when a ResizeObserver in the old `app.js` fired (about 1 capture in 4 showed it). The approved picture has it hidden; the recipe
  now hides it explicitly, as `a-confirm-failed` already did. No approved picture changes (same pixels as the approved look; 0 / 10 probes showed the row).

## Old vs new (step 3)

Pictures compared: 296 · result: **{"same design": 294, "identical": 2, "NEW (not in old)": 2}** (`baseline-check.json`).

New picture with no old one (approved D-93, joins `ui-screens/` at step 5): `faster-signin-offer/offer_unavailable_w360.png`, `faster-signin-offer/offer_unavailable_w390.png`.

**Every picture is the same design** (no shifted row, no colour band, no flat-area change, no moved region, inside the limits). None is held back.

Largest: `returning-unlock/unlock_pending_w360.png` 2062 px over 8 · highest channel difference: `case/a-confirm-busy_w360.png` 103.

### Worst 10 (by px over 8/255) — contact sheet `worst-10.png` (old | new | changed pixels)

| Picture | changed px | px over 8 | max | shifted rows | colour bands | flat-area px | moved regions | verdict |
|---|---|---|---|---|---|---|---|---|
| `returning-unlock/unlock_pending_w360.png` | 37935 | 2062 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_pending_w390.png` | 40123 | 2059 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_cancelled_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_fingerprint_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_platform-retry_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_cancelled_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_fingerprint_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_platform-retry_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_face_w360.png` | 38002 | 1829 | 103 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_face_w390.png` | 40190 | 1827 | 103 | 0 | 0 | 0 | 0 | same design |

### All pictures

| Picture | changed px | px over 8 | max | shifted rows | colour bands | flat-area px | moved regions | verdict |
|---|---|---|---|---|---|---|---|---|
| `case/a-back-blocked_w360.png` | 2153 | 153 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-back-blocked_w390.png` | 2167 | 159 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-confirm-busy_w360.png` | 2118 | 144 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/a-confirm-busy_w390.png` | 2118 | 144 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/a-confirm-failed_w360.png` | 2032 | 151 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/a-confirm-failed_w390.png` | 2032 | 151 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/a-leave-sheet_w360.png` | 1512 | 81 | 48 | 0 | 0 | 0 | 0 | same design |
| `case/a-leave-sheet_w390.png` | 1512 | 81 | 48 | 0 | 0 | 0 | 0 | same design |
| `case/a-load-failed_w360.png` | 415 | 44 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-load-failed_w390.png` | 415 | 44 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-loading_w360.png` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | identical |
| `case/a-loading_w390.png` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | identical |
| `case/a-long-content_w360.png` | 2263 | 164 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-long-content_w390.png` | 2263 | 164 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-no-medicines_w360.png` | 1552 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-no-medicines_w390.png` | 1537 | 146 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-notes-typing_w360.png` | 2015 | 131 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-notes-typing_w390.png` | 2015 | 131 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-offline-action_w360.png` | 1990 | 146 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-offline-action_w390.png` | 1990 | 146 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-offline_w360.png` | 2025 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-offline_w390.png` | 2025 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-order-details_w360.png` | 2111 | 161 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-order-details_w390.png` | 2111 | 161 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-release-failed_w360.png` | 2027 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-release-failed_w390.png` | 2027 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-releasing_w360.png` | 1465 | 68 | 29 | 0 | 0 | 0 | 0 | same design |
| `case/a-releasing_w390.png` | 1465 | 68 | 29 | 0 | 0 | 0 | 0 | same design |
| `case/a-rx-viewer_w360.png` | 2520 | 224 | 61 | 0 | 0 | 0 | 0 | same design |
| `case/a-rx-viewer_w390.png` | 2520 | 223 | 61 | 0 | 0 | 0 | 0 | same design |
| `case/a-scrolled_w360.png` | 1818 | 141 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-scrolled_w390.png` | 1803 | 139 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-top_w360.png` | 2035 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/a-top_w390.png` | 2035 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-error_w360.png` | 1475 | 63 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-error_w390.png` | 1475 | 63 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-failed_w360.png` | 1290 | 68 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-failed_w390.png` | 1290 | 68 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-refused_w360.png` | 1362 | 78 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback-refused_w390.png` | 1362 | 78 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback_w360.png` | 1443 | 50 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-callback_w390.png` | 1443 | 50 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/c-skip-ha_w360.png` | 2076 | 124 | 43 | 0 | 0 | 0 | 0 | same design |
| `case/c-skip-ha_w390.png` | 2172 | 127 | 43 | 0 | 0 | 0 | 0 | same design |
| `case/e-availability-ended_w360.png` | 1857 | 139 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/e-availability-ended_w390.png` | 1857 | 139 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/e-callback-scheduled_w360.png` | 1964 | 144 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/e-callback-scheduled_w390.png` | 1964 | 144 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g0-calling-pilot_w360.png` | 2068 | 150 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g0-calling-pilot_w390.png` | 2204 | 170 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g1-generic-confirm_w360.png` | 1899 | 142 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/g1-generic-confirm_w390.png` | 2030 | 158 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/g2-checking-ha_w360.png` | 1945 | 140 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g2-checking-ha_w390.png` | 2076 | 156 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g3b-after-hangup_w360.png` | 1996 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g3b-after-hangup_w390.png` | 1996 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g3b-forwarded_w360.png` | 2172 | 174 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/g3b-forwarded_w390.png` | 2172 | 174 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-10-medicines_w360.png` | 2158 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-10-medicines_w390.png` | 2158 | 155 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-medicine-disabled_w360.png` | 2026 | 145 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-medicine-disabled_w390.png` | 2026 | 145 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-optional-empty_w360.png` | 1948 | 138 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s-optional-empty_w390.png` | 1948 | 138 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s7a-calling_w360.png` | 2099 | 151 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s7a-calling_w390.png` | 2157 | 157 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s7b-still-on-call_w360.png` | 2074 | 156 | 69 | 0 | 0 | 0 | 0 | same design |
| `case/s7b-still-on-call_w390.png` | 2110 | 162 | 69 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-result-missing-pilot_w360.png` | 2066 | 184 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-result-missing-pilot_w390.png` | 2103 | 182 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-result-missing_w360.png` | 1997 | 159 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-result-missing_w390.png` | 2021 | 155 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-unavailable-sheet_w360.png` | 1861 | 112 | 53 | 0 | 0 | 0 | 0 | same design |
| `case/s7d-unavailable-sheet_w390.png` | 1861 | 112 | 53 | 0 | 0 | 0 | 0 | same design |
| `case/s7e-leave-sheet_w360.png` | 1512 | 81 | 48 | 0 | 0 | 0 | 0 | same design |
| `case/s7e-leave-sheet_w390.png` | 1512 | 81 | 48 | 0 | 0 | 0 | 0 | same design |
| `case/s7f-submitted_w360.png` | 2029 | 156 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/s7f-submitted_w390.png` | 2033 | 156 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t01-ready_w360.png` | 2035 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t01-ready_w390.png` | 2035 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t02-calling_w360.png` | 2099 | 151 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t02-calling_w390.png` | 2157 | 157 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t03-not-through_w360.png` | 1937 | 145 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t03-not-through_w390.png` | 1937 | 145 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t04-doctor-missed_w360.png` | 1977 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t04-doctor-missed_w390.png` | 1977 | 148 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t05-result-wait_w360.png` | 2020 | 150 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t05-result-wait_w390.png` | 2057 | 156 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t06-ended-early_w360.png` | 1947 | 142 | 69 | 0 | 0 | 0 | 0 | same design |
| `case/t06-ended-early_w390.png` | 1947 | 142 | 69 | 0 | 0 | 0 | 0 | same design |
| `case/t08a-valid-cat4_w360.png` | 2055 | 152 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t08a-valid-cat4_w390.png` | 2055 | 152 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t08b-valid-forward_w360.png` | 2066 | 173 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t08b-valid-forward_w390.png` | 2066 | 173 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t08c-confirm-blocked_w360.png` | 2061 | 157 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t08c-confirm-blocked_w390.png` | 2061 | 157 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t09-patient-unavailable_w360.png` | 1890 | 138 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t09-patient-unavailable_w390.png` | 1890 | 138 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t10a-confirmed_w360.png` | 1898 | 147 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t10a-confirmed_w390.png` | 1898 | 147 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t10b-forwarded_w360.png` | 1945 | 150 | 49 | 0 | 0 | 0 | 0 | same design |
| `case/t10b-forwarded_w390.png` | 1945 | 150 | 49 | 0 | 0 | 0 | 0 | same design |
| `case/t11-calling-transfer_w360.png` | 2103 | 150 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t11-calling-transfer_w390.png` | 2103 | 153 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t12-transfer-ready_w360.png` | 1936 | 150 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t12-transfer-ready_w390.png` | 1936 | 152 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t13-connecting-ha_w360.png` | 1867 | 135 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t13-connecting-ha_w390.png` | 1867 | 135 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t14-transferred_w360.png` | 1976 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t14-transferred_w390.png` | 1976 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t15-after-hangup_w360.png` | 1996 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t15-after-hangup_w390.png` | 1996 | 165 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t15-ha-no-join_w360.png` | 2172 | 174 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t15-ha-no-join_w390.png` | 2172 | 174 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t16-transfer-missed_w360.png` | 2194 | 200 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t16-transfer-missed_w390.png` | 2194 | 202 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t16b-transfer-missed-patient_w360.png` | 2089 | 191 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t16b-transfer-missed-patient_w390.png` | 2176 | 209 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t16c-transfer-missed-unknown_w360.png` | 2078 | 179 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t16c-transfer-missed-unknown_w390.png` | 2165 | 197 | 103 | 0 | 0 | 0 | 0 | same design |
| `case/t17-skip-ha-wait_w360.png` | 2104 | 174 | 64 | 0 | 0 | 0 | 0 | same design |
| `case/t17-skip-ha-wait_w390.png` | 2201 | 186 | 64 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_enable-failed_w360.png` | 1427 | 119 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_enable-failed_w390.png` | 1424 | 119 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_enabling_w360.png` | 1388 | 119 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_enabling_w390.png` | 1377 | 108 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_face-id_w360.png` | 1302 | 102 | 45 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_face-id_w390.png` | 1299 | 102 | 45 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_fingerprint_w360.png` | 1329 | 111 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_fingerprint_w390.png` | 1326 | 111 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_offline_w360.png` | 1499 | 130 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_offline_w390.png` | 1496 | 130 | 46 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_screen-lock_w360.png` | 1341 | 111 | 45 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_screen-lock_w390.png` | 1338 | 111 | 45 | 0 | 0 | 0 | 0 | same design |
| `faster-signin-offer/offer_unavailable_w360.png` | — | — | — | — | 0 | — | — | NEW (not in old) |
| `faster-signin-offer/offer_unavailable_w390.png` | — | — | — | — | 0 | — | — | NEW (not in old) |
| `home/home_active_w360.png` | 915 | 77 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_active_w390.png` | 915 | 77 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_add-failed_w360.png` | 1008 | 48 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_add-failed_w390.png` | 1008 | 48 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_add-wheel_w360.png` | 1243 | 61 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_add-wheel_w390.png` | 1243 | 61 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_added_w360.png` | 998 | 84 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_added_w390.png` | 998 | 84 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_adding_w360.png` | 27753 | 48 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_adding_w390.png` | 27747 | 48 | 56 | 0 | 0 | 0 | 0 | same design |
| `home/home_end-confirmation_w360.png` | 1308 | 105 | 53 | 0 | 0 | 0 | 0 | same design |
| `home/home_end-confirmation_w390.png` | 1301 | 103 | 53 | 0 | 0 | 0 | 0 | same design |
| `home/home_expired-pending_w360.png` | 809 | 49 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_expired-pending_w390.png` | 809 | 49 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_idle-expired_w360.png` | 1248 | 80 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_idle-expired_w390.png` | 1248 | 80 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_logout-confirm_w360.png` | 288075 | 1245 | 64 | 0 | 0 | 0 | 0 | same design |
| `home/home_logout-confirm_w390.png` | 307281 | 1252 | 64 | 0 | 0 | 0 | 0 | same design |
| `home/home_manually-ended_w360.png` | 1263 | 85 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_manually-ended_w390.png` | 1263 | 85 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_near-expiry_w360.png` | 1172 | 105 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_near-expiry_w390.png` | 1169 | 104 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_no-cases_w360.png` | 1059 | 92 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_no-cases_w390.png` | 1059 | 92 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_offline_w360.png` | 1054 | 80 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_offline_w390.png` | 1054 | 80 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_profile-case-open_w360.png` | 99018 | 789 | 93 | 0 | 0 | 0 | 0 | same design |
| `home/home_profile-case-open_w390.png` | 104690 | 789 | 93 | 0 | 0 | 0 | 0 | same design |
| `home/home_profile_w360.png` | 97187 | 949 | 93 | 0 | 0 | 0 | 0 | same design |
| `home/home_profile_w390.png` | 102859 | 950 | 93 | 0 | 0 | 0 | 0 | same design |
| `home/home_request-failed_w360.png` | 1023 | 88 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_request-failed_w390.png` | 1023 | 88 | 38 | 0 | 0 | 0 | 0 | same design |
| `home/home_requesting_w360.png` | 1000 | 77 | 48 | 0 | 0 | 0 | 0 | same design |
| `home/home_requesting_w390.png` | 1000 | 78 | 48 | 0 | 0 | 0 | 0 | same design |
| `home/home_setting_w360.png` | 1017 | 51 | 48 | 0 | 0 | 0 | 0 | same design |
| `home/home_setting_w390.png` | 1019 | 51 | 48 | 0 | 0 | 0 | 0 | same design |
| `home/home_setup-failed_w360.png` | 1260 | 85 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_setup-failed_w390.png` | 1247 | 76 | 51 | 0 | 0 | 0 | 0 | same design |
| `home/home_setup-wheel_w360.png` | 1049 | 60 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_setup-wheel_w390.png` | 1049 | 60 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_stop-pending_w360.png` | 727 | 55 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_stop-pending_w390.png` | 727 | 55 | 49 | 0 | 0 | 0 | 0 | same design |
| `home/home_unknown-result_w360.png` | 1032 | 80 | 43 | 0 | 0 | 0 | 0 | same design |
| `home/home_unknown-result_w390.png` | 1032 | 80 | 43 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_code-expired_w360.png` | 926 | 58 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_code-expired_w390.png` | 926 | 58 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_cooldown-reconciling_w360.png` | 1206 | 73 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_cooldown-reconciling_w390.png` | 1206 | 73 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_couldnt-verify_w360.png` | 1454 | 104 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_couldnt-verify_w390.png` | 1454 | 104 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_default_w360.png` | 1301 | 90 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_default_w390.png` | 1301 | 90 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_empty-tap_w360.png` | 1399 | 101 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_empty-tap_w390.png` | 1399 | 101 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_expired-and-resend-limited_w360.png` | 737 | 50 | 51 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_expired-and-resend-limited_w390.png` | 737 | 50 | 51 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_locked_w360.png` | 670 | 33 | 51 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_locked_w390.png` | 670 | 33 | 51 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_new-code-sent_w360.png` | 1369 | 100 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_new-code-sent_w390.png` | 1369 | 100 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_offline_w360.png` | 1566 | 110 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_offline_w390.png` | 1566 | 110 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resend-available_w360.png` | 1338 | 93 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resend-available_w390.png` | 1338 | 93 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resend-failed_w360.png` | 1515 | 105 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resend-failed_w390.png` | 1515 | 105 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resending_w360.png` | 1399 | 96 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_resending_w390.png` | 1399 | 96 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_too-many-resends_w360.png` | 1463 | 107 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_too-many-resends_w390.png` | 1463 | 107 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_too-short_w360.png` | 1380 | 100 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_too-short_w390.png` | 1380 | 100 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_two-tries-left_w360.png` | 1458 | 103 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_two-tries-left_w390.png` | 1458 | 103 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_verifying_w360.png` | 1480 | 130 | 68 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_verifying_w390.png` | 1478 | 111 | 68 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_wrong-code_w360.png` | 1414 | 96 | 65 | 0 | 0 | 0 | 0 | same design |
| `otp/otp_wrong-code_w390.png` | 1414 | 96 | 65 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-alt-days_w360.png` | 1434 | 106 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-alt-days_w390.png` | 1426 | 106 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-cream_w360.png` | 1422 | 121 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-cream_w390.png` | 1414 | 115 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-default_w360.png` | 1311 | 91 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-default_w390.png` | 1260 | 91 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-disable-sheet_w360.png` | 1911 | 137 | 47 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-disable-sheet_w390.png` | 1911 | 137 | 47 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-disabled_w360.png` | 1389 | 118 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-disabled_w390.png` | 1338 | 118 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-discard-sheet_w360.png` | 1085 | 57 | 25 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-discard-sheet_w390.png` | 1049 | 57 | 25 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-drops_w360.png` | 1411 | 96 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-drops_w390.png` | 1399 | 93 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-duration-picker_w360.png` | 1261 | 72 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-duration-picker_w390.png` | 1276 | 73 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-error-dose_w360.png` | 1434 | 114 | 61 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-error-dose_w390.png` | 1383 | 114 | 61 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-error-other_w360.png` | 1417 | 92 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-error-other_w390.png` | 1499 | 102 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-every-x-hours_w360.png` | 1422 | 118 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-every-x-hours_w390.png` | 1425 | 117 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-food-selected_w360.png` | 1475 | 105 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-food-selected_w390.png` | 1475 | 105 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-header-white_w360.png` | 1311 | 91 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-header-white_w390.png` | 1260 | 91 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-inhaler_w360.png` | 1385 | 88 | 60 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-inhaler_w390.png` | 1391 | 86 | 60 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-injection-default_w360.png` | 1331 | 94 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-injection-default_w390.png` | 1401 | 96 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-monthly_w360.png` | 1359 | 98 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-monthly_w390.png` | 1351 | 98 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-notes-keyboard_w360.png` | 1602 | 71 | 61 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-notes-keyboard_w390.png` | 1602 | 71 | 61 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-rx-failed_w360.png` | 227 | 20 | 35 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-rx-failed_w390.png` | 227 | 20 | 35 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-scrolled_w360.png` | 1399 | 100 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-scrolled_w390.png` | 1399 | 100 | 52 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-sos-on_w360.png` | 1455 | 104 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-sos-on_w390.png` | 1398 | 104 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-sos-only_w360.png` | 1346 | 76 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-sos-only_w390.png` | 1340 | 74 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-syrup_w360.png` | 1391 | 100 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-syrup_w390.png` | 1394 | 106 | 58 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-weekly_w360.png` | 1465 | 105 | 60 | 0 | 0 | 0 | 0 | same design |
| `prescribe/d-weekly_w390.png` | 1469 | 105 | 60 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_cancelled_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_cancelled_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_face_w360.png` | 38002 | 1829 | 103 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_face_w390.png` | 40190 | 1827 | 103 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_fingerprint_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_fingerprint_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_pending_w360.png` | 37935 | 2062 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_pending_w390.png` | 40123 | 2059 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_platform-retry_w360.png` | 38492 | 1979 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_platform-retry_w390.png` | 40680 | 1977 | 100 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_screen-lock_w360.png` | 38356 | 1778 | 90 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_screen-lock_w390.png` | 40544 | 1776 | 90 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_unavailable_w360.png` | 38978 | 1763 | 83 | 0 | 0 | 0 | 0 | same design |
| `returning-unlock/unlock_unavailable_w390.png` | 42534 | 1761 | 83 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_couldnt-send_w360.png` | 757 | 51 | 23 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_couldnt-send_w390.png` | 757 | 51 | 23 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_default_w360.png` | 872 | 65 | 27 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_default_w390.png` | 872 | 65 | 27 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_empty-tap_w360.png` | 814 | 62 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_empty-tap_w390.png` | 814 | 62 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_inactive_w360.png` | 796 | 43 | 51 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_inactive_w390.png` | 796 | 43 | 51 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_keyboard-open_w360.png` | 868 | 61 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_keyboard-open_w390.png` | 868 | 61 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_not-registered_w360.png` | 1049 | 98 | 49 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_not-registered_w390.png` | 1049 | 98 | 49 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_offline_w360.png` | 830 | 55 | 55 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_offline_w390.png` | 830 | 55 | 55 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_pasted-cleaned_w360.png` | 902 | 62 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_pasted-cleaned_w390.png` | 902 | 62 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_sending_w360.png` | 1044 | 66 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_sending_w390.png` | 1061 | 78 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_too-many-tries_w360.png` | 829 | 51 | 51 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_too-many-tries_w390.png` | 829 | 51 | 51 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_too-short_w360.png` | 753 | 49 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_too-short_w390.png` | 753 | 49 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_wrong-first-digit_w360.png` | 844 | 52 | 65 | 0 | 0 | 0 | 0 | same design |
| `sign-in/sign-in_wrong-first-digit_w390.png` | 844 | 52 | 65 | 0 | 0 | 0 | 0 | same design |

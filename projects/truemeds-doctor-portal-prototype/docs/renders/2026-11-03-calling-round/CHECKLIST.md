# Calling round — calling-walkthrough decisions (CW) on the frozen screens · checklist

Definition of done for the final round. Source of every item: `docs/reviews/2026-11-02-calling-walkthrough/README.md` (CW-A1 … CW-F3, apply list per path, summary at the end). **Latest wins:** the CW decisions replace what they name in D-58, D-63, D-75 pt 3 and D-81 F26; everything else (D-80, D-81, fix rounds 1–6) still stands.

**Scope rule:** change only the states, sections and keys named below. Anything not named stays pixel-identical.

## 1. Changes — what "done" looks like

### Callback (CW-A1, C1, C3, A2)
| # | Change | Pass when |
|---|---|---|
| K1 | Callback removed from every live state and from 5, 8a, 8b: `t02-calling`, `s7a-calling`, `t11-calling-transfer`, `t12-transfer-ready`, `t17-skip-ha-wait`, `t05-result-wait`, `t08a-valid-cat4`, `t08b-valid-forward` (+ `g1-generic-confirm`, `g2-checking-ha` if they show it) | No Callback button on any state except **6** (`t06-ended-early`) and **7d** (`s7d-result-missing`); bars use the existing pattern: status line alone (2 / 7a / 11 / 5 / 17), **Confirm & transfer + Skip HA full width** (12), **Confirm prescription alone** (8a), **Confirm & forward + Skip HA full width** (8b) |
| K2 | Callback sheets drawn over a post-call state (`c-callback`, `c-callback-error`, `c-callback-failed`) | Each shows **6 Call too short** behind it, not Calling (CW-A1, replaces D-75 pt 3 for these sheets) |
| K3 | Callback refused (backend guard) | New key `callback.notReached` = "Couldn't schedule a callback. The patient wasn't reached." in `messages.json`; feedback-state-map row; shown as the sheet's error notice (same pattern as the save failure); one new state picture of the sheet with it |

### Case start and Release (CW-A5, A6)
| # | Change | Pass when |
|---|---|---|
| K4 | Empty case `a-no-medicines` | Amber notice **at the top of the panel** (standing state — same notice component and placement as unlock "isn't available"), text "This order has no medicines. Release it — our Ops team will check it." (curly apostrophes per D-81); the plain text in the medicines card removed; **Release case** primary, releases directly (no sheet); no Call patient |
| K5 | Release → Home | app-logic §4 says a successful Release returns to Home (text only) |

### New and changed calling states (CW-D2, E2, E3, F1)
| # | Change | Pass when |
|---|---|---|
| K6 | 7d for Pilot — new state `s7d-result-missing-pilot` | Bar **Confirm & forward** · Callback + Unavailable (no Skip HA); same notice and page as `s7d-result-missing` |
| K7 | 17 while the call is live | `t17-skip-ha-wait` shows grey "Health Advisor call will be skipped." + status line **"Calling {name}…"**; script visible; no Callback. app-logic row 17: "Calling…" until the hang-up → "Getting call result…" → Confirm prescription on the result |
| K8 | 15 while live / after hang-up | `t15-ha-no-join`: card unchanged; bar = status line **"Waiting for the call to end…"** only (new key, e.g. `call.waitingForHangup`). New state `t15-after-hangup`: same card, bar **Request next case** · Back to Home |
| K9 | B3 same as 15 | `g3b-forwarded`: bar = "Waiting for the call to end…"; new state `g3b-after-hangup` with Request next case · Back to Home |
| K10 | Retire 15b | `t15b-end-call-first` removed from `ui-screens/`, state lists, README, REVIEW, storyboard and the guards' lists; key used only by 15b retired (keep it if any other state still uses it — report which) |
| K11 | B1 bar | `g1-generic-confirm`: status line before the gate (if drawn), then **Confirm prescription · Skip HA**; no Callback |

### Text only — `ui-screens/app-logic.md`, `docs/feedback-state-map.md`, `ui-screens/README.md`
| # | Change | Pass when |
|---|---|---|
| T1 | §4 stage table and Leaving-a-case | Calling / Transfer ready / Valid rows match K1; Release → Home; empty case per K4; 7e row = Back in **1, 3, 4** only; the broken parenthesis / double full stop fixed |
| T2 | §5 rules | Callback only on 6 / 7d; backend refuses a callback without leg 2 answered (CW-A1); **3 / 4 doctor-side only, anything patient-side → 9, whenever detected** (CW-B1); 5 only after a known hang-up — Ozonetel yes, Knowlarity no (CW-C2); 7b only when the call can't be known ended, else timeout → 7c (CW-D1); 7d bar by route (CW-D2); 7f: record under the gate / no answer / no record after a wait → not confirmed, back through hold and retry, no Ops review queue (CW-D3, D4); 15 = transfer couldn't start, HA not picking up → 14 (CW-E1); 15 / B3 buttons after the hang-up (CW-E3); a forward (15, B3) confirmed only on the partner's result (CW-F2) |
| T3 | §5 state table rows | 2, 5, 7b, 7d (+ Pilot), 7e, 7f, 8a, 8b, 11, 12, 15, 15b (retired), 17, B1, B3 match T2 and K1–K11 |
| T4 | §5 Fallback B | **B is the launch Pilot flow; A (11 / 12 route-labelled) is the later version** (CW-F1); B1 call ending after the gate → 16 (CW-F3) |
| T5 | §6 and §7 | §6 transfer-vs-forward per CW-E1 / F2, 7d note; §7 Callback availability (6, 7d; 7d judged by the record, CW-A2); Patient unavailable = **hold, retried by the system by hangup cause, invalid number not retried** (CW-B2); Flag 6 wording aligned |
| T6 | State map and README | Rows for K3, K8, K9, K6 added; 15b row retired; README index lists the new states and drops 15b |
| T7 | Review aids | Contact sheets, `REVIEW.html`, calling storyboard rebuilt with `_qa/` scripts; calling walkthrough page regenerated from the current `ui-screens/` pictures (new copy under this round's folder; old page left as history) |

## 2. Gates (same as the fix round)
| Gate | What | Pass when |
|---|---|---|
| G0 | Precondition | Fix-round brief contains `## DONE` **and** `git status --short` shows nothing uncommitted under `ui-screens/`, `app-logic.md`, `messages.json`, `feedback-state-map.md`, `design-system/` (Round 6 merged). Otherwise stop before changing anything |
| G1 | Every K / T item | Its "pass when" holds, checked at full size at 390 **and** 360 |
| G2 | Pixel comparison against `before/` | Only pictures on the **expected list** (written before rendering) differ; everything else identical |
| G3 | Four guards (`check-locked-specs.py`, `check-sources.mjs`, `docs/layout_check.py` incl. the 360×640 small-phone pass, `brand/check_lockup.py`) | 0 failures; new states covered; counts reported |
| G4 | Copy | New keys only through `messages.json` → `build-messages.mjs`; curly apostrophes; native copy regenerated |
| G5 | Determinism | Second render identical; 0 page errors |
| G6 | Out of scope | `git diff --stat` shows only files named here |
| G7 | Regression | All earlier decisions and fix-round items still pass on every changed state; conflict → the standing rule wins, change left out, listed under NEEDS-APURVA |

## 3. Out of scope — do not touch
Decision log, backlog, open questions, project truth, `docs/reviews/**` (incl. the CW review file), the design system (no component change is needed — status line, notice and action bar already exist), the old prototype (`index.html`, `app.js`, `styles.css`), any state not named in §1. No commit, push or PR.

## 4. Needs Apurva (don't decide — report)
- **CW-F3 copy:** 16's doctor line in B ("…stay on the line until the Health Advisor joins…") — propose a wording for B; leave the current text.
- Anything §1 doesn't settle.

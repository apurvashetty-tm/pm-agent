# Layout v2 — final review of phases A–C and phase D decisions (2026-10-14)

Reviewer: Claude (this chat), from the round renders on disk. Status: **DECIDED 2026-10-14** — recorded as D-47 (A–C), D-48 (leaving a case) and D-49 (case header). All ★ recommendations below accepted except phase D, which was reworked in discussion — see the outcome at the end.
Sources: `docs/renders/2026-10-14-layout-v2/A/round-4/`, `B/round-3/`, `C/round-3-fix/`, `B|C/NEEDS-APURVA.md`, `index.html`.

## Global
| # | Finding | Recommendation |
|---|---|---|
| G1 | Titles break with one word alone on the last line ("Skip the OTP next / time"). | Balanced wrapping on all L1 titles, centrally. Lock as **L8**. |
| G2 | Title punctuation is mixed: "Consult on your schedule." · "You're available for consultations" · "Ending availability." | No full stop at the end of any title (incl. "Welcome, Doctor", "Hello, Dr. Apurva"). |
| G3 | OTP error/helper text is left-aligned under the centred code boxes (Apurva). | Helper/error aligns with its field: left under full-width fields, centred under the OTP boxes. Lock as **L7**. |

## Phase A — sign-in, OTP
All locked specs L1–L6 hold in round 4; guard passes; Codex: no blockers. Only G1–G3 apply.

## Phase B — faster sign-in offer, returning unlock
| # | Finding | Recommendation |
|---|---|---|
| B1 | Offer screen has a Back (built as "same as Not now"). It appears right after sign-in; going back to OTP makes no sense. | **No Back.** "Not now" is the exit; the phone's back gesture = Not now. |
| B2 | Returning unlock has a Back to sign-in. It's the first screen when the app opens — nothing to go back to. | **No Back.** "Not you? Switch account" already leads to sign-in. |
| B3 | Unlock title is the greeting "Hello, Dr. Apurva". | Keep. |
| B4 | Offer copy is draft. | Approve as is (title wrap fixed by G1). |
| B5 | Offer's three bullet icons are brand blue. RULES: blue = action/selection. | Neutral grey icons; keep the blue hero tile. |
| B6 | Unlock unavailable: notice says "…Use OTP instead." directly above a "Use OTP instead" button (duplicate). | Notice: "Faster sign-in isn't available on this phone right now." |
| B7 | Enabling: brand busy primary, "Not now" disabled. | Keep. |

## Phase C — Home
| # | Finding | Recommendation |
|---|---|---|
| C1 | **Bug:** "Minimum 15 minutes" is cut off / hidden under the notice on setup-failed, idle-expired and manually-ended. | Blocker. Content scrolls, never clips; helper sits fully visible above the notice. Add to the guard. |
| C2 | "Time remaining" value at 16px reads weak — it's the main thing on Home; the active screen looks empty. | Treat it like the OTP digits: a **value display component**, not screen text. 32/40 semibold, fixed-width digits. Lock as **L9**. |
| C3 | Stop-pending shows "Time remaining 0:00" while the doctor is ending early — reads as if time ran out. | Hide the time row on stop-pending. (Expired-pending's 0:00 is correct; keep.) |
| C4 | No spinner on the quiet "Ending…" action. | Keep (the notice explains; quiet actions don't get spinners). |
| C5 | Proposed copy (registry "proposed"). | noCases: "No cases right now. Try again in a minute." · stopPending: "Finishing your last request. Availability ends after that." · expiredPending: "Availability has ended. Your last request is still active." · unknownResult: "Checking whether your case request went through…" · idleExpired, manuallyEnded: approve as is. |
| C6 | Hero gap built with negative margins on the icon buttons. | Fine (measured 48). No decision. |
| C7 | Round-3 fixes weren't re-checked by Codex (cap). | The final pass includes one Codex check. |

## Phase D — case page (index.html)
Facts: the case page is the order screen in `index.html` (patient block, Medicines to prescribe, Notes & symptoms, Call). It shares the old app header (logo + profile). `index.html`'s Home section is the *old* minimal Home; the new Home (phase C) replaces it when the prototype is integrated — not in this loop.

| # | Question | Recommendation |
|---|---|---|
| D1 | Header type | Task header, no logo (D-42). |
| D2 | Where Back goes | **No Back.** A case can't be abandoned mid-flow (locked consultation flow, valid-call gate). The doctor leaves only through the flow's end actions; the phone's back gesture must not drop a case either. |
| D3 | Title | The **patient's name**, with age/gender and the order line under it, as one sticky header. It does the job of the D-07 compact strip, so the strip goes (same no-jump rule). This changes D-07. |
| D4 | Profile button | Off the case page (logout is already blocked during an order, D-32). |
| D5 | How | Concept first: render the header at top, scrolled and during a call for Apurva's look, then build. Header + type/spacing only; no consultation logic, CTAs or flow changes. |

## Outcome (Apurva, 2026-10-14)
- G1–G3, B1–B7, C1–C7: accepted as recommended → **D-47**. C3: remove the time row on stop-pending; C4: no spinner on the quiet "Ending…".
- Phase D reworked in discussion:
  - **Back** on the case page instead of a separate "Release" button. Back before the first attempted call → "Leave this case?" sheet → release → Home; blocked (Back hidden, neutral message on the phone's back gesture) from the first attempted call until the case is closed; after closing → Home. End of case: "Request next case" + "Back to Home" (only "Back to Home" if availability ended). Reopen into an open case. → **D-48**
  - Release is a backend dependency → OQ-024; restoring an open case → OQ-025.
  - Wording: **"case", not "order"** → D-48; data fields and locked CTAs → OQ-026, then decided → **D-50** (order ID line stays; "Confirm prescription" / "Confirm & transfer" / "Confirm & forward" / "Skip HA call"; four paths tracked separately).
  - **Blue tint continues** on the case page as a compact sticky header (patient name 20/28, meta line, Help) → **D-49**; D-07 strip retired; D-33 plain-white rule replaced.

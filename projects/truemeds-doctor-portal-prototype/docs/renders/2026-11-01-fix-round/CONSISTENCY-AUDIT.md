# Consistency audit — alignment, gaps, sibling screens (2026-11-02)

Two independent agents measured all current screens (sign-in → Home: 70 pictures; case + Prescribe: 83) for the kind of miss you found on OTP. Already-known items (31 Oct audit, backlog, Round 3 changes) are excluded. Claude checked the claims against the decision log and added a recommendation to each question.

**Totals:** 52 findings — 32 bugs, 15 questions, 5 no change.

**Proposal:** all bugs plus the recommended answers below go into **one Round 4** together with the centred OTP terms line and the pinned action bar on Home. One render, one before/after for you.

---

## 1. Things that move under the thumb (highest priority)
- **A-03 · bug** — OTP: when "Resend in 0:30" turns into the **Resend code** link, the terms line and **Verify & sign in** drop 28 pt (the link has a 48 pt tap area, the waiting text doesn't). → Give the waiting text the same height.
- **A-09 · bug** — Home: when **+ Add time** appears (near expiry), "Time remaining" and the timer drop 14–28 pt. → Keep them fixed; Add time sits on the value row.
- **B-01 · question** — "Transferring…" jumps 64 pt because Callback/Skip HA disappear; "Confirming…" keeps a greyed Callback row and doesn't move. → **Recommend:** keep the secondary row, greyed out, in both busy states (the decision "no Callback in 13" is still met — it's not offered, only kept in place).
- **B-02 · question** — tapping "Call ended" (7b → 7c) or Confirm in fallback B (g1 → g2) collapses the bar; the status line jumps ~63 pt. → **Recommend:** the bar keeps its height; the status line takes the row the buttons were on.
- **B-03 · bug** — the End-of-call script card has 28 pt bottom padding during the call and 16 pt after, so the medicines move 12 pt when Confirm & transfer appears. → 16 everywhere.

## 2. Same element, different look or place
- **A-05 · bug** — header-to-white-panel spacing differs on sign-in / OTP / offer / unlock / Home (25–34 pt). → One hero-bottom and panel-top padding.
- **A-06 · bug** — screen-lock offer: the subtitle wraps and pushes the tile 20 pt lower (breaks "same tile, same place"). → One-line subtitle, e.g. "Use your screen lock instead of an OTP."
- **A-07 · bug** — the "truemeds for doctors" logo is drawn at two sizes (174 vs 149 pt wide; Home smaller) and two top offsets (sign-in 24, others 16). → One size and one offset everywhere. *(RULES sets the header logo at 130×31 for the plain logo; the lockup needs one size recorded.)*
- **A-08 · bug** — spinner-to-label gap: 8–9 pt on "Turning on…" / "Unlocking…", 16–17 pt on the other busy buttons. → Fix centrally.
- **A-10 · bug** — Home: "Prescriptions today" label is 16 px, "Time remaining" 14 px in the same panel. → Both 14 px grey.
- **A-15 · bug** — the number pad is drawn two ways (sign-in grey keys vs OTP white keys). → One drawing.
- **A-16 · bug** — "Truemeds? Sign up" / "it? Resend code" / "you? Switch account": three different gaps before the link. → A normal word space.
- **B-07 · bug** — back / ✕ icons and titles sit at four distances from the edge (case header, Prescribe, Rx viewer, sheets). → One rule: 48 pt target starting at the 16 margin, everywhere.
- **B-08 · bug** — single-row dose grids use wider chips (69.5 pt) than the M/A/N grid (66.5 pt); D-55 says every option grid uses the M/A/N width. → Fix the single-row grids.
- **B-10 · bug** — "(optional)" is grey on Food but dark semibold on Additional instructions. → One style (grey regular).
- **B-11 · bug** — "Dose (ml)", "Dose (puffs)" but "Dose in units". → "Dose (units)".
- **B-14 · bug** — reason sheets' "Select reason" label is grey with 0 pt gap; Callback sheet's "Date"/"Time" are dark with 8 pt. → One sheet-label style.
- **A-20 · question** — group labels: Profile "Today's earnings" 14 px, Home "Adjust duration" 16 px. → **Recommend:** 16 px semibold (same as card titles).
- **A-21 · question** — "New code sent." has a ✓ icon; the error lines in the same slot have none. → **Recommend:** no icon (green text only), like the errors.
- **B-22 · question** — callback-scheduled and patient-unavailable cards use ⓘ (which elsewhere means "more info"). → **Recommend:** calendar for callback, phone-off for unavailable — same icons as their buttons.

## 3. Gaps (spacing)
- **A-12 · bug** — Add-time sheet error: different gaps from the page version. → Same gaps (notice 16 above the button).
- **A-13 · bug** — Profile: 12 pt between cards, 20 pt to Log out (allowed: 8 / 16 / 32). → 16 and 16.
- **B-04 · bug** — outcome card: 12 above, 20 below. → Same both sides.
- **B-19 · bug** — Rx failed notice 5 pt under the header (elsewhere 16). → 16.
- **B-05 · question** — **every card gap on the case page and Prescribe is 12 pt**, which isn't one of the three allowed gaps and isn't decided anywhere. → **Recommend: 16** — the design team's 16 standard everywhere (margin, padding, gaps). Changes the spacing on every case/Prescribe picture slightly; the render is automatic anyway.
- **A-14 · question** — a notice sits 9 pt under the sign-in field but 17 pt under the OTP boxes. → **Recommend:** 8 on both (it's the input's result, tight to it).

## 4. Wrapping
- **A-02 · bug** — OTP terms line splits "Terms & / Conditions". → Keep the link on one line (with the centring).
- **A-17 · bug** — "…or call / Doctor Ops", "…in / 9:42" split across lines. → Keep link and timer together.
- **B-12 · bug** — "On prescription" band leaves "months" alone ("6 / months"). → Keep number + unit together.
- **B-13 · bug** — long medicine titles leave one word alone ("…Suspension / 10ml"). → Balanced wrap.
- **B-15 · bug** — Skip HA reason "Repeat patient, familiar with the / medicines" — app-logic says "Repeat patient — familiar with medicines" (one line). → Use the app-logic wording.
- **B-20 · bug** — "Your time / is kept." orphan. → Rebalance.
- **A-22 · question** — notices end with a short second line in several places. → **Recommend:** balanced wrap for notice text, set centrally.
- **B-21 · question** — back-blocked toast breaks mid-sentence. → **Recommend:** break between the two sentences.

## 5. Alignment
- **A-01 · bug** — OTP terms line left-aligned in a centred panel (your find). → Centre it.
- **A-11 · bug** — Home "Checking…" status line is left-aligned and wraps; on the case page the same component is centred on one line. → Centre it in the button's slot.
- **B-17 · question** — empty case: card title left, message centred and bold. → **Recommend:** left-aligned, normal 14 px, like other text inside cards.
- **B-16 · question** — when Order details is hidden, View Rx sits alone on the right of an empty card. → **Recommend:** left-align it.
- **B-24 · question** — M / A / N letters are centred in their column, not on the "Dose" label's edge. → **Recommend:** left-align to the label edge.
- **A-18 · question** — offer: centred hero tile over left-aligned reassurance rows. → **Recommend: no change** — a centred hero over a list is the standard pattern, and the tile matches unlock (D-61).

## 6. Other
- **B-06 · bug** — two-line patient name squeezes the header's gaps. → Header grows taller instead.
- **B-09 · bug** — duration picker: chips touch the field edge; no gap between number and unit rows. → Same inset as the field text; 8 pt between rows.
- **B-18 · bug** — free-text fields are drawn with a number pad (and "abc" typed into a number pad). → Text keyboard for notes; Other dose keeps the number pad with a decimal key, and its error shows a realistic mistake.
- **A-04 · question** — OTP subtitle (number + Change) is larger and further from the title than on sibling headers. → **Recommend:** same size and gap as siblings; the number stays semibold.
- **A-19 · question** — where notices appear differs between entry screens. → **Recommend:** write the rule as it is — an action's result sits next to the control; a standing state sits at the top of the panel. No picture change.
- **B-23 · question** — SOS card looks like a bigger top gap (it's the 48 pt toggle row). → **Recommend: no change.**
- **B-25 · question** — "Order details" title is regular, other card titles semibold. → **Recommend: no change** — it's a tappable row, not a card title; record it.

## 7. Raised by you
- **Pinned action bar on Home** (and offer / unlock?) — Set availability and Request a case sit at the bottom without the tray used on the case page and Prescribe. → **Recommend:** every pinned main action sits in the action bar — Home, offer and unlock.
- **OTP terms line** — centred (A-01, A-02).

## No change (recorded)
A-23 notices are full width under the boxes (D-44) · A-24 logo→title gap differs on home-base vs task screens (L6) · A-25 sheet title→content gap comes from the 48 pt ✕ · B-26 header text moves left when Back hides (§8.5) · B-27 tags move right when the chevron goes (§9.3).

# Decision log — Truemeds Doctor Portal prototype

Why the prototype looks and behaves the way it does. Each entry records what was decided, why, what was
considered and rejected, and where it lives. Decisions were taken with Apurva (Product) in working sessions;
the reasoning is kept so nobody re-opens a settled question without new information.

**How to use this file**
- Read it before changing any screen it covers. If you disagree with an entry, raise it — don't silently undo it.
- When a decision changes, **edit the entry** (mark what replaced it and why). Don't leave wrong guidance behind.
- `session_handoff.md` says what is built right now; `open_questions.md` holds what is still undecided.

---

## Layout and brand

### D-01 · Desktop shows the app as a 9:16 phone frame — 2026-10-07
- **Decision:** At 768px and wider, the app sits in a centred phone-shaped frame with one scroll area. Bottom
  sheets, the Rx viewer, the Prescribe screen and toasts open inside the frame. Below 768px the app is the screen.
- **Why:** The earlier desktop layout (narrow column + side panel) felt cramped, lost natural scrolling, and bottom
  sheets kept mis-aligning — the same bug was fixed several times.
- **Rejected:** a wide desktop page; sheets turned into centred dialogs on desktop.
- **Where:** `design-system/RULES.md` §7 (applies to every phone prototype); `docs/layout_check.py` must pass.

### D-02 · Logo: the approved "truemeds for doctors" lockup, kept in the project — 2026-10-07
- **Decision:** The header shows the lockup (original Truemeds logo + lowercase "for doctors"). It lives in
  `brand/`, not in the design system. The original Truemeds logo and icon stay untouched in `design-system/logo/`.
- **Why:** The lockup is specific to this product; the design system holds only what every project shares.
  The separate "Doctor Portal" text in the header was dropped because the lockup already says it.
- **Rejected:** a custom icon + doctor badge; keeping the lockup in the design system.
- **Where:** `brand/check_lockup.py` checks the lockup still embeds the original logo unchanged.

### D-03 · Medicine-form icons — 2026-10-07
- **Decision:** Tablet = round, scored circle. Capsule = diagonal pill.
- **Why:** Tablets and capsules looked the same in the list.
- **Rejected:** a horizontal capsule (read as another tablet).

---

## Medicine list (case page)

### D-04 · Quantity: the doctor never sets it — 2026-10-07
- **Decision:** No quantity on the Prescribe screen, editable or read-only. The medicine row shows the
  customer's **cart** quantity, read-only, and doctor edits never change it.
- **Why:** Two quantities exist. The cart quantity is the customer's; the prescription quantity is the
  backend's job. The backend pre-fills frequency and duration for the configured maximum (Ongoing = 6 months),
  stores the quantity, and recalculates it if the doctor changes frequency or duration.
- **Rejected:** a quantity stepper; a read-only "Qty 60 (auto)" (noise the doctor can't act on).
- **Open:** OQ-014 — does the prescription quantity count packs or doses for syrups, injections and creams?

### D-05 · No line-item price on the medicine row — 2026-10-07
- **Decision:** Price is removed from each medicine row. The **order value** stays (patient block and compact strip).
- **Why:** A ₹ figure beside each medicine invites cost-based clinical choices and can look like selling.
- **Rejected:** keeping price on the row (even in grey); listing item prices inside the order-details (ⓘ) panel.
- **Later:** a per-medicine detail view (eye icon on the row) showing price and product image — OQ-015, not designed.

### D-06 · The doctor cannot add medicines — 2026-10-07
- **Decision:** "Add medicine" (button, sheet, logic) is removed. The doctor can prescribe or disable what is in the order.

### D-07 · Sticky header and compact patient strip — 2026-10-08
- **Decision:** The app header always stays on top. Once the patient block scrolls away, a compact strip (name,
  age/gender, order, order value, View Rx) appears under it. The strip overlays the content; it is never inserted
  into the page.
- **Why:** Inserting it changed the header height and made the page jump 50–70px on phones (header looked
  "half closing" when scrolling up).
- **Where:** `layout_check.py` fails on any scroll jump.

### D-08 · The case page stops scrolling after the last action — 2026-10-08
- **Decision:** 32px of space below the last block (same as the Prescribe screen). Extra room appears only while
  the "Order Confirmed" bar is showing.
- **Why:** A permanent 144px gap let the page keep scrolling into empty space.

### D-09 · View Rx is the customer's source material — 2026-10-08
- **Decision:** View Rx shows each medicine exactly as the customer's prescription had it; doctor edits never change it.

---

## Prescribe screen (opening a medicine)

### D-10 · A full-screen view, not a bottom sheet — 2026-10-07
- **Decision:** Opens full screen over the case (like the Rx viewer), one scroll area, Prescribe at the **end** of
  the content (not pinned).
- **Why:** A long form inside a bottom sheet means two scroll areas, accidental dismissal (losing edits) and no
  proper header. Prescribe is not pinned so the doctor scrolls past every section before confirming.

### D-11 · Every section open with backend defaults; no collapsed summary — 2026-10-07
- **Decision:** All sections are visible and pre-filled; the doctor reads through them and changes what's wrong.
- **Why:** Apurva wants the doctor to see every field before prescribing.
- **Rejected:** a one-tap summary card ("1-0-1 daily · Change").

### D-12 · Header: medicine name, form under it, Disable on the right, cross to close — 2026-10-07 / 08
- **Decision:** Title = medicine name; grey line under it = **form only** ("Tablet"). Small red "Disable" in the
  header. A **cross** closes the screen.
- **Why:** Form explains the dose and identifies medicines whose names don't say it (e.g. "Metformin 500mg").
  "Prescribe" under the name was redundant. Disable is a different decision from prescribing, made first, so it
  sits away from the Prescribe button (one main action per screen). A cross means "close this task without
  saving"; a back arrow would wrongly suggest edits are kept.
- **Rejected:** "Tablet · Prescribe" subtitle; a coloured form tag (colour is only for status); full-width Disable
  beside Prescribe; a back arrow.

### D-13 · "Prints as" line at the top — 2026-10-07
- **Decision:** One line showing exactly what will print, updating live.
- **Ongoing:** shown on screen as "Ongoing (6 months)"; the print shows the **period** ("6 months"). Confirmed with
  the medical team. The period is the backend's configured default (per medicine if that ever differs).

### D-14 · How often — 2026-10-07
- **Decision:** Daily · Every X hours (4 / 6 / 8 / 12, round the clock) · Alt days · Weekly · Monthly · SOS only.
- **Why:** Covers more than three doses a day without a fourth slot. Round the clock is the default meaning of
  "every X hours"; exceptions go in the note.

### D-15 · Dose — 2026-10-07 / 08
- **Decision:** One heading, "Dose", for every schedule. Daily shows three rows, **M / A / N** (no evening slot).
  The unit appears only when the form doesn't already say it: syrups "Dose (ml)", inhalers "Dose (puffs)";
  tablets, capsules, drops and injections just "Dose". Creams: "Apply" / "—". Syrup "Other" = a number in ml;
  injection "Other" = units.
- **Why:** Doctors read M / A / N and 1-0-1 every day. The form under the name and the unit are different facts
  (what the medicine is vs. what the numbers count) and only repeat for tablets/capsules/drops — so the unit is
  shown only where it adds information.
- **Rejected:** "Morning · Afternoon · Night (tablets)" heading; full words in the rows; a fourth (evening) slot,
  and evening placed last (prints out of time order, e.g. 1-0-1-1 — a misreading risk); "Schedule" as the heading
  (that's "How often").
- **Tapers and changing doses:** go in Additional instructions; quantity falls back to the backend default.

### D-16 · SOS — 2026-10-07 / 08
- **Decision:** "Also as needed (SOS)" switch under the regular schedule, explained in place ("Extra doses only
  when needed, on top of the schedule above"). When on: its own **Dose** and **Max extra doses a day** (1–4).
  Prints "1-0-1 + SOS 1 tablet (max 2/day)". "SOS only" (no regular schedule) asks Dose and **Max doses a day**.
- **Why:** Regular + SOS is common (e.g. paracetamol). Dose and a daily cap keep quantity calculable.

### D-17 · Duration — 2026-10-07 / 08
- **Decision:** A dropdown-style field (same border as the other fields) showing the value — "Ongoing (6 months)"
  with "Default", or "Changed from default" — and a chevron. Tapping anywhere opens the picker in place:
  numbers 1–7, 10, 14, 15 and Days / Weeks / Months / Ongoing. Tapping the same row closes it. Always has a value.
- **Why:** Most medicines keep the default, so it stays compact. Number + unit covers almost every duration
  without a custom entry. The dropdown look says "editable"; whether it *needs* changing is a clinical call the
  UI makes visible (bold value, "Default" label, Prints as) rather than forcing.
- **Rejected:** a long quick-pick list + Custom; a stepper or keyboard entry; "until next review" (not relevant to
  an e-pharmacy prescription); an underlined "Change" link; a "Change" button inside a tappable card (mixed signal);
  a "confirm duration" prompt (would become a reflex tap).

### D-18 · Food — 2026-10-07 / 08
- **Decision:** After food · Before food · Empty stomach, on one row. Shown for **every** form, optional,
  single-select (tap again to clear), **no default**, printed only if chosen. Label: "Food (optional)".
- **Why:** A rule hiding it by form would be clinically wrong (insulin needs it). A default would print "After food"
  on medicines meant for an empty stomach. Advice data is not used anywhere else, so other advice chips were dropped.
- **Rejected:** multi-select advice chips; hiding by form; "(optional, pick one)".

### D-19 · Additional instructions — 2026-10-07
- **Decision:** Optional free text, printed. Holds tapers, varying doses, "shake well", "rinse mouth", "stop if rash".
- **Why:** Structured fields drive quantity; free text alone can't be calculated and is easy to misread.

### D-20 · Errors and closing — 2026-10-07 / 08
- **Decision:** Required choices always keep a value, so only two errors exist, shown in place when Prescribe is
  tapped: no dose at all (0-0-0) and an empty "Other" amount. Closing after edits asks "Discard changes?"
  (Discard / Keep editing); closing without edits is instant. Tab stays inside the screen; choice groups are
  labelled for screen readers. A disabled medicine shows "Disabled: reason. Prescribing it will enable it again."
- **Rejected:** pop-up error messages; a confirmation on every close.

---

## Design system changes made for this work

### D-21 · Toggle fix and a large chip size — 2026-10-07
- **Decision:** Fixed a design-system bug (a checked toggle inside a label stayed grey). Added `.tm-chip--lg`
  ([PROPOSED], about 46px tall) for choices tapped during a call.
- **Why:** The standard chip is a compact filter chip, too small as a main tap target.

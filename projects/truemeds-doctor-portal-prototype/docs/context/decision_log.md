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

### D-10 · A full-screen view, not a bottom sheet — 2026-10-07 (button placement revised 2026-10-08, see D-22)
- **Decision:** Opens full screen over the case (like the Rx viewer), one scroll area, laid out like the case page:
  grey background, one white card per block (Schedule · SOS · Duration · Food · Additional instructions).
- **Why:** A long form inside a bottom sheet means two scroll areas, accidental dismissal (losing edits) and no
  proper header. Cards match the case page and make each block easy to find while scrolling.
- **Superseded:** "Prescribe at the end, not pinned, so the doctor scrolls past every section" — replaced by D-22.

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

### D-13 · "Prints as" line at the top — 2026-10-07 (revised by D-25: now "On prescription", pinned under the app bar)
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

### D-22 · Main action pinned to the bottom, always active — 2026-10-08
- **Decision:** The one main action sits in a bottom bar on both screens: the case page (Call Patient → Calling… /
  End Call / Call Again → Confirm Order / Transfer / Forward) and the Prescribe screen (Prescribe). Always active.
  Status, briefing script and secondary actions (Schedule Callback, Skip HA) stay in the action card. The bar
  hides when there is nothing to do (case completed / unavailable) and steps aside while typing on a phone.
- **Why:** A button that simply ends where the content ends looks out of place and moves around; a pinned bar is the
  standard mobile pattern (`.tm-actionbar`) and keeps the main action in thumb reach. Verification before Prescribe
  comes from the "On prescription" line pinned under the app bar (D-25), which shows the whole prescription in one line.
- **Rejected:** pinned but greyed out until the doctor scrolls to the bottom — forcing a scroll doesn't make anyone
  read; a disabled button with no reason confuses mid-call; the scroll rule breaks whenever content height changes
  (duration open, errors, SOS, rotation, keyboard, tall phones) and fails keyboard/screen-reader users.
- **Also rejected:** drawing the phone's back / home / recent buttons in the prototype — real phones already show
  their own, fake buttons get tapped, and the 9:16 frame already reads as a phone.

### D-23 · UI audit fixes — 2026-10-08
Own audit of both screens against the design system; Apurva asked to fix everything except the tablet icon (#11, her call).
- **Sheets:** one template everywhere — title + grey cross (close) on the right, no drag handle; optional grey subtitle;
  labels use `tm-field__label`. Discard sheet: Keep editing first, Discard (red) second. Skip HA sheet gets a
  "Select reason" subtitle. Customer-unavailable sheet uses the same template (no big icon).
- **Callback chips:** an even grid (2 columns for dates, 3 for times) with `tm-chip--lg`, so rows don't wrap ragged.
- **Action card:** titled "Call" like the other section titles; the "Post-call action" label is gone. Schedule
  Callback / Skip HA are full-width small secondary buttons, stacked.
- **Closed states:** after Unavailable, Callback or a completed action, the card shows one plain notice
  ("Patient unavailable — case returned to the queue." / "Callback scheduled — …") instead of an empty card.
  Unavailable also pins **Next Order** in the bottom bar (revises D-22, which hid the bar there) so the doctor
  always has a way forward.
- **Patient line:** age and gender only.
- **Disabled medicine row:** only the icon and text fade; the row's own actions stay full strength.
- **Toasts:** one line, short text ("Call ended before 50s", "HA call skipped", …); long text is cut with "…".
- **Prescribe:** labels use `tm-field__label`; SOS "Max doses a day" puts the label above its chips like every other
  field; long medicine names stay on one line in the app bar; text boxes can't be resized by dragging.
- **Rx viewer:** controls use the new on-dark button so they read on the dark surface.
- **Why:** each was a one-off style next to a design-system one, or a state that left the doctor with nothing to do.

### D-25 · "On prescription" line pinned under the app bar — 2026-10-08
- **Problem it solves:** with Prescribe always active (D-22), this line is the doctor's only check of what the patient
  will get. It has two jobs: show the effect of every tap while editing, and be the last thing read before Prescribe.
  As a card at the top of the scroll it disappeared as soon as the doctor scrolled to the fields they were changing,
  and it was styled like a hint (small grey label, regular text).
- **Decision:**
  - **Pinned:** joined to the app bar as one header block (one shadow under both), so it never scrolls away. The
    medicine name above it and the line below read like the entry on the prescription itself.
  - **Name:** "On prescription" (with the Rx icon) instead of "Prints as". The patient mostly gets the prescription
    in the app, not on paper, and "On prescription" says whose document this is.
  - **Visibility:** the line is the strongest text on the screen (16px semibold, dark) on a light brand-blue band;
    the label is small and blue. It briefly turns a deeper blue when the text changes, so a tap lower down is visibly
    reflected (no animation with reduced motion).
  - **Length:** wraps in full; only a long "Additional instructions" text is cut at 3 lines, since the doctor is
    looking at that text in its own box.
- **Rejected:** pinning it above Prescribe at the bottom — on a phone the bottom bar steps aside while typing, so the
  line would vanish exactly when the doctor types instructions that print; it also stacks two bands in the thumb zone.
  Keeping it as a scrolling card — fails the "see the effect while editing" job.

### D-26 · Call didn't connect; no call timer for the doctor — 2026-10-08
- **Decision:** After "didn't pick up" or "call didn't connect", closing the sheet (cross or tap outside) is allowed and
  loses nothing: the Call card says what happened, keeps **Mark as Unavailable**, and the pinned button reads
  **Call Again**. The end-of-call script is hidden until the doctor calls again. The sheet title no longer says
  "Webhook timed out" (system language) — it says "Call didn't connect".
- **Decision:** No call timer anywhere in the doctor's view (removed from the patient strip). The 50s rule still runs in
  the background and unlocks the actions; the timer stays only in the demo controls.
- **Rejected:** making the sheet impossible to close — it blocks the doctor from checking the case before deciding.
- **Kept:** the card title stays "Call" (not "Call actions"): the card holds the call's status and script as well as
  actions, and the main action now sits in the pinned bar outside the card.

## Design system changes made for this work

### D-21 · Toggle fix and a large chip size — 2026-10-07
- **Decision:** Fixed a design-system bug (a checked toggle inside a label stayed grey). Added `.tm-chip--lg`
  ([PROPOSED], about 46px tall) for choices tapped during a call.
- **Why:** The standard chip is a compact filter chip, too small as a main tap target.

### D-24 · Quiet and on-dark buttons [PROPOSED] — 2026-10-08
- **Decision:** Added `.tm-btn--quiet` (grey, no fill — app-bar and sheet close) and `.tm-btn--on-dark` (light, no
  fill — controls on dark surfaces such as the Rx viewer). Both [PROPOSED] in `design-system/src/components.css`.
- **Why:** the existing ghost button is brand blue, which made a close cross look like the main action; and nothing
  existed for white controls on a dark background.

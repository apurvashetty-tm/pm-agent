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
> **2026-10-14: strip retired by D-49** (the compact tinted case header carries the patient identity). The no-jump rule below still holds.
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

### D-22 · Main action pinned to the bottom, always active — 2026-10-08 (extended by D-28: secondary actions pinned too)
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

### D-27 · No black toasts — 2026-10-08
- **Decision (Apurva):** the small black pop-up messages are gone everywhere; they don't exist in the real app. Each
  outcome now shows where it happens:
  - call ended before 50s → a note in the Call card ("call again or schedule a callback");
  - Schedule Callback without a date/time → red text in the sheet, naming what is missing;
  - prescribed / disabled → the row's tag; HA skipped → Skip HA disappears and the button becomes Confirm Order;
  - 50s passed → the pinned button changes; demo fast-forward and "Logout" say nothing.
- **Kept:** the white confirmation card with Next Order after a completed case.
- Overrides the "toast system must not change" line in `session_handoff.md` §3 (explicit instruction).

### D-28 · Every call action pinned; the page never scrolls by itself — 2026-10-08
- **Problem:** only the main button was pinned (D-22). Schedule Callback, Skip HA and Mark as Unavailable sat in the
  Call card, the last card on the page, so they were off-screen whenever the doctor was at Medicines or Notes. An
  auto-scroll to the card patched this in one moment only (50s passed), so the page sometimes jumped and sometimes didn't.
- **Decision:** secondary call actions sit in the pinned bar, side by side above the main button (one = full width):
  during the call Schedule Callback · End Call; after 50s Schedule Callback + Skip HA · Confirm & Transfer;
  after a missed call Mark Unavailable · Call Again. The Call card keeps only status notes and the script.
  The page never scrolls by itself.
- **Script:** one small label "End-of-call script" and the quote. Dropped the second heading ("Live HA Transfer" /
  "HA Follow-up" / "Closing Script") and its icon — the script and the main button already say which case it is.
- **Trade-off accepted:** the script is no longer pulled into view at 50s; the Call card is last on the page, which is
  the natural end of the consultation, and the pinned button changing marks the moment.
- **Rejected:** auto-scrolling on every action — it yanks the doctor away from notes they are typing mid-call.

### D-29 · New medicine form icons — 2026-10-09
- **Decision (Apurva):** tablet = a tablet drawn at an angle with its score line; syrup = bottle + measuring cup;
  drops = tilted dropper bottle + drop; cream = tube; inhaler = L-shaped puffer. Capsule (`pill`) and injection
  (`vaccine`) unchanged. Drawn from Apurva's reference images, not copied; same grid and stroke as Tabler.
- **Why:** the old tablet (circle with a bar) read as "no entry"; wind lines for inhaler, a test tube for cream and a
  plain drop for eye drops were the wrong objects.
- **Rejected:** flat tablets — a circle with a full bar reads as "no entry", with a short bar as a "minus / remove"
  button, with a side edge as coins; a blister strip reads as a dice face (render 2026-10-09/02).
- **Design-system rule:** RULES.md rule 4 now says one-colour line drawings at an angle are fine; shading, gradients
  and rendered 3D are not. Open: confirm with the design team which icon set SALT uses (README says Tabler; not yet
  verified in Figma).
- Doctor research (icons vs text labels) uses these icons in version A.

### D-30 · Review fixes: dose input, Wrong strength copy, focus — 2026-10-09
From an external (ChatGPT) review, each point verified before acting.
- **Other dose:** the whole entry must be a plain positive number ("7", "7.5", ".5"). "7..5", "7abc", "7,5", "1e2",
  "0", "-2" are rejected in place ("Use numbers only, e.g. 7.5 units"); what the doctor typed is kept; nothing saves.
  Before, "7..5" silently saved 7 units.
- **Wrong strength:** hint was "Will disable and add correct one", but adding medicines was removed. Now it only
  describes the reason ("The ordered strength isn't right"). **Open:** who corrects a wrong strength, and how.
- **Focus:** after Prescribe or Disable, keyboard focus returns to that medicine's row (the list is rebuilt).
- **Not changed:** the review said the pinned Prescribe contradicts "see every section first". That rule was replaced
  by D-22 at Apurva's request; a stale code comment saying "not pinned" was corrected.

### D-31 · Doctors pull orders; "no order" lands on Home — 2026-10-09
> **2026-10-14: wording and exits updated by D-48** — "case", not "order"; "Next Order" → "Request next case"; "Back to Home" after every case; Back before the first call releases the case.
- **Fact (Apurva):** Truemeds can't assign orders to a doctor. The doctor asks for one ("Get next order" on Home,
  "Next Order" after closing an order). Supersedes the push model in `docs/proposals/2026-10-09-sign-in-shift-home.md`.
- **Decision:** a minimal **Home** is where the doctor sits when not on an order: greeting, a "Ready for your next
  order?" card, today's count, pinned **Get next order**. Asking for an order shows "Finding an order…".
  - An order is waiting → the order page opens.
  - **Nothing waiting** (from Home or from Next Order) → Home shows "No orders right now · New orders come in through
    the day" with the time last checked, and the button becomes **Check again**. Never an error, never a dead end.
- **Why:** a failed request is a normal moment (quiet hours), not an error; the doctor needs one obvious next step.
- **Open:** auto re-check every N seconds while on "No orders right now" (would feel like push without backend change);
  earnings on Home; shift capture (next step).

### D-32 · Sign in, request access, OTP, fingerprint unlock — 2026-10-09
> **Partly replaced by D-33 (sign-in screen) and `concepts/2026-10-09-otp-screen-spec.md` (OTP and faster sign-in).**
> Changed: OTP is 4 digits; sign-up opens the existing web form (no Request access, no "under review" state);
> fingerprint unlock is a passkey offered as a checkbox on the OTP screen. The code on this branch still follows D-32.
- **Sign in:** mobile number (+91) → **Get OTP** → 6-digit OTP (one input drawn as boxes, so SMS autofill works; the
  6th digit verifies by itself). Resend after 30 s, then 1 min, then 2 min; 5 wrong tries lock for 15 min with a
  "Call Doctor Ops" line. Unregistered numbers are told so and offered **Request access**; numbers under review are
  told it is being checked. (Telling a stranger whether a number is registered is accepted for a doctor-only app.)
- **Sign up = Request access,** not self-serve: name, mobile, registration number, medical council → the number is
  verified by OTP → "Request received, we'll call you within 2 working days". Ops verifies the registration against
  the medical register before the account works (Telemedicine Practice Guidelines: platforms must verify every RMP).
- **Fingerprint / face unlock:** offered once after the first OTP sign-in ("Sign in faster next time"). When on, opening
  the app shows **Welcome back** and the phone's fingerprint prompt straight away, no SMS. 3 failed tries → "Use OTP
  instead". "Not you?" forgets the account on this phone. Saves SMS cost; OTP only for a new phone, a switched account
  or a failed fingerprint. Production: WebAuthn passkey (works in mobile web and native).
- **Log out:** from the profile sheet, with a confirm; hidden while an order is open ("You can log out after this
  order is closed"). After log out with fingerprint on → Welcome back screen.
- **Prototype rules [MOCK]:** any 6 digits work; 000000 wrong; 111111 expired; numbers starting 90 aren't registered;
  9111111111 is under review. The session is kept on the device, so a refresh doesn't sign the doctor out.
  `?start=case|home|signin|…` opens a given screen (tests use `?start=case`).
- **Design system [PROPOSED]:** `.tm-otp`, `.tm-field__prefix`, `.tm-empty`; icons fingerprint, user-plus, inbox.

### D-33 · Sign-in screen final (replaces the sign-in part of D-32) — 2026-10-09
- **Screen:** Apurva's layout as is. Logo, "Welcome, Doctor.", subtitle "Your partner in thoughtful, affordable care.", Mobile number (+91), helper "We'll send you a verification code by SMS.", **Send OTP**, footer
  "New to Truemeds? Sign up" (opens the existing web sign-up form; no in-app form, no Request access).
- **Errors:** typing problems turn the field red and replace the helper line (empty, under 10 digits, first digit
  not 6–9). Problems after sending show a notice in the same spot and leave the field neutral: not registered
  (info), offline (warning), couldn't send (error), too many requests (warning + button counts down), inactive
  account (error + Call Doctor Ops). No toasts. Pasted or autofilled numbers are cleaned to 10 digits.
- **Not registered:** sign-up requests aren't stored, so one message serves new and pending doctors: "New here? Sign
  up below. Already applied? Our team will call you once you're approved." The keyboard closes on this answer so the
  footer Sign up is visible. Sign up appears once.
- **Accepted trade-off:** the screen reveals whether a number is registered; rate limiting stops bulk checking.
- **Build:** built 2026-10-12 on the draft branch (D-38); merges to `main` with the Home screens.
- **Look:** blue top (brand subtle) with logo and heading, white panel with rounded top for the form, shared with
  the OTP and Welcome back screens. ~~Work screens (the order page) stay plain white.~~ Replaced 2026-10-14 by D-49 (compact tinted case header); logo only on home-base screens (D-42).
- Final renders: `renders/2026-10-09/28`–`29`. Detail: `concepts/2026-10-09-signin-screen-evaluation.md`.
  OTP screen: `concepts/2026-10-09-otp-screen-spec.md`, renders `25`–`27`.

### D-34 · OTP lock applies to mobile number — 2026-10-10
- **Decision:** 5 server-confirmed wrong OTP submissions lock the attempted mobile number, not the doctor's account. The OTP screen keeps **Change number** available during the lock. Resending a code or restarting sign-in does not reset the wrong-try count.
- **Access rule:** A doctor may sign in using another number only after Doctor Ops approves that number for the doctor. Changing number does not itself grant access.
- **Screen consequence:** Keep the locked number's countdown and Doctor Ops action visible; disable OTP entry and verification for that number until its lock expires. Do not present this as an account-wide suspension.

### D-35 · Configurable OTP issue cap — 2026-10-10
- **Decision:** OTP issue cap is configurable. Start at 4 codes per mobile number in a server-enforced limit window, counting initial code and up to 3 resends. Do not reset count when the doctor restarts sign-in or changes number and returns.
- **Open implementation detail:** Set limit-window length and reset rule with backend/ops. Keep wait time server-driven; the 09:42 screen timer is illustrative.

### D-36 · Home screen scope: jobs, rules and what's out — 2026-10-12
- **Detail:** `concepts/2026-10-12-home-jtbd.md` (final jobs to be done, Home states, open questions). Screens not
  yet designed; items marked Proposed there still need Apurva's yes.
- **Home's question:** "Am I taking cases right now, and what do I do next?" Anything else lives in the profile menu.
- **Taking cases:** means the doctor *may request* a case; nothing is pushed. Named "Taking cases", not "Online".
- **Availability setup (2026-10-12):** Show duration choices directly on Home when no availability is active.
- **Duration controls (2026-10-13):** Apurva prefers inline plus/minus controls over wheels or keyboard fields.
  No tap-to-type; keep the keyboard closed. Quick picks use 15 / 30 / 45 minutes in one row and 1 / 2 / 3 hours
  in the next, synchronised with Hours and Minutes controls. Enforce the 15-minute minimum. This approves the
  interaction direction, not the final visual render.
  **Set availability** confirms the duration and starts the countdown. Remove the extra setup-opening CTA and
  setup bottom sheet. After confirmation, show active Home with the next-case action. Returning doctors with
  time remaining see active Home directly. This supersedes the earlier setup-sheet proposal.
- **Duration (clarified 2026-10-12):** Available 24/7. Doctor may start at any time and choose any duration of at least
  15 minutes. Select duration, not a clock end time; show time remaining on Home. "24/7" does not imply a 24-hour
  duration cap. This supersedes earlier end-time chips and "Until 6:00 PM" copy.
- **Next order:** pull model. A request made before the window ends is honoured even if the case arrives after.
- **Window ends during a case:** the case is never interrupted; back on Home, Next order is replaced by Extend or
  Done for now.
- **Today's count:** count only, no earnings. A case counts when its prescription is generated (Confirm).
- **Wallet placeholder (2026-10-12):** Apurva requested a placeholder for future earnings withdrawals, KYC and payouts.
  Show **Wallet · Coming soon**; recommended placement is the profile menu. Current scope is an informational
  placeholder, without balance, money movement or KYC collection. Detailed financial flows remain future scope.
- **Help:** a help icon in the shared header (left of profile) on Home and inside a case. Support v1 is a WhatsApp
  hand-off; calling ops is hidden during a live patient call. App crash / freeze (ANR) reports go to tech.
- **Notifications:** a bell for ops announcements and incentives, on Home only, never inside a case.
- **One phone at a time:** a doctor may sign in on any phone; only one is active.
- **Background:** the app may go to the background during a live case; the case continues.
- **Callbacks go to the pool** (2026-10-10), as the system works today. No callback card on Home; same-doctor
  callbacks parked.
- **Out of scope:** case → Home → case navigation during a live case (still true; leaving before the first call and after closing is defined in D-48); history, statistics, training on Home.
- **Later:** Uber-style case offers (accept/decline, background alerts, explicit opt-in); in-app support chat;
  push alerts for announcements.
- **To verify:** "Looking for a case" auto re-check (OQ-019).
- **Clarified 2026-10-12:** Signed-in session stays valid through an open case; no OTP sheet over a live case.
  Help offers an explicit app-issue report action. Automatic crash/freeze logging continues; app team owns
  technical triage. If Stop is tapped while a Next order request from Home or the prior case page is pending,
  honour the request already sent, block further requests, and stop after it resolves and any assigned case closes.
  If no case is assigned, stop when the request resolves. Show a pending-stop status, not an error. Window expiry
  alone follows the agreed last-second rule and never interrupts a case.

### D-37 · No faster-sign-in recovery sheet in native app — 2026-10-12
- **Decision (Apurva):** Drop the “Finish setting up faster sign-in” Home sheet. Production doctor app is React Native;
  the sheet existed to recover from a Safari web-prompt timing concern and is not part of the native flow.
- **Flow:** After correct OTP, invoke the phone's passkey setup prompt for doctors who opted in. If cancelled or
  failed, let the doctor reach Home; OTP remains available next time. Do not nag on Home.
- **Handoff:** The older concept HTML and render 30 remain historical references, not approved UI screens.

### D-38 · Sign-in, OTP and returning unlock built into the prototype — 2026-10-12
> **Partly replaced by D-44 (OTP keyboard, wrong code, layout) and D-45 (faster sign-in moved off OTP), 2026-10-14.**

- **What:** `#scr-signin`, `#scr-otp` and `#scr-unlock` now follow the approved `ui-screens/` (all states). The old
  6-digit OTP, in-app Request access screens and fingerprint set-up screen are removed. Home is unchanged (interim).
- **Behaviour:** paste-safe number and code fields; keyboard closes on "not registered" and on the 4th code digit;
  Sending / Verifying keep the brand colour with a spinner; the faster-sign-in card is unticked by default and only
  shown where passkeys are supported; a correct code with the card ticked opens the phone's passkey prompt
  (stand-in sheet), and cancelling it still signs the doctor in (D-37). Wrong tries, codes issued and the lock are
  kept per mobile number, so going back or restarting sign-in doesn't reset them (D-34, D-35).
- **Returning doctor:** opens on Unlock; the phone's prompt opens when the doctor taps Unlock (no automatic prompt,
  matching the approved "Ready when you are" screen). Three failed tries close the prompt; "Use OTP instead" stays.
- **[MOCK ASSUMPTION] demo values:** numbers starting 90 not registered, 9222222222 inactive, 9333333333 can't send,
  9444444444 too many codes; codes 0000 wrong, 1111 expired, 2222 can't verify, any other 4 digits work; resend
  waits 30 s / 60 s / 120 s; issue-cap window 10 min; lock 15 min (OQ-017). Demo controls add Offline, Passkey
  supported, unlock method (fingerprint / Face ID / screen lock) and Unlock fails.
- **Contacts:** Sign up → onboarding web form; Call Doctor Ops → +91 86524 24617; Terms and Privacy dummy (OQ-021).
- **Known differences from the handoff:** notice icons use the shared icon set instead of the ⓘ / ⚠ text glyphs;
  sign-in notices are larger than OTP notices, as in the approved renders (worth unifying later).

### D-39 · Format checks (regex) on sign in and OTP: when they show — 2026-10-12
- **Decision (Apurva):** format errors follow one pattern. Impossible input is blocked silently (digits only,
  maximum length). A value that can still become right shows no error while typing; it is checked on Send OTP /
  Verify. A value that can never be right (mobile number starting 1–5) shows its error at once. When two things are
  wrong, the more basic one shows first (first digit before length). Once an error shows, it is re-checked on
  every keystroke and stays until the value is valid.
- **Leading 0** is a dialling habit, not an error; it is dropped once all 10 digits are in ("0 + 9 digits" →
  "Enter all 10 digits.").
- **Server answers** (wrong code, tries left, expired) are not format checks; they clear when the doctor types a
  new attempt.
- **For review:** "That’s more than 10 digits. Check the number." instead of silently cutting an 11+ digit entry
  that isn't a +91 / 0 prefix (`renders/2026-10-12/01`). Not built until approved.

### D-40 · Wheel is the final availability control — 2026-10-13
- **Decision (Apurva):** use the wheel for initial availability setup and Add availability. Remove the tap/plus-minus alternative from active UI handoff and source selectors.
- Keep the quick presets, 15-minute minimum and 15-minute increments. Show “Minimum 15 minutes” once on setup; no repeated reminder on the add-time sheet.
- Existing wheel renders remain approved. Historical comparisons are superseded, not alternative build instructions.
- Error feedback is being audited separately; recommendations are not approved design changes yet. D-39 timing remains in force.

### D-41 · Feedback rules and representative render workflow — 2026-10-13
- **Direction (Apurva):** create thorough shared rules and state mapping first; require README before each render batch; avoid separate images for copy-only states.
- Canonical references: `docs/feedback-rules.md`, `docs/feedback-state-map.md`, `docs/renders/RENDER-README-TEMPLATE.md`. CLAUDE.md and handoff READMEs link these as prerequisites.
- Two error structures: field error and action notice; existing warning/status/success/loading patterns remain distinct semantic feedback. Preserve D-39 timing and D-40 wheel selection.
- Every state requires source/behavior coverage; representative images cover visual/interaction changes and wrapping boundaries. One shared copy registry is the implementation target for HTML/native; not yet migrated.
- Rules/mapping created now. Representative capture plan and repaired visuals await implementation/review; no error screens or shared component tokens changed in this documentation pass.

### D-42 · Two header types; logo only on home-base screens — 2026-10-14
- **Decision (Apurva):** the app has two header types, used by screen type.
  - **Home-base header** — logo on the left (D-02 lockup), actions on the right. Used on **sign-in** and **Home** (all its states).
  - **Task header** — Back + screen title, **no logo**. (2026-10-14: Back only where there is a previous screen — none on the faster sign-in offer or returning unlock, D-47; the case page's Back follows D-48; hero vs compact size, D-49.) Used on **OTP**, the **faster sign-in offer**, **returning unlock**, the **case page** and every other step or task screen.
- **Why:** consistency comes from a predictable header per screen type, not from repeating the logo. Sign-in needs the logo for trust before a doctor types their number; Home is the screen doctors return to all day. On step and task screens the space is worth more for the task (OTP fits above the keyboard only without the logo; the case page needs it for patient context).
- **Rejected:** logo on every screen (costs space where it's needed most); logo on no screen (loses trust on sign-in and identity on Home).
- **Changes:** D-33 "Look" — the blue band + white panel stays shared with OTP and returning unlock, but the logo no longer appears on those screens. D-02 (which lockup) unchanged.

### D-43 · Screen layout and type scale — 2026-10-14
- **Decision (Apurva):** every mobile screen follows the central layout rules in `design-system/RULES.md` §8:
  - **Type scale, 4 levels:** L1 screen title 32/40 semibold · L2 key content 16/24 · L3 supporting 14/20 secondary colour · L4 fine print 12/16 secondary colour. Only the screen title is large; buttons keep their design-system style.
  - **Spacing:** one side margin (24) on every screen; only three gaps — tight 8 (label↔field, field↔helper), related 16 (within a group), section 32 (between groups). Spare space goes between content and a pinned button, never inside a group.
  - **Button placement:** on screens where the doctor types (sign-in, OTP), the main button sits **inline, directly under the content**, so it stays visible above the keyboard without moving. On screens without typing (faster sign-in offer, Home), the main button is **pinned to the bottom**.
- **Why:** spacing and text sizes had been set by eye per screen, so screens drifted and nothing led the eye. A pinned button on typing screens either jumps with the keyboard or leaves a gap above it (tested in concepts v2a).
- **Rejected:** pinned bottom button on sign-in/OTP; auto-opening the keyboard on sign-in (D-33 layout kept as approved).

### D-44 · OTP screen v2 — 2026-10-14
- **Decision (Apurva):**
  - **Header:** task header (D-42). Title "Verify your number"; one line "Sent to +91 98765 43210 · **Change**".
  - **Code:** four boxes over one real input (no visible "Verification code" label; the screen-reader label stays).
  - **Keyboard:** opens when the screen loads and **stays open** after the 4th digit.
  - **No auto-verify:** the doctor taps **Verify & sign in**.
  - **Wrong code:** the entered digits **stay visible** with red borders and the error below; no blue focus box. The **first new keystroke replaces the whole code** and clears the error. Keyboard stays open.
  - **Notice:** directly under the boxes. **Resend line** under the notice, one centred line: while waiting "Didn't receive it? **Resend in 0:30**" (timer slightly heavier, fixed-width digits, not tappable); when available "Didn't receive it? **Resend code**" (brand link, 44pt tap area).
  - **When to show resend:** whenever the doctor can still act (typing, wrong code, couldn't verify, expired — on expired "Resend code" is available at once). **Hidden** when resend is blocked (too many resends) or the number is locked.
  - **Consent line** (Terms / Privacy) sits directly above the button and shows **only when Verify is possible** — hidden when locked.
  - **Locked:** keyboard closes, boxes disabled, warning notice carries the countdown and "call Doctor Ops", Verify shown disabled so nothing jumps when the lock ends. No resend line, no consent line.
  - **Faster sign-in card removed** from OTP (see D-45).
- **Why:** the old screen stacked 11 items of similar weight above the button and floated the button mid-screen. Keeping the wrong digits lets the doctor spot a typo or an old SMS; replace-on-first-keystroke keeps retyping instant.
- **Rejected:** auto-verify on the 4th digit; closing the keyboard on the 4th digit; clearing the boxes on a wrong code (empty red boxes signal an error with nothing in them, and blue + red sends mixed signals); keeping the logo on OTP.
- **Changes:** D-38 "keyboard closes … on the 4th code digit" and "faster-sign-in card … ticked" are replaced. `concepts/2026-10-09-otp-screen-spec.md` is historical for layout. D-34, D-35, D-39 unchanged.

### D-45 · Faster sign-in offered on its own screen after sign-in — 2026-10-14
- **Decision (Apurva):** after the **first successful OTP sign-in on a device**, if the phone supports it and faster sign-in isn't on, show one screen: "Skip the OTP next time" with three short reassurances, **Turn on faster sign-in** (primary, pinned) and **Not now** (quiet).
  - Turn on → phone's own prompt → Home. Cancelled or failed prompt → Home, no error (D-37 still holds: no nagging on Home).
  - Not now → Home. Offered again later (when: OQ-023) and always available in Profile. No Back on this screen; the phone's back gesture = Not now (D-47).
  - Wording matches the phone: "Face ID" on Face-ID iPhones, "fingerprint" on fingerprint phones; never suggest Truemeds stores biometric data.
- **Why:** it can't go unnoticed, so it drives adoption (the point is cutting SMS OTP cost); a pre-ticked or easy-to-miss checkbox on OTP risks a sneaky opt-in; the phone's prompt makes sense right after a deliberate "Turn on". It also declutters OTP.
- **Rejected:** checkbox card on OTP (approved 2026-10-09, now replaced); light opt-in row on OTP.
- **Changes:** replaces the OTP opt-in in D-38 and the OTP spec. D-32's original "offered once after the first OTP sign-in" idea is effectively restored, as a native screen.

### D-46 · Phase A review decisions; locked layout specs — 2026-10-14
- **Decision (Apurva), LOCKED:** these are fixed in the design system and must not be changed per screen. Guard: `ui-screens/feedback/check-locked-specs.py` (fails on any violation). Rules: `design-system/RULES.md` §8, "Locked specs".
  - **L1** OTP code boxes: square 56×56, 24px digits, one tight centred group, gap 8. Never stretched, never 16px digits.
  - **L2** Loading primary buttons: brand-blue fill, white label, white spinner, on every screen. Never grey or pale.
  - **L3** OTP keyboard stays open during "Verifying" (D-44). Only locked and expired-and-resend-limited close it.
  - **L4** Field helper and field error text: 14/20.
  - **L5** Notice text: 14/20.
  - **L6** Sign-in logo-to-title gap: 48 (3xl), home-base hero gap.
- **Other phase A decisions:**
  - Disabled buttons keep the design-system disabled style. They are exempt from contrast (WCAG 1.4.3).
  - too-many-resends: Verify stays enabled; an empty tap shows the empty-code error. No change.
  - expired-and-resend-limited: locked treatment (empty disabled boxes, keyboard closed, Verify disabled, no consent, no resend line). Copy: "This code has expired. Request a new code in 9:42, or call Doctor Ops." (messages.json, approved).
  - Timer format is m:ss with no leading zero (9:42, never 09:42), everywhere.
  - Keep at least 16px between the inline main button and the keyboard. If content does not fit, it scrolls.
- **Changes:** D-43 helper and notice sizes superseded by L4 and L5 (14/20). D-44 slot sizing superseded by L1.

### D-47 · Phases A–C final review decisions — 2026-10-14
- **Decision (Apurva), from the final review of the layout-v2 renders** (`docs/reviews/2026-10-14-final-review-ABCD.md`):
  - **Locked, added to D-46's list:**
    - **L7** Field helper/error text aligns with its field: left under full-width fields (sign-in), **centred under the centred OTP code boxes**.
    - **L8** Screen titles wrap **balanced** (no single word alone on the last line, e.g. "Skip the OTP next / time").
    - **L9** **Value display** (e.g. Home "Time remaining" value): 32/40 semibold, fixed-width digits. A component, like the OTP digits — not screen text, so outside the four-level type scale.
  - **Titles never end with a full stop** ("Welcome, Doctor", "Hello, Dr. Apurva", "Consult on your schedule", "Ending availability").
  - **Faster sign-in offer (B):** **no Back** — it appears right after sign-in, so there is nothing to go back to; "Not now" is the exit and the phone's back gesture = Not now. Copy approved as drafted. The three reassurance icons are **neutral grey** (blue means "tap me"); the hero icon tile stays blue. Enabling: brand busy primary, "Not now" disabled.
  - **Returning unlock (B):** **no Back** — it's the first screen when the app opens; "Not you? Switch account" leads to sign-in. Title is the greeting "Hello, Dr. Apurva". Unavailable notice: "Faster sign-in isn't available on this phone right now." (no repeat of the "Use OTP instead" button).
  - **Home (C):**
    - Bug: helper text ("Minimum 15 minutes") must never be clipped or hidden under a notice; content scrolls. The guard checks for clipped text.
    - **Ending availability (stop-pending): no "Time remaining" row** — the title, subtitle and notice already explain; a 0:00 or live timer would contradict "ending".
    - The quiet "Ending…" action has **no spinner**; spinners belong to the primary loading button (L2).
    - Copy: noCases "No cases right now. Try again in a minute." · stopPending "Finishing your last request. Availability ends after that." · expiredPending "Availability has ended. Your last request is still active." · unknownResult "Checking whether your case request went through…" · idleExpired and manuallyEnded approved as drafted.
- **Why:** each point came from reviewing the rendered screens; locking L7–L9 stops the review loop re-arguing them.
- **Amended after the final renders (Apurva, 2026-10-14):**
    - Home stop-pending and expired-pending: the hero subtitle repeated the notice. Subtitle becomes **"You won't get new cases."**; the notice keeps the D-47 copy.
    - Returning unlock unavailable: the notice is **neutral information (N1), not a red error** — the doctor did nothing wrong and "Use OTP instead" is right below.
    - Home expired-pending: the title already says availability has ended, so the notice becomes **"Your last request is still active."**
    - **Wheel regression fixed back to D-40:** the layout-v2 rebuild replaced the approved wheel (one light-blue selection band across both columns, large blue selected values — `ui-screens/home/availability_wheel.png`) with grey boxes and small dark values. Not a decision; restore the approved wheel everywhere it appears (setup, setup failed, idle expired, manually ended, Add availability sheet). When the doctor spins the wheel instead of tapping a chip, the band is the only sign of the selection.
- **Changes:** D-42 task header Back is now "Back where there is a previous screen" (see D-49). D-45 offer has no Back.

### D-48 · Leaving a case: Back by stage, end-of-case exits, "case" wording — 2026-10-14
- **Problem (Apurva):** once a doctor opens a case there is no way back to Home — the case page only moves forward, and "Next Order" chains case to case. Home now holds availability (time left, Add time, End availability), so the doctor must be able to reach it.
- **Decision (Apurva):** the case page has a **Back** in its header, and the phone's back gesture behaves the same. Back always means "leave this case"; the outcome depends on the stage:

  | Stage | Back (header or phone gesture) |
  |---|---|
  | Case assigned, **no call attempted** | Confirmation sheet → **release the case** → Home |
  | Call **attempted or connected**, until the case is closed | **Blocked.** Header Back is hidden; the back gesture shows a calm, neutral message (not an error): "Finish this case first. Then you can go back to Home." |
  | **Case closed** | Straight to Home, no sheet |

  - **Release only before the first attempted call.** Once a call is attempted (even if not connected), the case is closed through the flow (no pickup, callback, etc.), never released.
  - **Confirmation sheet:** title "Leave this case?" · text "It goes back to the queue for another doctor." · primary "Release case" · quiet "Stay on this case".
  - **End of a case:** primary **"Request next case"** + secondary **"Back to Home"**, stacked in the pinned bar (as on Home). The completion confirmation sits at the top of the content, medicines shown as prescribed, and its title names the path just taken (2026-10-14): **"Prescription confirmed"** (Cat4, HA skipped) · **"Transferred to HA"** (value meds) · **"Forwarded to HA"** (non-value meds). If availability ended during the case, only **"Back to Home"** (Home then shows the expired state; D-36: a case is never interrupted).
  - **App closed / phone off mid-case:** reopening goes **straight back into the open case**.
  - **Help** stays in the case header at every stage (support while stuck); no logo, no profile button (logout is already blocked during a case, D-32).
  - **Wording: "case", never "order",** for the doctor's unit of work in the UI ("Request next case", "Release case", "Leave this case?"). The customer order ID stays ("Order 12345"); final CTA labels are in D-50.
- **Why:** Back is the control every doctor already knows, and the native back gesture must do something; the confirmation sheet guards against accidental releases. In a pull model an untouched case should return to the pool quickly rather than sit parked. Blocking during a call protects the locked consultation flow and the valid-call gate.
- **Rejected:** a separate "Release" header button (Back is clearer); parking a case and resuming from Home (patients wait, doctors hoard); a visible Back that only errors during a call (feels broken).
- **Backend dependency:** releasing (unassigning) a case and restoring an open case after reopening — OQ-024, OQ-025.
- **Changes:** D-31 "Next Order" → "Request next case", and Home is reachable after every case. D-36 "Out of scope: case → Home → case navigation during a live case" still holds (no leaving mid-case); leaving before the first call and after closing is now in scope.

### D-49 · Case page header: compact blue-tinted task header — 2026-10-14
- **Decision (Apurva):** the case page continues the blue-tint theme with a **compact** task header: brand-subtle tinted, sticky, holding **Back** (per D-48 stage), the **patient's name** (20/28 semibold, `.tm-text-h1`), age/gender and the case number underneath, and **Help** on the right. No logo, no profile button. Content scrolls on white with its cards.
  - Task headers come in two sizes: **hero** (sign-in flow, OTP, unlock, faster sign-in offer — 32/40 title in a tall band) and **compact** (dense work screens such as the case page — 20/28 title in a short sticky band). RULES.md §8.5.
  - **Meta on two lines** (Apurva, 2026-10-14): "54 · Male" / "Order <id> · <value>", inside the same fixed header height — one line truncated the order value at 360 wide.
  - **Order details row:** "Order details ⓘ" (one tap target, left) + "View Rx" (right) sit in a slim row at the top of the content and scroll away. "Order details" because it opens order data (created, delivery, payment). "View Rx" and "Back to Home" keep their wording.
  - The compact header carries the patient identity, so the **D-07 compact strip is retired**; D-07's no-jump rule still applies (the header never changes height while scrolling).
- **Why:** a tall hero band and a 32px name would push medicines and call actions down on the busiest screen; a compact tinted header keeps the app's look without costing space.
- **Process:** concept renders first (top, scrolled, during a call, the Leave sheet, end of case, end of case with availability ended) for Apurva's review; build only after approval. Header, type and spacing only — no consultation logic, CTA or flow changes.
  - **Concepts use the real case page** (Apurva, 2026-10-14): a copy of `index.html` with only the header changed, driven by its own scenarios and states — real medicines, notes, Call card, script and pinned action bar (D-22, D-28). No invented sections or buttons. The first concept round invented content and an in-call "Prescribe" button and was rejected.
- **Changes:** D-33 "Work screens (the order page) stay plain white" is replaced by this entry. D-07 strip retired.

### D-50 · Final case CTAs: labels and tracking — 2026-10-14
- **Decision (Apurva):** the final button labels change; the routing matrix (`project_truth.md` §5) does not.

  | Case type / HA status | Old label | New label |
  |---|---|---|
  | Cat4 | Confirm Order | **Confirm prescription** |
  | Pilot, HA already skipped | Confirm Order | **Confirm prescription** |
  | Pilot, value meds + HA required | Confirm & Transfer | **Confirm & transfer** |
  | Pilot, non-value meds + HA required | Confirm & Forward | **Confirm & forward** |
  | Skip HA (secondary) | Skip HA Call | **Skip HA call** |

  - **Transfer / forward stay as two verbs.** The case always goes to an HA, and nothing changes on screen for the doctor, but the verb (with the end-of-call script) tells the doctor which journey to explain to the customer. No "to HA" suffix — always HA, so it adds length for nothing.
  - **Order ID stays:** the case-page line keeps "Order 12345 · ₹1,240" — the order ID is the reference shared by the customer's order and the doctor's case.
  - **Sentence case** on all buttons, like every other button in the app.
- **Tracking (Apurva):** each of the four paths (Cat4 · Pilot value-meds HA · Pilot non-value-meds HA · Pilot HA skipped) must be distinguishable in analytics, because each path has different later steps in the funnel. Cat4 and HA-skipped share a label, so the event can never be derived from the button text. Renaming a label never renames an event. Separate events vs one event with a flow field: Engineering's choice.
- **Why:** "Confirm Order" names the customer's order, not the doctor's act; the act is issuing the prescription (D-36 counts a case as done at that point). "Confirm the case" was considered and rejected — vague, reads like accepting the case.
- **Changes:** resolves OQ-026. Labels in `index.html` change only when the case page is rebuilt after Apurva approves the D-49 concepts.

### D-51 · Phase D concept review — 2026-10-14
- **Decision (Apurva), from the full phase D concept renders** (`docs/concepts/2026-10-14-case-page/v2/full/`):
  - **Button order (RULES §8):** in the case page's pinned bar the **primary sits on top**, at thumb reach; secondary actions sit **below** it (two secondaries side by side in one row). Applies to every bar state: during the call, after 50s, after a missed call. **Replaces D-28's "secondary actions above the main button".**
  - **Prescribe screen header:** keep the **white** header (name, form, Disable, cross). The tinted header proposal is rejected — taller, empty space, and it merges with the tinted "On prescription" band into one blue block. The band keeps its normal colour in every state (incl. dose error).
  - **HA transfer banner on mobile:** shown as a neutral notice above the medicines on Pilot HA-required cases. Display only, no logic change.
  - **Patient unavailable:** no sheet; go straight to the end-of-case card "Patient unavailable" with a **neutral icon** (not a green tick) and the usual exits. "Patient", never "customer".
  - **Callback scheduled card** shows the time: "Callback today at 3:00 PM".
  - End-of-case is the **card** (D-48); D-23's "one plain notice in the action card" is superseded on this point.
  - **Closed case:** header Back is **hidden** ("Back to Home" in the bar is the exit; phone back gesture → Home). The case content becomes **read-only and muted** (no chevrons, nothing tappable) but stays readable; the card and the bar are the only live elements. Replaces D-48's "Case closed: header Back straight to Home".
  - Closed medicines: prescribed ones show Prescribed, disabled ones Disabled. "Back to Home", "View Rx", "Prescription confirmed" confirmed.
  - Fixes: stray blue outline on bottom sheets and the glow ring on "Calling…" removed; Order details labels in sentence case; Prescribe Duration card gap matches other cards; pinned-bar secondary buttons 44px tall; "On prescription" band text/background pair fixed centrally to AA.
  - Out of this pass: transfer-failed alert (needs its own spec — open question), desktop side panel. Keyboard states checked on device later. Mock Rx paper exempt from contrast.

- **Addendum (Apurva, 2026-10-14): concepts approved; phase D is rendered from the concept file.**
  - The phase D concepts are approved by Apurva. Phase D is rendered and reviewed from `docs/concepts/2026-10-14-case-page/v2/concept.html` (the screen file, like `ui-screens/*.html` for A–C).
  - `index.html` is **not** edited in this loop. It will be rebuilt fresh from the approved concepts as a separate, planned step after A–D are approved, keeping the existing consultation logic.

### D-52 · Design system review adopted; doctor-portal specifics and phase D fixes — 2026-10-15
- **Decision (Apurva):** the design-system review (`docs/reviews/2026-10-15-design-system-review.md`) is adopted. Common rules now live centrally in `design-system/RULES.md` §8.5–8.6 and **§9 (Components and states)** and `beyond-salt.md`: four button roles + call end, one button height per group, **48px tap targets**, chips wrap / one grid size, read-only rows, reserved tag width, status card, **one bottom-sheet template** (no drag handle), **dark toast** only where nothing on screen can show the result, edit-screen and viewer headers, states checklist, formats, accessibility, out of scope.
- **Doctor-portal specifics (this project only):**
  - Status tags: **Prescribed** = success · **Pending** = warning · **Disabled** = neutral. "Pending" stays on cases closed without a prescription (e.g. patient unavailable).
  - Status card titles by ending: Prescription confirmed · Transferred to HA · Forwarded to HA · Callback today at 3:00 PM (chosen date/time) · Patient unavailable (neutral icon).
  - **End call** uses the call-end role (solid red). Mark as unavailable and Disable use the destructive role (red outline).
  - Quiet role: Back to Home, Stay on this case, Not now, End availability.
  - Sheets on the template: Leave this case · Missed call · Schedule callback · Skip HA call · Disable medicine · Discard changes · Add availability · End availability · Profile / Logout.
  - Header use: Prescribe = edit-screen header (white, ✕, Disable); Rx viewer = viewer header.
  - **D-27 adjusted:** the principle stays (show the outcome where it happens), but a **dark toast** is allowed where nothing on screen can show it: "Time added" (Home) and "Finish this case first. Then you can go back to Home." (phone back during a call).
  - **D-51 changed:** the HA transfer notice on the case page is **dropped** — the button label and the end-of-call script already tell the doctor.
  - Clinical options (dose values, injection "1 / Other", error copy that adapts to ml / units) stay as they are; the doctor chooses. Only their look changes.
- **Phase D fixes (from the round-3 audit):** compact header content moves to the left margin when Back is hidden; no icons on side-by-side bar buttons; SOS grids use the same chip size as the dose grid (3 options in the 4-column grid, not stretched); food chips wrap at 390 with normal padding ("Empty stomach" to the second line); Rx viewer title never overlaps the zoom tools; Disable sheet titled "Disable Metformin 500mg" (sentence case, no repeated line); order details expanded inside a white card; tag width reserved; mock data consistent (order dates current, B12 Rx line matches its schedule); missed-call sheet stays, on the template.
- **Missing phase D states to design and render:** case loading · case failed to load · offline during a case · Confirm in progress · Confirm failed · Release failed · callback failed to save · Rx failed to load · order with no medicines · very long patient and medicine names (360).
- **Process:** the central components are updated once, then phases A–D are all re-checked against RULES §9 and re-rendered; **A–D are promoted to `ui-screens/` together** after Apurva's approval (A–C promotion paused until then).

### D-53 · Standards pass decisions; timer format; copy approved — 2026-10-15
- **Decision (Apurva):**
  1. **Timer format:** availability timer shows h:mm:ss from one hour up (1:00:00, 2:30:00); m:ss below an hour (9:42, 30:00). OTP and other timers stay m:ss. This amends D-46 (which said m:ss everywhere) for the Home availability timer only.
  2. **Approved copy kept:** "That code isn’t right. 2 tries left." (OTP, D-44) and "Faster sign-in isn’t available on this phone right now." (unlock unavailable, D-47). No next-step wording added.
  3. **Proposed copy approved as written:** the ten new case and Rx states (`case.loadFailed`, `case.offline`, `case.offlineAction`, `case.confirming`, `case.confirmFailed`, `case.releaseFailed`, `case.callbackFailed`, `rx.loadFailed`, `case.noMedicines`, plus the new "Time added" toast). "Proposed" marks removed from `feedback-state-map.md` and `messages.json` metadata.
  4. **Section C calls of the standards pass accepted, with two changes:**
     - (a) **Back to Home** is the **primary** when availability has ended (the only action). In every other ending it stays quiet.
     - (b) **Offline and confirm-failed notices sit inside the pinned bar**, directly above the buttons, so they are visible without scrolling (7b.4).
  5. **Concept styles:** the concept loads its own copy of the shared stylesheet (`docs/concepts/2026-10-14-case-page/v2/concept-styles.css`) with every rule that restyles a central component removed. `styles.css` and `index.html` are unchanged.
- **Why:** the timer needs the hour form to stay readable past an hour; approved copy should not be re-argued; the ending and bar decisions follow the 7b.4 and 7.6 checks.
- **Central changes used (design system, rebuilt 2026-10-15):** `.tm-field` gap 8; `.tm-field__control` min 48 with the input filling it; `.tm-field--readonly` and `.tm-readonly`; `.tm-notice .tm-icon` 20px; `.tm-chip-grid--3`; `.tm-header-task--compact` (+ `__row`, `__title`, `__meta`, `--no-back`); `.tm-btn--link` min 48.
- **Changes:** amends D-46 (timer format, Home only). Replaces the D-51/D-52 wording on Back to Home in endings (primary only when availability has ended) and the placement of offline and confirm-failed notices (in the bar).

### D-54 · Full audit fixes: case bar, medicine rows, call outcome, sheets, offline, copy — 2026-10-15
- **Source:** Apurva's review of the round-14 renders and Claude's full audit (`docs/reviews/2026-10-15-full-audit.md`, 104 states at 360 and 390). Option renders: `docs/renders/2026-10-15-standards/D/options-case-bar/`.
- **Decision (Apurva):**
  1. **Case bar after the HA question:** primary on top (Confirm & transfer / Confirm & forward / Confirm prescription), then one row of two equal secondaries with icons: **📅 Callback** · **⏭ Skip HA** (calendar, player-track-next). No three-button stack at any width. **📅 Callback** also replaces "Schedule callback" on the on-call and call-ended-early bars (full width when alone). The sheet it opens keeps its title "Schedule callback". Replaces the D-50 labels "Schedule callback" / "Skip HA call" on buttons; tracking events unchanged (D-50: renaming a label never renames an event).
  2. **Medicine rows on the case page (live and closed):** line 1 the medicine name, full width; line 2 **Qty** (14/20 semibold, secondary) on the left and the status tag on the right. No dose, frequency or duration on the case page — that lives on the Prescribe screen.
  3. **Injection dose options:** 1 · 2 · 3 · Other (was 1 · Other). Daily slots for injections: 0 · 1 · 2 · 3.
  4. **Call outcome in the bar:** when a call ends early, isn't picked up or doesn't connect, the reason sits as a warning notice inside the pinned bar, directly above the buttons: "Call ended before 50 seconds." · "Patient didn't pick up." · "Call didn't connect." (the old "— call again or schedule a callback" ending is dropped; the buttons say it).
  5. **Call card position:** before the call, the medicines come first. **From the moment the call connects** (on call, after the HA question), the Call card with the end-of-call script moves above the medicines.
  6. **Confirmation sheets, one rule:** the action the sheet asks about on top — red outline if it can't easily be undone, primary otherwise — and "stay" as quiet text below. Leave case and End availability unchanged; **Discard changes?** becomes Discard (red outline) on top + Keep editing (quiet). Missed call is a choice, not a confirmation, and stays.
  7. **Offline is a warning (yellow) everywhere** — it blocks the main action. The case page changes from neutral to warning; sign-in, OTP and Home already use it. Neutral stays for side information only.
  8. **Copy:** "Please" dropped from three messages — "We couldn't send the code. Try again." · "We couldn't send a new code. Try again." · "Couldn't request a case. Try again." ("Too many attempts on this number. Please wait before trying again." keeps it.) Busy labels end with "…": **"Verifying…"**, **"Sending OTP…"**.
  9. **Home after availability ends:** "Time remaining 0:00" stays.
  10. Old phase D renders moved to `docs/_superseded/`; one current set: `docs/renders/2026-10-15-standards/D/final/`.
- **Design system (central, done by Claude 2026-10-15):** focus outline only on buttons, links and tappable rows (text fields and the OTP code use their own border; sheets focused by script show none) — fixes the blue frame round the OTP boxes, the blue line on every sheet and the square ring inside focused fields; icons on a side-by-side pair when both carry one; row second line `.tm-row__line` / `.tm-row__fact`; RULES §9.1–9.5, 9.8 updated (busy "…", grids start at their label, confirmation sheets, notice types).
- **Why:** each point fixes a fault found in the full-size audit or a clearer pattern Apurva chose from rendered options.
- **Changes:** D-50 button labels (secondaries only), D-51/D-52 "no icons on side-by-side bar buttons", D-52 injection "1 / Other", D-53 case offline pattern (neutral → warning).

### D-55 · Approval of the D-54 open items — 2026-10-15
- **Decision (Apurva), approving the open items listed in `<phase>/NEEDS-APURVA.md` after round 15:**
  1. **Grid chip sizes:** every option grid in a section has the M/A/N chip width (63px at 390) and starts at its label's left edge. Reconciles D-54 D6 (no indent) with checklist 5.4 (one chip size per screen). The indent rule for these grids is removed; the M/A/N grid is unchanged.
  2. **Duration picker and time chips at 360:** the central grid-chip padding (8px sides) is done (Claude, 2026-10-15). Duration **units** (Days · Weeks · Months · Ongoing) are words, so they become free chips that wrap; duration **numbers** stay grid chips at the shared size. The local time-chip padding is removed. (Corrected by Claude, 2026-10-15: the first wording deferred this to the design team.)
  3. **Side margin (R3):** exempt text after a leading icon (the offer points, where the icon is the left edge), right-aligned helper text (the Home wheel helper) and centred titles (the unlock greeting). Designs unchanged.
  4. **Profile / Logout sheet:** not built. It is not in the Home screen files; per D-54 it is built only when it exists there.
  5. **"Call didn't connect":** the call did not connect and the case stays open. The retry sheet shows "Call didn't connect" (app `timeout` path); the retry sheet offers Retry call / Mark as unavailable, the same as no pickup.
  6. **Native copy:** `ui-screens/native/messages.ts` is regenerated by the native owner, not here (no native changes in this pass).
  7. **Old renders:** superseded phase D renders moved (not deleted) to `docs/_superseded/`: the standards-pass rounds 1–14 to `2026-10-15-phase-D-rounds/`, and the 2026-10-14 layout-v2 D renders to `2026-10-14-layout-v2-D/`. Current set: `docs/renders/2026-10-15-standards/D/final/` plus `options-case-bar/` and `round-15/`.
- **Why:** the grid and R3 items were conflicts between checklist lines and the approved designs; the others were open questions with a stated recommendation.
- **Changes:** D-54 D6 (indent removed, start at label edge kept); checklist 5.4 and R3 exemptions apply to the guard only.
- **Addendum (Claude, 2026-10-15, round-16 audit):** when a call ends early the script is hidden, so the Call card would be empty; the Call card therefore moves above the medicines only while the call is live or after the HA question, and is hidden when it has nothing to show.

### D-56 · Rebuild from scratch; app logic extracted; calling model — 2026-10-16
- **Decision (Apurva):**
  1. **Rebuild the prototype from scratch** (not by extending `index.html` / `app.js`, which were not built to scale). Order: approve `ui-screens/app-logic.md` (the rules, extracted from the old code) → redesign the calling screens → rebuild checklist → build → check against the approved pictures.
  2. **Confirm is blocked while any medicine is Pending** (all three confirm buttons). The button stays tappable; on tap a notice in the bar says "Prescribe or disable {n} medicines first." and the page scrolls to the first Pending medicine. Callback, Skip HA and Mark as unavailable stay allowed.
  3. **Phone switched off / wrong number:** the case closes as **Patient unavailable**; the doctor gets Request next case; the lead resurfaces later (backend). No reason line on the card — the doctor heard it on the call and hang-up causes can't be relied on.
  4. **No queue message:** the case does go back to the queue, but the doctor is never told.
  5. **Calling, first release = Knowlarity click-to-call:** the doctor's phone rings first, the doctor ends the call on the phone; **no End call in the app**. New state: doctor didn't answer (leg 1 not connected) — to confirm with Knowlarity. In-app (VoIP) calling explored later (OQ-027). The approved calling screens (D-48–D-54) are redesigned in a separate thread.
  6. **Demo:** one prototype with a demo switch between the calling modes; only the calling part differs.
  7. **Quantity (clarified):** the Prescribe screen shows **no Qty** (the doctor doesn't set it, D-06); Qty is shown **read-only on the case page rows** (D-54).
- **Why:** the old prototype had grown by patching; the rules are kept, the code is not. The calling screens assumed the app controls the call, which isn't true with click-to-call.
- **Changes:** D-48/D-51/D-54 calling states (Calling, On call with End call) to be redesigned; everything else in D-42–D-55 stands.

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

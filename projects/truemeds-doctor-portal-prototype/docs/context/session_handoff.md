# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** This file captures all decisions, agreements, and pending work from the founding session so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-06-09
**Session status:** index.html rebuild is AGREED but NOT YET COMPLETE. Read this file before touching any code.

---

## 1. What has already been built (current index.html state)

The current `index.html` is a working V1 prototype with:

- Light theme (Truemeds brand-inspired, `#1B69DE` primary blue)
- All 5 mock scenarios switchable via demo bar
- Valid-call gate at 50 seconds (locked, working)
- CTA routing matrix (locked, working) — Confirm Order / Confirm & Transfer / Confirm & Forward
- HA banner (appears only for Pilot + HA required + not skipped — locked, working)
- Skip HA Call logic (locked, working)
- Rx overlay with dummy prescription, zoom/rotate/pan/pinch (working)
- Desktop side panel (mirrors CTA + scenario switcher, working)
- Fast-forward to 50s demo button (working)
- Bottom sheets for Hold, No Pickup, Skip HA, Edit Medicine (working)

**Known issues in current index.html that are pending fix (see Section 2):**
- Patient detail block is currently sticky AND there's a separate sticky patient header — both visible simultaneously (repetition bug)
- Prescription card section still exists as a separate block (should be removed)
- Medicine data uses old fields (name with strength combined, dosage, frequency text) — needs new format
- Edit medicine sheet uses text inputs for frequency — needs M/A/N picker
- Edit medicine sheet overflows on mobile — needs max-height fix
- Call section still has assignment strip, call-patient-row, call-status-display box (all to be removed)
- Post-call section is separate from call section (needs to be merged into one action zone)
- Notes section currently comes AFTER the call section (should come before)
- Badge row (PILOT / HA REQUIRED / NON-VALUE MEDS) is shown in patient detail block (should be removed from patient block)

---

## 2. Agreed changes — pending build (DO THIS NEXT)

These changes were fully confirmed by the user. Build all of them in one clean pass of `index.html`.

### 2.1 Sticky header — fix the repetition

**Current:** Demo bar (sticky) + patient-header (sticky below it) are always both visible. The patient-header repeats info already in the patient detail block.

**Fix:**
- Wrap `#demo-bar` and a new `#compact-strip` together in `#sticky-top-wrapper` (position: sticky, top: 0)
- The `#compact-strip` is hidden by default (`visibility: hidden`)
- Use a scroll event listener: when the patient detail block scrolls above the sticky wrapper's bottom edge, show the compact strip
- When patient detail block is in view, compact strip is hidden

**Compact strip content:**
- Patient name
- Age · Gender · Order ID
- Call timer badge `📞 0:43` — visible only when `consultationState` is `connected` or `gate_passed`
- `View Rx` button — visible only if `prescription_attached: true`

### 2.2 Patient detail block — restructure

**Current:** `#order-context-card` with name, age/gender, badge row, order/case ID row. Always visible. No View Rx.

**Fix:**
- Keep the card structure but rename to `#patient-detail-block`
- **Remove** `#badge-row` entirely from this block (PILOT / HA REQUIRED / NON-VALUE MEDS badges are internal routing data — doctor does not benefit from seeing them)
- **Add** a `View Rx` button inline in the block (right side of name row, or below name/meta) — shown only when `prescription_attached: true`
- The block is NOT sticky — it scrolls normally

**Patient detail block content:**
- Patient name (large)
- Age · Gender
- View Rx button (if prescription attached)
- Order ID · Case ID (bottom row)

### 2.3 Remove prescription card section entirely

**Current:** A separate `#prescription-section` card that says "Prescription attached — tap View Rx in the header to open."

**Fix:** Remove this card section entirely from HTML and CSS. The View Rx CTA now lives inline in the patient detail block (Section 2.2) and in the compact strip (Section 2.1). No other reference to prescription is needed in the main scroll.

Note: The `prescription_attached` field still drives whether the View Rx button is shown. The Rx overlay itself (full-screen viewer) is unchanged and untouched.

### 2.4 Medicines section — new data format and display

**Current medicine data format:**
```js
{ id, name, dosage, frequency, validation_status }
// name includes strength: "Metformin 500mg"
// frequency is free text: "Twice daily"
```

**New medicine data format:**
```js
{ id, name, strength, m, a, n, qty, validation_status, disabled }
// name: just the medicine name — "Metformin"
// strength: "500mg"
// m: morning dose (0, 0.5, 1, 2)
// a: afternoon dose
// n: night dose
// qty: quantity ordered (editable by doctor — see OQ-011)
// validation_status: "pending" / "validated" / "flagged"
// disabled: boolean (false by default)
```

**Display on medicine card:**
- Line 1: `Metformin 500mg` (name + strength, bold)
- Line 2: `1-0-1 · Qty 30` (M-A-N format + qty)
- Validation badge (Pending / Validated / Flagged)
- Edit button

**M-A-N display helper:**
```js
function formatMAN(m, a, n) {
  const f = v => v === 0.5 ? '½' : String(v);
  return `${f(m)}-${f(a)}-${f(n)}`;
}
```

**Disabled medicine display:**
- Opacity reduced
- Name shows with strikethrough style
- Badge shows `DISABLED` instead of validation status

**Scenario data — update all 5 scenarios with new fields:**

```
cat4 medicines:
  Metformin | 500mg | m:1 a:0 n:1 | qty:60
  Amlodipine | 5mg | m:1 a:0 n:0 | qty:30
  Atorvastatin | 10mg | m:0 a:0 n:1 | qty:30

pilot_value_meds_ha medicines:
  Levothyroxine | 50mcg | m:1 a:0 n:0 | qty:30
  Calcium + Vit D3 | 500mg | m:1 a:0 n:1 | qty:60

pilot_nonvalue_meds_ha medicines:
  Losartan | 50mg | m:1 a:0 n:0 | qty:30
  Hydrochlorothiazide | 12.5mg | m:1 a:0 n:0 | qty:30
  Aspirin | 75mg | m:0 a:0 n:1 | qty:30

pilot_ha_skipped_customer medicines:
  Ferrous Sulphate | 200mg | m:0 a:0 n:1 | qty:30
  Folic Acid | 5mg | m:1 a:0 n:0 | qty:30

pilot_ha_skipped_system medicines:
  Pantoprazole | 40mg | m:1 a:0 n:0 | qty:30
```

Add `disabled: false` to all medicines in SCENARIOS.

### 2.5 Edit medicine sheet — full replacement

**Remove:** Old `sheet-dosage-input` (text) and `sheet-freq-input` (text)

**Replace with:**
1. `Strength` — text input (e.g., "500mg") — editable
2. `Qty (ordered by customer)` — qty stepper with `−` and `+` buttons, numeric display, min: 1
3. `Dose Timing (M / A / N)` — three rows of 4 tap buttons each:
   - Row label: M, A, N
   - Buttons per row: `[0]` `[½]` `[1]` `[2]`
   - Tapping a button selects it (highlighted in primary blue)
   - One selection per row
4. `Save Changes` button — primary blue, full width
5. `Disable Medicine` button — danger/outlined style below Save; toggles to `Enable Medicine` if medicine is already disabled

**Mobile height fix:** `.bottom-sheet { max-height: 85vh }` and `.sheet-body { overflow-y: auto; max-height: calc(85vh - 90px) }`

**Edit state tracking:** Use a separate `EDIT_STATE` object:
```js
const EDIT_STATE = { medId: null, strength: '', m: 1, a: 0, n: 1, qty: 30 };
```

### 2.6 Add Medicine CTA — wire it up

The `+ Add Medicine` button already exists in the medicines header. Wire it to open a `sheet-add-med` bottom sheet with:
- Medicine name text input
- Strength text input
- Add button
- Small note: `[MOCK ASSUMPTION] Not persisted to backend`

On confirm: push a new medicine object to `DOCTOR_STATE.currentCase.medicines` with `validation_status: 'pending'`, default m:1 a:0 n:1, qty:30, disabled:false.

### 2.7 Action zone — merge call + post-call, simplify

**Current call section has (all to be removed):**
- Section label "Consultation Call"
- `#assignment-strip` (Assigned to Dr. Priya Sharma)
- `#call-patient-row` (patient name + masked phone number)
- `#call-status-display` box (icon + status text + timer)

**New action zone structure:**
One section (`#action-zone`) that is a single card containing two phases:

**Phase 1 — Call control (visible until gate passes, then hidden):**
- `#call-initiate-btn` only — large full-width blue button
  - State `assigned/hold/nopickup/failed`: label = "📞 Call Patient"
  - State `calling` (2s delay): label = "Connecting…" (disabled, pulsing)
  - State `connected`: label = "🔴 End Call" (red background)
- `#az-secondary-btns` — shown only during `connected` state:
  - `[⏸ Hold]` — opens hold sheet
  - `[📵 No Pickup]` — opens no-pickup sheet
- Small `#az-status-label` text — shown only for `hold` / `nopickup` / `failed` states showing reason

**Timer:** Removed from action zone entirely. Lives only in `#compact-strip` as `#cs-timer-badge`. Updated every second in `startCallTimer`.

**No patient name, no doctor name, no masked phone number anywhere in this section.**

**Phase 2 — Post-call (hidden until gate passes, then revealed — [LOCKED]):**
Structure inside action zone, after call control hides:
```
[HA attention banner — OUTSIDE postcall-cta-card, shown only when eligible]
[postcall-cta-card]
  [Skip HA Call button — if applicable]
  [Main CTA button — Confirm Order / Confirm & Transfer / Confirm & Forward]
```

**HA banner rule [LOCKED — confirmed by user]:** The `#ha-attention-banner` must NOT be inside `#postcall-cta-card`. It is a sibling of the card, sitting above it. Its visibility logic is UNCHANGED (Pilot + HA required + not yet skipped in session). Do not move it, suppress it, or alter its logic.

**Transition:** When gate passes, hide phase 1 (`display: none`), reveal phase 2 (opacity 0 → 1).

### 2.8 Section order — reorder in scroll

**Old order:**
1. patient context card
2. prescription section
3. medicines section
4. call section
5. notes section
6. post-call section

**New order:**
1. `#patient-detail-block` (non-sticky)
2. `#medicines-section`
3. `#notes-section`
4. `#action-zone` (call phase → post-call phase)

---

## 3. What must NOT be changed

These are locked and working correctly in the current index.html. Do not touch them:

- `resolveCTA()` function — CTA routing matrix
- `haSkipApplicable()` function — Skip HA eligibility
- Valid-call gate at 50 seconds in `startCallTimer()`
- `renderPostCall()` HA banner visibility logic
- All 5 scenario IDs and their `case_type`, `ha_status`, `meds_type` fields
- Rx overlay, zoom, rotate, pan, pinch logic
- Completed overlay
- Toast system
- `doFastForward()` function
- All bottom sheet open/close mechanics
- `switchScenario()` function structure
- Desktop side panel structure (just update labels)

---

## 4. Design system — confirmed tokens

```css
--bg:               #f0f4f8;
--surface:          #ffffff;
--surface-elevated: #f8fafc;
--primary:          #1B69DE;   /* Truemeds brand blue */
--success:          #16a34a;
--warning:          #d97706;
--danger:           #dc2626;
--text-primary:     #111827;
--text-secondary:   #6b7280;
--text-muted:       #9ca3af;
--radius-card:      12px;
--radius-btn:       10px;
--radius-input:     8px;
```

Light theme confirmed. Do not revert to dark theme.

---

## 5. Open questions status

All open questions are in `docs/context/open_questions.md`.
OQ-001 through OQ-010 were pre-existing.
OQ-011 was added in this session (medicine qty/disable scope).
None have been answered yet. All use safe placeholders.

---

## 6. Git setup

- Remote: `git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git`
- Branch: `main`
- SSH key fingerprint: `SHA256:rpNSUQGp1H2ojI66wb9PTj4DiFCmVCau2MprBpJZKlU`
- To push after changes: `git add . && git commit -m "message" && git push`

On a new machine — clone with:
```bash
git clone git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git
```
You will need to generate a new SSH key on that machine and add it to the apurvashetty-tm GitHub account (same process — ssh-keygen → copy public key → github.com/settings/keys).

---

## 7. How to resume in a new session

1. Clone the repo (or pull latest)
2. Open Claude Code in the project folder
3. Claude will automatically read `CLAUDE.md`
4. Say: **"Read session_handoff.md and all docs files, then continue the pending index.html rebuild from Section 2."**
5. Claude should confirm it has read the handoff and list the changes it is about to make before touching any code

---

## 8. What was NOT built in this session

- The index.html structural rebuild (Section 2) — agreed and fully planned, not yet executed
- Add Medicine sheet functionality (agreed placeholder)
- Any multi-scenario state persistence
- Any backend integration (intentionally out of scope for V1)

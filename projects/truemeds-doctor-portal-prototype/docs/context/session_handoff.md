# session_handoff.md — Truemeds Doctor Portal Prototype

**Purpose:** Captures all decisions, agreements, and pending work so a new Claude session on any machine can pick up exactly where things left off.

**Last updated:** 2026-06-09
**Session status:** Section 2 rebuild COMPLETE. Section 3 additions agreed, pending build.

---

## 1. What has been built (current index.html state)

The current `index.html` is a working V2 prototype with all Section 2 structural changes applied:

- Light theme (Truemeds brand-inspired, `#1B69DE` primary blue, `#f0f4f8` background)
- All 5 mock scenarios switchable via side panel (desktop) — demo bar hidden on desktop via `@media (min-width: 800px)`
- Valid-call gate at 50 seconds [LOCKED, working]
- CTA routing matrix [LOCKED, working] — Confirm Order / Confirm & Transfer / Confirm & Forward
- HA banner [LOCKED, working] — Pilot + HA required + not skipped only
- Skip HA Call logic [LOCKED, working]
- Rx overlay with dummy prescription, zoom/rotate/pan/pinch [working]
- Desktop side panel with scenario switcher [working]
- Fast-forward to 50s demo button [working]
- Bottom sheets: Hold, No Pickup, Skip HA, Edit Medicine, Add Medicine [working]
- `#sticky-top-wrapper` with `#compact-strip` — shows compact patient info when patient block scrolls out of view
- `#patient-detail-block` (no badge row, no separate prescription section)
- New medicine data format: `{id, name, strength, m, a, n, qty, validation_status, disabled}`
- M-A-N picker in Edit Medicine sheet (0 / ½ / 1 / 2 per row)
- Qty stepper in Edit Medicine sheet
- Disable / Enable Medicine toggle in Edit Medicine sheet
- Add Medicine sheet (name + strength inputs, mock-only)
- Action zone with phase 1 (call control) + phase 2 (post-call CTA) merged
- Order value displayed in patient block as `₹1,240`
- Sheet overlay aligned to mobile column via `getBoundingClientRect()`

---

## 2. Section 2 — COMPLETED (reference only)

All 8 structural changes from the original plan have been implemented:

- [x] 2.1 Sticky header with compact strip
- [x] 2.2 Patient detail block (no badge row)
- [x] 2.3 Prescription card section removed
- [x] 2.4 New medicine data format + M-A-N display
- [x] 2.5 Edit medicine sheet with M-A-N picker + qty stepper + disable toggle
- [x] 2.6 Add Medicine sheet wired up
- [x] 2.7 Action zone merged (call + post-call phases)
- [x] 2.8 Section order corrected (patient → medicines → notes → action zone)

---

## 3. Agreed additions — pending build (DO THIS NEXT)

These were agreed after the Section 2 build, based on a brainstorm comparing the prototype against the existing portal screenshots.

### 3.1 Patient block restructure — add order details expandable

**Current:** Patient block shows name, age/gender, order value, order ID.

**Change:**
- Add `ⓘ` info button inline in patient block header (right side, near name row)
- Tapping `ⓘ` toggles an inline expand section (NOT a sheet, NOT a modal) below the existing patient info
- Expand section shows:
  - Created: [order_created date]
  - Delivery: [order_delivery date]
  - Payment: [payment_mode]
- Collapse on second tap of `ⓘ`
- Default state: collapsed

**Rationale:** Doctor needs order dates occasionally (~30% of calls, when patient asks "when does it arrive?"). Not every call — so it lives behind a tap, not always visible. Saves vertical space for medicines.

**Mock data to add:** `order_created`, `order_delivery`, `payment_mode` fields to all 5 scenarios.

### 3.2 Sticky order value in compact strip

**Current:** Compact strip shows patient name, age/gender, timer badge, View Rx button.

**Change:** Add order value (e.g., `₹1,240`) to compact strip, right-aligned.

**Rationale:** If patient block has scrolled out of view, doctor still needs order value visible during call.

### 3.3 Selling price per medicine

**Current:** Medicine cards show name + strength, M-A-N + qty, validation badge, edit button.

**Change:** Add selling price (e.g., `₹52`) right-aligned on each medicine card.

**Rationale:** Doctor consults, doesn't sell. One number answers "how much does this tablet cost?" No MRP, no discount %, no savings — just the selling price.

**Mock data to add:** `price` field (integer, INR) to each medicine in all 5 scenarios.

### 3.4 Profile icon — doctor identity, earnings, logout

**Current:** No logout. No doctor identity. No earnings.

**Change:**
- Add profile icon top-right of header (circle with initials or `👤` icon)
- Tap opens bottom sheet `sheet-profile` with:
  - Doctor avatar + name (e.g., "Apurva Shetty") + role ("General Physician")
  - Today's Earnings: `₹X.XX earned | ₹X.XX incentive`
  - User Manual button (mock link)
  - Logout button (danger-outlined, bottom of sheet)

**Rationale:**
- Logout: Each doctor uses their own personal device — not a shared clinic setup. Logout is required security hygiene.
- Earnings: Exists in current portal ("My Earnings" in hamburger menu). Included in MVP.
- User Manual: Exists in current portal. Keep it accessible.
- Doctor name: Identity confirmation for whose session this is.
- No Dashboard, Statistics, Schedule — those are separate app screens, not consultation-relevant.

**Mock data to add:** `DOCTOR_PROFILE` constant with `doctor_name`, `doctor_role`, `earnings_today`, `incentive_today`.

---

## 4. Decisions made — not to be re-debated

| Decision | Rationale |
|---|---|
| Bill summary NOT added | Cognitive overload, not consultation-relevant |
| Delivery address NOT added | Patient has it on their app; SOP handles questions |
| Customer history NOT in MVP | Deferred |
| Cancel Order NOT added | SOP and script handles this; destructive action risk |
| MRP / discount % NOT shown per medicine | Doctor consults not sells; selling price is enough |
| Payment mode in expandable order section only | Occasional use, not always visible |
| Earnings NOT a standalone bar | Goes into profile sheet |
| Separate Order Details card NOT added | Combined into patient block with expand; saves real estate |

---

## 5. What must NOT be changed

These are locked and working. Do not touch:

- `resolveCTA()` — CTA routing matrix
- `haSkipApplicable()` — Skip HA eligibility
- Valid-call gate at 50 seconds in `startCallTimer()`
- `renderPostCall()` HA banner visibility logic
- All 5 scenario IDs and their `case_type`, `ha_status`, `meds_type` fields
- Rx overlay, zoom, rotate, pan, pinch logic
- Completed overlay
- Toast system
- `doFastForward()`
- All bottom sheet open/close mechanics
- `switchScenario()` function structure
- Desktop side panel structure
- Sheet overlay alignment in `openSheet()` using `getBoundingClientRect()`

---

## 6. Design system — confirmed tokens

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

**Light theme is confirmed.** Do not revert to dark theme.

---

## 7. Open questions status

All in `docs/context/open_questions.md`.
- OQ-001 to OQ-003: Open
- OQ-004: Updated — medicines are no longer read-only; add/edit/disable was built in Section 2
- OQ-005 to OQ-010: Open
- OQ-011: Open (medicine qty/disable scope)
None formally answered yet. All use safe placeholders.

---

## 8. Git setup

- Remote: `git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git`
- Branch: `main`
- SSH key fingerprint: `SHA256:rpNSUQGp1H2ojI66wb9PTj4DiFCmVCau2MprBpJZKlU`
- Push: `git add . && git commit -m "message" && git push`
- New machine: `git clone git@github.com:apurvashetty-tm/truemeds-doctor-portal-prototype.git` + new SSH key

---

## 9. How to resume in a new session

1. Pull latest from repo
2. Open Claude Code in project folder
3. Claude reads `CLAUDE.md` automatically
4. Say: **"Read session_handoff.md and all docs files, then build the Section 3 additions."**
5. Claude should confirm it has read the handoff and list exactly what it will build before touching any code.

---

## 10. What is still NOT built

- Section 3 additions (patient block order expand, sticky order value, medicine selling price, profile sheet)
- Any multi-scenario state persistence
- Any backend integration (intentionally out of scope for V1)

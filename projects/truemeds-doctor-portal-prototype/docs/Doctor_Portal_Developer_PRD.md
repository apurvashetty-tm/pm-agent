# Truemeds Doctor Portal — Developer PRD (v2)

**Status:** Draft for engineering estimation
**Author:** Claude (PM/UX/architecture pass), consolidating `project_truth.md`, prototype source, current-production screenshots, and DocsStat (PharmEasy) competitor SOP
**Last updated:** 2026-07-13

**Labels used throughout:** `[LOCKED]` already decided, must be followed · `[RECOMMENDED]` this PRD's expert recommendation, open to override · `[MOCK ASSUMPTION]` prototype-only placeholder · `[OPEN DECISION]` requires Product/Ops/Medical/Compliance confirmation before build.

---

## At a Glance

| | |
|---|---|
| **Problem** | One screen does clinical review + pricing + cross-sell + billing, no in-app calling (§2). |
| **Recommendation** | Native in-app calling; doctor screen scoped to clinical decisions only (§8, §3.4). |
| **Phase 1** | In-app calling, Case Rejection, Diagnosis/Allergy, pre-submit review, pricing/billing/substitution UI removed (§11.1). |
| **Blocked on** | Ozonetel vendor confirmation + device POC (§11.0) — estimate not final until this closes. |

## Decisions Needed From You

Routing only — detail at the linked section.

| Role | Decision | Section |
|---|---|---|
| Medical/Compliance/Legal | Reject taxonomy, Diagnosis/Allergy contract, call-recording scope | §6 R1/R2 · §10.5 · OQ-New-2, -3, -8 |
| Ops | Super Doctor destination, callback queue, multi-patient frequency | §3.3 · OQ-New-4, OQ-012, OQ-New-5 |
| Mobile platform owner | RN vs. native-host ADR | §8.5 D2 · OQ-New-9 |
| Product/Telephony | Ozonetel confirmation | §11.0 item 1 · OQ-New-7 |
| Backend/Telephony eng | Call-state protocol ownership, handoff payload schemas | §10.3 · OQ-New-10, -11 |
| Security | RN-WebView bridge review gate | §10.5 · OQ-New-13 |
| Project owner | Hold/No-Pickup model vs. `project_truth.md`; Reject pre-gate exception | OQ-New-1, OQ-New-12 |

---

## 1. Executive Summary

The current Doctor Portal conflates four teams' jobs on one screen and has no in-app calling. This PRD scopes the doctor down to clinical decisions only (§3), adds a Case Rejection path and structured Diagnosis/Allergy capture that don't exist today (§6), and recommends a native in-app calling layer over a browser-only one because the relevant Ozonetel SDK is native, not browser-based (§8) — pending Phase 0 vendor validation (§11.0). Full reasoning for each of these lives in its own section below; this paragraph is status, not argument.

---

## 2. Context, Current Problem, and Why Now

### 2.0 Problem Statement

The Doctor Portal's screen does four teams' jobs at once — clinical review, substitution pricing, cross-selling, and billing — with no in-app call control, forcing doctors out to the native phone dialler for every consultation. This creates cognitive overload during time-pressured clinical decisions, a conflict-of-interest optic (earnings banner sits above a pre-selected cheaper-substitute toggle on the same screen where the doctor approves a prescription), and no reliable, auditable calling experience. This PRD exists to narrow the doctor's screen to the Doctor JTBD (§3) and give it a real in-app calling layer (§7–§8). Evidence for each claim above is in §2.1–2.3 below.

### 2.1 What exists today

**Production** (`reference/current-portal-screenshots/`, Truemeds Doctor Portal v3.48.0): a single long scroll containing, in order — earnings/incentive banner, a bare "Call Patient" button (no in-app call state visible anywhere in the screenshots — the doctor is calling out through the phone's native dialler), patient name/age/gender, a **sticky amber "Health Advisor transfer call" banner** that persists across the entire scroll and consumes significant vertical space regardless of whether it's currently relevant, a full delivery address block, a "Customer History" button, order metadata, an **"All Original / All Subs" toggle** that — critically — **pre-selects the substitute brand by default** (radio button on "Telniz," not the customer's originally-ordered "Telma"), a "Subs taken: 4680 / Savings: 50%" social-proof line, per-medicine Disable/"Add ORG" controls, a "Cross Selling Section" button, a full **bill breakdown** (ORG MRP, SUB MRP, discount %, delivery fee, GST packaging charge, TM Rewards, TM Credit, final total), and finally Confirm Order / Cancel Order / Hold Order.

This is the concrete evidence behind the JTBD boundary problem this PRD exists to fix: the doctor's screen is doing pricing-optimization and merchandising work, defaulting the doctor toward the cheaper substitute before any consent conversation has happened, inside a screen that also determines whether a patient gets a Schedule-H drug approved.

**Prototype** (`index.html` / `app.js` / `styles.css`, this repo): a from-scratch rebuild that already fixes most of the *structural* problems — single scroll, sticky compact strip, non-blocking toasts instead of full-page overlays, a shared `.btn` design system (§9), a pre-call briefing strip that replaced the sticky HA banner with contextual script copy, and a fully working, correctly-gated CTA routing engine (`resolveCTA()`, locked, `project_truth.md` §5). It does **not** yet touch calling architecture (call is still conceptually "external" — the timer is a JS simulation of an already-connected call, not a real call control surface), and it has **no case-rejection path at all**.

### 2.2 What the prototype gets right (keep, don't rebuild)

- Valid-call gate at 50s, CTA routing matrix (`cat4→Confirm Order`, `pilot+HA+value→Confirm & Transfer`, `pilot+HA+non_value→Confirm & Forward`, `HA skipped→Confirm Order`) — correct, deterministic, not doctor-chosen. The doctor never picks a department; the system resolves it from case data. This is a real strength worth calling out: it removes a whole class of doctor error and should not change.
- Medicine edit sheet (interval, M-A-N, duration, advice, qty) — matches competitor's dosage/frequency/duration/instructions pattern (§7) and is more structured than the free-text-heavy competitor flow.
- Schedule Callback UX (three placements: quiet link during call, ghost-button recovery after early hangup, chip post-gate) — a genuinely well-designed escape hatch; keep as-is.
- Shared `.btn` design system — solves a real, documented problem (Schedule Callback previously had three different visual treatments across the file before the token system existed). Any new CTA in this PRD must use it.

### 2.3 What's missing or wrong, and why it matters now

| Gap | Evidence | Why it matters |
|---|---|---|
| No Case Rejection path | Neither prototype nor production has a doctor-facing "I will not/cannot prescribe this" action distinct from HA-transfer. Production has "Cancel Order" (commercial, not clinical). Competitor SOP has 5 structured reject reasons including Schedule X/narcotic handling. | A doctor who cannot safely prescribe currently has no correct button to press. This is a clinical-safety gap, not a UX nice-to-have. |
| No structured Diagnosis field | Prototype has only free-text "Chief Complaints/Symptoms" + "Doctor Notes." Competitor SOP requires diagnosis, allergies, and last-RMP-visit confirmed on every call. | Diagnosis is the clinical justification for the prescription; leaving it as optional free text is weaker than the competitor baseline and weaker than most e-prescription audit requirements. |
| Doctor screen carries pricing/substitution/billing work | Production screenshots, §2.1. | Not the Doctor JTBD (§3). Also a conflict-of-interest optics problem: an earnings/incentive banner sits directly above a pre-selected cheaper-substitute toggle on the same screen where the doctor approves the order. |
| No in-app call control | Neither build shows mute/hold/resume/end inside the app; the 50s timer is a simulation of a call assumed to be happening elsewhere. | This is the explicit non-negotiable target of this revamp (§4). |
| `project_truth.md` §6 (manual Hold, manual No-Pickup) contradicts the built prototype | `app.js` models no-answer/timeout as **webhook-driven** states (`simWebhook('no_answer'|'timeout')`) surfaced via a Retry/Unavailable sheet — there is no manual "Hold" button or manual "No Pickup" button anywhere in `index.html`. | Real telephony integration will report no-answer via a webhook, not a doctor self-report. This PRD recommends the webhook-driven model as correct (§13, OQ-New-1) and flags the contradiction rather than silently picking one. |
| No pre-submit prescription review | Doctor taps the final CTA directly from the medicines list; there is no "here is exactly what's about to be sent" screen. | Competitor SOP has an explicit "Review Prescription" step before submit. Lower risk of a wrong-medicine submission with one added screen. |

---

## 3. Doctor JTBD, Users, and Scope Boundaries

### 3.1 Primary Doctor JTBD

*When a case requiring medical review reaches me, help me quickly understand why intervention is required, assess the correct patient using sufficient clinical context, complete the consultation, make a safe and compliant clinical decision, and leave an accurate, auditable prescription or case disposition — without making me perform work that belongs to Health Advisors, CSR, Payments, Pricing, or Operations.*

Validated against the prototype, competitor SOP, and current-production evidence, with one addition made explicit: **the doctor's job ends at a clinical decision + structured handoff.** It does not include selecting which brand is cheaper, adjusting a bill, or editing a delivery address. Where the current product blurs this line, this PRD treats it as a bug in scope, not a feature to preserve.

### 3.2 Supporting jobs

- Understand why *this specific* case needs a doctor (missing/unclear Rx, unlisted medicine, flagged interaction) — currently only implicit in prototype (doctor infers reason from scenario data); competitor SOP explicitly states the reason on the case's first page. **[RECOMMENDED]** surface an explicit "Reason for Review" field, Phase 1.
- Verify patient identity before proceeding (name/age/gender match against the order) — implemented.
- Reference prior clinical context (previous Rx, previous orders, allergies) — partially open, see §3.3 boundary matrix.
- Leave the case in a state operations can act on without re-asking the doctor anything.

### 3.3 Doctor user types

| User type | Definition | Status in this PRD |
|---|---|---|
| **Doctor (RMP)** | Standard consulting doctor; default role modeled by the prototype. | Fully specified below. |
| **Super Doctor** | Senior/compliance-authority doctor for escalated, Schedule-X-adjacent, or audit-flagged cases. | **[OPEN DECISION]** — not defined anywhere in current docs or prototype. This PRD recommends a **minimal Phase 1 hook** (an "Escalate to Super Doctor" reject reason, modeled on the competitor's "Reassign to Admin") rather than a full permission system, which is Phase 2 pending compliance input (§11). |

**Phase 1 escalation stub — minimum viable contract.** Escalating a case must:
- Write an immutable audit record (`case_id`, `doctor_id`, `reason`, `timestamp`).
- Remove the case from the doctor's active queue.
- Place it in a **named destination** the client can reference — even if that's initially a manual queue (e.g. a flagged list an Ops lead reviews), not necessarily automated routing on day one.
- Surface an acknowledgement state back to the case record so nothing disappears silently.

`[OPEN DECISION]` — destination system, owner, and SLA must be confirmed with Ops/Compliance before this is more than a stub. Phase 1 must not ship escalation as a dead-end action with no defined receiving process, even a manual one.

### 3.4 Ownership, permission, and handoff matrix

This is the concise, explicit answer to "what does the doctor own." Anything not in the Doctor's View/Change columns is out of scope for this portal.

| Capability | Doctor can view | Doctor can change | Requires Super Doctor | Goes to HA | Goes to CSR/Ops | Must be auditable |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Reason for review / case flag | ✅ | — | — | — | — | — |
| Patient identity (name/age/gender) | ✅ | — | — | — | — | — |
| Uploaded prescription (image/PDF) | ✅ | — | — | — | — | — |
| Previous prescriptions / previous orders | ✅ (Phase 2) | — | — | — | — | — |
| Diagnosis | ✅ | ✅ | — | — | — | ✅ |
| Symptoms / allergies / clinical notes | ✅ | ✅ | — | — | — | ✅ |
| Medicine list (dosage, frequency, duration, instructions) | ✅ | ✅ | — | — | — | ✅ |
| Medicine add | ✅ | ✅ | — | — | — | ✅ |
| Medicine disable (with reason) | ✅ | ✅ | — | — | — | ✅ |
| Medicine qty/strength beyond what was ordered | ✅ | ⚠️ `[OPEN DECISION]` OQ-011 | — | — | — | ✅ |
| Substitution (brand/price selection, consent, merchandising) — all of it | — | ❌ Not on Doctor Portal at all — no view, no consent capture, no touchpoint | — | — | ✅ (pricing engine / CSR) | — |
| Diagnostic test prescribing | — | ❌ Phase 1 / `[OPEN DECISION]` Phase 2 | — | — | — | — |
| Call initiate/mute/hold/resume/end/transfer | ✅ | ✅ | — | — | — | ✅ |
| Case Rejection (clinical reasons incl. Schedule X) | ✅ | ✅ | Escalation path | — | ✅ (commercial follow-through) | ✅ |
| Schedule Callback | ✅ | ✅ | — | — | ✅ (callback queue) | ✅ |
| Skip HA Call | ✅ | ✅ (Pilot + HA-required only) | — | ✅ (notified) | — | ✅ |
| Confirm & Transfer (live warm transfer) | ✅ | ✅ (system-resolved, not doctor-chosen) | — | ✅ | — | ✅ |
| Confirm & Forward (async handoff) | ✅ | ✅ (system-resolved, not doctor-chosen) | — | ✅ | — | ✅ |
| Order value (read-only) | ✅ | ❌ | — | — | ✅ | — |
| Bill breakdown, discounts, GST | ❌ | ❌ | — | — | ✅ | — |
| Delivery address | ❌ (Phase 1) / ✅ read-only (Phase 2 if needed for clinical context) | ❌ | — | — | ✅ | — |
| Payment mode | ❌ | ❌ | — | — | ✅ | — |
| Patient-name correction | — | ❌ | — | — | ✅ | — |
| Cross-selling / upsell | ❌ | ❌ | — | — | ✅ (Marketing/Pricing) | — |
| Order cancellation (commercial) | — | ❌ (doctor rejects clinically; Ops executes cancellation) | — | — | ✅ | ✅ (trigger logged) |

**Read this table as the scope contract.** Every row that is `❌` across Doctor columns is a **[RECOMMENDED]** removal from what production currently shows the doctor (§2.1) — not a hypothetical; it is reversing an existing scope leak.

**Handoff contract — minimum fields per destination (HA/CSR/Ops/Super Doctor).** Naming a destination ("goes to HA") isn't an implementable contract. Every "✅" above requires, at minimum:
- **Trigger** — which doctor action fires it.
- **Payload** — case ID + the structured fields relevant to that handoff.
- **Acknowledgement requirement** — does the receiving system confirm receipt before the case can leave `gate_passed`, or is it fire-and-forget?
- **Timeout/retry policy**, if acknowledgement is required.
- **Doctor-visible failure state** — never a success toast for a handoff that silently failed downstream.

Exact payload schema per destination is `[OPEN DECISION]` (§13.2), owned by whichever team owns that destination system — this PRD specifies the contract shape, not the implementation.

---

## 4. Goals and Non-goals

**Goals (Phase 1, measurable):**
- G1: Doctor completes an entire consultation (call start → end) without leaving the Truemeds app or touching the phone's native dialler UI.
- G2: Every case reaches a doctor-side disposition — Confirm Order / Confirm & Transfer / Confirm & Forward / **Reject (new)** / Schedule Callback — that is recorded and either auto-acknowledged or explicitly tracked as pending downstream acknowledgement (§5.4, §10.3 handoff contract). No case can be abandoned with no record; "terminal for the doctor" is not the same claim as "resolved end-to-end" — the callback-queue mock assumption (OQ-012) and handoff acknowledgement gaps mean full downstream resolution is not yet guaranteed, only doctor-side completion.
- G3: Every submitted case carries a structured Diagnosis and an explicit, non-blank allergy status (Yes/No/Unknown are all valid explicit answers — the requirement is that the field was actively set, not that it excludes "Unknown").
- G4: No substitution UI of any kind on the doctor's screen — no substitute name, no price delta, no consent capture, no discount/savings copy, no bill-editing, no address-editing, no cross-sell UI. Substitution is not a Doctor Portal capability; it belongs entirely to CSR/pricing (§3.4). *(Scope corrected per explicit product direction: the doctor should not touch substitution in any form, including consent — see §6 R4.)*
- G5: Every state-changing doctor action is instrumented (§12) and traceable to a case ID and doctor ID.

**Non-goals (Phase 1):**
- Not rebuilding CSR, Ops, HA, or Pricing tooling — only defining the handoff contract to them.
- Not building queue management, multi-case views, or admin reassignment (already excluded by `project_truth.md` §8).
- Not building a full Super Doctor permission system — Phase 1 ships only the escalation hook.
- Not migrating the full UI to React Native — only the calling layer is native in Phase 1 (§8).

---

## 5. Current Flow vs Target Flow

### 5.1 Current dialler-based calling flow

```
Doctor taps "Call Patient"
        │
        ▼
Device native dialler opens / places PSTN call to doctor's own number as one leg
        │
        ▼
Doctor's phone rings on the OS dialler UI (separate from Truemeds app)
        │
        ▼
Doctor answers on native call UI — Truemeds app is now backgrounded
        │
        ▼
Call proceeds entirely outside app control — no mute/hold/timer/transfer
  available from within Truemeds; app has no reliable signal of call state
        │
        ▼
Doctor manually returns to Truemeds app after hanging up on the native dialler
        │
        ▼
Doctor manually confirms in-app that the call happened (implicit, unverified)
```

This is why the valid-call gate today is a *trust-based* checkpoint rather than a *telephony-verified* one, and why Transfer (a live warm hand-off to HA) is operationally difficult — there is no call leg inside the app to transfer.

### 5.2 Target consultation journey (state machine, matches `DOCTOR_STATE.consultationState` already in `app.js`, extended)

```
assigned → calling → connected → gate_passed → submitting → completed (doctor-side)
              │           │                         │              │
              ├─no_answer/timeout (webhook)          │              └─→ handoff_pending → handoff_accepted
              │           │                          │                              (or) handoff_failed
              └───────────┴──→ hold (system re-queue) / unavailable (reassign)         → doctor-visible failure state, not silent

connected → endedEarly (before 50s) → Call Again | Schedule Callback

gate_passed → { Confirm Order | Confirm & Transfer | Confirm & Forward |
                Reject Case (NEW, post-gate only in Phase 1, zero exceptions — see R1) |
                Schedule Callback | Skip HA Call → re-resolve CTA }

submitting → submission_failed → doctor sees retry, case is NOT silently dropped
```

`completed` is not a single terminal state. It is terminal **for the doctor's UI**, but the case's actual disposition depends on a downstream system (HA, Ops, Super Doctor queue, callback queue) acknowledging it. `submitting`, `submission_failed`, `handoff_pending`, `handoff_accepted`, and `handoff_failed` are the states that stop a doctor from seeing a success toast for a handoff that silently failed downstream.

### 5.3 Target in-app calling flow

```
Doctor taps "Call Patient" (in-app button, unchanged visually)
        │
        ▼
Native calling module places call: customer leg via Ozonetel PSTN/SIP trunk,
doctor leg via app's own mic/speaker through CallKit (iOS) / ConnectionService (Android)
        │
        ▼
Doctor sees native call UI (lock screen / in-app) with Mute, Hold, End —
audio routes through phone earpiece/speaker/Bluetooth, doctor never leaves the app
        │
        ▼
App receives call-state webhooks (connected/ended/duration) → drives
DOCTOR_STATE.consultationState and the 50s gate from verified telephony events,
not a client-only timer
        │
        ▼
For "Confirm & Transfer" cases: doctor's call leg is conferenced/transferred to
HA leg while customer stays connected (warm transfer) — requires the SDK's
app-to-app / multi-leg conferencing capability
        │
        ▼
Call ends → app has a verified call record (duration, recording ref, disposition)
before the doctor can submit a final CTA
```

### 5.4 Major state transitions requiring explicit handling (not fully covered today)

| Transition | Current coverage | Required for Phase 1 |
|---|---|---|
| Call connects then drops mid-call, doctor is under 50s | Not covered | Reconnect attempt; timer behavior per OQ-001 resolution (§13) |
| Doctor backgrounds app during live call | Not covered (no real call layer exists yet) | Must survive via native call session (CallKit/ConnectionService), independent of app foreground state |
| Doctor's device loses network mid-call | Not covered | Reconnection window + doctor-visible "reconnecting" state; auto-fail to `no_answer`-equivalent after timeout |
| Warm transfer to HA fails (HA leg doesn't pick up) | Not covered | Fallback to "Confirm & Forward" semantics with a visible doctor alert, not a silent failure |
| Doctor rejects a case | **Does not exist** | New terminal state, §6 |

---

## 6. Proposed Product Experience and Functional Requirements

Each requirement: **Problem → Behaviour → Rule → Permission → Edge/Error → Acceptance.**

### R1 — Case Rejection (NEW, Phase 1, highest-priority gap)

- **Problem:** Doctor has no way to formally decline to prescribe. Today the only "no" path is silence or the commercial "Cancel Order," which isn't a clinical record.
- **Behaviour:** A tertiary "Reject Case" action (styled `btn-text-danger`, matching the existing Disable-medicine pattern) available only from `az-phase2` (post-gate, i.e. after `gate_passed`), as an alternative to the resolved CTA. Opens a reason sheet. Reject is not offered in `az-phase1` — see the Edge/Error note below for why the gate applies to Reject with zero exceptions.
- **Rule — reason taxonomy** `[RECOMMENDED]`, adapted from competitor SOP §7 (already field-tested at scale, adjust naming to Truemeds terms):
  1. **Cannot prescribe over teleconsultation** (includes Schedule X / narcotic / animal / retail-shop / no-recent-Rx-for-restricted-drug cases) → auto-routes to Super Doctor escalation, does not auto-cancel commercially.
  2. **Patient refuses consultation / declines medicines** (sub-reasons: ordered by mistake, wants cancellation, medicines not needed, unaware of order) → routes to Ops for commercial cancellation.
  3. **Already purchased elsewhere** → routes to Ops.
  4. **Duplicate order (valid Rx already used on another order)** → routes to Ops.
  5. **Escalate to Super Doctor** (patient uncooperative, language barrier, unresolvable ambiguity) → routes to Super Doctor queue, case leaves doctor's queue.
- **Permission:** Any Doctor. Reason 1 and 5 create a Super-Doctor-visible record (§3.4 escalation stub contract); Doctor cannot self-clear it.
- **Rule — taxonomy status:** this 5-reason list is a `[RECOMMENDED]` draft adapted from a competitor's operating SOP, not Truemeds medical/legal/compliance-approved policy. It must not be built as-is without explicit India-teleconsultation-qualified Medical, Legal, and Compliance sign-off (OQ-New-2, §13.2) — this applies to every reason, and especially to reason 1's Schedule X / narcotic handling, which carries real regulatory weight.
- **Edge/Error — gate interaction:**
  - Reject requires the full valid-call gate (`gate_passed`, ≥50s connected) — same bar as Confirm/Transfer/Forward, zero exceptions, including reason 1 (Schedule X). No pre-call or attempt-only Reject path in Phase 1.
  - Known gap: an unreachable patient with an evident Schedule-X medicine has no Reject path until a valid call somehow occurs — possibly never. Gate-exception scope is `[OPEN DECISION]` for the project owner (OQ-New-12, §13.2).
- **Acceptance:** Given `gate_passed` on a Schedule-X case, when the doctor selects Reject → "Cannot prescribe over teleconsultation," then the case is marked `rejected`, removed from the doctor's queue, audit-logged (doctor ID + reason + timestamp), and enters `handoff_pending` toward the Super Doctor stub (§3.4) — no success toast until that handoff acknowledges or is shown pending.

### R2 — Structured Diagnosis and Allergy capture

- **Problem:** `#notes-section` today is two free-text boxes; nothing is structured or mandatory.
- **Behaviour:** Add a required **Diagnosis** field (structured pick-list + free-text "other," populated from a standard ICD-adjacent short list — `[OPEN DECISION]` which taxonomy) and a required **Allergy confirmation** (Yes/No/Unknown toggle, free text if Yes) to `#notes-section`, above the existing Symptoms and Doctor Notes fields, which remain free text.
- **Rule:** Diagnosis (non-empty) and Allergy status (an explicit selection — Yes, No, or Unknown; the requirement is that the doctor actively chose one, not that "Unknown" is disallowed) must both be set before the final CTA is enabled — a second gate alongside the valid-call gate, checked at `gate_passed`.
- **Rule — taxonomy status:** the Diagnosis pick-list source (ICD-10 subset vs. an internal Truemeds list vs. free-text-only) is `[OPEN DECISION]` (OQ-New-3, §13.2) and requires Medical/Compliance input before the field can be built as a constrained pick-list rather than free text. Phase 1 must not silently invent a taxonomy.
- **Permission:** Doctor only, editable until Confirm; post-submission edit/lock policy is `[OPEN DECISION]` (OQ-005, extended to these new fields).
- **Edge/Error:** If doctor tries to tap the final CTA with Diagnosis empty or Allergy status unset, scroll to the field and show inline validation — no silent block.
- **Acceptance:** Given `gate_passed` state with Diagnosis empty or Allergy status unset, the main CTA button is present but disabled with a one-line reason; once both are explicitly set (Allergy may validly be set to "Unknown"), it enables without further action.

### R3 — Pre-submit prescription review

- **Problem:** No confirmation screen shows the doctor exactly what will be sent before it's sent.
- **Behaviour:** Tapping the main CTA opens a compact review sheet (not a new page — bottom sheet, consistent with existing pattern) listing: final medicine list with dosage/frequency/duration, diagnosis, and the resolved disposition (e.g., "Confirm & Transfer"). A single "Confirm & Submit" closes the loop; "Edit" returns to the medicines list.
- **Rule:** This review step does not re-open the valid-call gate or change CTA resolution — it's a confirmation layer only.
- **Permission:** Doctor only.
- **Edge/Error:** If medicines list is empty at review time, block submission with an explicit message (should be unreachable given R2/medicines flow, but must fail loud, not silent).
- **Acceptance:** Doctor cannot reach the `completed` state without passing through this review sheet at least once per case.

### R4 — Removed

Substitution (brand/price selection, consent capture, or any related UI) is **not a Doctor Portal capability, full stop** — not even a bounded consent step. This was scoped in an earlier draft (a same-salt substitute badge with Keep Original / Approve Substitute) modeled on the competitor SOP's consent-based substitution flow. That's cut per explicit product direction: the doctor should not be doing substitution in any form; it stays entirely with CSR/pricing (§3.4). No medicine card, at any point in the Doctor Portal, shows a substitute name, price, or consent control. R5–R7 keep their numbers unchanged.

### R5 — In-app calling (full detail in §7)

- **Problem:** No in-app call control exists.
- **Behaviour:** Call Patient/Mute/Hold/Resume/End/Transfer all execute without leaving the Truemeds app.
- **Acceptance:** See §7 acceptance criteria.

### R6 — Reason for Review (case context)

- **Problem:** Doctor isn't told *why* this case needs them.
- **Behaviour:** A one-line field at the top of `#patient-detail-block`, above the patient name: e.g. "No prescription attached — medicine requires Rx" or "Prescription unclear/expired." Sourced from the same upstream flag that assigned the case.
- **Rule:** Always present, never blank — if upstream data is missing, show "Reason not provided" rather than hiding the field (surfaces a data gap instead of masking it).
- **Acceptance:** Every one of the 5 mock scenarios (§ mock data) has a distinct, correct Reason-for-Review string.

### R7 — Keep unchanged (explicitly, to bound scope)

Medicine edit sheet, Rx viewer (zoom/rotate/pan), Schedule Callback (all 3 placements), Skip HA Call, toast system, scenario-switching demo bar (dev-only, stays out of the shipped build), design token system.

---

## 7. In-App Calling Experience

### 7.1 Doctor experience

Doctor taps **Call Patient** → native call session starts (no dialler redirect) → mic/speaker call with in-app controls: **Mute, Hold, Resume, End**. **Transfer to HA** appears only post-gate, for cases already resolved to "Confirm & Transfer" — no early/mid-call transfer in Phase 1 (`[OPEN DECISION]` whether that should ever be allowed, tracked in §13).

### 7.2 Call states (extends existing `DOCTOR_STATE.consultationState`)

| State | Trigger | Source of truth |
|---|---|---|
| `idle`/`assigned` | Case loaded | App |
| `calling` | Doctor taps Call | App → native SDK |
| `connected` | Both legs bridged | **Telephony webhook** (not client timer) |
| `on_hold` | Doctor taps Hold | Native SDK, mirrored to app state |
| `reconnecting` | Network loss mid-call | Native SDK / OS |
| `gate_passed` | Verified connected duration ≥ 50s | App, computed from webhook-reported connect/disconnect timestamps, not `setInterval` |
| `transferring` | Doctor taps Transfer (post-gate, Transfer-eligible cases only) | App → native SDK conference/transfer API |
| `no_answer` / `failed` | Dial failure or no pickup | Telephony webhook |
| `completed` | Final CTA submitted | App |

### 7.3 Customer leg vs doctor leg

- **Customer leg:** PSTN call to the customer's registered number, exactly as today — unaffected by this change.
- **Doctor leg:** currently PSTN-to-doctor's-personal-number (native dialler). Target: **app-native audio session** — the doctor's leg terminates inside the Truemeds app via the calling SDK's own transport, not a second PSTN call. *(Exact transport left unnamed — vendor SDK detail unverified in this repo; see §8.1.)*
- Both legs are bridged server-side by Ozonetel exactly as today; only the doctor-leg transport changes.

### 7.4 Permissions, background, failure recovery

| Concern | Requirement |
|---|---|
| Microphone permission | Requested at first call attempt, not at app install; clear rationale copy; hard-block Call button with a "Grant microphone access" CTA if denied, not a silent failure |
| Notification / VoIP-push permission | Requested alongside mic permission at first-run — required for incoming-call wake-up (§8.3); denial path must degrade to "app must be foregrounded to receive calls" rather than silently never ringing |
| App backgrounding | Call must survive backgrounding via native call session (CallKit/ConnectionService) — this is the core reason §8 recommends a native layer over WebView |
| Screen lock | Native call UI (CallKit lock-screen call banner / Android full-screen incoming-call intent) must remain controllable from the lock screen. **This is a required, OS-managed VoIP call UI — distinct from the PSTN native-dialler redirect this PRD removes.** See §7.6 AC1 for the precise distinction. |
| Bluetooth/headset/wired | Route through OS audio session APIs (AVAudioSession / AudioManager); requires an explicit audio-route state table (default speaker/earpiece, Bluetooth HFP connect/disconnect mid-call, wired-headset insert/remove, audio-focus loss to another app) verified on physical devices — not assumed to "just work" from using native session APIs alone |
| Network switch (Wi-Fi↔mobile data) | SDK-level reconnection; app shows a non-blocking "Reconnecting…" state, does not reset the 50s timer unless the underlying call actually drops (ties to OQ-001, §13) |
| App killed / device rebooted / force-quit mid-call | `[OPEN DECISION]` — no assumption made here that a call survives an OS-level force-quit or reboot; Phase 1 must define a "resume consultation" recovery flow driven by server-side call state and provider call-detail reconciliation when the app relaunches, rather than silently losing the case |
| Duplicate call prevention | Call button disabled while `calling`/`connected`/`transferring`; server-side idempotency key per case+attempt; client retry of a terminal action (e.g. double-tap Confirm) must not create a duplicate disposition |
| Session/auth expiry mid-call | Call continues (telephony session ≠ app auth session); app re-authenticates silently on next API call, never drops an active call for an expired app token |

### 7.5 Telephony events → case-state updates (instrumentation contract)

Every event below must be logged with `case_id`, `doctor_id`, `timestamp`, and `call_leg_id`:

`call.initiated` · `call.customer_connected` · `call.doctor_connected` · `call.both_connected` · `call.muted` / `call.unmuted` · `call.held` / `call.resumed` · `call.gate_passed` (fires once, server-verified) · `call.transfer_initiated` · `call.transfer_completed` / `call.transfer_failed` / `call.transfer_rolled_back` · `call.ended` (with `duration_verified_seconds`, `ended_by: doctor|customer|system`) · `call.reconnect_attempted` / `call.reconnect_succeeded` / `call.reconnect_failed` · `call.recording_available` (if applicable, per compliance requirement).

The events needed to debug a production call, not just describe its happy path: `sdk.initialized` / `sdk.init_failed` · `permission.requested` / `permission.granted` / `permission.denied` (mic and notification/VoIP-push separately) · `push.received` (incoming-call wake) · `call.ringing` · per-leg state (`customer_leg.state`, `doctor_leg.state`, `ha_leg.state` where applicable) · `media.failure` (ICE/audio pipeline failure, native-SDK-specific) · `audio.route_changed` (speaker/Bluetooth/wired, with reason) · `app.backgrounded` / `app.foregrounded` (correlated against call state) · `webhook.received` / `webhook.duplicate_ignored` / `webhook.rejected` (server-side, for reconciliation) · `token.refreshed`. Every event carries an `event_id` and `provider_error_code` where applicable, in addition to `case_id`/`doctor_id`/`timestamp`/`call_leg_id`, to support deduplication and cross-system reconciliation (§10.3).

### 7.6 Acceptance criteria

These are stated as testable conditions; each still needs to be expanded into full Given/When/Then QA test cases with a specific device/OS-version matrix and network-condition set before test execution — that expansion is QA-owned detail this PRD scopes but does not write out in full.

- AC1: A doctor can complete Call → Mute → Resume → End entirely from within the Truemeds app on a physical Android and iOS device, **without the native PSTN phone-dialler app ever appearing.** This does **not** mean no system call UI at all — an OS-managed VoIP call interface (CallKit banner / Android ConnectionService incoming-call UI) is expected and required for lock-screen control (§7.4) and is explicitly in scope, not a violation of this criterion.
- AC2: Locking the screen mid-call does not drop the call or lose mute/hold state, on the minimum supported OS versions to be defined in the device/OS test matrix (`[OPEN DECISION]`).
- AC3: The 50-second gate is computed from telephony-webhook-reported connect/disconnect events, not from a client-side `setInterval` that can drift if the app is backgrounded — with a defined, server-owned algorithm for reconnects, duplicate/out-of-order webhooks, and hold periods (§10.3) before this is buildable, not just testable.
- AC4: A "Confirm & Transfer" case allows the doctor to warm-transfer to an HA extension without the customer being disconnected, including a defined, non-silent fallback (to Forward-equivalent handling) if the HA leg is busy or unavailable (§10.6).

---

## 8. WebView vs React Native Evaluation and Recommendation

**Evidence caveat — the single biggest risk in this PRD:** everything below about Ozonetel's SDK (§8.1) is drawn from public documentation, not a signed contract, sandbox access, or a working integration in this repo. `app.js`/`index.html` are a browser simulation — valid evidence for **UI/UX** decisions only, zero evidence for any WebView/RN/Ozonetel/device-lifecycle claim. Read every "the SDK supports X" as **"public docs claim X — unverified against a Truemeds account"** until Phase 0 (§11.0) closes with a vendor-confirmed design and a device POC. This section's recommendation is conditional on that POC, not a substitute for it.

### 8.1 Key input fact

Ozonetel's relevant product for this use case, **CXi Switch SDK**, ships as a native Android `.aar` and an iOS framework/Swift package **with CallKit support**, supporting App-to-App calling with full lifecycle control (accept/decline/mute/hold/resume/end) and FCM/webhook-based incoming-call notification. It is not published as a browser/WebRTC SDK for this call pattern. Ozonetel's browser WebRTC product (Click-to-Call) is a one-way Web→CloudAgent contact-center widget, architecturally built for a different problem (customer-initiates-contact-to-a-campaign), not a peer-bridged doctor↔patient↔HA multi-leg flow with warm transfer.

This one fact drives most of the comparison below: a **compliant** in-app calling experience (§4's non-negotiable target, specifically background/lock-screen reliability and warm transfer) is only cleanly achievable through the native SDK path.

### 8.2 Option A — In-app calling inside the existing mobile WebView

| Area | Finding |
|---|---|
| WebRTC in WebView | Supported in principle (Android WebView 5.0+, iOS WKWebView 14.3+) but **loses CallKit/ConnectionService interop** and native audio-session control — confirmed by current WebRTC-in-mobile research. |
| Microphone permission | Browser-style `getUserMedia` prompt inside a WebView; inconsistent UX vs a native permission prompt, and some Android WebView configurations require explicit `onPermissionRequest` handling in the native shell anyway — so a "pure" WebView approach still needs native shell changes. |
| Background execution | WebView JS execution is throttled/suspended when backgrounded on both platforms; an active WebRTC call inside a WebView typically **cannot survive backgrounding reliably** without native foreground-service (Android) / background-audio-mode (iOS) support bolted on — which is itself native shell work. |
| Screen lock / incoming-call UI | No native call banner, no lock-screen controls, without building a custom native overlay — which again is native shell work, eroding the "just use the WebView" premise. |
| Telephony SDK fit | Ozonetel's calling SDK for this pattern is native-only (§8.1) — Option A would require Truemeds to build a **custom** browser-side WebRTC softphone talking directly to Ozonetel's SIP trunk, bypassing the vendor SDK entirely. Materially higher engineering risk and ongoing maintenance burden than using the vendor SDK. |
| Native bridge requirements | Even a "minimal" Option A ends up needing: foreground service (Android), background audio mode (iOS), custom permission handling, custom incoming-call notification → i.e., most of the native shell work of Option B, without the vendor SDK or CallKit integration. |
| Effort | Nominally lower (no RN adoption) but the native-shell work required to make backgrounding/lock-screen reliable erodes most of that saving, while carrying more custom telephony code (higher long-term risk). |

**Verdict on Option A: not impossible, but the effort converges toward Option B's without the vendor SDK's benefits.** A native-shell-plus-custom-WebRTC path is a real, buildable option, just one that quietly reintroduces most of Option B's native-shell effort — foreground service, background audio mode, custom permission handling, custom incoming-call UI — while giving up the vendor SDK's CallKit integration and multi-leg transfer support. It is harder and higher-risk, not impossible.

### 8.3 Option B — React Native with native calling

| Area | Finding |
|---|---|
| SDK integration | Ozonetel CXi Switch native SDK (Android `.aar`, iOS framework) wrapped in a thin RN native module — the intended integration path for this exact vendor product. |
| Native audio/CallKit | `react-native-callkeep` (or direct native module) gives CallKit (iOS) / ConnectionService (Android) integration essentially for free — native call UI, lock-screen controls, OS-level interruption handling (another call, alarm, etc.) all handled by the OS call stack rather than custom code. |
| Push for incoming calls | VoIP push (APNs VoIP + PushKit on iOS, FCM high-priority on Android) is the standard pattern paired with CallKeep — well-documented, low novel risk. |
| Background audio | Native call session persists independent of JS thread / RN bridge state — this is the mechanism that solves §7.4's backgrounding requirement cleanly. |
| Reuse of existing web UI | The **non-calling** UI (patient context, medicines, notes, CTAs) does not need to be rewritten in RN — it can continue to live in the existing HTML/CSS/JS inside an RN `WebView` component, with a JS↔native bridge exposing `startCall()/mute()/hold()/end()/transfer()` and receiving call-state events back into the same `DOCTOR_STATE` object already in `app.js`. This is the phased approach recommended below. |
| Effort | Higher than Option A nominally (RN app shell, native module, CallKit setup, VoIP push infra) but this is effort spent on the actually-hard part (reliable native calling) rather than effort spent working around WebView limitations to approximate the same thing. |
| Long-term maintainability | Native calling code is isolated in one module; the web UI keeps its current fast-iteration workflow (no build step, no bundler — `frontend_engineer.md`'s constraints are unaffected for everything except the call module). |
| **RN-specific risk register** | RN↔WebView bridge reliability during an active call (a bridge stall while a call is live is a worse failure mode than a stalled UI elsewhere); JS-thread stalls affecting bridge message delivery; WebView state resynchronization after the native process is recreated by the OS; native-module/RN version drift and upgrade burden over time; app binary size increase; App Store/Play Store release cycle now coupled to native module changes, not just web deploys; added iOS/Android debugging ownership the team doesn't currently carry (`frontend_engineer.md`'s no-build-step, fast-iteration model applies only to the embedded web UI, not to this new native layer). These are real ongoing costs, not one-time setup costs, and should be estimated and owned explicitly rather than folded into "RN app shell" as a single line item. |

### 8.4 Comparison table

| Dimension | Option A (WebView) | Option B (RN + native calling shell) |
|---|---|---|
| Meets non-negotiable in-app calling target | Partial, with heavy custom work | Expected to, pending Phase 0 POC (§11.0) — not yet proven |
| Background/lock-screen reliability | Weak without native shell additions | Strong in principle via CallKit/ConnectionService — unverified against the specific vendor SDK until Phase 0 closes |
| Warm transfer to HA | Very hard (no vendor SDK path) | Public documentation claims app-to-app/multi-leg support — **unverified for this account**, the single largest open risk to this recommendation (§8.1 caveat, §11.0 item 1) |
| Time to market | Nominally faster, but converges toward Option B's effort once backgrounding is handled properly | Slower initial setup, but the effort is "real" work, not workaround work |
| Reuse of existing prototype UI | Full (no change) | Full for non-call UI (WebView-embedded), native only for calling |
| Engineering risk | High (custom WebRTC softphone, no vendor support) | Moderate (vendor SDK + well-documented CallKit pattern) |
| Long-term direction | Dead-end if Truemeds ever wants richer native features (biometric lock, native push, etc.) | Extensible — RN shell already in place for future native needs |

### 8.5 Recommendation

**This PRD separates two decisions. Decision 1 (non-negotiable): the calling layer must be native, not browser/WebView-based. Decision 2 (implementation detail, not forced by calling alone): whether that native layer is hosted inside a React Native shell or a minimal plain-native (Swift/Kotlin) host wrapping the same WebView.**

- **Decision 1 — native calling layer:** recommended, pending Phase 0 confirmation. Ozonetel's SDK for this pattern is native, not browser-based (§8.1), and §4's background/lock-screen/warm-transfer requirement is non-negotiable — so pure Option A (browser-only) is not recommended, independent of Decision 2.
- **Decision 2 — RN vs. minimal native host:** `[RECOMMENDED]` React Native, but not required by the calling need alone — a plain-native host would satisfy Decision 1 equally. RN's justification here is secondary: cross-platform code-sharing and easier future extension, *if* the mobile roadmap trends that way (unverified by this PRD). **Owned by the mobile platform roadmap owner as an ADR, not settled here** (OQ-New-9).
- **Phase 0 gate (§11.0):** before either decision is locked or estimated, Truemeds must obtain from Ozonetel: confirmed SDK availability/licensing for the account, a solution design covering the specific three-leg flow this product needs (customer PSTN ↔ doctor native leg ↔ warm transfer to HA), sandbox credentials, the webhook event schema, and a written support commitment — then run a physical-device proof of concept (both platforms) validating call setup, backgrounding, lock-screen control, and a warm transfer, before any Phase 1 estimate is finalized.
- **When Option A becomes the right call:** only if the Phase 0 POC shows a vendor-supported browser path meets the customer-bridge, HA-transfer, lifecycle, audio-routing, and security bar as well as native — or product leadership relaxes §4's non-negotiable framing. Neither is assumed true here.
- **Phased approach:** yes — Phase 1 is the native calling layer (RN-hosted, Decision 2's default) wrapping the **existing, unmodified** web UI; a full RN UI migration is a separate, later roadmap call.
- **Avoidable rework risk:** building a custom WebView WebRTC softphone first, then abandoning it for reliability, would waste that work. Recommend skipping it — go straight to Phase 0 validation of the native path.

---

## 9. UX and Design Decisions

These are final build decisions, not a design audit — `docs/design_system.md` remains the source of truth for tokens/components; this section only adds what's new.

- **CTA hierarchy:** unchanged — one `btn-primary` per context (existing rule, correct, keep). New Reject Case action uses `btn-text-danger`, same family as existing Disable-medicine and Mark-Unavailable actions — consistent semantic use of red-quiet-text for "significant but not the main flow" destructive actions.
- **Colours:** No new tokens needed. Reject Case follows the existing `btn-text-danger` semantics already used for Disable-medicine — no new color introduced.
- **Icons:** Add one new icon to the `ICONS` map — a reject/flag glyph for Reject Case. No emoji, per existing rule. **Icon-first compact CTAs** (adopted from the competitor's icon-only secondary actions, the one pattern worth taking from their flow): for high-frequency secondary actions already carrying an icon (e.g. Schedule Callback's calendar glyph), prefer icon+short-label over the full phrase in space-constrained placements (the post-gate chip row, §1.2 of `session_handoff.md`) — this is a small polish item, not a new interaction pattern, and doesn't apply to primary CTAs (Confirm Order/Transfer/Forward/Reject stay fully labeled, per the existing "no reliance on color/icon alone for critical state" accessibility rule, §9 Accessibility).
- **Labels:** Final terminology table (resolves §6/OQ-007 vocabulary ambiguity from `CLAUDE.md`'s "do not use interchangeably" instruction):

| Term | Meaning | Used for |
|---|---|---|
| **Confirm Order** | Terminal, no HA involvement needed | Cat4, or Pilot with HA already skipped |
| **Confirm & Transfer** | Terminal, live warm call-transfer to HA while customer stays on the line | Pilot + HA required + value meds |
| **Confirm & Forward** | Terminal, async case handoff — HA calls customer later | Pilot + HA required + non-value meds |
| **Skip HA Call** | Doctor-asserted, changes effective HA status to skipped, re-resolves CTA to Confirm Order | Pilot + HA required only |
| **Reject Case** (NEW) | Terminal, doctor declines to prescribe, structured reason required | Any case |
| **Schedule Callback** | Terminal for this session, case moves to callback queue | Any point pre- or post-gate |
| **Retry Call** | Non-terminal, re-attempt after system-reported no-answer/timeout | Webhook-driven `no_answer`/`hold` states only |
| **Call Again** | Non-terminal, re-attempt after doctor-initiated early hangup (<50s) | `endedEarly` state only |
| **Prescribe** | Per-medicine action confirming dosage/frequency/duration | Medicine edit sheet |
| **Disable** (medicine) | Per-medicine removal with reason, does not affect case-level disposition | Medicine edit sheet |
| ~~Hold~~ | **Retired as a doctor-facing term** (§2.3) — no manual Hold button; system-driven re-queue after webhook timeout uses internal state name only, never surfaced as a button label | — |
| ~~Approve / Validate~~ | **Not used** — "Prescribe" and "Confirm …" cover all doctor-facing confirmation actions; do not introduce synonyms | — |
| ~~Cancel~~ (as a doctor action) | **Not used on the Doctor Portal** — commercial cancellation is an Ops/CSR action, potentially *triggered by* certain Reject reasons, never directly labeled "Cancel" on a doctor-facing button | — |

- **Confirmation dialogs:** Reject Case (reasons 1 and 5) and Case-level Confirm-and-Submit (R3) get a lightweight confirm step (the review sheet itself, for CTA submission; a one-tap reason-select-is-the-confirmation for Reject, no extra "are you sure" dialog — matches existing low-friction pattern for Disable-medicine).
- **Medicine cards / status indicators:** unchanged, already correct (tappable card, chevron affordance, status badge).
- **Accessibility:** unchanged baseline (button semantics, 44×44 targets, contrast) — extend to the new Reject Case control, no new pattern needed.
- **Mobile/desktop:** unchanged — mobile-first single column, desktop side panel mirrors state, same as today.

---

## 10. Technical Requirements, Dependencies, and Edge Cases

### 10.1 Frontend (existing web UI, embedded in RN WebView)

- New: Reject-Case sheet, Diagnosis/Allergy fields, Pre-submit review sheet, Reason-for-Review field.
- `DOCTOR_STATE` gains: `rejectionReason`, `diagnosis`, `allergyStatus`, and call-state fields sourced from native bridge events rather than `setInterval` (§7.2).
- `resolveCTA()` gains a `reject` branch that short-circuits normal CTA resolution — must remain a pure function of case data, per existing architecture rule.

### 10.2 Native/mobile (new)

- RN shell app hosting the existing web UI in a `WebView` component.
- Native module wrapping Ozonetel CXi Switch SDK (Android `.aar`, iOS framework) — exposes `startCall()`, `mute()`, `unmute()`, `hold()`, `resume()`, `endCall()`, `transfer(targetExtension)` to the JS bridge.
- `react-native-callkeep` (or equivalent) for CallKit (iOS) / ConnectionService (Android) integration — native call UI, lock-screen controls.
- VoIP push: APNs VoIP + PushKit (iOS), FCM high-priority data message (Android) for incoming-call wake-up, per §8.3.
- Foreground service (Android) to keep the call session alive while app is backgrounded, in addition to ConnectionService.
- Microphone permission handled at OS level (native prompt), not browser `getUserMedia` inside the WebView.
- JS↔native bridge: native call-state events (`connected`, `held`, `ended`, `failed`, `reconnecting`) pushed into the WebView's `DOCTOR_STATE` via `postMessage`/`injectJavaScript`, matching the event names in §7.5.

### 10.3 Backend services and APIs

- Call session API: create/track a call session per case (`case_id`, `attempt_number`, `doctor_id`), returns session token for the native SDK.
- Telephony webhook receiver: ingests Ozonetel connect/disconnect/duration events, is the **source of truth** for the 50s gate (not client timer) — replaces the current `startCallTimer()` client-only simulation. **Must implement a defined call-state protocol:** an explicit server-owned state machine with allowed transitions, an event envelope carrying a sequence number and idempotency key per webhook, deduplication of repeated/duplicate webhook deliveries, handling for out-of-order delivery, a retry/dead-letter path for failed webhook processing, and a periodic reconciliation job against Ozonetel's own call-detail records to catch missed or silently-dropped webhooks. Without this, the gate is not safely implementable, not just untested (OQ-001, §13.2).
- Case disposition API: accepts the final CTA submission (`confirm_order` / `confirm_transfer` / `confirm_forward` / `reject` / `schedule_callback`) with the full structured payload (diagnosis, allergy status, medicines, rejection reason if applicable) — single write, atomic, since a case must have exactly one terminal disposition. **Must be idempotent** — a client retry of the same submission (e.g. a double-tap, or a retry after a dropped network response) must not create a duplicate disposition or a duplicate downstream handoff.
- Reject-case routing: reasons 2–4 (§6, R1) trigger an Ops/CSR-facing cancellation workflow; reason 1 and 5 trigger a Super-Doctor queue entry (§3.4 stub contract). This routing logic lives in the backend, not the doctor client — mirrors how `resolveCTA()` is deterministic and system-owned today. Each handoff follows the minimum contract in §3.4 (trigger/payload/ack/timeout/failure-UX); exact payload schemas are `[OPEN DECISION]`, owned by the receiving team.
- **Concurrency model:** cases use an optimistic-concurrency version/lease model — a doctor's client holds a lease on an assigned case; a second doctor (or an admin reassignment) acting on the same case is rejected with a conflict response, not a silent overwrite. A late-arriving webhook after the doctor has already submitted a disposition locally must not retroactively change a disposition already sent downstream — it is logged for reconciliation, not auto-applied.

### 10.4 Data contracts (extends `mock_backend_engineer.md` §6 case contract)

New top-level case fields: `reason_for_review` (string, `CONFIRMED` — required non-null), `diagnosis` (structured code + free text, `CONFIRMED`), `allergy_status` (`none` / `has_allergies` / `unknown`, `CONFIRMED`), `rejection` (nullable object: `{reason_code, sub_reason, notes, doctor_id, timestamp}`). No substitute-related field — that data never reaches the doctor client (§6 R4 — Removed).

### 10.5 Security, privacy, compliance

Masking plus server-side dial resolution alone is not a complete security design for a clinical-data, native-calling product — the requirements below define what else is needed.

- Patient phone numbers remain masked in the UI (`+91 98765 XXXXX`, existing pattern) — call session tokens must not expose the raw number to the client; the native SDK/backend resolves the actual dial string server-side.
- **Call-token authorization model** — `[OPEN DECISION]`, required before build:
  - Token bound to a specific doctor + case + attempt, with a defined TTL, revocation path, and device binding.
  - API authorization verifies this binding on every call-control action, not just at session start.
  - Mobile hardening (rooted/jailbroken-device policy, TLS pinning) decided explicitly, not left implicit.
- **RN-WebView bridge as an attack surface** — the embedded web UI sends call controls, case IDs, and disposition data to native via `postMessage`/`injectJavaScript`; a compromised or mis-navigated web view could invoke native call actions or exfiltrate data. Required:
  - Fixed allowlisted WebView origin, no arbitrary navigation.
  - Strict versioned message schema, per-message authorization (not "trust anything from the bridge").
  - No auth/call tokens in DOM or JS-accessible state; bridge disabled outside the trusted origin; CSP.
  - Penetration-test gate before ship, not after.
- Call recording: **`[OPEN DECISION]`, not assumed in scope.** If Truemeds records consultations, this requires a Compliance decision made *before* architecture lock (it changes vendor scope, token design, and data-retention design, not just a UI flag) — covering doctor/patient disclosure and consent, storage region, access control, retention/deletion policy, export, and audit. `call.recording_available` (§7.5) is instrumentation for *if* this is approved, not a decision that it is.
- Diagnosis/allergy/rejection data is clinical record data — audit log entries (§ ownership matrix, §3.4) must be immutable/append-only, not user-editable after submission.
- VoIP push tokens and call session tokens follow standard mobile token-rotation practice; session expiry must not be able to terminate a live call (§7.4).

### 10.6 Edge cases and failure states (consolidated from §5.4, §7.4, §6/R1)

| Case | Required behaviour |
|---|---|
| Call connects, drops at 40s, doesn't reconnect | Timer does not reach gate; doctor sees `Call Again`/`Schedule Callback` recovery UI (existing pattern), pending OQ-001 resolution on whether a partial 40s counts toward anything |
| Doctor attempts Reject before the valid-call gate has passed, for any reason including Schedule X | Reject is not selectable pre-gate for any reason in Phase 1 (§6/R1). UI shows why: "Complete a valid call to close this case" |
| Warm transfer to HA fails (HA extension busy/unavailable) | Doctor sees a blocking (not silent) alert and must explicitly acknowledge before the case is re-routed — the disposition does **not** auto-convert to "Confirm & Forward" without doctor confirmation. Silently reclassifying a live-transfer case as an async handoff is itself a clinical-disposition change and must not happen without the doctor seeing and confirming it, even though Forward is the sensible fallback *outcome* to offer |
| Two doctors somehow assigned the same case (race condition) | Backend enforces single-active-assignment via the lease model (§10.3); second doctor's client shows a "case no longer available" state, not a crash |
| App process killed / device rebooted / force-quit mid-call | `[OPEN DECISION]` — no call-survival guarantee assumed across an OS-level kill; a "resume consultation" flow driven by server-side call state must reconcile against the provider's call-detail record on next app launch rather than silently losing the case or double-counting a partial call |
| Doctor submits a disposition; a late webhook then reports the call actually disconnected earlier / differently than assumed | Disposition already sent is not silently reversed; discrepancy is logged for reconciliation, and if material (e.g. gate hadn't actually passed per the provider's record) is routed to a human review queue rather than auto-corrected against a doctor-facing case |
| Warm transfer completes on the telephony side after the doctor has already retried/given up locally | Backend treats the case as owned by whichever disposition arrives and is accepted first (idempotency key, §10.3); the losing action surfaces a conflict state, not a silent double-submission |

### 10.7 Dependencies

Ozonetel CXi Switch SDK licensing/availability confirmation (blocking, §8.5) · diagnosis taxonomy source (`[OPEN DECISION]`, §13) · Super Doctor queue destination system (blocking for R1 reasons 1/5) · Ops/CSR cancellation-workflow API (blocking for R1 reasons 2–4).

---

## 11. Phase 1 and Phase 2

### 11.0 Phase 0 — vendor and architecture validation gate

§8.5's recommendation rests on Ozonetel capabilities documented publicly but unconfirmed for Truemeds' account — no Phase 1 calling estimate is final until this closes. Not scope-creep: this is work the PRD already implied, sequenced explicitly first:

1. Ozonetel solution design + commercial confirmation: CXi Switch SDK (or equivalent) licensing, supported platforms/OS versions, and — specifically — support for the three-leg flow this product needs (customer PSTN ↔ doctor native leg ↔ warm transfer to HA).
2. Webhook event schema and delivery-guarantee documentation from Ozonetel (ties to §10.3's call-state protocol requirement).
3. Physical-device proof of concept, both platforms: call setup, mute/hold/resume/end, backgrounding, lock-screen control, and one warm transfer, minimum.
4. Architecture Decision Record for Decision 2 in §8.5 (RN vs. minimal native host), made by the mobile platform roadmap owner.
5. Medical/Compliance/Legal sign-off on the Reject-reason taxonomy (R1) and the Diagnosis/Allergy data contract (R2) — these can run in parallel with 1–4, not blocked by them.

**Phase 1 estimation should not be finalized until 1–3 close.** Items 4–5 can close in parallel with early Phase 1 build (e.g., non-call UI work) but block their respective features (calling shell architecture; Reject and Diagnosis field launch).

### 11.1 Phase 1 — included

| Item | Reason |
|---|---|
| In-app native calling (mute/hold/resume/end/transfer) | Explicit non-negotiable target (§4) |
| Case Rejection (R1) with structured reasons | Clinical-safety gap, zero current coverage |
| Structured Diagnosis + Allergy capture (R2) | Clinical-safety gap, competitor baseline |
| Pre-submit prescription review (R3) | Low-cost, meaningfully reduces submission-error risk |
| Reason-for-Review field (R6) | Cheap, directly supports JTBD step 1 |
| Removal of pricing/billing/address/cross-sell/**substitution** UI from doctor screen (R4 removed entirely) | Scope correction, not new build — mostly *subtraction*. Substitution removal is a direct product-truth correction, not a discretionary trim |
| Escalation-to-Super-Doctor hook (minimal, via Reject reason 5) | Needed for R1 to be complete; full role system deferred |
| Telephony-webhook-driven gate/no-answer/hold model (resolves the `project_truth.md` §6 contradiction, §2.3) | Matches what's actually buildable with real telephony and what's already implemented in the prototype's simulation |
| Instrumentation for all of the above (§12) | Required to operate and audit any of the above safely |

**Phase 1 exit criteria:**
- All 5 locked scenarios + a new 6th "reject-eligible" scenario produce a correct, fully-instrumented terminal-for-doctor disposition (§5.2/5.4) on a physical device.
- In-app calling verified end-to-end (§7.6 AC1–AC4) on both platforms.
- Phase 0 items 1–5 (§11.0) explicitly closed, not assumed.
- Product/Medical confirms the prototype's existing permissive medicine add/disable/edit behavior (inherited via R7) is intentional for Phase 1, not an open question (OQ-004/OQ-011) being silently hardened into production.

**Estimation scope note:** "Phase 1" is at minimum four separately-owned work-streams, not one estimate: (a) web UI (R1–R3, R6, plus R4's removal — stays in the existing no-build-step stack), (b) native calling shell (§8.5, §10.2 — a real mobile product with its own release/signing model, not a thin add-on), (c) backend (call-state protocol, disposition API, handoff contracts, concurrency — §10.3), (d) QA (device/OS matrix, telephony scenarios). Treating this as one line item risks an unreliable estimate.

### 11.2 Phase 2 — deferred

| Item | Reason for deferral |
|---|---|
| Multi-patient order handling (one cart, multiple patients' medicines) | Frequency at Truemeds unconfirmed (`[OPEN DECISION]`, OQ-New-5) and each patient needs their own Diagnosis/Allergy/notes — a real data-model expansion, not just UI. Candidate pattern if built: patient chips above the medicines list + assign-via-existing medicine-edit sheet (adds one "Patient" field, no drag-and-drop, no new interaction paradigm) — full design deferred until Ops confirms this happens at Truemeds |
| Diagnostic test prescribing | Requires confirmation Truemeds' Diagnostics module is meant to be doctor-initiated from this portal at all |
| Full Super Doctor role/permission system | Needs compliance/medical sign-off on scope, beyond the Phase 1 escalation hook |
| Previous order / previous prescription history panel | Needs backend data access not yet scoped; supporting context, not a blocker for safe operation today |
| Full React Native UI migration (beyond the calling shell) | Separate roadmap decision, not forced by the calling requirement alone (§8.5) |
| Retry-limit policy for early call-end (OQ-013) | Needs Ops input on real-world abuse/frequency data |
| Real callback-queue backend semantics (OQ-012) | Needs Ops confirmation such a queue exists/should exist |
| Advanced/negotiated substitute-affordability workflows | Explicitly out of Doctor Portal scope, belongs to Pricing/CSR (§3.4) — not "deferred," **excluded** |

**Dependencies into Phase 2:** Super Doctor system depends on Phase 1's escalation hook being in place first (so there's a real queue to build the role system around, rather than designing it speculatively).

---

## 12. Metrics, Instrumentation, and Rollout

No baseline values are asserted below — all targets are `[OPEN DECISION]` pending real usage data; this section defines what to measure, not target numbers.

**Product/doctor productivity:** cases completed per doctor-hour · average time from case-assigned to terminal disposition · % of cases reaching `gate_passed` on first call attempt (no retry) · % of cases using Schedule Callback vs a terminal CTA.

**Call metrics:** % of calls completing entirely in-app (no dialler fallback — should be ~100% post-launch, meaningful regression signal if not) · call connect success rate · average time-to-connect · warm-transfer success rate (R5/AC4) · reconnect frequency.

**Clinical completeness:** % of submitted cases with non-empty structured Diagnosis · % with explicit allergy status (not "unknown").

**Compliance:** Reject reason-1/reason-5 volume and resolution time in the Super Doctor queue · audit-log completeness (every state-changing action has a matching event, §7.5/§10.4) · call recording availability rate, if recording is in scope.

**Technical reliability:** call-drop rate mid-consultation · native-module crash rate · WebView↔native bridge message failure rate · webhook delivery latency (telephony event → app state update).

**Event instrumentation:** all events listed in §7.5, plus `case.rejected`, `case.diagnosis_submitted`, `case.review_sheet_opened`, `case.review_sheet_confirmed` — each carrying `case_id`, `doctor_id`, `timestamp`.

**Rollout stages:** internal dogfood (small doctor cohort, both platforms) → limited production cohort with dialler fallback kept as a manual escape hatch → full rollout with dialler fallback removed once in-app call success rate is stable.

**Rollback conditions:** in-app call connect success rate drops materially below the dialler-based baseline · any case reaching a state with no valid terminal disposition (a P0 by definition, per G2) · webhook-driven gate producing a different result than the old client-timer gate in a way that blocks valid calls.

**Phase 1 launch gates:** "materially below" and "stable" above aren't release-decidable without structure. Each gate below needs an owner and a measurement window assigned before rollout begins; the threshold values themselves remain `[OPEN DECISION]` per this PRD's instruction not to invent baselines.

| Gate | What it checks | Owner | Threshold |
|---|---|---|---|
| Call-connect success rate | In-app calling vs. current dialler-based baseline | `[OPEN DECISION]` | `[OPEN DECISION]` |
| Gate-calculation correctness | Webhook-derived 50s gate matches provider call-detail records | `[OPEN DECISION]` | `[OPEN DECISION]` |
| Warm-transfer success rate | §7.6 AC4 | `[OPEN DECISION]` | `[OPEN DECISION]` |
| Webhook delivery latency | Telephony event → app state update | `[OPEN DECISION]` | `[OPEN DECISION]` |
| Crash / ANR rate | Native calling module, both platforms | `[OPEN DECISION]` | `[OPEN DECISION]` |
| Terminal-disposition integrity | Zero cases with no valid disposition (G2) | `[OPEN DECISION]` | Zero-tolerance, not negotiable |
| Audit-event reconciliation | Every state-changing action has a matching event (§7.5/§10.4) | `[OPEN DECISION]` | 100% for clinical events (Diagnosis, Reject, Confirm-family); best-effort acceptable for UI-only events |

---

## 13. Acceptance Criteria and Open Questions

### 13.1 Consolidated acceptance criteria

- All of §7.6 (AC1–AC4).
- A case cannot reach `completed` without exactly one of: Confirm Order / Confirm & Transfer / Confirm & Forward / Reject / Schedule Callback (G2).
- A case cannot reach a terminal Confirm-family disposition without a non-empty Diagnosis and an explicitly-set Allergy status (Yes/No/Unknown are all valid explicit values — the check is "was it set," not "does it exclude Unknown") (R2).
- No medicine card, sheet, or screen anywhere in the Doctor Portal ever renders a substitute name, price, or consent control (R4 — Removed).
- No pricing, billing, address, or cross-sell UI element is present anywhere in the doctor-facing screen (§3.4 table, `❌` rows).
- Every event in §7.5 and §12's instrumentation list fires correctly across all 6 scenarios (5 existing + new reject-eligible scenario) on both platforms.

### 13.2 Open Questions

Carried forward or newly surfaced; not silently answered. Each: question — resolution status — owner.

| ID | Question | Status / Owner |
|---|---|---|
| OQ-001 | Timer behavior on drop/reconnect | Rescoped: webhook-verified duration replaces the client timer (§7.2, §10.3); does a reconnect within N seconds count as continuous? — open |
| OQ-002 | No-pickup attempts / hold duration | Open — webhook-driven placeholder in use |
| OQ-003 | Doctor assignment source | Open — out of this PRD's scope |
| OQ-004 / OQ-011 | Medicine add/remove/qty authority | Open — prototype's permissive placeholder stays (§3.4 ⚠️ row) |
| OQ-005 | Notes visibility/locking | Open — now also covers Diagnosis/Allergy (R2) |
| OQ-006 | Pre-call notes capture | Resolved — Reason-for-Review is pre-call read-only; Diagnosis/Allergy/Notes editable pre- and post-call |
| OQ-007 | Transfer vs Forward distinction | `[RECOMMENDED]` Transfer=live warm transfer, Forward=async (§7.1, §9), inferred from prototype copy — needs **Ops/HA confirmation** before lock |
| OQ-008 | HA skip eligibility | Open — existing reason-list placeholder unchanged |
| OQ-009 | Value vs Non-Value Meds classification | Open, system-classified, outside Doctor Portal's control |
| OQ-010 | Cat4 vs Pilot classification | Open, system-classified |
| OQ-012 | Callback terminal behavior | Open — existing terminal-completion placeholder stays |
| OQ-013 | Early-call-end retry limit | Open — deferred to Phase 2 |
| OQ-New-1 | Hold/No-Pickup: `project_truth.md` §6 (manual actions) vs. built webhook-driven states | Recommend webhook model — **project owner** must confirm and update `project_truth.md` |
| OQ-New-2 | Reject taxonomy, adapted from competitor SOP | Needs **Medical/Compliance** sign-off before lock |
| OQ-New-3 | Diagnosis taxonomy source (ICD-10 / internal / free-text) | Needs **Medical/Compliance** input |
| OQ-New-4 | Super Doctor destination queue doesn't exist yet | Needs **Product/Ops** decision before the escalation hook is more than a stub |
| OQ-New-5 | Multi-patient order frequency at Truemeds | Needs **Ops** confirmation — affects Phase 2 scoping |
| OQ-New-6 | Diagnostics-prescribing scope on this portal | Needs **Product** confirmation; out of Phase 1 either way |
| OQ-New-7 | Ozonetel SDK commercial/technical availability | Canonical detail §8.1; **blocking Phase 0 item 1** — single largest risk to the calling recommendation |
| OQ-New-8 | Call recording in scope? | Not assumed — needs **Compliance/Legal** input |
| OQ-New-9 | RN vs. native-host ADR ownership | **Mobile platform roadmap owner**, not this PRD (§8.5 D2) |
| OQ-New-10 | Call-state protocol ownership/design | Blocking for a safe gate implementation — needs **backend/telephony** ownership, tied to Phase 0 item 2 |
| OQ-New-11 | Handoff payload schemas per destination | Needs each **receiving-team owner's** intake contract before R1/R5 backend estimation |
| OQ-New-12 | Reject pre-gate exception — full gate required for every Reject reason (§6/R1) leaves unreachable-patient Schedule-X cases with no closure path | **Project owner** must confirm whether a narrow gate exception is warranted |
| OQ-New-13 | RN-WebView bridge security review | Needs **mobile security** review/pen-test as a Phase 1 gate, not post-launch |

---

*End of PRD.*

# Truemeds Doctor Portal — Developer PRD (v2)

**Status:** Draft for engineering estimation
**Author:** Claude (PM/UX/architecture pass), consolidating `project_truth.md`, prototype source, current-production screenshots, and DocsStat (PharmEasy) competitor SOP
**Last updated:** 2026-07-13

**Labels used throughout:** `[LOCKED]` already decided, must be followed · `[RECOMMENDED]` this PRD's expert recommendation, open to override · `[MOCK ASSUMPTION]` prototype-only placeholder · `[OPEN DECISION]` requires Product/Ops/Medical/Compliance confirmation before build.

---

## 1. Executive Summary

**Problem.** The current production Doctor Portal (see screenshots, §2) makes the doctor do clinical review *and* substitution pricing *and* cross-selling *and* billing math *and* address/payment handling, on one dense screen, with a sticky warning banner that eats a third of the viewport and no visible in-app call controls — the doctor calls out through the native phone dialler. The result: cognitive overload, a screen doing four teams' jobs, and no reliable in-app calling experience.

**Doctor JTBD.** *When a case requiring medical review reaches me, help me understand why it needs intervention, confirm I have the right patient, review what's actually clinically relevant, reach the patient by voice without leaving the app, make and record a safe decision, and hand off anything that isn't mine — without doing HA, CSR, Payments, Pricing, or Ops work.* This hypothesis holds up against the prototype and competitor SOP with one correction: the current build (and current production) silently assumes the doctor also handles substitution/pricing/billing. This PRD removes that assumption explicitly (§3).

**Proposed direction.** Keep the prototype's locked consultation workflow, valid-call gate, and CTA routing matrix — they are correct and already built. Add the two things a safe teleconsultation flow cannot ship without: a structured **Case Rejection** path (doesn't exist today) and structured **Diagnosis/Allergy** capture (today it's free text only). Remove substitution-pricing, cross-selling, and billing editing from the doctor's surface entirely — they're a different job.

**Calling architecture decision.** Ozonetel's calling capability for this use case (CXi Switch SDK) is a **native** Android/iOS SDK with CallKit/ConnectionService support — it is not a browser/WebView SDK. That single fact is the deciding input for §8: full in-app calling with reliable background/lock-screen/interruption handling requires a native calling layer. Recommendation: a thin **React Native native-calling shell** wrapping the existing web UI in Phase 1 (not a full RN rewrite), with native call control bridged to the web view via JS bridge.

**Phase 1 recommendation.** Ship: in-app native calling (mute/hold/resume/end/transfer), Case Rejection with structured reasons, structured Diagnosis/Allergy capture, a pre-submit prescription review step, and explicit removal of substitution/billing/address UI from the doctor screen. Defer: multi-patient orders, diagnostics prescribing, full Super Doctor role system, previous-order/previous-Rx history panel, and a full React Native UI migration. **A Phase 0 vendor/architecture validation gate (§11.0) precedes Phase 1 estimation** — the calling-architecture recommendation in §8 depends on Ozonetel SDK capabilities that are documented publicly but not yet confirmed against a Truemeds account; this PRD treats that confirmation as a blocking prerequisite, not a detail to discover mid-build.

---

## 2. Context, Current Problem, and Why Now

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

**Phase 1 escalation stub — minimum viable contract:** escalating a case must (a) write an immutable audit record (`case_id`, `doctor_id`, `reason`, `timestamp`), (b) remove the case from the doctor's active queue, (c) place it in a **named destination** the doctor's client can reference even if that destination is initially a manual queue (e.g., a flagged list an Ops lead reviews, not necessarily an automated Super Doctor routing system on day one), and (d) surface an acknowledgement state back to the case record so nothing disappears silently. **[OPEN DECISION]** — the actual destination system, owner, and SLA for picking up an escalated case must be confirmed with Ops/Compliance before this is more than a stub; until then, Phase 1 must not ship escalation as a dead-end UI action with no defined receiving process, even a manual one.

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
| Same-salt substitute — clinical consent only | ✅ | ✅ (approve/keep-original, no price negotiation) | — | — | — | ✅ |
| Substitute brand/price selection & merchandising | — | ❌ (removed from Doctor Portal, §2.3) | — | — | ✅ (pricing engine / CSR) | — |
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

**Handoff contract — minimum fields per destination (HA/CSR/Ops/Super Doctor).** Naming a destination ("goes to HA") is not the same as an implementable contract. Every "✅" in the HA/CSR/Ops/Super-Doctor columns above requires, at minimum: a **trigger** (which doctor action fires it), a **payload** (case ID + the structured fields relevant to that handoff), an **acknowledgement requirement** (does the receiving system need to confirm receipt before the doctor's case is allowed to leave `gate_passed`, or is it fire-and-forget), a **timeout/retry policy** if acknowledgement is required, and a **doctor-visible failure state** if the handoff doesn't complete (the doctor must never be shown a success toast for a handoff that silently failed downstream). The exact payload schema per destination is `[OPEN DECISION]` (§13.2) and owned by whichever team owns that destination system — this PRD specifies the contract shape, not the destination system's internal implementation.

---

## 4. Goals and Non-goals

**Goals (Phase 1, measurable):**
- G1: Doctor completes an entire consultation (call start → end) without leaving the Truemeds app or touching the phone's native dialler UI.
- G2: Every case reaches a doctor-side disposition — Confirm Order / Confirm & Transfer / Confirm & Forward / **Reject (new)** / Schedule Callback — that is recorded and either auto-acknowledged or explicitly tracked as pending downstream acknowledgement (§5.4, §10.3 handoff contract). No case can be abandoned with no record; "terminal for the doctor" is not the same claim as "resolved end-to-end" — the callback-queue mock assumption (OQ-012) and handoff acknowledgement gaps mean full downstream resolution is not yet guaranteed, only doctor-side completion.
- G3: Every submitted case carries a structured Diagnosis and an explicit, non-blank allergy status (Yes/No/Unknown are all valid explicit answers — the requirement is that the field was actively set, not that it excludes "Unknown").
- G4: No discount/savings marketing copy, no pre-selected substitute, and no bill-editing, address-editing, or cross-sell UI on the doctor's screen. A same-salt substitute's name and price delta may still be shown strictly to support the doctor's consent conversation with the patient (R4) — this is informational, not merchandising, and G4 should be read as excluding the *merchandising treatment* seen in production (§2.1: pre-selection, "Subs taken" social proof, savings percentages), not excluding all price information outright.
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
- **Edge/Error — gate interaction:** the locked valid-call gate (`project_truth.md` §4: "final operational CTAs must NOT appear before a valid call is completed") defines a valid call as connected **and** live for ≥50 seconds — a no-answer or failed-dial attempt does not qualify. Phase 1 takes the fully conservative position with **zero exceptions**: Reject is treated as a member of the same "final operational CTA" family Confirm/Transfer/Forward already belong to, and requires the identical valid-call gate (§5.2 `gate_passed`) before any reject reason — including reason 1 (Schedule X) — becomes selectable. There is no pre-call or attempt-only Reject path in Phase 1. This creates a real practical tension worth naming plainly: a doctor who can see a Schedule-X medicine on an unreachable patient's order has no way to close that case via Reject until a valid connected call happens — for a patient who may never pick up, that's a genuine gap, not a false alarm. Whether the locked gate should be amended with a narrow, explicit exception for evidently-non-prescribable cases is exactly the kind of change only the project owner can authorize (`[OPEN DECISION]`, OQ-New-12, §13.2) — this PRD deliberately does not make that call unilaterally.
- **Acceptance:** Given a case with a Schedule-X-tagged medicine, when the valid-call gate has passed (`gate_passed`, same ≥50s-connected bar as every other final CTA) and the doctor then selects Reject → "Cannot prescribe over teleconsultation," then the case is marked `rejected`, is removed from the doctor's active queue, generates an audit entry with doctor ID + reason + timestamp, enters `handoff_pending` toward the Super Doctor escalation stub (§3.4), and does **not** trigger the standard Confirm-CTA success toast until that handoff is acknowledged or explicitly shown as pending. Reject is **not** selectable before `gate_passed`, for any reason, in Phase 1 (§13.2 OQ-New-12 covers the resulting practical gap for unreachable-patient Schedule-X cases).

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

### R4 — Substitute consent (bounded)

- **Problem:** Production pre-selects a cheaper substitute by default (§2.1); this is a consent violation waiting to happen and outside doctor JTBD.
- **Behaviour:** When a medicine is flagged OOS/limited-stock by the pricing/inventory engine (a signal the Doctor Portal *receives*, does not compute), the medicine card shows a same-salt substitute badge. Doctor taps to see substitute name + price delta only — no discount percentage framed as savings, no "Subs taken" social proof, no default selection. This is the exact scope G4 (§4) permits: informational price context for the consent conversation, not merchandising. Two explicit actions: **Keep Original** / **Approve Substitute** — neither pre-selected.
- **Rule:** Substitute approval requires doctor to have informed the patient on the live call (soft rule — captured via a checkbox "Discussed with patient," not independently verified in Phase 1).
- **Permission:** Doctor only; commercial pricing terms are read-only.
- **Edge/Error:** If no substitute is offered by the pricing engine, this UI doesn't render at all (current medicine card behavior, unchanged).
- **Acceptance:** No medicine ever displays with a substitute pre-selected; the default state is always "Original," requiring an explicit doctor tap to change.

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

Doctor taps **Call Patient** → native call session starts (no dialler redirect) → doctor's device rings/connects using the phone's own mic and speaker → in-app (or lock-screen native) controls: **Mute, Hold, Resume, End**, plus **Transfer to HA** exposed only for cases the CTA engine has already resolved to "Confirm & Transfer" once the gate passes (i.e., transfer is a post-gate action, not available mid-call for ordinary cases — `[OPEN DECISION]`: should a doctor be able to *initiate* an early transfer before 50s if the patient clearly needs HA immediately? Recommend **no** for Phase 1 — preserves the valid-call gate's integrity — flagged in §13).

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
- **Doctor leg:** currently PSTN-to-doctor's-personal-number (native dialler). Target: **app-native audio session** — the doctor's leg terminates inside the Truemeds app via the calling SDK's own transport, not a second PSTN call to the doctor's phone number. *(This PRD deliberately avoids naming the exact underlying transport — e.g. "WebRTC" — since that is a vendor SDK implementation detail this repo has no verified documentation for; §8.1's evidence caveat applies here too. The exact transport terminology should come from Ozonetel's confirmed integration docs during Phase 0, not be assumed generically here.)*
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

**Evidence caveat — the single biggest risk in this PRD:** everything in §8.1 about Ozonetel's SDK is drawn from public product documentation, not from a signed Truemeds—Ozonetel contract, sandbox access, or a working integration in this repo. `app.js`/`index.html` in this repo are a vanilla-JS browser simulation with no native bridge, no SDK, and no build/host app — they are valid evidence for the **UI/UX** decisions in this PRD and zero evidence for any WebView/React Native/Ozonetel/device-lifecycle claim. Every "the SDK supports X" statement below should be read as **"public documentation claims X — unverified against a Truemeds account"** until Phase 0 (§11.0) closes it out with a vendor-confirmed solution design and a physical-device proof of concept. This section's recommendation is conditional on that POC, not a substitute for it.

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

- **Decision 1 — native calling layer: recommended, high confidence given public documentation, pending Phase 0 confirmation.** Given Ozonetel's calling product for this pattern ships as a native SDK with CallKit support (§8.1) rather than a browser SDK, and given §4's explicit "non-negotiable" framing of background/lock-screen/warm-transfer reliability, a browser/WebView-only calling path (pure Option A) is not recommended. This holds regardless of Decision 2's outcome.
- **Decision 2 — RN vs. minimal native host: `[RECOMMENDED]` React Native, but explicitly not required by the calling need alone.** A native calling module could be integrated into a small plain-native iOS/Android host wrapping the existing WebView, without adopting React Native as a framework at all — that would satisfy Decision 1 just as well. This PRD recommends RN anyway, but for a **secondary** reason: cross-platform code-sharing of the native module and easier future extension (e.g., native push, biometric lock) *if* the broader Truemeds mobile roadmap already trends that direction — a claim this PRD cannot verify and does not attempt to. **This decision should be made by whoever owns Truemeds' mobile platform roadmap, as an explicit Architecture Decision Record, not settled by this PRD alone** (`[OPEN DECISION]`, OQ-New-9).
- **Phase 0 gate (§11.0):** before either decision is locked or estimated, Truemeds must obtain from Ozonetel: confirmed SDK availability/licensing for the account, a solution design covering the specific three-leg flow this product needs (customer PSTN ↔ doctor native leg ↔ warm transfer to HA), sandbox credentials, the webhook event schema, and a written support commitment — then run a physical-device proof of concept (both platforms) validating call setup, backgrounding, lock-screen control, and a warm transfer, before any Phase 1 estimate is finalized.
- **When Option A (browser/WebView-only) would become the right call:** if the Phase 0 POC shows a vendor-supported browser call path can meet the customer-bridge, HA-transfer, lifecycle, audio-routing, and security requirements as well as the native path — or if Truemeds product leadership explicitly relaxes the non-negotiable framing in §4 (e.g., accepts that backgrounding may drop a call). Neither is assumed true by this PRD.
- **Is a phased approach viable:** Yes. Phase 1 = native calling layer (RN-hosted per Decision 2's default recommendation) wrapping the **existing, unmodified** web UI; a full RN UI migration beyond the calling layer remains a separate, later roadmap decision, not triggered by this work.
- **Does an initial WebView-only implementation create avoidable rework:** Yes, if a custom browser WebRTC softphone (pure Option A) is attempted first and later abandoned for reliability reasons. Recommend not building that path at all — go straight to Phase 0 validation of the native path.

---

## 9. UX and Design Decisions

These are final build decisions, not a design audit — `docs/design_system.md` remains the source of truth for tokens/components; this section only adds what's new.

- **CTA hierarchy:** unchanged — one `btn-primary` per context (existing rule, correct, keep). New Reject Case action uses `btn-text-danger`, same family as existing Disable-medicine and Mark-Unavailable actions — consistent semantic use of red-quiet-text for "significant but not the main flow" destructive actions.
- **Colours:** No new tokens needed. Substitute-consent UI (R4) uses existing neutral/`btn-ghost` styling for "Keep Original" and `btn-success` for "Approve Substitute" (matches existing Prescribe/Confirm Callback green semantics) — no amber/warning color, since this is a routine clinical decision, not an alert.
- **Icons:** Add one new icon to the `ICONS` map — a reject/flag glyph for Reject Case. No emoji, per existing rule.
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
- **Accessibility:** unchanged baseline (button semantics, 44×44 targets, contrast) — extend to new Reject/Substitute-consent controls, no new pattern needed.
- **Mobile/desktop:** unchanged — mobile-first single column, desktop side panel mirrors state, same as today.

---

## 10. Technical Requirements, Dependencies, and Edge Cases

### 10.1 Frontend (existing web UI, embedded in RN WebView)

- New: Reject-Case sheet, Diagnosis/Allergy fields, Pre-submit review sheet, Substitute-consent control, Reason-for-Review field.
- `DOCTOR_STATE` gains: `rejectionReason`, `diagnosis`, `allergyStatus`, `substituteDecisions[]`, and call-state fields sourced from native bridge events rather than `setInterval` (§7.2).
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
- Substitute-signal API: doctor client receives OOS/substitute flags from the existing pricing/inventory system as a read-only signal; doctor client never writes back pricing decisions, only a consent flag (approved/kept-original + "discussed with patient" boolean).
- **Concurrency model:** cases use an optimistic-concurrency version/lease model — a doctor's client holds a lease on an assigned case; a second doctor (or an admin reassignment) acting on the same case is rejected with a conflict response, not a silent overwrite. A late-arriving webhook after the doctor has already submitted a disposition locally must not retroactively change a disposition already sent downstream — it is logged for reconciliation, not auto-applied.

### 10.4 Data contracts (extends `mock_backend_engineer.md` §6 case contract)

New top-level case fields: `reason_for_review` (string, `CONFIRMED` — required non-null), `diagnosis` (structured code + free text, `CONFIRMED`), `allergy_status` (`none` / `has_allergies` / `unknown`, `CONFIRMED`), `rejection` (nullable object: `{reason_code, sub_reason, notes, doctor_id, timestamp}`), `substitute_offers` (array, per-medicine, `MOCK_ONLY` until pricing-engine integration confirmed).

### 10.5 Security, privacy, compliance

Masking plus server-side dial resolution alone is not a complete security design for a clinical-data, native-calling product — the requirements below define what else is needed.

- Patient phone numbers remain masked in the UI (`+91 98765 XXXXX`, existing pattern) — call session tokens must not expose the raw number to the client; the native SDK/backend resolves the actual dial string server-side.
- **Call-token authorization model** (`[OPEN DECISION]`, not designed here, but required before build): token issuance must be bound to a specific doctor + case + attempt, with a defined TTL, revocation path, and device binding; API authorization must verify this binding on every call-control action, not just at session start; mobile hardening decisions (rooted/jailbroken-device policy, TLS pinning) must be made explicitly, not left implicit.
- **RN-WebView bridge as an attack surface:** if the embedded web UI sends call controls, case IDs, or disposition data to the native layer via `postMessage`/`injectJavaScript`, that bridge is a real attack surface — a compromised or mis-navigated web view could otherwise invoke native call actions or exfiltrate data. Required: a fixed allowlisted origin for the WebView (no arbitrary navigation), a strict versioned message schema, per-message authorization (not just "if it came through the bridge, trust it"), no auth/call tokens stored in DOM or JS-accessible state, bridge disablement outside the trusted origin, and a CSP — with a penetration-test gate before this ships, not after.
- Call recording: **`[OPEN DECISION]`, not assumed in scope.** If Truemeds records consultations, this requires a Compliance decision made *before* architecture lock (it changes vendor scope, token design, and data-retention design, not just a UI flag) — covering doctor/patient disclosure and consent, storage region, access control, retention/deletion policy, export, and audit. `call.recording_available` (§7.5) is instrumentation for *if* this is approved, not a decision that it is.
- Diagnosis/allergy/rejection data is clinical record data — audit log entries (§ ownership matrix, §3.4) must be immutable/append-only, not user-editable after submission.
- VoIP push tokens and call session tokens follow standard mobile token-rotation practice; session expiry must not be able to terminate a live call (§7.4).

### 10.6 Edge cases and failure states (consolidated from §5.4, §7.4, §6/R1)

| Case | Required behaviour |
|---|---|
| Call connects, drops at 40s, doesn't reconnect | Timer does not reach gate; doctor sees `Call Again`/`Schedule Callback` recovery UI (existing pattern), pending OQ-001 resolution on whether a partial 40s counts toward anything |
| Doctor attempts Reject before the valid-call gate has passed, for any reason including Schedule X | Reject is not selectable pre-gate for any reason in Phase 1 (§6/R1). UI shows why: "Complete a valid call to close this case" |
| Warm transfer to HA fails (HA extension busy/unavailable) | Doctor sees a blocking (not silent) alert and must explicitly acknowledge before the case is re-routed — the disposition does **not** auto-convert to "Confirm & Forward" without doctor confirmation. Silently reclassifying a live-transfer case as an async handoff is itself a clinical-disposition change and must not happen without the doctor seeing and confirming it, even though Forward is the sensible fallback *outcome* to offer |
| Substitute offered but doctor's call already ended before consent given | Substitute-consent control remains available post-call up to submission (not tied to live-call state) — doctor can still ask on a follow-up or note it was discussed |
| Two doctors somehow assigned the same case (race condition) | Backend enforces single-active-assignment via the lease model (§10.3); second doctor's client shows a "case no longer available" state, not a crash |
| App process killed / device rebooted / force-quit mid-call | `[OPEN DECISION]` — no call-survival guarantee assumed across an OS-level kill; a "resume consultation" flow driven by server-side call state must reconcile against the provider's call-detail record on next app launch rather than silently losing the case or double-counting a partial call |
| Doctor submits a disposition; a late webhook then reports the call actually disconnected earlier / differently than assumed | Disposition already sent is not silently reversed; discrepancy is logged for reconciliation, and if material (e.g. gate hadn't actually passed per the provider's record) is routed to a human review queue rather than auto-corrected against a doctor-facing case |
| Warm transfer completes on the telephony side after the doctor has already retried/given up locally | Backend treats the case as owned by whichever disposition arrives and is accepted first (idempotency key, §10.3); the losing action surfaces a conflict state, not a silent double-submission |

### 10.7 Dependencies

Ozonetel CXi Switch SDK licensing/availability confirmation (blocking, §8.5) · pricing/inventory engine substitute-signal API (blocking for R4) · diagnosis taxonomy source (`[OPEN DECISION]`, §13) · Super Doctor queue destination system (blocking for R1 reasons 1/5) · Ops/CSR cancellation-workflow API (blocking for R1 reasons 2–4).

---

## 11. Phase 1 and Phase 2

### 11.0 Phase 0 — vendor and architecture validation gate

This PRD's calling-architecture recommendation (§8.5) rests on Ozonetel capabilities that are documented publicly but unconfirmed for Truemeds' account, and no engineering estimate for Phase 1's calling work should be treated as final until that's closed. Phase 0 is not optional scope-creep — it's the same work the PRD already implied, made explicit and sequenced first:

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
| Substitute consent, bounded (R4) | Removes an active consent/compliance risk in current production |
| Reason-for-Review field (R6) | Cheap, directly supports JTBD step 1 |
| Removal of pricing/billing/address/cross-sell UI from doctor screen | Scope correction, not new build — mostly *subtraction* |
| Escalation-to-Super-Doctor hook (minimal, via Reject reason 5) | Needed for R1 to be complete; full role system deferred |
| Telephony-webhook-driven gate/no-answer/hold model (resolves the `project_truth.md` §6 contradiction, §2.3) | Matches what's actually buildable with real telephony and what's already implemented in the prototype's simulation |
| Instrumentation for all of the above (§12) | Required to operate and audit any of the above safely |

**Phase 1 exit criteria:** every one of the 5 locked mock scenarios (plus a new 6th "reject-eligible" scenario) produces a correct, fully-instrumented terminal-for-doctor disposition (§5.2/5.4) on a physical device, with in-app calling verified end-to-end (§7.6 AC1–AC4) on both platforms, **and** the following dependencies are explicitly closed, not assumed: Phase 0 items 1–5 (§11.0); Product/Medical confirmation that the prototype's existing permissive medicine add/disable/edit behavior (inherited via R7, §6) is intentional for Phase 1 rather than an unresolved placeholder being silently hardened into production (`ties to OQ-004/OQ-011` — shipping this in Phase 1 without explicit sign-off repeats the exact "invent around an open question" risk `project_truth.md` §9 warns against).

**Estimation scope note:** "Phase 1" as scoped above is not one estimate — it is at minimum four separately-owned work-streams that should be estimated and staffed separately: (a) web UI changes (R1–R4, R6 — stays in the existing no-build-step HTML/CSS/JS, per `frontend_engineer.md`'s constraints), (b) the native calling shell (§8.5, §10.2 — a real mobile-platform product with its own release/signing/support model, not a thin add-on), (c) backend (call-state protocol, disposition API, handoff contracts, concurrency model — §10.3), and (d) QA (device/OS matrix, telephony test scenarios). Presenting these as a single undifferentiated "Phase 1" line item is likely to produce an unreliable estimate.

### 11.2 Phase 2 — deferred

| Item | Reason for deferral |
|---|---|
| Multi-patient order handling | Frequency at Truemeds unconfirmed (`[OPEN DECISION]`); competitor pattern exists but may not apply |
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

**Clinical completeness:** % of submitted cases with non-empty structured Diagnosis · % with explicit allergy status (not "unknown") · substitute-consent capture rate when a substitute was offered.

**Compliance:** Reject reason-1/reason-5 volume and resolution time in the Super Doctor queue · audit-log completeness (every state-changing action has a matching event, §7.5/§10.4) · call recording availability rate, if recording is in scope.

**Technical reliability:** call-drop rate mid-consultation · native-module crash rate · WebView↔native bridge message failure rate · webhook delivery latency (telephony event → app state update).

**Event instrumentation:** all events listed in §7.5, plus `case.rejected`, `case.diagnosis_submitted`, `case.substitute_decision`, `case.review_sheet_opened`, `case.review_sheet_confirmed` — each carrying `case_id`, `doctor_id`, `timestamp`.

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
- No medicine card ever renders with a substitute pre-selected (R4).
- No pricing, billing, address, or cross-sell UI element is present anywhere in the doctor-facing screen (§3.4 table, `❌` rows).
- Every event in §7.5 and §12's instrumentation list fires correctly across all 6 scenarios (5 existing + new reject-eligible scenario) on both platforms.

### 13.2 Open Questions

Carried forward from `open_questions.md` (unresolved, this PRD does not silently answer them, but notes where a Phase 1 decision was still made using the documented safe placeholder):

- **OQ-001** (timer behavior on drop/reconnect) — Phase 1 recommendation: telephony-webhook-verified duration replaces the client timer entirely (§7.2, §10.3), which changes the shape of this question — recommend re-scoping OQ-001 to "does a webhook-reported reconnect within N seconds count as continuous" rather than a client-timer question.
- **OQ-002** (no-pickup attempts / hold duration) — still open; Phase 1 uses the existing webhook-driven safe placeholder.
- **OQ-003** (doctor assignment source) — still open, out of this PRD's scope (assignment arrival, not consultation UX).
- **OQ-004 / OQ-011** (medicine add/remove/qty authority) — still open; Phase 1 keeps the prototype's current permissive placeholder (§3.4 marks qty/strength beyond ordered as `⚠️`).
- **OQ-005** (notes visibility/locking) — still open; extends now to Diagnosis/Allergy fields (R2) — same question applies to the new structured fields.
- **OQ-006** (pre-call notes capture) — resolved by R2/R6 design: Reason-for-Review is pre-call read-only, Diagnosis/Allergy/Notes remain editable pre- and post-call, consistent with the prototype's existing placeholder.
- **OQ-007** (Transfer vs Forward distinction) — this PRD makes a `[RECOMMENDED]` resolution: Transfer = live warm call-transfer, Forward = async handoff (§7.1, §9), inferred from the prototype's own briefing-strip copy. **Requires Ops/HA-team confirmation before lock.**
- **OQ-008** (HA skip eligibility) — still open; Phase 1 keeps existing reason-list placeholder, unchanged.
- **OQ-009** (Value vs Non-Value Meds classification) — still open, unchanged, out of Doctor Portal's control (system-classified, §3.4).
- **OQ-010** (Cat4 vs Pilot classification) — still open, unchanged, system-classified.
- **OQ-012** (callback terminal behavior) — still open; Phase 1 keeps existing terminal-completion placeholder.
- **OQ-013** (early-call-end retry limit) — still open; deferred to Phase 2 per §11.2.

**New open questions from this pass:**

- **OQ-New-1 — Hold/No-Pickup model contradiction.** `project_truth.md` §6 describes manual Hold and manual No-Pickup doctor actions; the actual prototype implements both as telephony-webhook-driven system states with no manual buttons. This PRD recommends the webhook-driven model as correct (matches real telephony integration and existing working code) and flags that `project_truth.md` should be updated to match — **requires the project owner to confirm and update `project_truth.md`**, which this PRD does not modify.
- **OQ-New-2 — Reject reason taxonomy.** §6/R1's 5-reason taxonomy is adapted from the DocsStat/PharmEasy competitor SOP, not yet validated against Truemeds' own compliance/medical requirements. **Requires Medical/Compliance sign-off before lock.**
- **OQ-New-3 — Diagnosis taxonomy source.** R2 assumes a structured pick-list; no source taxonomy (ICD-10 subset, internal list, free-text-only) is confirmed. **Requires Medical/Compliance input.**
- **OQ-New-4 — Super Doctor role definition and destination queue.** §3.3/§11.1's escalation hook needs somewhere to route to; the actual Super Doctor system doesn't exist yet in any reviewed doc. **Requires Product/Ops decision before the escalation hook can be more than a UI stub.**
- **OQ-New-5 — Multi-patient order frequency at Truemeds.** Competitor SOP handles this explicitly; unconfirmed whether Truemeds Cat4/Pilot orders are ever multi-patient. **Requires Ops confirmation** — affects whether Phase 2 scoping for this is even necessary.
- **OQ-New-6 — Diagnostics prescribing scope.** Unconfirmed whether the Doctor Portal is meant to be a diagnostics-prescribing surface at all (Truemeds has a separate Diagnostics module per other org context; unclear if doctor-initiated from here). **Requires Product confirmation**, kept out of Phase 1 either way.
- **OQ-New-7 — Ozonetel CXi Switch SDK commercial/technical availability.** §8.5's recommendation assumes this SDK is licensable and technically integrable for Truemeds' account, and specifically that it supports the three-leg (customer PSTN ↔ doctor native ↔ HA warm transfer) flow this product needs; not independently verified beyond public documentation. This is the single largest risk to the entire calling-architecture recommendation. **This is now Phase 0, item 1 (§11.0) — a formal blocking gate, not a background assumption — requiring direct confirmation with Ozonetel's account/solutions team, sandbox access, and a physical-device POC before Phase 1 engineering estimates are finalized.**
- **OQ-New-8 — Call recording in scope?** §10.5 flags recording as a compliance surface but this PRD does not assume it is required. **Requires Compliance/Legal input.**
- **OQ-New-9 — RN vs. minimal native host, and full React Native UI migration roadmap ownership.** §8.5 explicitly separates "native calling layer required" from "RN specifically required" — Decision 2 (RN vs. a plain-native host) should be made by the mobile platform roadmap owner as an Architecture Decision Record, not settled unilaterally by this PRD. Whether a broader RN UI migration is planned for other reasons is likewise outside this PRD's authority.

**Additional open questions:**

- **OQ-New-10 — Call-state protocol ownership and design.** §10.3's webhook dedup/sequencing/reconciliation requirement and §7.6 AC3's gate-algorithm precision are both blocking for a safe valid-call gate implementation, not just testing detail. **Requires backend/telephony engineering ownership assigned before Phase 1 estimation**, and is tied to Phase 0 item 2 (§11.0).
- **OQ-New-11 — Handoff contract payload schemas.** §3.4's minimum handoff contract (trigger/payload/ack/timeout/failure-UX) is specified at the shape level only; the actual payload schema per destination (HA, CSR/Ops cancellation, Super Doctor queue, callback queue) needs each receiving team's input. **Requires each destination-system owner to confirm their intake contract** before R1/R5's backend work can be estimated precisely.
- **OQ-New-12 — Reject-before-call / Reject-before-gate exception.** §6/R1 requires the identical full valid-call gate (≥50s connected, `gate_passed`) for every Reject reason in Phase 1, with no attempt-only or pre-call shortcut — the fully conservative, locked-gate-compliant default. The resulting practical gap: a Schedule-X (or similarly evident) case on a patient who never picks up has no Reject path until a valid call somehow occurs, which for an unreachable patient may be never — that case is left to the existing no-answer/hold/unavailable flow indefinitely rather than a clean Reject closure. **Requires the project owner to confirm whether the locked valid-call gate should be narrowly amended for evidently-non-prescribable Reject reasons, and if so, exactly which reasons qualify** — this PRD does not amend the locked gate unilaterally.
- **OQ-New-13 — RN-WebView bridge security review.** §10.5's bridge-security requirements (allowlisted origin, message schema, no tokens in DOM) are specified as requirements, not yet implemented or reviewed. **Requires a mobile security review / penetration test as a Phase 1 gate**, not a post-launch nice-to-have, given clinical data and call-control actions cross this bridge.

---

*End of PRD.*

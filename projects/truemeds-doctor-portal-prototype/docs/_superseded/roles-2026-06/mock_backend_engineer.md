# mock_backend_engineer.md — Truemeds Doctor Portal Prototype

## Purpose

This file defines how Claude should behave when doing backend-like work for the Truemeds Doctor Portal prototype.

There is no real backend for this prototype.
Claude's job here is to support the frontend with clear mock contracts, realistic scenario-based data, and small deterministic behavior that future engineering can later replace with real APIs.

This file must support `project_truth.md`, `frontend_engineer.md`, and `uiux_designer.md`.
It must not override them.

---

## 1. Role

Claude is acting as a safe mock backend support engineer for this prototype.

Claude's job is to:
- unblock frontend progress when real backend behavior is missing
- define clean frontend-facing contracts for consultation workflow data
- create realistic mock scenarios that produce deterministic screen states
- keep data easy to edit and behavior easy to replace later
- support stateful frontend behavior without inventing operational truth

Claude is not acting as a full backend architect.

---

## 2. Source of truth priority

Claude must follow this order:

1. `project_truth.md`
2. `frontend_engineer.md`
3. `uiux_designer.md`
4. Existing agreed mock contract patterns
5. The current task request

If something is unclear, Claude must not silently invent consultation workflow logic.

---

## 3. Core working principle

Default mindset:
- contract-first
- scenario-first
- facts in JSON, behavior in JS
- state-aware
- deterministic
- easy to swap later with real APIs

Claude should build only as much mock behavior as the current screen or the next immediate dependent behavior needs.
Claude must not design a broad fake backend system for the whole portal.

---

## 4. Non-negotiable guardrails

Claude must not:
- invent case-type routing logic not in `project_truth.md`
- invent medicine classification rules not approved by the user
- invent HA eligibility rules
- fake call connection or call timer behavior in ways that bypass the locked gate
- override `project_truth.md` decision matrix

Claude should keep mock work:
- small
- targeted
- deterministic
- readable
- replaceable

---

## 5. The five locked scenarios

All mock behavior is driven by five named scenarios from `project_truth.md` Section 7.

| Scenario ID | Case Type | HA Status | Meds Type | Expected CTA |
|---|---|---|---|---|
| `cat4` | Cat4 | N/A | N/A | Confirm Order |
| `pilot_value_meds_ha` | Pilot | HA Required | Value Meds | Confirm & Transfer |
| `pilot_nonvalue_meds_ha` | Pilot | HA Required | Non-Value Meds | Confirm & Forward |
| `pilot_ha_skipped_customer` | Pilot | HA Skipped (customer) | Value Meds | Confirm Order |
| `pilot_ha_skipped_system` | Pilot | HA Skipped (system) | Value Meds | Confirm Order |

Each scenario must produce a complete, deterministic, believable screen state.

Scenario behavior must not be random. The selected scenario drives the result.

---

## 6. Mock consultation case contract

Every scenario must populate these fields for the doctor screen.

### 6.1 Case context fields

| Field | Certainty | Purpose |
|---|---|---|
| `case_id` | `MOCK_ONLY` | Display in header |
| `order_id` | `MOCK_ONLY` | Display in patient context |
| `patient_name` | `MOCK_ONLY` | Display in patient context |
| `patient_phone` | `MOCK_ONLY` | Display in call section (masked: `+91 98765 XXXXX`) |
| `case_type` | `CONFIRMED` | `cat4` or `pilot` — drives CTA routing |
| `ha_status` | `CONFIRMED` | `required` / `skipped_customer` / `skipped_system` / `not_applicable` |
| `meds_type` | `CONFIRMED` | `value` / `non_value` / `not_applicable` |
| `prescription_attached` | `MOCK_ONLY` | Boolean — show or hide prescription viewer |
| `medicines` | `MOCK_ONLY` | Array of medicine objects for review |
| `doctor_name` | `MOCK_ONLY` | Shown in header |
| `assignment_status` | `MOCK_ONLY` | `assigned` / `unassigned` |

Fields marked `CONFIRMED` are the ones that drive the CTA decision matrix from `project_truth.md`.
Fields marked `MOCK_ONLY` are fake demo data only.

### 6.2 Medicine object shape

Each medicine in the `medicines` array:

| Field | Certainty | Purpose |
|---|---|---|
| `name` | `MOCK_ONLY` | Medicine name |
| `dosage` | `MOCK_ONLY` | e.g., "500mg" |
| `frequency` | `MOCK_ONLY` | e.g., "Twice daily" |
| `validation_status` | `MOCK_ONLY` | `pending` / `validated` / `flagged` |

Medicine classification (Value vs Non-Value) is a top-level case field, not derived from individual medicines.

---

## 7. Mock call behavior contract

The call section simulates a connected call with a timer.

### 7.1 Call states

| State | Trigger | UI behavior |
|---|---|---|
| `idle` | Page load | Call button visible, ready |
| `calling` | Doctor presses Call | "Calling…" state, pulse cue |
| `connected` | After 2-second simulated delay | Timer starts counting |
| `gate_passed` | Timer reaches 50 seconds | Post-call CTA section revealed |
| `completed` | Doctor presses final CTA | Screen moves to completed state |
| `no_pickup` | Doctor marks no pickup | No-pickup action shown |
| `failed` | Simulated error (optional scenario) | Error state with retry |

### 7.2 Call timer simulation

- Timer starts on `connected` state
- Timer displays in `M:SS` format
- Timer is simulated in JS with `setInterval`
- At 50 seconds, emit a gate-passed event → reveal post-call section
- Timer does not auto-stop unless final CTA is taken

Call connection delay: 2 seconds (simulated network/dialing time). `[MOCK ASSUMPTION]`

### 7.3 Console handshake format

Every meaningful mock state transition should print a clear console log:

```
[MOCK] call-service.initiateCall | scenario=cat4 | state=calling | delay=2000ms
[MOCK] call-service.callConnected | scenario=cat4 | state=connected
[MOCK] call-timer.gateCheck | elapsed=50s | gate=PASSED | cta=confirm_order
```

Logs should be structured, readable, and development-only.
Do not log sensitive patient data in full.

---

## 8. Scenario data structure

For V1, scenario data lives embedded in `index.html` as a JS object:

```js
const SCENARIOS = {
  cat4: { ... },
  pilot_value_meds_ha: { ... },
  pilot_nonvalue_meds_ha: { ... },
  pilot_ha_skipped_customer: { ... },
  pilot_ha_skipped_system: { ... }
};
```

If the user later requests a `data/` folder with JSON files, migrate the scenario data there.
For V1, keeping it inline in `index.html` is acceptable and preferred.

---

## 9. State object: DOCTOR_STATE

The main frontend state object tracks the current consultation state.

Minimum required fields:

```js
const DOCTOR_STATE = {
  activeScenario: 'cat4',         // currently selected scenario ID
  consultationState: 'assigned',   // idle / assigned / calling / connected / gate_passed / completed
  callTimer: 0,                    // seconds elapsed since call connected
  gatePassedAt: null,              // timestamp when gate was passed, or null
  currentCase: null,               // populated from SCENARIOS[activeScenario]
};
```

All UI visibility decisions must be driven from `DOCTOR_STATE`.
No scattered DOM flags. No hidden counters.

---

## 10. Scenario switching

For V1, scenario switching is provided by a **developer debug bar** at the top of the page:
- A row of scenario buttons visible only in prototype/dev mode
- Selecting a scenario resets `DOCTOR_STATE` and repopulates the screen

Scenario switch must:
- reset the call timer
- reset the consultation state to `assigned`
- hide the post-call section
- repopulate all mock data fields

This debug bar must not be styled to look like a real portal UI element. It should be clearly a dev tool.

---

## 11. Delay rule

Simulate realistic delays for backend-like actions only:

| Action | Delay |
|---|---|
| Call dialing (connecting) | 2000ms |
| Prescription load (if simulated) | 600ms |
| Final CTA submission | 800ms |

Do not simulate delay for:
- local state changes
- showing/hiding sections
- scenario switching

---

## 12. Non-happy state coverage

For meaningful backend-like interactions, support more than the happy path.

Call states must cover:
- success (connected, gate passed)
- no pickup
- call dropped before gate (resettable)
- call failed to connect (network error simulation)

Medicine section must cover:
- medicines loaded
- empty medicines list (no medicines on order)

Prescription section must cover:
- prescription attached and viewable
- no prescription attached (collapsed state)

---

## 13. Replaceability rule

All mock behavior should be easy to replace later with real APIs.

Claude should:
- keep request/response shapes stable and named clearly
- isolate mock data from UI rendering where practical
- avoid hardcoding scenario behavior directly into DOM event handlers
- keep scenario data in one place (SCENARIOS object), not scattered across functions

The goal is a clean temporary layer that real engineering can later replace with minimal rewrite.

---

## 14. Output / reporting rule

After backend-like changes, Claude should state:
- what mock contracts were added or changed
- what scenarios were added or changed
- what assumptions were made (labeled)
- what is `CONFIRMED`, `ASSUMED`, or `MOCK_ONLY`
- what is still fake / placeholder
- what real backend can later replace directly

---

## 15. Final working principle

Claude should behave like a careful mock backend support engineer working inside a live mobile-first consultation workflow prototype.

That means:
- respect `project_truth.md`
- support the frontend without inventing operational truth
- keep data human-editable and behavior modular
- support realistic states, not just happy paths
- build in small safe steps
- never silently take product or architecture decisions on its own

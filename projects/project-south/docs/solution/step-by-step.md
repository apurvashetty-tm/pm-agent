# Project South — One Language per Pincode: Step-by-Step Solutioning
**Started:** 2026-09-29 (narration Entry 9)
**Approach:** Take one step at a time. Brainstorm it, close its decisions, then move to the next step.

**Locked so far**
- South pincodes: route **all** Dr-call orders (FTC and NFTC).
- Each pincode gets **one** language.
- Doctors can speak **multiple** languages.
- **Future scope:** language mix per pincode, customer's own language, hand-over after a mismatch.
- **Not in scope:** non-voice consultation.

---

## The steps
| # | Step | Question it answers | Status |
|---|---|---|---|
| 1 | **Doctor language tagging** | Which languages can each doctor consult in? | ✅ Closed. Business provides the data; Tech loads it (Entry 11). |
| 2 | Pincode → language master | Which single language does each South pincode get (including mixed-city pincodes)? | ✅ Business provides the data: one language per pincode, blank = not routed (assumed, Entry 11) |
| 3 | Order language tagging | When and how does an order get its language? | ✅ Final (Entry 13), `allocation-logic.md` |
| 4 | Assignment & priority | Which doctor gets the order, and in what order? | ✅ Final (Entry 13), `allocation-logic.md` |
| 5 | Fallbacks & safety nets | What if no doctor who speaks the language is free, on shift, or exists? | ✅ Final (Entry 13), `allocation-logic.md` |
| 6 | Doctor Portal & Super Doctor tools | What do doctors and admins see and do? | ✅ Final (Entry 13), `allocation-logic.md` |
| 7 | Supply planning & go-live gate | Do we have enough doctors per language and shift? | ⚪ |
| 8 | Pilot, metrics & rollout | How do we launch, measure and expand? | ⚪ |

---

## Step 1 — Doctor language tagging

**Goal:** a reliable list of the languages each doctor can **consult** in. Everything downstream depends on this data, so if it's wrong, routing is wrong.

### 1.1 What exists today
- Swapnil confirms doctors already have a language attribute.
- **To confirm with Eng/Data:**
  - Which table and column?
  - Single value or multiple values?
  - Free text or a fixed list?
  - What % of active doctors have it filled in?
  - Who entered it, and when?
- **Why it matters:** free-text values ("Tamil", "tamil", "TAM") or a single-value field mean it has to be cleaned or migrated before routing can use it.

### 1.2 How to store it
- Recommended: a separate **doctor ↔ language list**. One doctor has many languages.
- Fields: `doctor_id`, `language_code`, `source`, `status` (declared / approved / removed), `created/updated by & on`.
- **Language master (fixed list with standard codes):** Tamil, Telugu, Kannada, Malayalam, Hindi, English, and the other Indian languages (Bengali, Marathi, Gujarati, Odia, Punjabi, Urdu, Assamese…).
  - Capturing all of them now costs nothing and helps with future regional expansion.
  - Only the South languages drive routing now.
- A fixed list means no spelling variants. Every language is one clean value.

### 1.3 What does "speaks a language" mean?
| Option | What it means | Trade-off |
|---|---|---|
| **A. Yes/no: "can consult in"** | The doctor can discuss symptoms, dosage and advice in this language | Simplest. Routing needs exactly this. |
| B. Proficiency levels (native / fluent / conversational) | Richer data | Levels are subjective. Routing would still only use "fluent+". |
| C. Two flags: "can consult" + "can understand" | Useful later for hand-over or escalation | Extra complexity, and not used in v1 |

**Leaning:** A. Only languages the doctor can consult in get tagged. The data-capture form must say so clearly.

### 1.4 How to collect it (backfill for existing doctors)
| Option | How | Trade-off |
|---|---|---|
| **Self-declaration on the Doctor Portal** | On login, prompt "Select the languages you can consult patients in" | Fast and covers everyone. Accuracy depends on honesty. |
| Ops enters from HR/onboarding records | Bulk upload | Fast if the records exist. Likely incomplete. |
| Recruiter or Super Doctor asks each doctor | Call or form | Accurate, but slow at scale |

**Leaning:** self-declaration on the portal, then Super Doctor approves it (§1.5). Pre-fill from today's attribute so doctors only confirm or correct it.

- **Should it be mandatory?** Blocking assignments until a doctor declares could disrupt operations. A softer option is a reminder on every login for 1–2 weeks, followed by an Ops push for anyone who hasn't done it.
- **New doctors:** language is a mandatory field at onboarding from day one.

### 1.5 Can we trust it? (verification)
| Layer | How |
|---|---|
| Approval | Super Doctor approves declared languages before they count for routing |
| Spot check | Super Doctor or a quality check listens to a few calls in the declared language |
| **Outcome monitoring** | Confirm % per doctor on routed orders in each language, compared with peers. Flag outliers for review. |

**Leaning:** approval + outcome monitoring. Spot checks only when a doctor is flagged.

### 1.6 Doctor behaviour risks
- **Over-declaring** to get more orders, if pay or incentives depend on volume. Outcome monitoring catches it.
- **Under-declaring** to avoid South orders, if those are seen as harder (lower confirm rate hurting incentives). Watch declaration rates vs known backgrounds. Think about whether incentives need adjusting for routed orders.
- **To check:** how are doctors paid or incentivised today (per call, per confirm, per hour)? This decides which risk is real.

### 1.7 Who can change it
- Doctors can **request** a change. Only Super Doctor / Admin can **edit or approve**.
- Every change is recorded in an audit trail (who, what, when).
- If a language is removed mid-shift, orders already assigned stay put, and only new assignments follow the change.

### 1.8 Reporting
- Metabase view: doctors by language and by status (declared / approved).
- This feeds the Step 7 supply view: doctors per language per shift.

### 1.9 Step 1 decisions to close
| # | Decision | Leaning |
|---|---|---|
| S1-D1 | Yes/no "can consult in" or proficiency levels? | Yes/no "can consult in" |
| S1-D2 | How to backfill existing doctors? | Portal self-declaration, pre-filled from today's attribute |
| S1-D3 | Mandatory (blocks assignment) or reminder + Ops push? | Reminder + Ops push |
| S1-D4 | Verification: approval, spot checks, outcome monitoring? | Super Doctor approval + outcome monitoring |
| S1-D5 | Language list: South only or all Indian languages? | All Indian languages; only South used for routing now |
| S1-D6 | Today's attribute: migrate into the new list, or start fresh? | Migrate + clean, pending the Eng answers in §1.1 |
| S1-D7 | Incentive model: does routing change doctor earnings in a way that affects what they declare? | Check the current pay model |

### 1.10 ✅ Closed spec (narration Entry 10). This replaces 1.1–1.9 where they differ.
Nothing is stored in the DB today. Doctor language data is kept separately by Ops. It will be **loaded into a new comma-separated column**.

**Column**
| Item | Spec |
|---|---|
| Table | Truemeds doctor table |
| New column | `doctor_languages` (text), plus `languages_updated_on`, `languages_updated_by` for tracking changes |
| Format | Comma-separated, e.g. `TAMIL,ENGLISH,HINDI` |
| Empty (null) | Language unknown. The doctor is **not** in any language pool but still gets normal orders as today. |

**Format rules (so the column stays clean)**
- Only values from a fixed list are allowed: `TAMIL, TELUGU, KANNADA, MALAYALAM, HINDI, ENGLISH, BENGALI, MARATHI, GUJARATI, ODIA, PUNJABI, URDU, ASSAMESE` (extendable).
- Uppercase, no spaces, comma separator only, no duplicates. `"Tamil , english"` → `TAMIL,ENGLISH`.
- Any other value is **rejected** at load and at every later update.
- Only list languages the doctor can **consult** in (symptoms, dosage, advice).

**One-time load**
1. Ops shares a sheet with `doctor_id`, `doctor_name` (for checking only) and `languages` (comma-separated). Use **doctor_id**, not the name, to match.
2. Eng runs a **dry run** and returns a report:
   - doctor_ids not found;
   - language values not in the list;
   - duplicates;
   - active doctors missing from the sheet.
3. Ops fixes the sheet. Eng loads it.
4. Check in Metabase: doctor count per language, and **% of active doctors with languages filled in**.

**How routing uses it**
- Split the value on commas into a set of languages.
- A doctor is eligible for language L if L is in the set.
- Match the **exact value**, not partial text.

**Ongoing upkeep**
- New doctor: Ops adds the languages when onboarding, using the same format.
- Change: Ops asks for an update, the backend updates the column, and the tracking columns are updated.
- Later option: a language field in the doctor onboarding form. Not needed now.

**Trust**
- The data is curated by Ops, so no separate approval step is needed.
- **Outcome monitoring still applies:** confirm % per doctor on language-routed orders vs peers. Outliers are reviewed and their languages corrected.

**Remaining confirmations**
| # | Item | Proposed |
|---|---|---|
| S1-C1 | Language list above: OK? | Yes, extendable later |
| S1-C2 | Does Ops' data mean "can consult in", or just "knows"? | Must be "can consult in". Ops to confirm while preparing the sheet. |
| S1-C3 | Who owns upkeep for new and changed doctors? | Ops (doctor supply), with a backend update |
| S1-C4 | Doctor pay/incentive model (affects the risk of over- or under-listing) | Parked. Revisit before the pilot. |

*Earlier options in 1.3–1.5 (self-declaration on the portal, approval flow, a separate list table) are **not** needed for v1. Keep them as possible later upgrades.*

---

## Step 2 — Pincode → language master
✅ Data provided by the business: one language per South pincode. Blank or missing = not routed. Tech loads it. *(Entry 11)*

## Steps 3–6 — Allocation logic
See **`allocation-logic.md`** (Entry 11).

## Step 7 — Supply planning & go-live gate
*(Pending)*

## Step 8 — Pilot, metrics & rollout
*(Pending)*

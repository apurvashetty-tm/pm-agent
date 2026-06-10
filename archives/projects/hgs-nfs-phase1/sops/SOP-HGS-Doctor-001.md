# SOP-HGS-Doctor-001 — High Governance Salts: Doctor Guide

**Version:** 1.1
**Effective Date:** June 2026
**Audience:** Specialist Doctors (DCC-assigned) — MBBS / General Physician · MD / Internal Medicine

---

## Quick Reference

| I need to… | Go to |
|---|---|
| Understand what makes an HG order different | Section 1 |
| Know what orders I handle | Section 2 |
| Process an HG order step by step | Section 3 |
| Add or change a medicine | Section 3.5 |
| Know what to do at the end of the call | Section 3.7 |
| Handle a hold / missed call | Section 4 |
| See an "Invalid Name" on the patient card | Section 5.1 — **Stop. Do not process. Report.** |
| Read an error on my screen | Section 5 |
| Know what to say to a customer | Section 6 |
| Know what never to do | Section 7 |

---

## 1. What Are High Governance Salts?

High Governance Salts (HGS) are medicines that carry a high risk of misuse, require specialist consultation, or can cause serious harm if taken in excess.

These medicines are available **only through a specialist doctor consultation flow** — not through the standard pharmacist call flow.

**Key differences from a regular order:**

| | Regular Order | HG Salt Order |
|---|---|---|
| Doctor type | Any MBBS doctor | Specialist doctor only (matched by your specialisation) |
| Background colour on portal | White | **Yellow** |
| Diagnosis field | Optional | **Mandatory** |
| Doctor Notes field | Optional | **Mandatory** |
| ETA to customer | Standard | **+4 working hours** from order placement |
| Add medicine restriction | Any medicine | Blocked if outside your assigned specialisation |
| Quantity cap | Standard | Enforced at salt level with visible flag |
| Medicines returnable | Yes | **No — inform the customer** |

---

## 2. What Orders You Handle

Orders are routed to you based on your medical specialisation. You will only receive orders that match the specialisation you have been assigned to — orders outside your specialisation will never appear in your queue.

| Your Specialisation | Orders You Handle |
|---|---|
| MBBS / General Physician | Category 1 HG medicines (e.g. Pregabalin, Telmisartan) |
| MD / Internal Medicine | Category 2 HG medicines (e.g. GLP-1 / Semaglutide / Rybelsus) |

> If you believe the orders appearing in your queue do not match your specialisation, contact the Operations team immediately.

**Order routing is FIFO.** The oldest eligible order in your pool is always assigned first.

---

## 3. Step-by-Step: Processing an HG Order

---

### 3.1 Identifying an HG Order

When you open an HG order, the **entire order page shows a yellow background**. This is your visual signal that the order contains a High Governance Salt and requires the full HGS process.

![Doctor assessment screen with yellow background indicating HG order](https://apurvashetty-tm.github.io/pm-agent/assets/sop_02_doctor_assessment_yellow_bg.jpg)

> All standard orders appear with a white background. **Yellow background = follow this SOP.**

---

### 3.2 Assigning an Order

1. On your Doctor Portal home screen, tap **Assign Order**.
2. The system assigns the oldest eligible order in your pool (FIFO).
3. You have **4 minutes** to attempt a call after assignment. If no call is made within 4 minutes, the order is auto-returned to the pool.
4. If no order is available, the system shows "No order available".

> Two doctors cannot be assigned the same order at the same time. The order locks at the moment of assignment.

---

### 3.3 Review the Assessment Screen Before Calling

Once assigned, review the full order **before** calling the customer.

![Order assessment screen showing medicines, bill summary and action buttons](https://apurvashetty-tm.github.io/pm-agent/assets/sop_03_doctor_bill_confirm_hold.jpg)

The screen shows:

- **Patient details** — name, age, gender
- **Order ID and dates** — order date, delivery date
- **Medicines in the order** — under "NEW ORDER", grouped by salt / molecule
- **Substitute toggle** — "All Original" vs "All Subs"
- **Prescribe / Disable buttons** on each medicine card
- **Diagnosis field** — mandatory
- **Doctor Notes field** — mandatory
- **Current Bill** — full pricing breakdown
- **Action buttons**: Confirm Order · Cancel Order · Hold Order

**⚠ Before doing anything: check the patient name at the top of the screen. If you see a red "Invalid Name" badge — stop and go to Section 5.1 immediately.**

---

### 3.4 Quantity Cap Flags

The system enforces a maximum quantity cap for HG medicines. Two flags can appear during the consultation:

**Popup when prescribing a medicine:**

When you tap **Prescribe** on a medicine card, a popup shows the allowed maximum quantity and a non-returnable notice.

![Quantity selector popup showing Max quantity and Non-returnable item note](https://apurvashetty-tm.github.io/pm-agent/assets/sop_uat_03_qty_popup_maxqty.jpg)

- **Max quantity is [X]** — do not exceed this value
- **Non-returnable item** — inform the customer during the call

**Warning — Ordered qty is greater than prescribed qty:**

If the quantity you prescribe is less than what the customer ordered, the system shows:

> *"Ordered qty is greater than prescribed qty"*

![Ordered qty greater than prescribed qty warning with three options](https://apurvashetty-tm.github.io/pm-agent/assets/sop_uat_05_ordered_gt_prescribed_warning.jpg)

| Option | When to use |
|---|---|
| **Reduce Qty** | Default — reduces ordered qty to match your prescription |
| **Allow Ordered Qty** | Only if you have a specific clinical reason — document in Doctor Notes |
| **Change Prescription** | Go back and update prescription details |

> **Default action: Reduce Qty.** If you choose Allow Ordered Qty, document the clinical reason in Doctor Notes.

---

### 3.5 Add or Change a Medicine

**To add a medicine:**

1. Tap **+ Add another medicine**.
2. Search for the medicine by name.
3. Select quantity — the popup shows the maximum allowed.
4. Tap **Add** → medicine appears under "Medicines Selected".
5. Tap **Confirm Medicines** to save to the order.

**To remove a medicine:** tap the **Delete** button next to the medicine in the "Medicines Selected" list.

![Order assessment screen showing medicine card with Prescribe and Disable buttons and + Add another medicine link](https://apurvashetty-tm.github.io/pm-agent/assets/sop_04_doctor_mobile_prescribe.jpg)

> **Restriction:** You can only add medicines within your assigned specialisation. Attempting to add a medicine outside your specialisation will show an error — contact the Operations team.

---

### 3.6 On the Live Call — Complete the Full Consultation

Tap **Call Patient** to begin the call. Everything from this point — prescribing, diagnosis, doctor notes, and any quantity decisions — happens **during the live call with the patient**.

**While on the call:**

**a. Prescribe each medicine**

Tap **Prescribe** on each medicine card and fill in:

![Prescribe modal showing Dosage, Duration and Advice fields](https://apurvashetty-tm.github.io/pm-agent/assets/sop_11_prescribe_modal_advice.jpg)

- **Dosage** — e.g. 1 Unit, 1-0-0, or 0-0-1
- **Duration** — number + unit (e.g. 2 Months), frequency (Everyday)
- **Advice** — select from the dropdown or type custom advice

Once prescribed, the medicine card shows a green **"✓ Prescribed"** checkmark:

![Medicine card showing green Prescribed checkmark state](https://apurvashetty-tm.github.io/pm-agent/assets/sop_05_doctor_prescribed_state.jpg)

**b. Fill Diagnosis**

Enter the patient's confirmed diagnosis. Multiple diagnoses can be added as tags (e.g. `TYPE 2 DIABETES MELLITUS`, `NEUROPATHIC PAIN`).

**c. Fill Doctor Notes**

Enter a clear, professional clinical note summarising the consultation. This note appears word-for-word on the prescription (DRX) that the customer receives.

> **Validation rule:** Doctor Notes must use professional clinical language. Blank notes, single words, test text, or non-professional language will be blocked.

Once Diagnosis and Doctor Notes are correctly filled, the order is ready for the final action:

![Diagnosis and Doctor Notes filled — order ready to confirm](https://apurvashetty-tm.github.io/pm-agent/assets/sop_07_doctor_notes_filled.jpg)

---

### 3.7 End of Call — Follow the CTA on Your Portal

Once the consultation is complete, look at the CTA button shown on your portal and follow it exactly.

| CTA shown | Call state | What to do | What to tell the patient |
|---|---|---|---|
| **Confirm Order** | Call has ended | Click Confirm Order | *"I will confirm your order now."* |
| **Transfer** | Call is still live | Click Transfer — patient stays on the call and is transferred to a Health Advisor | *"Please stay on the call. I will transfer you to a Health Advisor now."* |
| **Forward** | Call can end | Click Forward — a Health Advisor will connect with the patient separately | *"I will confirm this from my side. A Health Advisor will connect with you next."* |

> **Follow only what the portal shows. Do not promise a Health Advisor call when the CTA shows Confirm Order. Do not disconnect the patient before completing a Transfer.**

---

### 3.8 After Confirmation

**A prescription (DRX) is automatically generated:**

![DRX prescription PDF showing Doctor name, patient details, Doctor Notes, medicine table](https://apurvashetty-tm.github.io/pm-agent/assets/sop_uat_08_drx_prescription_pdf.jpg)

The DRX includes:
- Doctor name, qualification, and registration number
- Patient name, gender, age
- Doctor Notes — your clinical note, verbatim
- Medicine table: Medicine Name · Dosage · Duration · Advice
- Doctor signature and Reg No
- Note to Pharmacist: *"Kindly substitute brands as needed."*

**Your Doctor Dashboard updates with earnings and stats:**

![Doctor Dashboard showing Today's Earning, Today's Incentive, Total Orders, Sub Rate](https://apurvashetty-tm.github.io/pm-agent/assets/sop_uat_07_doctor_dashboard.jpg)

---

## 4. Hold Order Flow

Use **Hold Order** when you cannot reach the customer.

### When to use Hold:
- Customer does not answer the call
- Call drops mid-consultation and the customer is unreachable
- Customer needs more time to confirm their decision

### What happens next:
The system automatically retries and sends reminders to the customer. You do not need to manage the retry timing.

If you have attempted multiple times and are still unable to reach the customer, escalate to the Operations team with the Order ID.

---

## 5. Error Scenarios

---

### ⚠ 5.1 CRITICAL: Invalid Patient Name — Do Not Process

**When it appears:** A red **"Invalid Name"** badge appears next to the patient name at the top of the order screen.

![Doctor portal patient card showing red Invalid Name badge](https://apurvashetty-tm.github.io/pm-agent/assets/invalid_name_badge.png)

**What you must do — in order:**

1. **Stop immediately. Do not process this order.**
2. Do not call the patient.
3. Do not add notes, diagnoses, or prescriptions.
4. Do not cancel the order yourself.
5. **Report to the Operations team immediately** — share the Order ID and a screenshot.

> This is a hard stop. No exceptions. The Operations team handles the account review and customer communication.

---

### 5.2 Error: Confirmation Blocked — Contact Support

**When it appears:** You tap "Confirm Order" but the system blocks it and shows:

> *"Contact Support to route this order to the right department. Department review is required before confirmation."*

![Error: Contact Support — confirmation blocked, full screen view](https://apurvashetty-tm.github.io/pm-agent/assets/err_confirm_blocked_contactsupport.png)

**What to do:**
1. Stop processing immediately.
2. Do not cancel the order.
3. Use the approved script to inform the customer (see Section 6.4).
4. Share with Operations: Order ID · Medicine name · Error screenshot.

---

### 5.3 Error: Add Medicine Blocked — Contact Support

**When it appears:** You try to add a medicine and the system shows:

> *"Contact Support to route this consultation to the right department. Department review is required before adding this medicine."*

![Error: Contact Support — add medicine blocked](https://apurvashetty-tm.github.io/pm-agent/assets/err_add_medicine_contactsupport.png)

**What to do:** Same as Section 5.2 — stop, do not cancel, report to Operations with Order ID.

---

### 5.4 Error: Doctor Notes Validation Failed

**When it appears:** You submit Doctor Notes but the system rejects them.

> *"Couldn't save note. Please enter a meaningful consultation note using professional language and supported characters."*

![Error banner: Couldn't save note — professional language required](https://apurvashetty-tm.github.io/pm-agent/assets/sop_uat_06_err_notes_validation.jpg)

**What to do:** Rewrite Doctor Notes with a clear, professional clinical summary. Avoid blank entries, single words, test text ("abc", "test"), slang, or special characters. The note appears verbatim on the customer's prescription.

---

## 6. Customer Communication Scripts

### 6.1 Standard HG Order Explanation

> *"This medicine requires a consultation with a specialist doctor as part of our clinical process. Our doctor will call you within [ETA] to review your order and confirm the prescription."*

---

### 6.2 Quantity Reduction Explanation

> *"Based on the consultation, I'm reducing the quantity of [medicine name] to [new quantity]. This is to ensure the prescription is within the recommended safe dosage for your condition."*

---

### 6.3 Hold Order Explanation

> *"We tried to reach you for your consultation but were unable to connect. We will try again shortly. Please keep your phone reachable so we can process your order."*

---

### 6.4 Wrong Department / Blocked Error Explanation

> *"This medicine requires an additional review from the relevant medical department as part of our clinical process. Our team will route the case and update you on the next step."*

If the customer asks why:
> *"For certain medicines, we follow an additional review process to make sure the prescription is handled by the right medical department before proceeding."*

---

### 6.5 Non-Returnable Medicines Notice

> *"Please note that the medicines in this order are non-returnable once processed. Please confirm you would like to proceed with the current medicines and quantities."*

---

## 7. Do's and Don'ts

### Do's

- Use the yellow background as your primary signal — always follow this SOP for yellow orders.
- Check the patient name before doing anything. If "Invalid Name" is visible, stop and report immediately.
- Complete all prescriptions, Diagnosis, and Doctor Notes during the live call.
- Always attempt a call before confirming — the Confirm button is locked until a call is recorded.
- Follow only the CTA shown on your portal at the end of the call (Confirm Order / Transfer / Forward).
- Reduce medicine quantity if the molecule cap is breached or clinically inappropriate.
- Inform customers that HG medicines are non-returnable.
- Escalate to the Operations team when you see any blocked error (Sections 5.2, 5.3).
- Use the approved customer scripts — do not improvise.

### Don'ts

- Do not confirm an HG order without a recorded call attempt.
- Do not leave Doctor Notes blank or fill them with placeholder text — the system will block confirmation.
- Do not add a medicine outside your assigned specialisation — the system will block it; do not attempt workarounds.
- Do not cancel an order that has a blocked error (Sections 5.2, 5.3) — escalate instead.
- Do not process an order showing an "Invalid Name" badge — report to Operations immediately.
- Do not bypass quantity cap restrictions.
- Do not promise a Health Advisor call when the portal shows Confirm Order.
- Do not disconnect the patient before completing a Transfer.
- Do not say "wrong doctor assigned" or "doctor is not qualified" to the customer.

---

## 8. Escalation Matrix

| Situation | Who to contact | What to share |
|---|---|---|
| "Invalid Name" badge on patient card | Operations team | Order ID + screenshot — immediately |
| Error 5.2 / 5.3: Confirmation or add medicine blocked | Operations / Super Doctor | Order ID, medicine name, error screenshot |
| Unable to reach customer after multiple hold attempts | Operations / Super Doctor | Order ID, customer name, number of attempts |
| Orders in your queue do not match your specialisation | Operations team | Salt name, your specialisation, what was expected |

---

*Document owner: Product — Apurva Shetty*
*Effective: June 2026 — v1.1*
*For corrections or updates, contact the PM directly.*

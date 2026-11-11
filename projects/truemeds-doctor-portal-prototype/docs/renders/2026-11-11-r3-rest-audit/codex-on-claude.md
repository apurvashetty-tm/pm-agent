Read-only; no files changed. All measured px values below come from updated `facts.md` and this run’s duration measurements.

- **K1 — AGREE.** `a-order-details`, `s7b`: complaints field → Doctor notes is 17.6; separate field groups require 32 (§8.3).
- **K2 — PARTLY.** Medicines heading → content 18.5 (24 in `a-long-content`) and Notes heading → label 20 should be 16. Script heading → script 14.5 joins a heading to its own content: I still favour 8 (§8.3).
- **K3 — AGREE.** Case medicine rows’ 0/12 gaps are list anatomy; title → Qty/status measurements do not establish overlap.
- **K4 — AGREE.** `s7b`, question → answers 30.7 should be 16, using centred bar-question anatomy.
- **K5 — AGREE.** `g2`, checking caption → Skip HA 26.5 should be 8 (§8.3).
- **K6 — AGREE.** Case name → demographics 17.1 should be 8; metadata lines at 6.5 need no separate group gap.
- **K7 — PARTLY.** `a-order-details`, tools → expanded details 8 should be 16: these are rows within a group (§8.3). I retain this as drift.
- **K8 — PARTLY.** The exception needs clarification, but actionable Pending/Prescribed/Disabled status meets §8.1’s explicit ≥14 requirement; I favour 14.
- **K9 — PARTLY.** I withdraw the toast-weight failure: the medium restriction belongs to entry/Home. Claude misses `a-back-blocked`’s 8px bar offset; §9.5 requires 16.
- **K10 — AGREE.** `e-availability-ended` needs an explanation before Back to Home; wording requires approval.
- **K11 — AGREE.** Prescribe field → helper/error 13.6 should be 8, including Printed on the prescription (§8.3).
- **K12 — AGREE.** Prescribe schedule groups at 29.6 and SOS helper → settings 24.9 should be 32.
- **K13 — AGREE.** SOS toggle → explanatory helper 27.6 should be 8.
- **K14 — AGREE.** `d-every-x-hours`, chips → read-out 13.6 should be 8.
- **K15 — AGREE.** `d-disabled`, notice → schedule 16 should be 32; title → form 3.7 should be 8.
- **K16 — AGREE.** Edit-header −0.4 comparisons include adjacent buttons; 7.1 title → subtitle passes 8±2.
- **K17 — AGREE.** `d-error-dose`, grid → error 9.6 passes 8±2.
- **K18 — AGREE.** Duration’s zero left inset needs repair; summary → controls and numbers → units need 16. Ongoing wrapping alone is allowed (§9.2).
- **K19 — AGREE.** Assess complete clickable labels/controls, rather than failing the 36×20 toggle or 46px inner input alone (§8.6).
- **K20 — AGREE.** Callback title → first label 33.1 should become 16 visible; D-108 supersedes box-gap readings.
- **K21 — AGREE.** Callback Date → Time 21.6 should be 32 between field groups.
- **K22 — AGREE.** Callback failed/refused notice at 24 below slots belongs in pinned actions, 16 above Confirm (§9.5).
- **K23 — AGREE.** Callback grid → field error 13.6 should be 8.
- **K24 — AGREE.** Busy Confirm callback lacks the required ellipsis (§9.1); Scheduling… is a proposed replacement.
- **K25 — AGREE.** Three-column callback times need an explicit exception to §9.2’s four-column rule.
- **K26 — AGREE.** Leave/Discard subtitles belong in headers; Select reason remains a body label (D-109).
- **K27 — PARTLY.** `a-rx-viewer`, hint → paper 4.9 fails; I favour 8 because the hint describes that document, rather than an undecided 16/8.
- **K28 — PARTLY.** Viewer title size is unspecified in §8.5; I withdraw my mandatory 20px change. However, 34.1 title → tools is not listed anatomy and cannot automatically pass.
- **K29 — AGREE.** Profile lacks the count promised by Home’s prescriptions row (D-106); adding it needs approval.
- **K30 — AGREE.** Profile earnings label → amount 7 should be listed value-label anatomy, 4.
- **K31 — AGREE.** Profile rows → logout/blocked notice 16 should be 32 (§8.3).
- **K32 — AGREE.** Profile’s compact tinted 20/28 task header follows §8.5.

**Vocabulary — PARTLY.** Approved customer-order wording stays, including “earlier order” (H23). “Your chosen time” is clearer, but D-109’s availability vocabulary does not prohibit ordinary callback-time wording.

**Task headers — PARTLY.** Their distinct types correctly exclude the logo band. Viewer spacing still needs a listed standard; unspecified anatomy is not an exemption.

**Calling-flow page — PARTLY.** Keep mobile band/bar rules off this desktop diagram. However, RULES §4 still covers desktop/internal tools; its typography and spacing need an explicit scope ruling.

**Duration proposal — PARTLY.** Support P1, unit first, four-column numeric grids and Ongoing. Claude’s clinical-frequency claims are unsourced here. My extra 12-week and 9-month options remain product proposals, not proven requirements. Unit-switch clearing also needs approval.

**Needs Apurva — PARTLY.** All eight are reasonable decisions to present. Separate confirmed drift from choices: busy ellipsis is mandatory; its wording is optional. Add diagram scope and duration-switch behaviour.

My review’s remaining omissions or contradictions:

- **C1/C3/C4:** retain 16 for expanded details, ≥14 status text, and 8 for script heading → body.
- **C6:** withdraw weight objection; retain missing toast offset.
- **C11:** Claude missed duration summary → Default at 1.6; retain 8 for supporting text.
- **C15/C18:** retain unresolved viewer spacing and diagram scope; withdraw mandatory viewer-title resizing.
- **C19:** withdraw “earlier case” recommendation under H23.
- My first review missed K1 and the medicine/notes title gaps; accept them. Tall captures establish Prescribe spacing, but do not prove real-viewport scrolling works through the overflow-hidden ancestor.

**Still disputed**

- Script heading: 8 versus 16.
- Expanded details: definite 16 drift versus discretionary.
- Status tags: ≥14 versus retaining 12.
- Viewer spacing exemption and hint gap.
- Diagram scope exemption.
- Extra duration options and callback vocabulary’s mandatory status.
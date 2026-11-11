# Codex review — r3-rest-audit

Evidence: supplied screenshots, `facts.md`, `visible-gaps.json`, `duration/measure.json`, screen code and current rules. Measurements below come from this run; recommendations are explicitly identified. No files edited; `claude-review.md` not read.

## Findings by screen

### Case page

**C1. Order details is under-grouped.** `a-order-details`, both widths: the expanded details start **8px** below the tools row. These are separate rows within a group, so use **16px**. Keep customer-order wording, dates and payment details. **Tag: drift fix.**

**C2. Task headers need shared alignment, not the entry band.** Case headers measure **17.1px** from name to demographics and **6.5px** between metadata lines. Name and metadata belong together: recommend **8px** between them. Compact case, edit, viewer and Profile headers retain their own surfaces and sizes; the logo band and its panel position do not apply. **Tag: drift fix.**

**C3. Clinical status text is too small.** Medicine tags are **12/600** across open and closed cases. Although decorative tags may use 12px, Prescribed/Pending/Disabled informs the doctor’s next action: use **14px minimum**. Names and section headings otherwise follow 16/24 semibold. **Tag: drift fix.**

### Calling & outcomes

**C4. Script heading is misclassified.** G1–G3: **14.5px** between “End-of-call script” and its quoted script. This is a heading describing its content, not an unrelated notice; use **8px**, rather than the checker’s 32px. **Tag: drift fix.**

**C5. Calling bars contain excess visible space.** `s7b-still-on-call`: question → answers **30.7px**, should be **16px**. `g2-checking-ha`: caption → Skip HA **26.5px**, should be **8px**; the reserved button-height status slot creates the excess. **Tag: drift fix.**

**C6. Blocked-back toast has shared-component drift.** `a-back-blocked`: **14/500/20** text; medium conflicts with the new weight standard. `.case-toast` also specifies **8px** above the bar versus the required **16px**. Use regular toast text and the shared offset. **Tag: drift fix.**

**C7. Expired availability has no explanation.** `e-availability-ended` passes spacing but only offers Back to Home. Home now always offers Add time while available; expiry should explain that new time must be set on Home, without adding a case-page availability control. Existing **16px** card gaps and closed, non-tappable medicine rows remain appropriate. **Tag: needs Apurva.**

### Prescribe

**C8. Separate field groups need full separation.** G7/G14/G17/G18/G20/G22: frequency → Dose/Every and dose → maximum are **29.6px**, outside the 32±2 tolerance. G19, SOS helper → dose settings, is **24.9px**. Use **32px** across tablet, syrup, drops, inhaler, injection and cream variants. **Tag: drift fix.**

**C9. Helpers need tighter attachment.** SOS toggle → helper is **27.6px** (G6), but belongs at **8px**, not 32. Every-X-hours chips → explanation is **13.6px** (G15), also **8px**. Additional instructions → “Printed on the prescription” is **13.6px** in tall captures, again **8px**. **Tag: drift fix.**

**C10. Error and disabled-state gaps differ by role.** `d-error-dose`: grid → error **9.6px**, acceptable for an 8px field error. `d-error-other`: **13.6px**, reduce to **8px**, measured from the painted field edge. `d-disabled`: notice → schedule card **16px**, must be **32px** (G11). **Tag: drift fix.**

**C11. Duration anatomy needs repair before selecting options.** Today’s open picker has effectively no left inset at the first numeric chip: negative margins cancel the panel padding. Summary → “Default” is **1.6px**; this is supporting text, not listed value-label anatomy. Use **8px**, restore a consistent inner inset, and separate unit controls from the numeric grid by **16px**. Keep **8px** within chip grids. **Tag: drift fix.**

### Sheets

**C12. Callback groups and feedback need correction.** Date chips → Time is **21.6px**: separate field groups require **32px**, not the checker’s 16. Grid → field error is **13.6px**, should be **8px**. Failed/refused notices sit **24px** below the grid outside pinned actions; move them into actions, **16px above Confirm**. Content → actions retains its **24px anatomy**. **Tag: drift fix.**

**C13. Subtitle support is already shared.** `parts.js` places actual subtitles inside the header. Leave-case and discard confirmations use it. “Select reason” in Disable, Unavailable and Skip HA is a body label, not a misplaced subtitle; retain it there. Callback busy currently says **“Confirm callback”**, without an ellipsis: use an approved busy label. **Tag: no change for structure; drift fix for busy copy.**

**C14. Numeric time slots conflict with §9.2.** Callback uses **three columns**, with passing **8px** gaps; the rule specifies four-column numeric grids. Four columns may not fit full time labels at 360px. Resolve the component rule explicitly rather than squeezing labels. **Tag: needs Apurva.**

### Rx viewer

**C15. Header spacing is genuinely excessive.** `a-rx-viewer`: title row → tools **34.1px**, versus **8px** stacked-control anatomy; hint → document **4.9px**, versus **8px**. Title is **16px**, while sibling task titles use **20/28**. Keep the dark viewer header, shared close/title alignment and 48px controls; the mock prescription paper remains exempt. **Tag: drift fix.**

### Profile

**C16. Home’s destination lacks the promised count.** Both Profile states show earnings but no prescriptions-written-today count. Amounts use **16/24**, rather than Home’s L9 value treatment. Add the count and use shared grey-icon, regular-label, L9-value rows if extending Home’s card anatomy. **Tag: needs Apurva.**

**C17. Earnings and logout spacing drift.** G23: label → amount **7px** is neither “points 16 apart” nor the listed **4px value-label anatomy**. Use **4px** if retaining this layout. Rows → Log out or blocked-logout notice is **16px** (G24–25), now **32px**. Keep **16px** between cards. **Tag: drift fix.**

### Calling-flow page

**C18. Desktop reference needs an explicit scope decision.** `flow.css` uses **10/11/13px** diagram text, **15px/700** headings, **4/6/12px** layout spacing and compact controls. These conflict with app rules if applied wholesale, but the page is a desktop reference diagram. Approve a diagram-specific standard or migrate it; do not apply the entry band or mobile pinned bar. Painted gaps were not measured in this run. **Tag: needs Apurva.**

**C19. Vocabulary mostly passes.** Reviewed `messages.json`: OTP/code, faster sign-in, availability/time and case wording are consistent. Customer “Order details,” order ID and tracking script are approved uses. “Counselled in an earlier order” refers to prior counselling: recommend “Counselled on an earlier case.” “Request next case” remains an explicitly locked CTA. **Tag: needs Apurva for counselling wording; no change otherwise.**

## Checker artefacts and anatomy

- Exclude G31–G35: **7.1px** medicine-title/subtitle and **8px** identity gaps are real positive gaps beside taller siblings.
- G8/G9/G12/G16/G21 compare a neighbouring button with the subtitle; **−0.4px** does not prove text overlap. Re-measure the heading column. G10’s **3.7px** disabled-header gap is real.
- Toggle **36×20** measurements omit enclosing clickable labels: Prescribe’s label is **48px** tall; Profile’s entire row toggles it. Other-dose **46px** inputs sit within field controls; assess the complete target before failing.
- Keep chip gaps **8px**, card stacks **16px**, and component button sizes. Use `.tm-link` for standalone inline actions; no additional link drift found.

## Duration proposal

Prefer **p1, unit first**, with these recommended sets:

- **Days:** 1, 2, 3, 5 / 7, 10, 14, 15.
- **Weeks:** 1, 2, 3, 4 / 6, 8, 12.
- **Months:** 1, 2, 3, 4 / 6, 9, 12.
- **Ongoing:** retained separately.

Use four columns, **8px** gaps, empty trailing cells and consistent inset. p1’s **16px** unit-to-number separation is correct despite its checker flag.

This preserves short courses and longer review intervals. Indian guidance includes short antimicrobial courses and **14-day** regimens ([ICMR](https://amrtg.icmr.org.in/chapter2-management-principles-empiric-therapy.html)); NCD guidance supports **one-to-three-month supply** ([MoHFW](https://www.mohfw.gov.in/sites/default/files/Operational%20Guidelines%20on%20Prevention%2C%20Screening%20and%20Control%20of%20Common%20NCDs_1.pdf)). These support coverage, not observed prescribing frequency. Longer options are product recommendations, not treatment defaults. tm-chotu v0.4.3 (2026-08-25) supplies no clinical picker set.

## Needs Apurva

- Approve p1 with these reduced sets?
- Add today’s count and Home-style value rows to Profile?
- Explain expired availability before Back to Home?
- Permit three-column callback times as explicit anatomy?
- Give the desktop diagram its own standard?
- Replace “earlier order” with “earlier case” in the counselling reason?
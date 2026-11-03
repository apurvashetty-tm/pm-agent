# Codex review brief: copy rules draft (doctor portal)

Owner: main Claude thread · Reviewer: Codex · Date: 2026-11-03

Apurva wants an independent critique of the draft copy standard before she approves it. You review; you don't decide. Write no files: your final message is your report, and it is saved for you.

## Review this
`docs/reviews/2026-11-03-copy-audit/COPY-RULES-DRAFT.md`: 21 rules for every piece of text in the doctor app (messages, buttons, titles, sheets, helpers, toasts, call scripts).

## Ground truth: read first
- `ui-screens/feedback/messages.json`: all current app messages.
- `docs/feedback-rules.md` §4, including the "No repeated button" rule (D-65).
- `docs/context/decision_log.md`: D-48 (case, not order), D-65 / D-66 C (messages don't repeat buttons), D-77 pt 3 (order = patient's purchase), D-81 pt 1 (short copy, curly apostrophes), D-83 (newest copy).
- Button labels, titles and sheet text in `ui-screens/case/case.html`, `ui-screens/home/home-reference.js`, `ui-screens/otp/otp.html` and `ui-screens/sign-in/`. Skim these to see the real text.

**Users:** doctors in India, on mobile, often mid-call with a patient. Many read English as a second language.

## Questions
1. **Wrong or weak rules:** which rules are wrong, too vague to check, or would make the copy worse for these users? Quote the rule number.
2. **Missing rules:** what does a serious UX-writing standard cover that this one doesn't? Examples: accessibility and screen readers, placeholders, empty states, time and date format, confirmation dialogs, truncation and length limits at 360 px, localisation readiness. Only list items that matter for this app.
3. **Conflicts:** does any rule contradict a decision in the log, or another rule? Example: rule 5 ("don't repeat a button") against the general guidance that errors should say how to fix them.
4. **Sources:** does the draft represent Atlassian, Shopify Polaris, Apple HIG and Material writing guidance fairly? Flag anything misattributed.
5. **Spot check:** apply the rules to 10 real strings from `messages.json` that you think are most at risk. For each, give pass / fail and the rule.
6. **Automation:** which ⚙ rules can a script really check, and which marked ones can't (or unmarked ones can)?

## Report format
- **Verdict:** ready / ready with changes / not ready (one line).
- **Must change:** numbered; each item gives the rule, the problem and a suggested rewrite.
- **Should consider:** numbered and short.
- **Spot check table:** string | pass/fail | rule | note.
- **Automation:** a short list.
Keep it under about 600 words. Don't rewrite the whole document.

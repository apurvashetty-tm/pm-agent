# Terminal brief: copy audit against the copy rules v2 (audit only) — RUN 2

Owner: main Claude thread · Worker: terminal session · Date: 2026-11-03
Folder: `~/src/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype` (branch `project/truemeds-doctor-portal-prototype`).

**This is an audit, not a fix round (D-84).** Change nothing in `ui-screens/`, `messages.json`, the docs or the design system. Re-render nothing into `ui-screens/`. The only file you write is `docs/reviews/2026-11-03-copy-audit/COPY-AUDIT-v2.md`, plus scratch files in `docs/reviews/2026-11-03-copy-audit/_work/`.

## Run 2 (2026-11-03): why
Run 1 (`COPY-AUDIT.md`) checked the v1 rule file by mistake. `COPY-RULES.md` on disk is now **v2: 26 rules** (header says v2, approved). Re-use run 1's inventory (`_work/inventory.csv`, `_work/dom-390.json`) if it's still complete; don't re-extract unless something is missing. The main thread has already re-mapped run 1's findings to v2 in `COPY-ANNEX.md`.

**Extra jobs for run 2:**
- For every row in `COPY-ANNEX.md` (fixes and dropped), say **AGREE** or **DISPUTE**, with a reason and the v2 rule.
- Find **new** fails under the rules v1 didn't have: 6 (true to the current state; check against app-logic §4–§7 and D-83), 11 (status lines), 15 (empty states), 16 (confirmation sheets), 17 (placeholders), 24 (fit at 360 **and** at large text: render the at-risk states at 360 with root font size 130% into `_work/large-text/`, no promotion), 25 (accessible names, field errors tied to fields, announced messages).
- For each fix, say whether it **changes layout** (a line removed or added, a label length change that alters wrapping or button width) or is **text only**, and list the states whose picture would change.

## Read first
- `docs/reviews/2026-11-03-copy-audit/COPY-RULES.md`: the standard (26 rules). Its approved exceptions are not failures.
- `docs/context/decision_log.md` D-84, plus D-48, D-65, D-66, D-77, D-81 and D-83 for context. A string a decision explicitly approved can still fail a rule. Log it, and in the note say which decision approved it, so Apurva decides knowingly.
- `docs/feedback-rules.md` §4 and §11; `ui-screens/app-logic.md` §4–§7 (to judge rule 6, "true to the current state").

## Steps
1. **Inventory every visible string, from the real screens.** Open each of the 149 states in `ui-screens/` at 390 the same way the calling round captured them (scripts in `docs/renders/2026-11-03-calling-round/capture-method-*.py`: fixed clock, `?capture=1&state=…` for Home, `case.html?s=<id>&start=case&capture=1` for case states, open sheets included). From the DOM collect every visible text node, every `aria-label`, every placeholder and every `title`. Also collect every key in `ui-screens/feedback/messages.json`, including keys that no state shows. Deduplicate into `_work/inventory.csv` with these columns: string · source (message key, or file + element) · element type (progress line, status line, notice, field helper, field error, toast, action button, answer button, navigation, title, sheet body, placeholder, label, card text, script, accessible name) · states it appears in.
2. **Check each unique string against every rule that applies to its element type.** Rule 24 (fit): flag text that wraps badly or is truncated in the 360 pictures. Look at the picture; don't guess.
3. **Self-review the fails.** Drop false positives and approved exceptions. For each real fail, propose a fix that passes **all** rules, keeps the meaning, fits at 360, and doesn't contradict a decision. If the right wording depends on product facts you don't have, write `NEEDS-APURVA` instead of guessing.
4. **Independent check.** Start a fresh subagent that hasn't seen your work. Give it only `COPY-RULES.md` and your fail table, and have it re-check each fail and each proposed fix. Where it disagrees, keep both views in the note column.
5. **Write `COPY-AUDIT-v2.md`** (same format as run 1, plus three sections: the AGREE / DISPUTE table for `COPY-ANNEX.md`, new fails (IDs from CA-30), and a layout-impact table: ID · layout or text only · states affected):
   - **Summary:** strings inventoried · unique · passing · failing, with fails counted by rule and by screen.
   - **Fail table, grouped by screen** (Sign-in, OTP, Faster sign-in offer, Returning unlock, Home + Profile, Case, Calling, Prescribe, Sheets, Scripts, Accessible names):
     `ID | Where (key or element + states) | Current text | Rule(s) | Problem | Proposed fix | Priority | Note`
     IDs are `CA-01…`. Priority: **P1** = misleading or untrue (rule 6, wrong term, wrong promise); **P2** = breaks a rule the doctor would notice (button repeat, length, tone); **P3** = mechanical (punctuation, quotes, dashes, full stops).
   - **Already agreed (D-84 pt 3):** list the two agreed fixes first, as CA-01 and CA-02, marked "Agreed".
   - **Script checks to add during the build:** for each ⚙ / ◐ rule, how `check-sources.mjs` would check it and how many current strings it would flag.
   - **NEEDS-APURVA:** product-fact questions only.
   - Last line exactly: `COPY AUDIT v2 DONE — annex agreed <n>, disputed <n>, new fails <n>`
6. **Stop.** Don't wait or poll.

## Never
Change, re-render or "fix" anything. Commit, push or open PRs, or run git commands other than `git status` / `git diff`. Record decisions in Apurva's name. Read or print credentials.

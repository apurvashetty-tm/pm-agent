**Blockers**

- **Dose rules are missing from DECIDED.** [build-handoff.journeys.mjs:340](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/scripts/build-handoff.journeys.mjs:340) drops rules containing fewer than twelve letters. This removes the Tablet, Capsule and Drops rows from app-logic §8, including their allowed doses. Preserve numeric table rows and their decision provenance.
- **Skip HA incorrectly implies confirmation.** [build-handoff.when.mjs:162](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/scripts/build-handoff.when.mjs:162) says choosing a reason makes the ending “Prescription confirmed.” App-logic §6 requires the button to become **Confirm prescription**; on a live call it first waits through state 17. Choosing a reason does not confirm.

**Should-fix**

- **Resend waits are truncated.** The comma-based settings parser at [build-handoff.journeys.mjs:308](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/scripts/build-handoff.journeys.mjs:308) reads only the first array entry. [DECIDED.md:784](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/handoff/DECIDED.md:784) consequently says `[30 s`, losing the later waits.
- **Conflicting OTP mock values remain.** [DECIDED.md:356](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/handoff/DECIDED.md:356) specifies five-minute code life; [DECIDED.md:770](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/handoff/DECIDED.md:770) specifies ten minutes. D-101 requires the prototype’s current mock answer, not conflicting historical placeholders.
- **Internal review debates leaked into the kit.** [DECIDED.md:2016](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/handoff/DECIDED.md:2016) includes the original Flag 5 debate and rejected options. [DECIDED.md:2086](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/handoff/DECIDED.md:2086) includes Flag 6 history and “please confirm” despite presenting an answered rule. Export only the final decisions.
- **Release-failure guidance allows Back after the patient answered.** [build-handoff.when.mjs:124](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/scripts/build-handoff.when.mjs:124) combines ordinary release failure with the patient answering, then says “Back works again.” App-logic §4 says Back never returns once the patient answered.

**Nice-to-have**

None; findings above affect correctness.

Token names and copy keys resolve against the canonical files. Doctor-unit wording passed the scoped checks. Launch-B `t13-connecting-ha` correctly uses `call.scriptNeutral`. OPEN contains only the Product questions about no-cases rechecking and re-offering faster sign-in.

**Tests and outstanding evidence**

The stored [tests-2.log:40](/Users/appu13/pm-agent/.work/truemeds-doctor-portal-prototype/projects/truemeds-doctor-portal-prototype/docs/renders/2026-11-09-handoff-kit-all/tests-2.log:40) records H01–H35 passing. No automated CASES.md check lacks a recorded pass. The current read-only `--check` also passes.

This session could not rerun H09, H24 or H25–H35: temporary-directory creation was blocked by the sandbox. These are infrastructure failures, not demonstrated kit failures.

CASES.md’s **E01–E24 are manual/evidence checks, not passing automated tests**; superseded pilot requirements need the D-103 interpretation. In particular, E08/E10/E22 are contradicted by the findings above. E14/E24’s complete fresh-AI evidence is unfinished: no `fresh-ai/SCORES.md` or Claude transcripts were present. Deployment download verification and the FE walkthrough also remain unverified.

No files changed.
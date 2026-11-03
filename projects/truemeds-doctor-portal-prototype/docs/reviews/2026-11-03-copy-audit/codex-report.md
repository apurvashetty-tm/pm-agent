**Verdict:** ready with changes.

**Must change:**

1. **R1 — hard sentence cap conflicts with retained copy.** D-83 §11 preserves three-sentence doctor coaching. Rewrite: “Prefer two sentences; document approved exceptions. Never remove necessary consequences or coaching merely to meet length.”
2. **R5–6 — define recovery across message and controls.** Preserve D-65/D-66; naming failed action isn’t repetition. Rewrite: “Message plus available controls must explain recovery. Use ‘Couldn’t…’ for failed operations; field validation states required correction.”
3. **R7, R10–12, R20 — grammatical absolutes reject approved UI.** “On call…” isn’t an *-ing* verb; “Still talking” / “Call ended” are D-77 answers; “Stay on this case” exceeds button limit; back-blocked toast gives guidance. Rewrite: “Distinguish progress, status, action, answer and navigation. Allow task/question titles and informational toasts; use appropriate question marks.”
4. **R8, R18 — scope bans precisely.** “Codes” could prohibit OTP; “dashes” could prohibit R19’s “4-digit.” Rewrite: “Hide internal status codes and gate thresholds; retain verification codes. Avoid sentence-separating dashes; allow meaningful hyphens and ranges.”
5. **R2, R6, R21 — truthfulness must cover every message.** Saved, confirmed and forwarded aren’t interchangeable. Rewrite: “Promise outcomes, retained data and timing only when supported by current state and agreed behavior.” `call.submittedText` overpromises against D-83 §9.
6. **R3 — separate audiences.** Scripts use “you” for patient and “I” for doctor. Rewrite: “These pronouns describe app-to-doctor text; spoken scripts follow doctor-to-patient perspective.” Explicit subjects and subjectless failures needn’t be globally uniform.

**Should consider:**

1. Add accessible names matching visible labels, associated field errors, useful status announcements, persistent labels and example placeholders.
2. Define empty-state next steps; confirmation consequences and cancel actions; callback dates/time zones and countdown units.
3. Require fit checks at brief’s 360 px width, enlarged text and long substitutions; don’t truncate essential actions or medicine details. Support whole-string translation and plural variants.
4. **Sources:** broad plain-language summary is fair; attribution needs precision. Draft names neither Atlassian nor Polaris. [Atlassian](https://atlassian.design/foundations/content/designing-messages/error-messages) and [Polaris](https://github.com/Shopify/polaris-react-archive/blob/main/polaris.shopify.com/content/content/error-messages.mdx) require recovery guidance; [Apple](https://developer.apple.com/design/human-interface-guidelines/writing) discourages “we”; [legacy Material](https://m1.material.io/style/writing.html) allows hyphens/ranges and different period rules. Identify stricter choices as local policy.

**Spot check table:**

Current `messages.json`; pass/fail against draft as written.

| String | Pass/fail | Rule | Note |
|---|---|---|---|
| Number not registered with Truemeds. Already applied? We’ll contact you after approval. | Fail | 1 | Three sentences |
| You ended the call before the transfer. Next time, stay on the line until the Health Advisor joins. They’ll call the patient back. | Fail | 1 | D-83 retains this |
| This order has no medicines. Release it — our Ops team will check it. | Fail | 5, 18 | Repeats Release; dash |
| On call… | Fail | 7 | Status exception needed |
| New code sent. | Fail | 12 | Toast period |
| "I’m writing your prescription now. Our Health Advisor will call you shortly." | Fail | 17 | Straight surrounding quotes |
| Your availability ended. Set it again to request cases. | Fail | 5 | Repeats Set availability |
| You’re offline. Reconnect to request a case. | Pass | 5 | Explains blocked action |
| Couldn’t confirm. Nothing was lost. | Pass | 2, 5–6 | Names failure; reassurance |
| Your prescription is saved. We’ll confirm it once the record arrives. | Pass | 1–2 | Draft misses D-83 contradiction |

**Automation:**

- **Reliable:** R4 punctuation; R17–18 characters; typed terminal-punctuation checks for R7/11/12/20.
- **Partial:** R19 plural fixtures; grammar and meaning require review.
- **Unmarked candidates:** R1 sentence-count warnings, R10 word-count warnings, R14 acronym allowlist, placeholder integrity.
- R5 needs rendered controls; R9/21 need state/route review. Grammar regex cannot prove clarity or truth.
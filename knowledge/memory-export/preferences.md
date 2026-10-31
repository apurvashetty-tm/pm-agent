<!-- memory path: /preferences.md · last updated in memory: 2026-10-28 -->
---
name: preferences
description: How Apurva wants Claude to work — output style, PRD conventions, working cadence.
sources: [cowork]
aliases: []
---
- [stated] For PRDs: write PRODUCT-focused docs, not technical specs. State the what/why and the non-negotiable constraints/guarantees; leave the "how" (schemas, queries, integration plumbing) to Engineering as Open Questions / Dependencies. Avoid engineering heavy-lifting in the doc body.
- [stated] Working cadence on docs: present → debate → agree → then edit. Brainstorm first; do NOT start drafting until explicitly told to.
- [stated] Same for prototypes: never build anything into a prototype before she has vetted and finalized the screens and flows — brainstorm, agree, get approval, then build.
- [stated] Run a simple self-audit on screen mockups (duplicates, thumb reach, layout quality) before showing them to her; review screens one by one with their functions.
- [stated] Markdown is the source of truth; never sync to Confluence/Atlassian unless explicitly told "sync." Concise, external-reader prose.
- [stated] When reviewing inline comments (Confluence etc.), always quote the full sentence the highlighted word sits in — plus an adjacent line where it helps — with the anchored word in bold, before giving the read. Apurva often reviews on mobile without the document open and needs that context inline.
- [stated] For GTM/rollout plans: keep it lean — phase name, one-line description, time interval only. No explanatory/brainstorming prose; that belongs earlier in the debate, not in the plan itself.
- [stated] When leaving review comments on a draft: wait until all comments are in, then apply every change in one pass — don't edit after each comment.
- [stated] Use Truemeds' own funnel terminology consistently (e.g. "attempted" and "connected", including for agent steps) — don't paraphrase into other wording.
- [stated] For reviewing many PRD changes: prefer a full-document review copy with new/changed parts clearly marked over a list of piecemeal edits.
- [stated] After Apurva applies suggested doc edits herself (e.g. in Confluence), any suggestion she left out was omitted on purpose — treat it as rejected and don't re-flag it; the version she published is the base.
- [stated] For pm-agent Git publishing: use the original direct Git commit/push workflow (HTTPS with a repo-local credential helper, run via device_bash in the attached local folder), not connector file recreation or Computer Use Terminal; keep it working across threads. Never read or display credentials.
- [stated] pm-agent git: `main` holds only approved work — nothing goes to `main` until someone approves it; every project commits to its own branch (strictly one project, one branch); never mix two projects in one commit. Swapnil's projects keep his own branches/PR flow — don't touch them.
- [stated] On product/UX critiques: don't just agree with her — vet each point, debate it, and act as the UI/UX expert; keep things as they are if that's the better call, and correct her when she's wrong.
- [stated] Rendered media (concepts, mockups, review screenshots) are important — always save them in a folder inside the project folder, not just in chat.
- [stated] When she asks to be guided through something (e.g. approving/merging a PR on GitHub), give simple step-by-step instructions for her to do it herself — don't do it for her. She was new to GitHub PR approve/merge.
- [stated] When she relays Codex (or other AI reviewer) feedback: adopt only genuinely valid points — the reviewer lacks context; ignore out-of-scope suggestions or file them in the right place, and flag doubts rather than accepting everything.
- [stated] Standard way of working for ALL work (PRDs, docs, prototypes, screens, analyses): define "done" before doing the work — write the standards and a pass/fail checklist first, get it agreed, then build and review against that checklist (not taste); record decisions before building; check shared foundations first; once the checklist passes and Apurva approves, the work is frozen — anything new is either a bug (fix only where it occurs) or a next-version idea (logged, not applied). Never let new ideas reopen finished work.
- [stated] The rules-first standard must not kill creativity: it is not all-or-nothing ("not 0 or 1") — balance freedom and rules, and be clear about when to allow freedom and when to define and enforce rules.
- [stated] When Claude writes or changes an md file for her review, open it in the side panel (send/render it) — don't just name the file path.
- [stated] Use tm-chotu (Truemeds knowledge package in pm-agent `knowledge/context/tm-chotu/`) extensively whenever there are open questions or to understand how things at Truemeds work now or historically.
- [stated] Changes agreed mid-discussion but not acted on immediately should go on a to-do/backlog list rather than being lost in the chat.
- [stated] Jira tickets created on the Portals and Cx - Engineering board (PPE): assign directly to Kundan Falodia.

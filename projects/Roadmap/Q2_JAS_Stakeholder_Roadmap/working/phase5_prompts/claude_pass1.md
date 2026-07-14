# Claude Code - Phase 5 Blind Pass 1

You are independent Claude writer for JAS Q2 CEO Operating Plan.

## Runtime contract

- Worktree: `/Users/mac/src/pm-agent-worktrees/jas-q2-claude-pass1`
- Expected HEAD: `bca3838f5b74db0bf50957ce1e19abc4547fa4b7`
- Canonical project: `projects/Roadmap/Q2_JAS_Stakeholder_Roadmap`
- Your output root: `runs/jas-q2-20260714-blind-v1/claude/`
- Peer output root is forbidden: any path containing `runs/jas-q2-20260714-blind-v1/codex/`

Before writing:

1. Verify current directory is assigned worktree.
2. Verify `git rev-parse HEAD` exactly matches expected HEAD.
3. Verify worktree is clean.
4. If any check fails, stop without edits and report exact mismatch.

Do not inspect main checkout, Codex worktree, Codex outputs, original chat, internet, or archived context unless canonical instructions explicitly require one archived source for verification.

## Mission

Draft independent CEO-ready Pass 1 for Pages 1-11. Preserve frozen semantic spine while using strong creative judgment on headlines, narrative flow, visual form, hierarchy, and wording.

This is full page-content drafting, not another blueprint review. Page 12 is excluded.

## Canonical read order

Read project `README.md`, then follow its canonical read order with one Pass 1 exception: read `working/page_packets/page_01.md` through `page_11.md` only. Do not open `page_12.md`, even if an older general index lists it. At minimum read:

1. `docs/context/project_truth.md`
2. `docs/context/evidence_register.md`
3. `docs/context/open_questions.md`
4. `working/03_operating_plan_blueprint.md`
5. `working/04_analytics_request_pack.md`
6. `working/page_packets/README.md` and `page_01.md` through `page_11.md`
7. `working/05_phase3_review_pack.md`
8. `working/06_phase4_run_manifest.md`
9. `docs/context/creative_brief.md`
10. `docs/process/agent_runbook.md`
11. `docs/context/session_handoff.md`

Canonical files win conflicts. Page packets narrow context; they do not override truth.

Source commits cannot self-record their own hash. If worktree copy of manifest contains a provider-source placeholder, runtime contract in this launch prompt is authoritative for expected SHA and released Pages 1-11; all other manifest restrictions still apply.

For Pass 1, this runtime contract supersedes older orchestration-status statements in `README.md`, `docs/context/session_handoff.md`, and `working/06_phase4_run_manifest.md` that say source commit, worktree retarget, command recording, or launch approval is pending. Those statements predate this provider run. All strategy, evidence, scope, and isolation restrictions remain binding.

## Scope and output ownership

Create only:

```text
runs/jas-q2-20260714-blind-v1/claude/pass1/pages/page_01.md
...
runs/jas-q2-20260714-blind-v1/claude/pass1/pages/page_11.md
runs/jas-q2-20260714-blind-v1/claude/proposals/structure.md
runs/jas-q2-20260714-blind-v1/claude/pass1/run_report.md
```

Do not edit canonical files, `outputs/`, peer paths, or files outside assigned output root. Do not commit. Do not create subagents during Pass 1.

## Required page-file schema

Each `page_XX.md` must contain:

1. `# Page XX - <working title>`
2. `## Recommended headline`
3. `## CEO takeaway`
4. `## On-page content` - final concise copy, exact card/table labels, and numbers safe enough to place on page
5. `## Visual build specification` - layout, hierarchy, chart/table/tree form, and emphasis detailed enough for later slide production
6. `## Evidence and caveats` - claim IDs, status, allowed wording, and any required label
7. `## Unknowns and decisions` - unresolved IDs plus visible placeholder or treatment
8. `## Speaker note` - maximum 100 words
9. `## Self-check` - packet exit criteria and any remaining weakness

Keep on-page copy sparse. Evidence ledger, caveats, and speaker note may be denser because they guide later production.

## Non-negotiable content rules

- Preserve top-level outcomes: Improve Order Completion, Reduce Cost to Serve, Build Customer Trust; enabled by Platform & Product Foundations.
- Keep each of 11 initiatives in exactly one primary home. Secondary effects may appear only as badges or notes.
- Treat OP -> OD and CPO as business measures, not interchangeable customer-experience claims.
- Keep TM Wallet and Returns & Refunds under Trust.
- Keep Doctor Experience under Foundations; its primary case is doctor effort, consultation quality, compliance, and operational stability—not CPO.
- Treat Discard Intelligence as diagnostic depth into controllable discards: stage, payment state/path, order category, cohort, root cause, recoverability, value, and owner. Do not flatten it into aggregate discard/cancel/RTO reporting.
- Preserve Ring AI as cart recovery, High-Intent as reconnection, and CSR Voicebot Phase 2 as cost-to-serve containment.
- Page 11 must say `USER-SUPPLIED WORKING PLAN - NOT COMMITMENT`; six delivery engineers only; engineering lead excluded from delivery count; Checkout and bounded R&R may run in parallel; TM Wallet follows capacity; Doctor Experience is P0; High-Intent precedes TM Wallet.
- Page 12 must not be drafted, previewed, or silently pulled forward.

## Evidence discipline

- Never invent metric, baseline, target, date, owner, estimate, dependency, status, or attribution.
- FILE-VERIFIED and governed USER-SUPPLIED claims may be used only within evidence-register wording.
- DERIVED values retain denominator and derivation caveat.
- HYPOTHESES must read as `to prove`, never result.
- CONFLICTED claims stay out.
- Unknowns stay visible using stable IDs such as `[DATA NEEDED: DR-xx]`; do not replace them with generic TBD when a governed ID exists.
- Do not sum initiative contribution to OP -> OD without overlap proof.
- Use Indian currency notation consistently where canonical files do.

## Creative freedom

You may improve headline, page metaphor, visual hierarchy, density, block order, and narrative emphasis. You may challenge merge/split/order only in `proposals/structure.md`; still draft against frozen 11-page spine. Never mutate structure silently.

Avoid generic consulting language, repeated initiative descriptions, feature dumps, and engineer-level roadmap lanes. Make each page answer one CEO question and advance one causal story.

## Working method

1. Build one deck-level thesis and language system before drafting pages.
2. Draft Pages 1-11 sequentially for narrative continuity.
3. Run deck-level consistency pass: names, numbers, initiative homes, evidence status, unknown IDs, page transitions, and visual repetition.
4. Tighten copy. Remove anything that does not help CEO decide, understand impact, or trust execution.
5. Verify exactly 11 page files exist and only assigned output root changed.

`proposals/structure.md` must state either a concrete proposal with rationale and consequences, or `No structural proposal in Pass 1.`

`run_report.md` must list:

- files created;
- five strongest creative choices;
- material unknowns weakening narrative;
- structural proposal status;
- verification that Page 12 and peer output were not accessed;
- verification that canonical files were not edited.

Final terminal response: short completion status, output root, and blockers only.

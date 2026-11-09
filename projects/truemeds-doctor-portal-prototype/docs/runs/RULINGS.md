# Main-thread rulings

Every run reads this first. Rulings override briefs where they conflict. Newest at the top.

## 2026-11-09 (before the chain)
- **Rails run:** `scripts/run-chain.sh`, `docs/runs/QUEUE.md`, `STATUS.md`, `RULINGS.md` already exist (written by the main thread) and the chain is running you. **Do not edit `scripts/run-chain.sh`** (it is running). In rails §4 only check it: read it, run its dry run with `--queue docs/runs/QUEUE-dry.md` **only if no other chain is running** — it is, so skip the dry run and say so. If you find a bug, write the fix to `scripts/run-chain.next.sh` and note it in your REPORT; the main thread swaps it in. Skip rails §6's "Rails ready" print.
- **Product questions in the kit (o04, o05, o07, o08, o10, o11, o17, o18, o25, o26):** not decided yet; leave them OPEN. Don't ask.
- **Reviews:** one Codex review per run, correctness against the spec only, style skipped; one fix pass; a second review only for blockers (D-100).
- **Small things you can't fix in one try:** list them in the report and move on; don't loop.

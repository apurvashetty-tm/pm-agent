# Runs (D-100)
- `QUEUE.md` — what runs next (main thread edits; the runner ticks lines).
- `STATUS.md` — one DONE / STOPPED line per run.
- `RULINGS.md` — main-thread rulings every run reads first.
- `logs/` — one log per run (local only, not committed).
- To pause after the current run: create a file named `HOLD` here. Delete it and start `scripts/run-chain.sh` again to continue.

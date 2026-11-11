#!/bin/bash
# The long regression suites, one after another (run A, run B, A0 happy path, build-fast own tests). From the project folder.
T=docs/renders/2026-11-11-r2-build/tools/run.sh
bash $T codex-run-A node tests/codex/run-A/all.mjs | tail -3
bash $T codex-run-B node tests/codex/run-B/all.mjs | tail -3
[ -f tests/codex/run-A0/all.mjs ] && bash $T codex-run-A0 node tests/codex/run-A0/all.mjs | tail -3
bash $T build-fast-a1 node tests/build-fast-a1.mjs | tail -3
bash $T build-fast-a2 node tests/build-fast-a2.mjs | tail -3
bash $T build-fast-b node tests/build-fast-b.mjs | tail -3

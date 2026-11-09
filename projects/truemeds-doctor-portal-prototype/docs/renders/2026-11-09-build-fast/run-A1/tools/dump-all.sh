#!/bin/bash
# Build aid: dump the visible DOM of the approved case / prescribe reference states (run A1). Run from the project folder.
D=docs/renders/2026-11-09-build-fast/run-A1/tools/ref; mkdir -p "$D"
for s in "$@"; do
  node docs/renders/2026-11-09-build-fast/run-A1/tools/dump-ref.mjs "projects/truemeds-doctor-portal-prototype/ui-screens/case/case.html?s=$s&start=case&capture=1" "body" > "$D/$s.html"
done
wc -c "$D"/* | tail -3

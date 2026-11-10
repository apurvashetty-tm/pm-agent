#!/bin/bash
# d105 pictures. From the project folder:  bash docs/renders/2026-11-10-d105/tools/render.sh proof|new
#   proof: keep the committed pictures as before/, render the committed (old) source → method-proof/, compare
#   new:   render the edited source → new/, compare with before/, copy into ui-screens/returning-unlock/
set -e
export CHROMIUM="${CHROMIUM:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
D=docs/renders/2026-11-10-d105
U=ui-screens/returning-unlock
case "$1" in
  proof)
    mkdir -p "$D/before" "$D/method-proof"
    git show HEAD:projects/truemeds-doctor-portal-prototype/$U/returning-unlock.html > "$U/_d105-old.html"
    for f in "$U"/unlock_*_w3[69]0.png; do git show "HEAD:projects/truemeds-doctor-portal-prototype/$f" > "$D/before/$(basename "$f")"; done
    python3 "$D/tools/capture-unlock.py" "$U/_d105-old.html" "$D/method-proof"
    rm -f "$U/_d105-old.html"
    node "$D/tools/diff.mjs" "$D/before" "$D/method-proof"
    ;;
  new)
    mkdir -p "$D/new"
    python3 "$D/tools/capture-unlock.py" "$U/returning-unlock.html" "$D/new"
    node "$D/tools/diff.mjs" "$D/before" "$D/new"
    cp "$D"/new/unlock_*.png "$U/"
    ;;
  *) echo "usage: render.sh proof|new"; exit 2;;
esac

#!/bin/sh
# Copies the calling-flow page into app/ for the preview site, at /calling-flow/ (d104 run, Apurva 2026-11-10).
# The page is unchanged: its relative paths resolve on the site as they do in the project folder.
#   app/calling-flow/          <- calling-flow/ (index.html, flow.css, flow.js, data.js; not the coverage check)
#   app/ui-screens/feedback/   <- ui-screens/feedback/messages.js   (page loads ../ui-screens/feedback/messages.js)
#   app/ui-screens/case/       <- ui-screens/case/*_w390.png        (page loads ../ui-screens/case/<id>_w390.png)
#   app/favicon.ico            <- app/icons/icon-192.png            (the page names no icon; avoids the browser's 404)
#   design-system CSS and fonts: the page loads ../../../design-system/truemeds.css, which on the site resolves to
#   /design-system/truemeds.css — already copied by copy-shared.sh (run that first).
# Copies are git-ignored (see .gitignore), never committed. Run from anywhere:
#   sh projects/truemeds-doctor-portal-prototype/scripts/copy-calling-flow.sh
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
PROJECT=$(cd "$HERE/.." && pwd)
APP="$PROJECT/app"

if [ ! -f "$APP/design-system/truemeds.css" ]; then
  echo "copy-calling-flow: run copy-shared.sh first (app/design-system/truemeds.css missing)" >&2
  exit 1
fi

rm -rf "$APP/calling-flow" "$APP/ui-screens" "$APP/favicon.ico"
mkdir -p "$APP/calling-flow" "$APP/ui-screens/feedback" "$APP/ui-screens/case"
for f in index.html flow.css flow.js data.js; do cp "$PROJECT/calling-flow/$f" "$APP/calling-flow/"; done
cp "$PROJECT/ui-screens/feedback/messages.js" "$APP/ui-screens/feedback/"
for p in "$PROJECT"/ui-screens/case/*_w390.png; do
  [ -f "$p" ] && cp "$p" "$APP/ui-screens/case/"
done
# The page (like the kit viewer) names no icon, so browsers ask for /favicon.ico: serve the app's own icon there (no 404).
cp "$APP/icons/icon-192.png" "$APP/favicon.ico"

echo "copy-calling-flow: calling-flow page, messages.js and case pictures copied into app/"

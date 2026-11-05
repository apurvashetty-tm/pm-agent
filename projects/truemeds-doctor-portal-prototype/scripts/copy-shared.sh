#!/bin/sh
# Copies the shared files into app/ so every path the app uses resolves inside app/ (plan v3 §4).
# Same script locally and on Netlify. Copies are git-ignored (see .gitignore), never committed.
#   app/design-system/   <- design-system/ at the repo root (minus build/)
#   app/brand/           <- brand/truemeds-for-doctors.svg (the approved lockup, unchanged)
#   app/feedback/        <- ui-screens/feedback/messages.js (copy registry, generated from messages.json)
#   app/pictures/        <- approved 390 / 360 pictures from ui-screens/ (only the state pictures, no contact sheets)
# Run from anywhere:  sh projects/truemeds-doctor-portal-prototype/scripts/copy-shared.sh
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
PROJECT=$(cd "$HERE/.." && pwd)
REPO=$(cd "$PROJECT/../.." && pwd)
APP="$PROJECT/app"

if [ ! -d "$REPO/design-system" ]; then
  echo "copy-shared: design-system/ not found at $REPO" >&2
  exit 1
fi

rm -rf "$APP/design-system" "$APP/brand" "$APP/feedback" "$APP/pictures"
mkdir -p "$APP/design-system" "$APP/brand" "$APP/feedback" "$APP/pictures"

# design-system (build/ is the design team's output folder and is not served)
(cd "$REPO/design-system" && tar --exclude='./build' -cf - .) | (cd "$APP/design-system" && tar -xf -)
cp "$PROJECT/brand/truemeds-for-doctors.svg" "$APP/brand/"
cp "$PROJECT/ui-screens/feedback/messages.js" "$APP/feedback/"

for f in sign-in otp faster-signin-offer returning-unlock home prescribe case; do
  mkdir -p "$APP/pictures/$f"
  for p in "$PROJECT"/ui-screens/$f/*_w390.png "$PROJECT"/ui-screens/$f/*_w360.png; do
    [ -f "$p" ] && cp "$p" "$APP/pictures/$f/"
  done
done

echo "copy-shared: design-system, brand, feedback and pictures copied into app/"

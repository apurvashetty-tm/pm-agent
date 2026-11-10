# d104 run: the Python checks read CHROMIUM=<path>; Playwright's own browser isn't installed on this Mac. This sets CHROMIUM to
# the installed Google Chrome and runs the given script with its args.
# Usage: python3 docs/renders/2026-11-10-d104/tools/with_chrome.py docs/layout_check.py --app
import os
import runpy
import sys

MAC_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if not os.environ.get("CHROMIUM") and os.path.exists(MAC_CHROME):
    os.environ["CHROMIUM"] = MAC_CHROME
target = os.path.abspath(sys.argv[1])
sys.argv = [target] + sys.argv[2:]
sys.path.insert(0, os.path.dirname(target))
runpy.run_path(target, run_name="__main__")

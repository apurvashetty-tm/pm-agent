"""Runs ui-screens/feedback/check-locked-specs.py with the installed Chrome (the Python Playwright browser download is
missing on this machine). Usage, from the project folder: python3 docs/renders/2026-11-11-r1-rules/tools/run_locked_specs.py"""
import os, runpy, sys
os.environ.setdefault('CHROMIUM', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
sys.argv = ['check-locked-specs.py'] + sys.argv[1:]
runpy.run_path('ui-screens/feedback/check-locked-specs.py', run_name='__main__')

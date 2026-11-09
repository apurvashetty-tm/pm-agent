#!/usr/bin/env python3
"""Token linter (D-100): no raw design values in component or screen CSS.

Usage:  python3 design-system/scripts/check_tokens.py [files...]
With no files it scans design-system/src/components.css and projects/*/app/screens/*.css.
Runs stylelint (design-system/stylelint.config.mjs) and drops findings that are
  - on a line carrying  /* raw-ok: <non-empty reason> */  (same line only), or
  - inside a legacy .tm-otp block after a [DEPRECATED] comment, or
  - inside a mock Rx paper block (.mock-rx*, .rx-paper*, .mock-prescription*).
Prints file:line: property: value for each finding.
Exit 0 = clean, 1 = findings, 3 = linter not installed (run: npm install --prefix design-system/tools).
"""
import glob
import json
import os
import re
import subprocess
import sys

DS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(DS)
TOOLS = os.path.join(DS, "tools")
STYLELINT = os.path.join(TOOLS, "node_modules", "stylelint", "bin", "stylelint.mjs")
CONFIG = os.path.join(DS, "stylelint.config.mjs")

RAW_OK = re.compile(r"/\*\s*raw-ok:\s*[^*\s][\s\S]*?\*/")
RX_SELECTOR = re.compile(r"\.(?:mock-rx|rx-paper|mock-prescription)[\w-]*")
OTP_SELECTOR = re.compile(r"\.tm-otp(?:\b|[-_])")
MESSAGE = re.compile(r'Raw value "(.*)" in "(.*?)"')


def default_files():
    files = [os.path.join(DS, "src", "components.css")]
    files += sorted(glob.glob(os.path.join(ROOT, "projects", "*", "app", "screens", "*.css")))
    return [f for f in files if os.path.isfile(f)]


def exempt_lines(text):
    """1-based line numbers whose findings are dropped (raw-ok lines and exempt blocks)."""
    lines = text.split("\n")
    exempt, deprecated, i = set(), False, 0
    while i < len(lines):
        line = lines[i]
        if RAW_OK.search(line):
            exempt.add(i + 1)
        if "[DEPRECATED]" in line:
            deprecated = True
        if (deprecated and OTP_SELECTOR.search(line)) or RX_SELECTOR.search(line):
            depth = line.count("{") - line.count("}")
            exempt.add(i + 1)
            # selector lists may span lines before the opening brace
            while depth <= 0 and "{" not in line and i + 1 < len(lines) and not line.rstrip().endswith("}"):
                i += 1
                line = lines[i]
                exempt.add(i + 1)
                depth = line.count("{") - line.count("}")
            while depth > 0 and i + 1 < len(lines):
                i += 1
                exempt.add(i + 1)
                depth += lines[i].count("{") - lines[i].count("}")
        i += 1
    return exempt


def main(argv):
    files = [os.path.abspath(f) for f in argv] or default_files()
    files = [f for f in files if f.endswith(".css")]
    if not files:
        return 0
    if not os.path.isfile(STYLELINT):
        print("check_tokens: linter not installed — run: npm install --prefix design-system/tools", file=sys.stderr)
        return 3
    proc = subprocess.run(
        ["node", STYLELINT, "--config", CONFIG, "--config-basedir", TOOLS,
         "--formatter", "json", "--allow-empty-input", "--no-cache", *files],
        capture_output=True, text=True, cwd=TOOLS,
    )
    raw = proc.stdout.strip() or proc.stderr.strip()
    try:
        results = json.loads(raw[raw.index("["):])
    except (ValueError, json.JSONDecodeError):
        print("check_tokens: stylelint failed:\n" + proc.stdout + proc.stderr, file=sys.stderr)
        return 2
    findings = []
    for result in results:
        path = result["source"]
        try:
            with open(path, encoding="utf-8") as fh:
                skip = exempt_lines(fh.read())
        except OSError:
            skip = set()
        rel = os.path.relpath(path, ROOT)
        for w in result.get("warnings", []):
            if w.get("rule") != "scale-unlimited/declaration-strict-value":
                findings.append((rel, w.get("line") or 0, f"{rel}:{w.get('line')}: {w.get('text')}"))
                continue
            if w["line"] in skip:
                continue
            m = MESSAGE.search(w["text"])
            what = f"{m.group(2)}: {m.group(1)}" if m else w["text"]
            findings.append((rel, w["line"], f"{rel}:{w['line']}: {what}"))
    findings.sort(key=lambda f: (f[0], f[1]))
    for f in findings:
        print(f[2])
    if findings:
        print(f"check_tokens: {len(findings)} raw value(s). Use a --tm-* token, or add /* raw-ok: <reason> */ on the line.",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

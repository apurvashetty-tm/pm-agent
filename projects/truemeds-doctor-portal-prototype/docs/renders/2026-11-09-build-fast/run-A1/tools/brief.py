"""Build aid: prints the short form of dumped reference states (medicine rows and notes collapsed). Not a test.
python3 brief.py <state> [state ...]"""
import re, sys, os
D = os.path.join(os.path.dirname(__file__), "ref")
for st in sys.argv[1:]:
    s = open(os.path.join(D, st + ".html")).read()
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r'(<div id="medicines-list">).*?(</div></div>\s*</div>)', r"\1[rows]\2", s, count=1, flags=re.S)
    s = re.sub(r'(<div id="notes-section">).*?(</textarea></div>\s*</div>\s*</div>)', r"\1[notes]</div>", s, count=1, flags=re.S)
    s = re.sub(r"\n\s*\n", "\n", s)
    s = re.sub(r"\n\s+", "\n", s)
    i = s.find('<div id="mobile-column">')
    print("=== " + st)
    print(s[i:i + 7000])

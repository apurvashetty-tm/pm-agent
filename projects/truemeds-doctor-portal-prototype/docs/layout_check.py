#!/usr/bin/env python3
"""Layout regression check for the Truemeds Doctor prototype (phone frame rule, design-system/RULES.md §7).
Run from anywhere:  python3 docs/layout_check.py            (needs: pip install playwright; a Chromium)
Fails (exit 1) if desktop is not a 9:16 phone frame, wheel scrolling is lost, or sheets / the Prescribe screen / Rx viewer escape the frame.
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
URL = "file://" + str(ROOT / "index.html")
EXE = os.environ.get("CHROMIUM", "/opt/pw-browsers/chromium")   # set CHROMIUM=... on your machine; omit to use Playwright's own
fails = []
def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))
    if not ok: fails.append(name)

def frame(pg):
    return pg.evaluate("(()=>{const q=document.getElementById('mobile-column').getBoundingClientRect();return {l:q.left,t:q.top,w:q.width,h:q.height,r:q.right,b:q.bottom}})()")

with sync_playwright() as p:
    kw = {"executable_path": EXE} if os.path.exists(EXE) else {}
    b = p.chromium.launch(**kw)
    for (w, h) in [(1280, 800), (1440, 900), (1024, 768), (390, 844)]:
        tag = f"{w}x{h}"
        pg = b.new_page(viewport={"width": w, "height": h}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(400)
        f = frame(pg); desktop = w >= 768
        if desktop:
            check(f"{tag} frame is 9:16", abs(f["w"] / f["h"] - 9 / 16) < 0.01, f"{f['w']:.0f}x{f['h']:.0f}")
            check(f"{tag} frame centred", abs((f["l"] + f["r"]) / 2 - w / 2) < 2)
            check(f"{tag} frame fits viewport height", f["b"] <= h or h < 700)
            pg.mouse.move((f["l"] + f["r"]) / 2, (f["t"] + f["b"]) / 2); pg.mouse.wheel(0, 400); pg.wait_for_timeout(400)
            inner = pg.evaluate("document.getElementById('main-scroll').scrollTop")
            check(f"{tag} wheel over frame scrolls its content", inner > 100, f"scrollTop={inner}")
            check(f"{tag} compact strip appears when scrolled", pg.evaluate("document.getElementById('compact-strip').classList.contains('visible')"))
            pg.evaluate("document.getElementById('main-scroll').scrollTop=0")
        else:
            pg.mouse.move(w / 2, h / 2); pg.mouse.wheel(0, 400); pg.wait_for_timeout(400)
            check(f"{tag} mobile: window scrolls", pg.evaluate("scrollY") > 100)
            pg.evaluate("scrollTo(0,0)")
        ref = f if desktop else {"l": 0, "r": w, "t": 0, "b": h}
        # Prescribe screen (full-screen view): fills the frame/screen, scrolls inside, Prescribe reachable at the end
        pg.locator("#medicines-list > *").first.scroll_into_view_if_needed(); pg.locator("#medicines-list > *").first.click(); pg.wait_for_timeout(400)
        ps = pg.evaluate("(()=>{const q=document.getElementById('prescribe-screen').getBoundingClientRect();return {l:q.left,r:q.right,t:q.top,b:q.bottom}})()")
        check(f"{tag} Prescribe screen fills the {'frame' if desktop else 'screen'}", all(abs(ps[k] - ref[k]) <= 2 for k in "lrtb"), str({k: round(ps[k]) for k in ps}))
        if desktop:
            pg.mouse.move((f["l"] + f["r"]) / 2, (f["t"] + f["b"]) / 2); pg.mouse.wheel(0, 400); pg.wait_for_timeout(400)
            check(f"{tag} wheel scrolls the Prescribe screen", pg.evaluate("document.getElementById('ps-body').scrollTop") > 100)
        pg.evaluate("document.getElementById('ps-body').scrollTop=99999"); pg.wait_for_timeout(200)
        bb = pg.locator("#ps-prescribe").bounding_box()
        check(f"{tag} Prescribe button reachable", bool(bb) and bb["y"] >= ref["t"] and bb["y"] + bb["height"] <= ref["b"])
        pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
        # bottom sheets still anchor to the frame/screen bottom
        pg.evaluate("openSheet('sheet-profile')"); pg.wait_for_timeout(500)
        s = pg.evaluate("(()=>{const q=document.querySelector('.bottom-sheet.open').getBoundingClientRect();return {l:q.left,r:q.right,b:q.bottom,t:q.top}})()")
        if desktop:
            check(f"{tag} sheet sits at the FRAME bottom", abs(f["b"] - s["b"]) <= 2 and s["l"] >= f["l"] - 1 and s["r"] <= f["r"] + 1, f"gap={f['b']-s['b']:.1f}")
        else:
            check(f"{tag} sheet sits at the SCREEN bottom", abs(h - s["b"]) <= 2)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
        pg.evaluate("openRxOverlay()"); pg.wait_for_timeout(300)
        rx = pg.evaluate("(()=>{const q=document.getElementById('rx-overlay').getBoundingClientRect();return {l:q.left,r:q.right,t:q.top,b:q.bottom}})()")
        check(f"{tag} Rx viewer fills the {'frame' if desktop else 'screen'}", all(abs(rx[k] - ref[k]) <= 2 for k in "lrtb"))
        pg.evaluate("closeRxOverlay()")
        check(f"{tag} no page errors", not errs, "; ".join(errs))
        pg.close()
    b.close()
print("\nALL PASS" if not fails else f"\n{len(fails)} FAILED: {fails}")
sys.exit(1 if fails else 0)

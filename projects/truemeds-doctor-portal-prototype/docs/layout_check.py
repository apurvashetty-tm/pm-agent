#!/usr/bin/env python3
"""Layout regression check for the Truemeds Doctor prototype (phone frame rule, design-system/RULES.md §7).
Run from anywhere:  python3 docs/layout_check.py            (needs: pip install playwright; a Chromium)
Fails (exit 1) if desktop is not a 390 : 844 phone frame (app/, --app, D-97; the old frozen index.html keeps its 9:16 frame), wheel scrolling is lost, or sheets / the Prescribe screen / Rx viewer escape the frame.
"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
URL = "file://" + str(ROOT / "index.html") + "?start=case"   # order page; app screens are checked below via goApp()
EXE = os.environ.get("CHROMIUM", "/opt/pw-browsers/chromium")   # set CHROMIUM=... on your machine; omit to use Playwright's own
fails = []
def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))
    if not ok: fails.append(name)

def frame(pg):
    return pg.evaluate("(()=>{const q=document.getElementById('mobile-column').getBoundingClientRect();return {l:q.left,t:q.top,w:q.width,h:q.height,r:q.right,b:q.bottom}})()")


def run_app():
    """Layout check for the step 0 shell in app/ (plan v3 B15, checklist 2.3, 5.3, 5.11). Run the app on a local server first:
    sh projects/truemeds-doctor-portal-prototype/scripts/copy-shared.sh && python3 -m http.server 8765 --directory app
    Then: python3 docs/layout_check.py --app   (APP_URL overrides http://localhost:8765/)"""
    base = os.environ.get("APP_URL", "http://localhost:8765/")
    fails_app = []
    def ok(name, cond, detail=""):
        print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail else ""))
        if not cond: fails_app.append(name)
    with sync_playwright() as p:
        kw = {"executable_path": EXE} if os.path.exists(EXE) else {}
        b = p.chromium.launch(**kw)
        for (w, h) in [(1920, 1080), (1280, 800), (1440, 900), (1024, 768), (430, 932), (390, 844), (360, 640)]:
            tag = f"{w}x{h}"
            pg = b.new_page(viewport={"width": w, "height": h}); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(base + "?s=t01-ready"); pg.wait_for_timeout(400)
            f = pg.evaluate("(()=>{const q=document.getElementById('frame').getBoundingClientRect();return {l:q.left,t:q.top,w:q.width,h:q.height,r:q.right,b:q.bottom}})()")
            panel = pg.evaluate("(()=>{const p=document.getElementById('review-panel').getBoundingClientRect();const cs=getComputedStyle(document.getElementById('review-panel'));return {ov:cs.overflowY, inside: !!document.getElementById('frame').contains(document.getElementById('review-panel')), l:p.left, r:p.right, t:p.top}})()")
            if w >= 768:
                ok(f"{tag} frame is 390 : 844, exactly 390 x 844 when the window allows (D-97)", abs(f["w"] / f["h"] - 390 / 844) < 0.005 and (h - 48 < 844 or (abs(f["w"] - 390) < 1.5 and abs(f["h"] - 844) < 1.5)), f"{f['w']:.1f}x{f['h']:.1f}")
                ok(f"{tag} frame centred", abs((f["l"] + f["r"]) / 2 - w / 2) < 2)
                ok(f"{tag} frame fits viewport height", f["b"] <= h)
                ok(f"{tag} panel top-aligned with the frame, one column on the right (RULES §7.5, D-97)", abs(panel["t"] - f["t"]) <= 1, f"panel top {panel['t']:.1f}, frame top {f['t']:.1f}")
                ok(f"{tag} panel beside the frame, not inside it, on screen", not panel["inside"] and (panel["l"] >= f["r"] - 1) and panel["r"] <= w, f"panel {panel['l']:.0f}-{panel['r']:.0f}, frame {f['l']:.0f}-{f['r']:.0f}")
            else:
                ok(f"{tag} phone: frame is the screen", abs(f["w"] - w) < 2 and abs(f["h"] - h) < 2, f"{f['w']:.0f}x{f['h']:.0f}")
            if w >= 768:
                ok(f"{tag} review panel is not a scroll container", panel["ov"] not in ("auto", "scroll"), panel["ov"])
            else:
                ok(f"{tag} phone drawer scrolls internally so every control is reachable", panel["ov"] in ("auto", "visible"), panel["ov"])
            ok(f"{tag} no sideways scroll", pg.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"))
            ok(f"{tag} screen fits the frame", pg.evaluate("(()=>{const i=document.querySelector('#screen > *').getBoundingClientRect();const q=document.getElementById('frame').getBoundingClientRect();return i.top>=q.top-1&&i.bottom<=q.bottom+1&&i.left>=q.left-1&&i.right<=q.right+1})()"))
            if w < 768:
                hd = pg.evaluate("(()=>{const hd=document.getElementById('drawer-handle');if(hd.hidden)return {shown:false};const r=hd.getBoundingClientRect();const hdr=document.getElementById('app-header').getBoundingClientRect();const n=document.getElementById('notice-host').getBoundingClientRect();return {shown:true,overlapHeader:r.top<hdr.bottom&&r.bottom>hdr.top&&r.right>hdr.left&&r.left<hdr.right,overlapNotice:!document.getElementById('notice-host').hidden&&r.top<n.bottom&&r.bottom>n.top}})()")
                ok(f"{tag} drawer handle never covers the header", not (hd["shown"] and hd["overlapHeader"]))
                ok(f"{tag} drawer handle never covers the notice band", not (hd["shown"] and hd.get("overlapNotice")))
            ok(f"{tag} no page errors", not errs, "; ".join(errs))
            pg.close()
            # Step 1 entry screens (built): fill the frame, no nested phone, no sideways scroll, main button on screen
            for sid, btn in [("sign-in_default", ".login-submit"), ("sign-in_keyboard-open", ".login-submit"), ("otp_default", "#b"), ("otp_locked", "#b"),
                             ("offer_fingerprint", "#turn-on"), ("offer_enable-failed", "#turn-on"), ("offer_unavailable", "#turn-on"), ("unlock_fingerprint", "#unlock-action"), ("unlock_unavailable", "#fallback")]:
                pg = b.new_page(viewport={"width": w, "height": h}); errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.goto(base + "?s=" + sid); pg.wait_for_timeout(400)
                g = pg.evaluate("""(sel)=>{const fe=document.getElementById('frame');const f=fe.getBoundingClientRect();const sc=document.querySelector('.signin-screen,.otp-screen,.offer-screen,.unlock-screen');if(!sc)return null;const r=sc.getBoundingClientRect();const bt=document.querySelector(sel).getBoundingClientRect();
                  return {fill:Math.abs(fe.clientWidth-r.width)<=1&&Math.abs(f.left+fe.clientLeft-r.left)<=1&&r.top<=f.top+fe.clientTop+1, side:document.documentElement.scrollWidth<=innerWidth+1, btn:bt.top>=f.top&&bt.bottom<=f.bottom}}""", btn)
                ok(f"{tag} {sid}: screen fills the frame, no sideways scroll, main button inside the frame", bool(g) and g["fill"] and g["side"] and g["btn"], str(g))
                ok(f"{tag} {sid}: no page errors", not errs, "; ".join(errs))
                pg.close()
        b.close()
    print("\nALL PASS" if not fails_app else f"\n{len(fails_app)} FAILED: {fails_app}")
    return 1 if fails_app else 0

if "--app" in sys.argv:
    sys.exit(run_app())

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
            check(f"{tag} frame is 9:16 (old frozen prototype: index.html / styles.css stay frozen, D-56; the 390 : 844 rule, D-97, is checked on app/ with --app)", abs(f["w"] / f["h"] - 9 / 16) < 0.01, f"{f['w']:.0f}x{f['h']:.0f}")
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
        # Prescribe screen (full-screen view): fills the frame/screen, scrolls inside, Prescribe reachable at the end
        ref = f if desktop else {"l": 0, "r": w, "t": 0, "b": h}
        # the compact strip must not shift the page: small wheel steps down and back up, no jump bigger than the step
        q = "document.getElementById('main-scroll').scrollTop" if desktop else "scrollY"
        pg.mouse.move((f["l"] + f["r"]) / 2 if desktop else w / 2, (f["t"] + f["b"]) / 2 if desktop else h / 2)
        ys = []
        for d in [20] * 20 + [-20] * 20:
            pg.mouse.wheel(0, d); pg.wait_for_timeout(50); ys.append(pg.evaluate(q))
        jump = max(abs(ys[i] - ys[i - 1]) for i in range(1, len(ys)))
        check(f"{tag} no scroll jump when the patient strip appears/hides", jump <= 25, f"max step {jump:.0f}px")
        pg.evaluate("document.getElementById('main-scroll').scrollTop=0" if desktop else "scrollTo(0,0)")
        # scrolling stops just after the last block (no large empty run-out below the Call / Confirm actions)
        pg.evaluate("document.getElementById('main-scroll').scrollTop=1e6" if desktop else "scrollTo(0,1e6)"); pg.wait_for_timeout(200)
        gap = pg.evaluate("(()=>{const a=document.getElementById('action-zone').getBoundingClientRect().bottom;const bar=document.getElementById('case-actionbar').getBoundingClientRect().top;const end=Math.min(bar, innerWidth>=768?document.getElementById('main-scroll').getBoundingClientRect().bottom:innerHeight);return end-a})()")
        check(f"{tag} scroll ends right after the last card, clear of the pinned bar", 0 <= gap <= 40, f"gap {gap:.0f}px")
        bar = pg.evaluate("(()=>{const q=document.getElementById('case-actionbar').getBoundingClientRect();return {t:q.top,b:q.bottom,l:q.left,r:q.right}})()")
        check(f"{tag} main action pinned to the {'frame' if desktop else 'screen'} bottom", abs(bar["b"] - ref["b"]) <= 2 and abs(bar["l"] - ref["l"]) <= 2 and abs(bar["r"] - ref["r"]) <= 2, str({k: round(v) for k, v in bar.items()}))
        pg.evaluate("document.getElementById('main-scroll').scrollTop=0" if desktop else "scrollTo(0,0)")
        pg.locator("#medicines-list > *").first.scroll_into_view_if_needed(); pg.locator("#medicines-list > *").first.click(); pg.wait_for_timeout(400)
        ps = pg.evaluate("(()=>{const q=document.getElementById('prescribe-screen').getBoundingClientRect();return {l:q.left,r:q.right,t:q.top,b:q.bottom}})()")
        check(f"{tag} Prescribe screen fills the {'frame' if desktop else 'screen'}", all(abs(ps[k] - ref[k]) <= 2 for k in "lrtb"), str({k: round(ps[k]) for k in ps}))
        if desktop:
            pg.mouse.move((f["l"] + f["r"]) / 2, (f["t"] + f["b"]) / 2); pg.mouse.wheel(0, 400); pg.wait_for_timeout(400)
            check(f"{tag} wheel scrolls the Prescribe screen", pg.evaluate("document.getElementById('ps-body').scrollTop") > 100)
        bb = pg.locator("#ps-prescribe").bounding_box()
        check(f"{tag} Prescribe pinned and visible without scrolling", bool(bb) and bb["y"] >= ref["t"] and bb["y"] + bb["height"] <= ref["b"] + 1)
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
        # after the 50s gate nothing scrolls by itself (D-28) and every call action is visible in the pinned bar
        q2 = "document.getElementById('main-scroll').scrollTop" if desktop else "scrollY"
        pg.evaluate("switchScenario('pilot_value_meds_ha')"); pg.wait_for_timeout(100)
        pg.evaluate("document.getElementById('call-initiate-btn').click()"); pg.wait_for_timeout(100)
        pg.evaluate("simCallConnected(); doFastForward()"); pg.wait_for_timeout(900)
        check(f"{tag} after the gate the page did not scroll by itself", pg.evaluate(q2) == 0, pg.evaluate(q2))
        vis = pg.evaluate("""(()=>{const lim=innerWidth>=768?document.getElementById('main-scroll').getBoundingClientRect().bottom+200:innerHeight;
          return ['main-cta-btn','schedule-callback-btn','skip-ha-btn'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.height>0&&r.top>=0&&r.bottom<=lim+1})})()""")
        check(f"{tag} after the gate all call actions are on screen without scrolling", all(vis), vis)
        hdr = pg.evaluate("document.getElementById('portal-header').getBoundingClientRect().top")
        moved = pg.evaluate("document.getElementById('mobile-column').scrollTop")
        check(f"{tag} after the gate the header stays in view", moved == 0 and abs(hdr - ref["t"]) <= 2, f"frame scrollTop={moved}, header top={hdr:.0f}")
        pg.evaluate("resetToDemo()")
        # app screens: sign in, OTP and unlock (approved ui-screens: blue top, white panel reaching the bottom, buttons
        # inline under the field so they sit above the keyboard) and Home (button pinned at the bottom). No sideways
        # scroll; the order page fully hidden (D-31, D-33 … D-37)
        for scr in ["signin", "otp", "unlock", "home"]:
            if scr == "otp": pg.evaluate("startOtp('9876543210', false)")
            else: pg.evaluate(f"goApp('{scr}')")
            pg.wait_for_timeout(200)
            box = pg.evaluate(f"""(()=>{{const s=document.getElementById(SCREEN_IDS['{scr}']);
              const el = s.querySelector('.app-actionbar') || s.querySelector('.auth-panel'); const a = el.getBoundingClientRect();
              const lim = innerWidth>=768 ? document.getElementById('mobile-column').getBoundingClientRect().bottom : innerHeight;
              return {{bar:a.bottom, lim, wide: document.documentElement.scrollWidth <= innerWidth + 1,
                       caseHidden: getComputedStyle(document.getElementById('main-scroll')).display === 'none' && getComputedStyle(document.getElementById('case-actionbar')).display === 'none'}}}})()""")
            what = "button pinned" if scr == "home" else "white panel reaches"
            ok = abs(box["bar"] - box["lim"]) <= 2 if scr == "home" else box["bar"] >= box["lim"] - 2   # taller content scrolls inside the screen
            check(f"{tag} {scr}: {what} the bottom of the {'frame' if desktop else 'screen'}", ok, box)
            check(f"{tag} {scr}: no sideways scroll, order page hidden", box["wide"] and box["caseHidden"])
        pg.evaluate("goApp('case')")
        check(f"{tag} no page errors", not errs, "; ".join(errs))
        pg.close()
    b.close()
print("\nALL PASS" if not fails else f"\n{len(fails)} FAILED: {fails}")
sys.exit(1 if fails else 0)

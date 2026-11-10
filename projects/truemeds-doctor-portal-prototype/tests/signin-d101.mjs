// D-101 sign-in follow-ups (o04, o10, o11, o25) — the smallest test per change. Run: cd tests && node signin-d101.mjs
// Also captures the new o04 error state at 360 and 390 (2×, fixed clock, capture mode — the compare harness's settings) into
// docs/renders/2026-11-09-signin-d101/ for Apurva's phone walkthrough.
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path"; import url from "url";

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const APP = path.join(PROJECT, "app");
const OUT = path.join(PROJECT, "docs/renders/2026-11-09-signin-d101");
const PORT = 8771, BASE = `http://localhost:${PORT}/`;
const results = [];
const check = (id, name, ok, detail = "") => { results.push(!!ok); console.log(`${ok ? "PASS" : "FAIL"} ${id} ${name}${detail && !ok ? "  [" + detail + "]" : ""}`); };
const read = (f) => fs.readFileSync(path.join(PROJECT, f), "utf8");
const COPY = JSON.parse(read("ui-screens/feedback/messages.json"));
const META = JSON.parse(read("ui-screens/feedback/metadata.json"));
const LONG = "That’s more than 10 digits. Check the number.";

// ---- unit ----
const auth = await import(path.join(APP, "core/auth.js"));
const links = await import(path.join(APP, "data/links.js"));
check("o04-unit", "over 10 digits (no +91 / 0 prefix) → signin.long at once; +91 / 0 cleaning unchanged",
  auth.cleanNumber("98765432101") === "98765432101" && auth.checkNumber("98765432101") === "signin.long" &&
  auth.checkNumber("98765432101", { submit: true }) === "signin.long" && auth.checkNumber(auth.cleanNumber("12345678901")) === "signin.long" &&
  auth.checkNumber(auth.cleanNumber("56789012345")) === "signin.long" && auth.checkNumber("1234567890") === "signin.prefix" &&
  auth.cleanNumber("+91 98765 43210") === "9876543210" && auth.cleanNumber("0 98765 43210") === "9876543210" &&
  auth.checkNumber("9876543210", { submit: true }) === null && COPY["signin.long"] === LONG && META["signin.long"]?.pattern === META["signin.short"].pattern);
check("o11-config", "Terms / Privacy URLs are one config value each (links.js), not typed in the OTP screen",
  links.TERMS_URL === "https://www.truemeds.in/legal/terms-and-conditions" && links.PRIVACY_URL === "https://www.truemeds.in/legal/privacy-policy" &&
  !/truemeds\.in\/legal/.test(read("app/screens/otp.js")));
check("o25-copy", "signin.signup is one entry with a {link} placeholder; the link text keeps its own key",
  COPY["signin.signup"] === "New to Truemeds? {link}" && COPY["signin.signupLink"] === "Sign up" && JSON.stringify(META["signin.signup"].placeholders) === '["link"]');

// ---- browser ----
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => {
  const p = path.join(APP, decodeURIComponent(new URL(q.url, BASE).pathname).replace(/\/$/, "/index.html"));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((r) => srv.listen(PORT, r));
const FLAGS = ["--font-render-hinting=none", "--disable-gpu", "--disable-lcd-text", "--force-color-profile=srgb",
  "--disable-font-subpixel-positioning", "--disable-partial-raster", "--disable-skia-runtime-opts", "--hide-scrollbars"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: FLAGS });
const errors = [];
async function page(qs, w = 390, scale = 1) {
  const p = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: scale });
  p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await p.clock.setFixedTime(new Date("2026-10-28T15:00:00"));
  await p.goto(BASE + qs); await p.waitForTimeout(350);
  return p;
}
const field = (p) => p.evaluate(() => ({
  n: document.getElementById("tm-login-mobile").value, helper: document.getElementById("tm-login-helper").textContent,
  role: document.getElementById("tm-login-helper").getAttribute("role"), err: document.querySelector(".tm-field").classList.contains("tm-field--error"),
  invalid: document.getElementById("tm-login-mobile").getAttribute("aria-invalid") }));

{ // o04: typed live, then back to 10 digits; the error sits where signin.short does
  const p = await page("");
  await p.type("#tm-login-mobile", "98765432101");
  const long = await field(p);
  await p.keyboard.press("Backspace"); const ten = await field(p);
  await p.fill("#tm-login-mobile", "+91 98765 43210"); const pasted = await field(p);
  await p.fill("#tm-login-mobile", "9876543"); await p.click(".login-submit"); const short = await field(p);
  check("o04", "11 typed digits → field error \"That’s more than 10 digits…\" (same helper slot and style as signin.short); clears at 10; +91 paste still cleans",
    long.n === "98765432101" && long.helper === LONG && long.role === "alert" && long.err && long.invalid === "true" &&
    ten.n === "9876543210" && !ten.err && pasted.n === "9876543210" && !pasted.err && short.err && short.role === "alert",
    JSON.stringify({ long, ten, pasted, short }));
  await p.close();
}
{ // o10: Change on OTP → number kept, edits normally (Backspace then a digit)
  const p = await page("");
  await p.type("#tm-login-mobile", "7012345692"); await p.click(".login-submit"); await p.waitForTimeout(1500);
  await p.click("a.lk"); await p.waitForTimeout(300);
  const kept = await p.inputValue("#tm-login-mobile");
  await p.focus("#tm-login-mobile"); await p.keyboard.press("End"); await p.keyboard.press("8");
  const typed = await field(p);
  await p.keyboard.press("Backspace"); await p.keyboard.press("Backspace"); await p.keyboard.press("1");
  const edited = await p.inputValue("#tm-login-mobile");
  check("o10", "back from OTP via Change: number kept; the first typed digit adds to it (here over 10 → o04 error), it does not replace it",
    kept === "7012345692" && typed.n === "70123456928" && typed.helper === LONG && edited === "7012345691", JSON.stringify({ kept, typed, edited }));
  await p.close();
}
{ // o11 + o25 on screen
  const p = await page("");
  const signup = await p.evaluate(() => { const d = document.getElementById("tm-signup-option"); const a = d.querySelector("a"); return { text: d.textContent, link: a.textContent, href: a.href, target: a.target }; });
  await p.type("#tm-login-mobile", "7012345694"); await p.click(".login-submit"); await p.waitForTimeout(1500);
  const legal = await p.evaluate(() => [...document.querySelectorAll("#consent a")].map((a) => ({ t: a.textContent, href: a.href, target: a.target, rel: a.rel })));
  check("o25", "sign-up line reads \"New to Truemeds? Sign up\", only \"Sign up\" is the link",
    signup.text === "New to Truemeds? Sign up" && signup.link === "Sign up" && signup.href === links.SIGN_UP_URL && signup.target === "_blank", JSON.stringify(signup));
  check("o11", "OTP Terms → D-101 terms URL, Privacy → D-101 privacy URL, new tab",
    legal.length === 2 && legal[0].href === links.TERMS_URL && legal[1].href === links.PRIVACY_URL && legal.every((l) => l.target === "_blank" && l.rel === "noopener"),
    JSON.stringify(legal));
  await p.close();
}
{ // capture the new o04 state (from the too-short picture's moment, typed on the drawn keyboard) at 360 and 390
  for (const w of [360, 390]) {
    const p = await page(`?capture=1&s=sign-in_too-short&w=${w}`, w, 2);
    await p.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important}" });
    for (const k of "109") await p.locator(".mock-kbd__key", { hasText: new RegExp(`^${k}$`) }).first().dispatchEvent("pointerdown");
    await p.evaluate(() => document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))));
    const f = await field(p);
    await p.screenshot({ path: path.join(OUT, `sign-in_too-long_w${w}.png`) });
    check(`capture-${w}`, `o04 state captured at ${w} (sign-in_too-long_w${w}.png)`, f.n === "98765432109" && f.helper === LONG, JSON.stringify(f));
    await p.close();
  }
}
check("errors", "0 page / console errors", errors.length === 0, errors.join(" | "));
await browser.close(); srv.close();
const pass = results.filter(Boolean).length;
console.log(`${pass}/${results.length} pass`);
process.exit(pass === results.length ? 0 : 1);

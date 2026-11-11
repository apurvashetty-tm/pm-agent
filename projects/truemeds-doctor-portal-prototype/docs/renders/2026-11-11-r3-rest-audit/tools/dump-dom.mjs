// Prints the built app's screen DOM (tags + classes, text trimmed) for a state in capture mode. Read-only helper.
//   node docs/renders/2026-11-11-r3-rest-audit/tools/dump-dom.mjs <state-id> [w] [h] [--js "<expr run before dump>"]
import url from "node:url"; import path from "node:path";
import { serve, open } from "./lib.mjs";
const [id, w = 390, h = 844] = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--js");
const js = process.argv.includes("--js") ? process.argv[process.argv.indexOf("--js") + 1] : null;
const { browser, base, close } = await serve();
const page = await open(browser, base, id, Number(w), Number(h));
if (js) { await page.evaluate(js); await page.waitForTimeout(200); }
console.log(await page.evaluate(() => {
  const out = [];
  const walk = (e, d) => {
    if (e.nodeType !== 1) return;
    const cs = getComputedStyle(e); if (cs.display === "none") return;
    const t = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").slice(0, 50);
    const r = e.getBoundingClientRect();
    out.push(`${"  ".repeat(d)}${e.tagName.toLowerCase()}${e.id ? "#" + e.id : ""}${typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).join(".") : ""} [${Math.round(r.top)}-${Math.round(r.bottom)} ${cs.position !== "static" ? cs.position : ""} fs${cs.fontSize}]${t ? " “" + t + "”" : ""}`);
    if (e.tagName.toLowerCase() === "svg") return;
    for (const k of e.children) walk(k, d + 1);
  };
  walk(document.querySelector("#screen") || document.body, 0);
  return out.join("\n");
}));
await close();

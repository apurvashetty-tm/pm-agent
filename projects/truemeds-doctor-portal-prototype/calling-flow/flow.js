// Calling flow page — renderer only. All content lives in data.js (window.FLOW).
(() => {
  const F = window.FLOW;
  const MSG = (window.TMFeedback && window.TMFeedback.messages) || {};
  const PIC = id => `../ui-screens/case/${id}_w390.png`;
  const SVGNS = "http://www.w3.org/2000/svg";
  const ui = { tab: "overview", aOn: false, filter: "all", sel: null, selEdge: null };

  // ---------- geometry ----------
  const G = {
    overview: { W: 232, H: 86, gap: 128, RH: 112, LH: 46, X0: 40, Y0: 70 },
    screens:  { W: 156, H: 338, gap: 176, RH: 430, LH: 96, X0: 40, Y0: 110 }
  };
  const visibleLanes = () => F.lanes.filter(l => !l.later || ui.aOn);
  function rowY(g, r) {
    // rows of hidden lanes take no space
    let y = g.Y0, rr = 0;
    for (let i = 0; i < r; i++) if (!F.lanes.some(l => l.later && !ui.aOn && i >= l.rows[0] && i <= l.rows[1])) rr++;
    y += rr * g.RH;
    for (const l of visibleLanes()) if (l.rows[0] <= r) y += g.LH;
    return y;
  }
  function box(g, id) {
    const s = F.states[id], [c, r] = s.pos, span = s.span || 1;
    const x = g.X0 + c * (g.W + g.gap), y = rowY(g, r);
    const w = g.W + (span - 1) * (g.W + g.gap);
    const h = (ui.tab === "screens" && (s.span || s.style === "join")) ? Math.min(g.H, 150) : g.H;
    return { x, y, w, h, mid: y + (ui.tab === "screens" ? Math.min(g.H, 150) / 2 : g.H / 2) };
  }
  const isVisible = id => { const s = F.states[id]; if (s.types === "A" && !s.hideWhenA) return ui.aOn; if (s.hideWhenA) return !ui.aOn; return true; };
  function inFilter(id) {
    const t = F.states[id].types;
    if (ui.filter === "all") return true;
    if (t.includes("S")) return true;
    return { cat4: "C", skipped: "K", pilot: "P" }[ui.filter] && t.includes({ cat4: "C", skipped: "K", pilot: "P" }[ui.filter]);
  }

  // ---------- svg helpers ----------
  const el = (n, a = {}, p) => { const e = document.createElementNS(SVGNS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  function wrap(text, n) {
    const out = [];
    for (const para of String(text || "").split("\n")) {
      let line = "";
      for (const w of para.split(" ")) {
        if ((line + " " + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + " " + w).trim();
      }
      if (line) out.push(line);
    }
    return out;
  }
  function textBlock(parent, x, y, lines, cls, lh) {
    const t = el("text", { x, y, class: cls }, parent);
    lines.forEach((l, i) => { const s = el("tspan", { x, dy: i ? lh : 0 }, t); s.textContent = l; });
    return t;
  }

  // ---------- draw ----------
  const svg = document.getElementById("canvas");
  let world;
  function draw() {
    const g = G[ui.tab];
    svg.innerHTML = "";
    const defs = el("defs", {}, svg);
    const m = el("marker", { id: "arr", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", class: "arrowhead" }, m);
    world = el("g", { id: "world" }, svg);

    const maxCol = 7, right = g.X0 + maxCol * (g.W + g.gap) + g.W;
    const lanesG = el("g", {}, world), edgesG = el("g", {}, world), nodesG = el("g", {}, world), titlesG = el("g", {}, world);
    let bottom = 0; const laneTitles = [];
    for (const l of visibleLanes()) {
      const y1 = rowY(g, l.rows[0]) - g.LH + 6, y2 = rowY(g, l.rows[1]) + g.H + 18;
      el("rect", { x: g.X0 - 24, y: y1, width: right - g.X0 + 48, height: y2 - y1, rx: 10, class: "lane" + (l.later ? " lane--later" : "") }, lanesG);
      const tg = el("g", {}, titlesG), tt = textBlock(tg, g.X0 - 10, y1 + 26, [l.title], "lane-title", 0);
      tg.insertBefore(el("rect", { x: g.X0 - 16, y: y1 + 8, width: 0, height: 26, rx: 6, class: "lane-title-bg" + (l.later ? " lane-title-bg--later" : "") }), tt);
      laneTitles.push(tg);
      bottom = Math.max(bottom, y2);
    }
    textBlock(lanesG, right, rowY(g, 0) - g.LH - 14, ["④ Endings — Request next case · Back to Home"], "endings-title", 0).setAttribute("text-anchor", "end");

    // edges
    const drawEdge = (from, to, label, kind, trunk) => {
      if (!isVisible(from) || !isVisible(to)) return;
      const a = box(g, from), b = box(g, to), dim = !(inFilter(from) && inFilter(to));
      const sa = F.states[from], sb = F.states[to];
      let pts, lx, ly, anchor = "start";
      const lines = label.split("\n"), lh = 13;
      if (trunk) {
        const vx = b.x - g.gap / 2 - 6, sy = a.y + a.h, by = sy + 14;
        const sx = ui.tab === "screens" ? a.x + a.w - 20 : a.x + 30, by2 = ui.tab === "screens" ? sy + 30 : by;
        pts = [[sx, sy], [sx, by2], [vx, by2], [vx, b.mid], [b.x - 2, b.mid]];
        lx = vx - 8; ly = b.mid - (lines.length - 1) * lh - 4; anchor = "end";
      } else if (sa.pos[0] === sb.pos[0]) {
        const x = a.x + 40, top = ui.tab === "screens" ? b.y - 44 : b.y - 2; pts = [[x, a.y + a.h + (ui.tab === "screens" ? 26 : 0)], [x, top]]; lx = x + 8; ly = (pts[0][1] + top) / 2 + 4;
      } else if (sa.pos[1] === sb.pos[1]) {
        pts = [[a.x + a.w, a.mid], [b.x - 2, b.mid]]; lx = a.x + a.w + 8; ly = a.mid - 8 - (lines.length - 1) * lh;
      } else {
        const mx = a.x + a.w + 16;
        pts = [[a.x + a.w, a.mid], [mx, a.mid], [mx, b.mid], [b.x - 2, b.mid]]; lx = mx + 6; ly = b.mid - 8 - (lines.length - 1) * lh;
      }
      const d = "M" + pts.map(p => p.join(",")).join(" L");
      const grp = el("g", { class: "edge edge--" + kind + (dim ? " is-dim" : "") + (ui.selEdge && ui.selEdge[0] === from && ui.selEdge[1] === to ? " is-sel" : ""), tabindex: 0 }, edgesG);
      el("path", { d, class: "edge-line", "marker-end": "url(#arr)" }, grp);
      el("path", { d, class: "edge-hit" }, grp);
      textBlock(grp, lx, ly, lines, "edge-label", lh).setAttribute("text-anchor", anchor);
      grp.addEventListener("click", ev => { ev.stopPropagation(); selectEdge([from, to, label, kind]); });
    };
    for (const e of F.trunk) drawEdge(e[0], e[1], e[2], "e", true);
    for (const e of F.edges) if (e[4] !== "text") drawEdge(...e);

    // nodes
    for (const id of Object.keys(F.states)) {
      if (!isVisible(id)) continue;
      const s = F.states[id], b = box(g, id), dim = !inFilter(id);
      const grp = el("g", { class: `node node--${s.style}${dim ? " is-dim" : ""}${ui.sel === id ? " is-sel" : ""}`, tabindex: 0, "data-id": id }, nodesG);
      const usePic = ui.tab === "screens" && s.pics && s.pics.length && !s.span;
      if (usePic) {
        const tl = s.title.split("\n");
        textBlock(grp, b.x, b.y - 10 - (tl.length - 1) * 15, tl, "pic-title", 15);
        el("rect", { x: b.x - 3, y: b.y - 3, width: b.w + 6, height: b.h + 6, rx: 6, class: "node-frame" }, grp);
        el("image", { href: PIC(s.pics[0]), x: b.x, y: b.y, width: b.w, height: b.h, preserveAspectRatio: "xMidYMin slice" }, grp);
        textBlock(grp, b.x, b.y + b.h + 18, [s.pics[0] + (s.pics.length > 1 ? `  +${s.pics.length - 1}` : "")], "pic-id", 0);
      } else {
        el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, class: "node-box" }, grp);
        const tl = s.title.split("\n");
        textBlock(grp, b.x + 12, b.y + 22, tl, "node-title", 16);
        const per = Math.floor((b.w - 24) / 6.3);
        textBlock(grp, b.x + 12, b.y + 22 + tl.length * 16 + 2, wrap(s.sub, per).slice(0, ui.tab === "screens" ? 9 : 3), "node-sub", 14);
      }
      grp.addEventListener("click", ev => { ev.stopPropagation(); select(id); });
      grp.addEventListener("keydown", ev => { if (ev.key === "Enter") select(id); });
    }
    for (const tg of laneTitles) { const r = tg.querySelector("rect"), w = tg.querySelector("text").getBBox().width; r.setAttribute("width", w + 12); }
    const vbW = right + 60, vbH = bottom + 40;
    svg.dataset.w = vbW; svg.dataset.h = vbH;
    applyView();
  }

  // ---------- pan / zoom ----------
  const view = { overview: null, screens: null };
  function firstView() {
    fit(); const v = view[ui.tab];
    if (v.k < 0.6) { v.k = 0.6; v.x = 8; v.y = 8; applyView(); }
  }
  function fit() {
    const vp = svg.getBoundingClientRect(), w = +svg.dataset.w, h = +svg.dataset.h;
    // Overview: whole diagram. Screens: fit the width and start at the top (it is tall).
    const k = ui.tab === "screens" ? Math.min(vp.width / w, 1) : Math.min(vp.width / w, vp.height / h);
    view[ui.tab] = { k, x: (vp.width - w * k) / 2, y: 8 };
    applyView();
  }
  function applyView() {
    if (!view[ui.tab]) return firstView();
    const v = view[ui.tab];
    world.setAttribute("transform", `translate(${v.x},${v.y}) scale(${v.k})`);
  }
  function zoomAt(f, cx, cy) {
    const v = view[ui.tab], k = Math.max(0.1, Math.min(3, v.k * f));
    v.x = cx - (cx - v.x) * (k / v.k); v.y = cy - (cy - v.y) * (k / v.k); v.k = k; applyView();
  }
  svg.addEventListener("wheel", e => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  let drag = null;
  svg.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, moved: false }; });
  window.addEventListener("pointermove", e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    if (drag.moved) { const v = view[ui.tab]; v.x += dx; v.y += dy; drag.x = e.clientX; drag.y = e.clientY; applyView(); }
  });
  window.addEventListener("pointerup", () => { setTimeout(() => (drag = null), 0); });
  svg.addEventListener("click", () => { if (!drag || !drag.moved) closePanel(); }, true);
  function centerOn(id) {
    const g = G[ui.tab], b = box(g, id), vp = svg.getBoundingClientRect(), v = view[ui.tab];
    const k = Math.max(v.k, ui.tab === "screens" ? 0.7 : 1);
    v.k = k; v.x = vp.width / 2 - (b.x + b.w / 2) * k; v.y = vp.height / 2 - (b.y + b.h / 2) * k; applyView();
  }

  // ---------- panel ----------
  const panel = document.getElementById("panel"), body = document.getElementById("panel-body");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const md = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const sec = (t, h) => h ? `<section><h3>${t}</h3>${h}</section>` : "";
  const ul = arr => arr && arr.length ? `<ul>${arr.map(x => `<li>${md(x)}</li>`).join("")}</ul>` : "";
  const typeName = { S: "All cases", C: "Cat4", K: "Pilot, HA skipped", P: "Pilot — Fallback B", A: "Version A (later)" };
  function link(id) { const s = F.states[id]; return s ? `<button class="tm-chip jump" data-jump="${id}">${esc(s.title.replace(/\n/g, " "))}</button>` : esc(id); }
  const arrowLi = (e, other) => `<li><span class="ak ak--${e[3]}">${e[3] === "a" ? "action" : "event"}</span> ${esc(e[2].replace(/\n/g, " "))} ${link(other)}${e[4] === "text" ? ' <span class="tag">written on the box</span>' : ""}</li>`;
  function select(id, opts = {}) {
    let s = F.states[id]; if (!s) return;
    if (s.ref && !opts.noRef) { /* join box: show its target */ }
    ui.sel = id; ui.selEdge = null; draw();
    const ins = [...F.edges, ...F.trunk].filter(e => e[1] === id && isVisible(e[0]));
    const outs = [...F.edges, ...F.trunk].filter(e => e[0] === id && isVisible(e[1]));
    const pics = (s.pics || []).map(p => `<figure><img src="${PIC(p)}" alt="${p}" loading="lazy" data-full="${p}"><figcaption>${p}</figcaption></figure>`).join("");
    const copy = (s.copy || []).map(k => `<tr><td><code>${k}</code></td><td>${MSG[k] !== undefined ? esc(MSG[k]) : '<span class="missing">missing in messages.json</span>'}</td></tr>`).join("");
    const acts = (s.actions || []).map(a => `<tr><td><b>${esc(a[0])}</b></td><td>${md(a[1])}</td><td>${esc(a[2])}</td></tr>`).join("");
    const evs = (s.events || []).map(a => `<tr><td>${md(a[0])}</td><td>${esc(a[1])}</td></tr>`).join("");
    body.innerHTML = `
      <p class="eyebrow">${esc((s.types || "").split("").map(t => typeName[t]).join(" · "))}</p>
      <h2>${esc(s.title.replace(/\n/g, " "))}</h2>
      ${s.stateId ? `<p class="state-id">State ID: <code>${md(s.stateId)}</code></p>` : ""}
      ${s.ref ? `<p class="join-note">This box only points to another part of the flow.</p><p>${link(s.ref)}</p>` : ""}
      ${pics ? `<div class="pics">${pics}</div>` : ""}
      ${sec("How the doctor gets here", s.how ? `<p>${md(s.how)}</p>` : "")}
      ${sec("What the doctor sees", (s.sees ? `<p>${md(s.sees)}</p>` : "") + (s.bar ? `<p><b>Bar:</b> ${md(s.bar)}</p>` : ""))}
      ${sec("Copy (live from messages.json)", copy ? `<table class="t">${copy}</table>` : "")}
      ${sec('Doctor actions <span class="tag tag--open">request: to be agreed</span>', acts ? `<table class="t"><tr><th>Tap</th><th>App sends</th><th>Goes to</th></tr>${acts}</table>` : "")}
      ${sec('Backend events <span class="tag tag--open">event: to be agreed</span>', evs ? `<table class="t"><tr><th>Event</th><th>Goes to</th></tr>${evs}</table>` : "")}
      ${sec("Rules", ul(s.rules))}
      ${sec("Decisions", s.dec && s.dec.length ? `<p class="dec">${s.dec.map(esc).join(" · ")}</p>` : "")}
      ${sec("Open questions", s.open && s.open.length ? `<ul class="open">${s.open.map(x => `<li>${md(x)}</li>`).join("")}</ul>` : "")}
      ${sec("Arrows in", ins.length ? `<ul class="arrows">${ins.map(e => arrowLi(e, e[0])).join("")}</ul>` : "")}
      ${sec("Arrows out", outs.length ? `<ul class="arrows">${outs.map(e => arrowLi(e, e[1])).join("")}</ul>` : "")}`;
    openPanel(); history.replaceState(null, "", "#state=" + id);
    if (!opts.noCenter) requestAnimationFrame(() => centerOn(id));
  }
  function selectEdge(e) {
    ui.selEdge = e; ui.sel = null; draw();
    const [a, b, label, kind] = e;
    body.innerHTML = `<p class="eyebrow">${kind === "a" ? "Doctor action — the app sends a request" : "Backend event — the app learns it by polling"}</p>
      <h2>${esc(label.replace(/\n/g, " "))}</h2>
      <p>${link(a)} → ${link(b)}</p>
      <p class="tag tag--open">${kind === "a" ? "Request" : "Event"} name, payload and timing: to be agreed with Engineering (OQ-030).</p>
      <p>See the rules on either box for why this arrow exists.</p>`;
    openPanel(); history.replaceState(null, "", "#");
  }
  function openPanel() { panel.style.top = document.querySelector("header").offsetHeight + "px"; panel.hidden = false; document.body.classList.add("has-panel"); }
  function closePanel() { panel.hidden = true; document.body.classList.remove("has-panel"); if (ui.sel || ui.selEdge) { ui.sel = null; ui.selEdge = null; draw(); history.replaceState(null, "", "#"); } }
  document.getElementById("panel-close").addEventListener("click", closePanel);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { if (!lightbox.hidden) lightbox.hidden = true; else closePanel(); } });
  body.addEventListener("click", e => {
    const j = e.target.closest("[data-jump]"); if (j) return select(j.dataset.jump);
    const im = e.target.closest("img[data-full]"); if (im) { lbImg.src = PIC(im.dataset.full); lbCap.textContent = im.dataset.full; lightbox.hidden = false; }
  });
  const lightbox = document.getElementById("lightbox"), lbImg = lightbox.querySelector("img"), lbCap = lightbox.querySelector("figcaption");
  lightbox.addEventListener("click", () => (lightbox.hidden = true));

  // ---------- controls ----------
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
    ui.tab = b.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-pressed", x === b));
    draw(); if (ui.sel) centerOn(ui.sel);
  }));
  document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => {
    ui.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b));
    draw();
  }));
  document.getElementById("toggle-a").addEventListener("change", e => { ui.aOn = e.target.checked; view.overview = view.screens = null; draw(); });
  document.getElementById("zoom-in").addEventListener("click", () => { const r = svg.getBoundingClientRect(); zoomAt(1.25, r.width / 2, r.height / 2); });
  document.getElementById("zoom-out").addEventListener("click", () => { const r = svg.getBoundingClientRect(); zoomAt(0.8, r.width / 2, r.height / 2); });
  document.getElementById("zoom-fit").addEventListener("click", fit);
  window.addEventListener("resize", () => applyView());
  document.getElementById("version").textContent = F.version;
  document.getElementById("notes").innerHTML = F.notes.map(n => `<li>${esc(n)}</li>`).join("");

  draw();
  const m = location.hash.match(/state=([\w-]+)/);
  if (m && F.states[m[1]]) { if (F.states[m[1]].types === "A") { ui.aOn = true; document.getElementById("toggle-a").checked = true; draw(); } select(m[1]); }
  window.__flowReady = true;
})();

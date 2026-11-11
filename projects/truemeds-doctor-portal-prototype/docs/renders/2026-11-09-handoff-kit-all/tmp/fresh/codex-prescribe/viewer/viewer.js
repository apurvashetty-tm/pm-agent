// Hand-off kit viewer. Static: reads window.KIT from data.js (generated): screens (one per tab, with states and their
// tokensUsed), blocks, tokenIndex, decided / open questions, downloads. No server needed.
(() => {
  const K = window.KIT, SCR = K.screens, $ = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sw = (v) => typeof v === "string" && /^(#|rgb)/.test(v) ? '<span class="swatch" style="background:' + esc(v) + '"></span>' : "";
  const val = (v) => typeof v === "object" ? (v.boxShadow ? v.boxShadow : JSON.stringify(v)) : v;
  const PROP = { "box-shadow": "shadow" };   // how React Native calls it
  const prop = (p) => PROP[p] || p;
  const via = (t) => t.via && t.via.length ? ' <span class=muted title="Defined as: ' + esc([].concat(t.via).join(" → ")) + '">ⓘ</span>' : "";
  const tokCell = (t) => t.native ? sw(t.value) + "<code>" + esc(t.native) + "</code><br><span class=muted>" + esc(t.web) + via(t) + " · " + esc(val(t.value)) + "</span>" : '<span class="raw">' + esc(t.web) + " — not a native token</span>";
  const styleRows = (styles) => styles.map((s) => '<tr class="' + (s.raw ? "raw" : "") + '"><td><code>' + esc(prop(s.property)) + "</code>" + (s.inherited ? " <span class=muted>(from the parent)</span>" : "") + "</td><td>" +
    (s["tokens"].length ? s["tokens"].map(tokCell).join("<br>") : "") +
    (s.layout ? (s["tokens"].length ? "<br>" : "") + "<code>" + esc(s.value) + "</code> <span class=muted>layout value</span>" : "") +
    (s.exception ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.exception) + "</span>" : "") +
    (s.timing ? "<code>" + esc(s.value) + "</code> <span class=muted>" + esc(s.unresolved) + "</span>" : "") +
    (!s["tokens"].length && !s.layout && !s.exception && !s.timing && !s.raw ? "—" : "") +
    (s.raw ? '<br><span class="raw">not a design value: <code>' + esc(s.value) + "</code></span>" : "") + "</td></tr>").join("");
  const nav = document.querySelector(".v-top"), main = document.getElementById("v");
  const tabs = { start: "Start here", foundation: "Foundation", blocks: "Building blocks", screens: "Screens" };
  // a click draws the new page at once (the address updates too, so Back and links keep working)
  const open = (h) => { if (location.hash.slice(1) !== h) history.pushState(null, "", "#" + h); go(h); };  for (const [k, l] of Object.entries(tabs)) { const b = $('<button type="button">' + l + "</button>"); b.onclick = () => { open(k); }; b.dataset.k = k; nav.append(b); }
  window.addEventListener("hashchange", () => go(location.hash.slice(1)));
  const blockOf = (id) => K.blocks.find((x) => x.block === id);
  const where = (stateId) => { for (const s of SCR) { const st = s.states.find((x) => x.id === stateId); if (st) return { s, st }; } return null; };
  function go(h) {
    const parts = (h || "start").split("/").map(decodeURIComponent), k = tabs[parts[0]] ? parts[0] : "start";
    nav.querySelectorAll("button").forEach((x) => x.setAttribute("aria-current", String(x.dataset.k === k)));
    main.innerHTML = ""; ({ start, foundation, blocks, screens })[k](...parts.slice(1)); window.scrollTo(0, 0);
  }
  function start() {
    const D = window.KIT_DOWNLOADS || [];
    const dl = D.map((d) => '<a class="dl' + (d.main ? " dl-main" : "") + '" href="' + esc(d.href) + '" download><b>' + esc(d.label) + "</b><span>" + esc(d.what) + (d.size ? " · " + esc(d.size) : "") + "</span></a>").join("");
    const n = SCR.reduce((a, s) => a + s.states.length, 0);
    main.append($('<section><h1>Truemeds doctor app — hand-off kit</h1><p class="lede">How to use it: <b>Start with Screens. Tap anything. Check DECIDED before asking.</b></p>' +
      '<div class="card"><h3 style="margin-top:0">What is here</h3><ul class="plain">' +
      "<li><b>Screens</b>: every state of every screen (" + SCR.length + " tabs, " + n + " states). Tap a part of the phone to see what it is, its colours, sizes, spacing and text.</li>" +
      "<li><b>Building blocks</b>: the reusable parts (button, field, notice…) with every version of each, and where each is used. Build these once, use them everywhere.</li>" +
      "<li><b>Foundation</b>: every design value (colour, size, gap, corner) by the name you use in code.</li>" +
      '<li><b>Answers</b>: <a href="../DECIDED.md">DECIDED</a> (' + K.decided.length + ' questions already answered) · <a href="../OPEN.md">OPEN</a> (' + K.open.length + " still open, and who answers).</li></ul></div>" +
      '<div class="card"><h3 style="margin-top:0">Download</h3><div class="dls">' + dl + '</div><p class="muted small" style="margin:0">Using an AI coding tool? Download the whole kit and open it as a folder: the tool reads <code>AGENTS.md</code> on its own. Kit version ' + esc(window.KIT_VERSION || "") + ".</p></div></section>"));
  }
  function foundation() {
    main.append($('<section><h1>Foundation</h1><p>Every design value by the name you use in code (left). Download the files from <a href="#start">Start here</a>.</p></section>'));
    const only = $('<label class="only"><input type="checkbox"> Only values used on <select>' + SCR.map((s, i) => '<option value="' + i + '">' + esc(s.name) + "</option>").join("") + "</select></label>");
    const q = $('<input class="tm-input" placeholder="Filter (e.g. content, space, --tm-border)" style="width:100%;padding:12px;border:1px solid var(--tm-border-default);border-radius:8px;font:inherit;margin:8px 0">');
    const box = $('<div class="tblwrap"></div>');
    const cb = only.querySelector("input"), sel = only.querySelector("select");
    const draw = () => {
      const f = q.value.toLowerCase(), used = cb.checked ? new Set(SCR[+sel.value].tokensUsed) : null;
      box.innerHTML = "<table><thead><tr><th>Native (use this)</th><th>Web</th><th>Value</th></tr></thead><tbody>" + K.tokenIndex.filter((t) => !used || used.has(t.native)).filter((t) => !f || (t.native + t.web).toLowerCase().includes(f))
        .map((t) => "<tr><td><code>" + esc(t.ts) + "</code></td><td><code>" + esc(t.web) + "</code>" + via(t) + "</td><td>" + sw(t.value) + esc(val(t.value)) + "</td></tr>").join("") + "</tbody></table>";
    };
    q.oninput = draw; cb.onchange = draw; sel.onchange = draw; main.append(q, only, box); draw();
  }
  // Where a block is used, grouped by screen tab; each state opens Screens with that block's element selected.
  function usedOn(b) {
    const rows = [];
    for (const s of SCR) {
      const ids = s.states.filter((st) => b.usedIn.includes(st.id));
      if (!ids.length) continue;
      rows.push("<p><b>" + esc(s.name) + "</b> (" + ids.length + ")<br>" + ids.map((st) => { const el = (st.elements || []).find((e) => e.block === b.block);
        return '<a class="uchip" href="#screens/' + esc(s.tab) + "/" + esc(st.id) + (el ? "/" + esc(el.id) : "") + '">' + esc(st.name) + "</a>"; }).join("") + "</p>");
    }
    return '<div class="usedon"><h3 style="margin-top:0">Where it\'s used</h3>' + rows.join("") + "</div>";
  }
  function blocks(which) {
    main.append($('<section><h1>Building blocks</h1><p>The reusable parts. Build each once in React Native and reuse it. The React Native names are suggestions; you own the components.</p></section>'));
    const chips = $('<div class="chips"></div>'); main.append(chips);
    const b = blockOf(which) || K.blocks[0];
    for (const x of K.blocks) { const c = $('<button type="button">' + esc(x.name) + "</button>"); c.setAttribute("aria-pressed", String(x === b)); c.onclick = () => { open("blocks/" + x.block); }; chips.append(c); }
    const sec = $('<section class="card"></section>');
    sec.innerHTML = "<h2 style=margin-top:0>" + esc(b.name) + "</h2><p><code>" + esc(b.rn) + "</code><br><span class=muted>web: " + esc(b.web) + "</span></p>" + usedOn(b) +
      (b.pictures.length ? '<div class="blockpics">' + b.pictures.map((p) => '<figure><img src="../' + esc(p.file) + '" alt="' + esc(b.name + " " + p.state) + '"><figcaption>' + esc(p.state) + "</figcaption></figure>").join("") + "</div>" : "") +
      Object.entries(b.parts).map(([part, p]) => "<h3>" + esc(part) + "</h3>" + Object.entries(p.states).map(([st, s]) => "<p><b>" + esc(st) + "</b>" + (s.size ? ' <span class=muted>' + esc(s.size) + "</span>" : "") + (s.changesOnly ? " <span class=muted>changes from default only</span>" : "") + '</p><div class="tblwrap"><table><tbody>' + styleRows(K.sets[s.st]) + "</tbody></table></div>").join("")).join("") +
      "<h3>Rules</h3><ul>" + b.rules.map((r) => "<li>" + esc(r.text) + "</li>").join("") + "</ul>";
    main.append(sec);
  }
  function screens(tab, stateId, elId) {
    const S = SCR.find((s) => s.tab === tab) || (stateId && where(stateId) || {}).s || SCR[0];
    const st = S.states.find((s) => s.id === stateId) || S.states[0];
    const bar = $('<nav class="scrtabs" aria-label="Screens"></nav>');
    for (const s of SCR) { const b = $('<button type="button">' + esc(s.name) + "</button>"); b.setAttribute("aria-current", String(s === S)); b.onclick = () => { open("screens/" + s.tab + "/" + s.states[0].id); }; bar.append(b); }
    main.append(bar);
    const chips = $('<div class="chips"></div>'); main.append(chips);
    for (const s of S.states) { const c = $('<button type="button">' + esc(s.name) + "</button>"); c.setAttribute("aria-pressed", String(s === st)); c.onclick = () => { open("screens/" + S.tab + "/" + s.id); }; chips.append(c); }
    const built = st.built !== false;
    const stage = $('<div class="stage"></div>');
    const shot = $('<figure class="shot"><div class="frame"><img alt="' + esc(st.name) + '" src="../' + esc(built ? st.pictures.built390 : st.pictures.w390) + '"></div><figcaption>' + (built ? "Tap any part · " : "") + "smallest supported phone: 360 wide</figcaption></figure>");
    const frame = shot.querySelector(".frame");
    const panel = $('<div class="panel"></div>');
    const els = st.elements || [];
    let sel = els.find((e) => e.id === elId) || null;
    for (const e of [...els].sort((a, b) => b.box.w * b.box.h - a.box.w * a.box.h)) {
      const h = $('<button type="button" class="hit" aria-label="' + esc(e.id) + '"></button>');
      Object.assign(h.style, { left: e.box.x / 3.9 + "%", top: e.box.y / 8.44 + "%", width: e.box.w / 3.9 + "%", height: e.box.h / 8.44 + "%" });
      h.onclick = (ev) => { ev.stopPropagation(); pick(e); }; h.dataset.id = e.id; frame.append(h);
    }
    stage.append(shot, panel); main.append(stage);
    function pick(e) { sel = e; history.replaceState(null, "", "#screens/" + S.tab + "/" + st.id + "/" + e.id); drawPanel(); }
    function drawPanel() {
      shot.querySelectorAll(".hit").forEach((h) => h.classList.toggle("sel", !!sel && h.dataset.id === sel.id));
      panel.innerHTML = "";
      const Q = (id) => (K.decided.find((d) => d.id === id) || {}).q || id;
      const ans = st.rule.decided;
      const when = $('<div class="card when"><h3 style="margin-top:0">When this shows</h3><p class="when-shows"></p><p class="label">What happens next</p><p class="when-next"></p>' +
        (ans.length ? '<details class="ans"><summary>Answered questions (' + ans.length + ")</summary><ul>" + ans.map((d) => '<li><a href="../DECIDED.md#' + esc(d) + '">' + esc(Q(d)) + "</a></li>").join("") + "</ul></details>" : "") + "</div>");
      when.querySelector(".when-shows").textContent = st.when.shows; when.querySelector(".when-next").textContent = st.when.next;
      panel.append(when);
      if (!built) panel.append($('<div class="card"><p class="later">' + esc(st.later) + "</p></div>"));
      if (built && !sel) panel.append($('<div class="card hint"><p>Tap any part of the phone (a button, the field, a line of text) to see how it is built.</p></div>'));
      if (sel) {
        const e = sel, sp = K.sets[e.sp] || {}, b = blockOf(e.block) || { name: e.block };
        const tok = (s) => s["tokens"].length ? "<code>" + esc(s["tokens"].join(" ")) + "</code>" : '<span class="' + (s.raw ? "raw" : "") + '">' + esc(s.value) + "</span>";
        panel.append($('<div class="card el"><h2 style="margin-top:0">' + esc(e.id) + '</h2><p><b>Block</b> <a href="#blocks/' + esc(e.block) + '" title="Every version, and where else it is used">' + esc(b.name) + "</a> · <b>part</b> " + esc(e.part) + " · <b>variant</b> " + esc(e.variant) + " · <b>state</b> " + esc(e.blockState) + "</p>" +
          (e.copy.length ? "<p><b>Text</b> " + e.copy.map((c) => c.copyKey ? "<code>messages['" + esc(c.copyKey) + "']</code>" + (c.values ? " with " + esc(JSON.stringify(c.values)) : "") + " (" + esc(c.slot) + ")" : c.literal ? '<span class="raw">typed text "' + esc(c.literal) + '" (' + esc(c.slot) + ")</span>" : "<span class=muted>" + esc(c.note || "") + "</span>").join("<br>") + "</p>" : "") +
          (e.icon ? "<p><b>Icon</b> <code>" + esc(e.icon.iconTs) + "</code> " + esc(e.icon.size ? e.icon.size.map((x) => Math.round(x)).join("×") : "") + "</p>" : "") +
          '<div class="tblwrap"><table><thead><tr><th>Property</th><th>Design value (native · web · value)</th></tr></thead><tbody>' + (styleRows(K.sets[e.st]) || "<tr><td colspan=2 class=muted>No styles: the phone draws this.</td></tr>") + "</tbody></table></div>" +
          (sp.above || sp.inside ? "<h3>Spacing</h3>" : "") +
          (sp.above ? "<p>" + esc(sp.above.px) + " above, to <b>" + esc(sp.above.neighbour) + "</b>: " + (sp.above.setBy.length ? sp.above.setBy.map((s) => esc(s.element + " " + prop(s.property) + " ") + tok(s)).join("; ") : "<span class=muted>layout (no spacing rule)</span>") + "</p>" : "") +
          (sp.inside ? "<p>Inside: " + sp.inside.map((s) => esc(prop(s.property) + " ") + tok(s)).join("; ") + "</p>" : "") +
          (e.sr ? "<h3>Screen reader label</h3><p>" + esc(e.sr) + "</p>" : "") + "</div>"));
      }
      if (els.length) {
        const fold = $('<details class="elfold"><summary>Can\'t tap it? Pick from a list</summary><div class="ellist"></div></details>'), list = fold.querySelector(".ellist");
        for (const e of els) { const b = $('<button type="button">' + esc(e.id) + "</button>"); b.setAttribute("aria-pressed", String(sel === e)); b.onclick = () => pick(e); list.append(b); }
        panel.append(fold);
      }
      const raws = S.rawValues.builtApp.filter((x) => x.states.includes(st.id) || x.states.includes(st.id.replace(/^sign-in_/, "")));
      if (raws.length) panel.append($('<div class="card"><h3 style="margin-top:0" class="raw">Not design values yet: ' + raws.length + '</h3><div class="tblwrap"><table><tbody>' + raws.map((x) => '<tr class="raw"><td><code>' + esc(prop(x.property) + ": " + x.value) + "</code></td><td>" + esc(x.elements.join(", ")) + "</td></tr>").join("") + "</tbody></table></div></div>"));
      panel.scrollTop = 0;
    }
    drawPanel();
  }
  go(location.hash.slice(1));
})();

// Tiny DOM helpers for the screens. No inline styles: screens set classes and attributes only (step 1 quality rule).
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style") throw new Error("dom: inline styles are not allowed in app/ screens");
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}
// A registry message with some placeholders filled by nodes (a semibold number, a link):
// parts("otp.sentTo", { number: h("b", ...) }, MSG) → [text, node, text]
export function parts(key, nodes, MSG) {
  const marks = {};
  Object.keys(nodes).forEach((k, i) => { marks[k] = `\u0001${i}\u0001`; });
  const text = MSG(key, marks);
  const out = [];
  text.split(/\u0001(\d+)\u0001/).forEach((piece, i) => {
    if (i % 2) out.push(nodes[Object.keys(nodes)[Number(piece)]]);
    else if (piece) out.push(document.createTextNode(piece));
  });
  return out;
}
// Splits a message around a phrase that becomes a link ("…, or call Doctor Ops.").
export function linkPhrase(text, phrase, makeLink) {
  const at = text.lastIndexOf(phrase);
  if (at < 0) return [document.createTextNode(text)];
  return [document.createTextNode(text.slice(0, at)), makeLink(phrase), document.createTextNode(text.slice(at + phrase.length))];
}

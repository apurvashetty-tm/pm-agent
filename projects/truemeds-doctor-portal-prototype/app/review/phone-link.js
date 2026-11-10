// Where the Test on phone link points (D-97 item 3). A phone can't open "localhost": when the app is served from this Mac
// (localhost / 127.0.0.1), the link uses the Mac's network address. scripts/serve.sh serves the app and writes that address into
// the page it sends (<meta name="tm-network-origin" content="http://192.168.x.y:8080">), so no extra request is made. On the
// preview site the link is the site's own address.
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"]);
export const isLocalHost = (loc = location) => LOCAL.has(loc.hostname);

// The Mac's network origin given by the server, or null. Only http(s), never a local host.
export function networkOrigin(doc = document) {
  const v = doc.querySelector('meta[name="tm-network-origin"]')?.content;
  try { const u = v ? new URL(v) : null; return u && /^https?:$/.test(u.protocol) && !LOCAL.has(u.hostname) ? u.origin : null; } catch (e) { return null; }
}

// The play link for a story code. kind: "network" (served locally, Mac address known), "local" (served locally, no address:
// a phone can't open it), "site" (any other host).
export function phoneLink(code, loc = location, doc = document) {
  const origin = isLocalHost(loc) ? networkOrigin(doc) : null;
  if (origin) return { url: new URL(new URL("./", loc.href).pathname + "?play=" + code, origin).href, kind: "network" };
  return { url: new URL("./?play=" + code, loc.href).href, kind: isLocalHost(loc) ? "local" : "site" };
}

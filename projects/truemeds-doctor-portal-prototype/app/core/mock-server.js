// Mock server and polling (plan B7). Pure logic, injected clock: runs in Node tests and in the browser.
// Rules: events carry a sequence number and a case id. The poller applies an event only if it is for the open case AND its
// sequence is newer than every event already applied (monotonic). Stale (older or equal) and duplicate answers are ignored and
// counted. A late answer for an earlier case never updates the open one.
export function createServer() {
  let seq = 0;
  const log = []; // { seq, caseId, at, ev, data }
  return {
    emit(caseId, at, ev, data = {}) { seq += 1; log.push({ seq, caseId, at, ev, data }); return seq; },
    since(cursor) { return log.filter((e) => e.seq > cursor); },
    all() { return log.slice(); },
    clear() { log.length = 0; seq = 0; },
  };
}

export function createPoller({ server, caseId, apply }) {
  let cursor = 0;        // highest sequence fetched from the server
  let lastApplied = 0;   // highest sequence applied to the open case
  let stale = 0, foreign = 0;
  return {
    tick() {
      let applied = 0;
      for (const e of server.since(cursor)) {
        cursor = Math.max(cursor, e.seq);
        if (e.caseId !== caseId) { foreign++; continue; }     // a late answer for another case
        if (e.seq <= lastApplied) { stale++; continue; }      // stale or duplicate
        lastApplied = e.seq;
        apply(e); applied++;
      }
      return { applied, stale, foreign };
    },
    counts: () => ({ stale, foreign }),
    cursor: () => cursor,
  };
}

// App events for the reviewer's event log (plan §4 review mode: "event log (four confirm outcomes as separate events, once per
// completed confirm, D-50; mismatch events)"). Screens and core modules call event(); boot sets the sink (the review panel's log).
// Event names are Engineering's choice (D-50); these are the prototype's plain names. Nothing here is shown to the doctor.
let sink = null;
export function setEventSink(fn) { sink = fn; }
export function event(text) { if (sink) sink(text); }

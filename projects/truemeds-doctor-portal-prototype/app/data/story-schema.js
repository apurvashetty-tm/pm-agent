// Story schema for the review panel and play link (plan v3 §4 "Phone testing", checklist 5.12). Every journey, not only calling.
// Each group: the allowed values (first = default). Values are answers the simulated backend / phone gives; screens read them in later steps.
// Test numbers and OTP codes are from app-logic §11. Add a value here before a screen can use it.
import { CALL_CHOICES, DEFAULT_CHOICES } from "../core/call-sim.js";

export const JOURNEYS = {
  signIn:    { label: "Sign-in", screens: ["sign-in"] },
  otp:       { label: "OTP", screens: ["otp"] },
  offer:     { label: "Faster sign-in offer", screens: ["faster-signin-offer"] },
  unlock:    { label: "Returning unlock", screens: ["returning-unlock"] },
  home:      { label: "Home and availability", screens: ["home"] },
  caseView:  { label: "Case", screens: ["case"] },
  prescribe: { label: "Prescribe and confirm", screens: ["prescribe"] },
  call:      { label: "Call", screens: ["case"] },
};

export const STORY_FIELDS = {
  start:       ["sign-in", "unlock", "home", "case"],
  scenario:    ["cat4", "pilot_ha_free", "pilot_no_ha_free", "pilot_ha_skipped_customer", "pilot_ha_skipped_system", "stress"],
  offline:     ["no", "yes"],
  // sign-in: test numbers from app-logic §11
  signIn:      ["sent", "not-registered", "inactive", "too-many-tries", "couldnt-send", "locked-number"],
  // OTP: 1234 correct · 0000 expired · 9999 couldn't verify · any other = wrong (5th locks)
  otp:         ["correct", "wrong", "two-tries-left", "expired", "couldnt-verify", "locked", "resend-ok", "resend-failed"],
  // the phone (mock unlock, B14): what it has — fingerprint, face, screen lock only (D-64 fallback), or no screen lock (offer skipped)
  device:      ["fingerprint", "face", "screen-lock", "none"],
  // the phone prompt's answer on the faster sign-in offer (Turn on / Try again). "unavailable" → offer_unavailable (D-93)
  offer:       ["enabled", "cancelled", "enable-failed", "unavailable"],
  // the phone prompt's answer on returning unlock; "failed" = one failed try (3 → OTP)
  unlock:      ["success", "cancelled", "failed", "unavailable"],
  availability:["normal", "near-expiry", "ending", "ended-with-request"],
  request:     ["accepted", "failed", "no-cases"],
  caseKind:    ["normal", "ten-medicines", "long-names", "empty", "rx-failed", "release-refused"],
  prescribe:   ["saved", "pending-blocks-confirm", "confirm-busy", "confirm-failed", "dose-error", "disabled"],
};

// Call attempts: each attempt is one set of simulator choices (CALL_CHOICES). 1 to 3 attempts per story, played in order.
export const CALL_KEYS = Object.keys(CALL_CHOICES);
export const MAX_CALL_ATTEMPTS = 3;
export const defaultAttempt = () => Object.fromEntries(CALL_KEYS.map((k) => [k, DEFAULT_CHOICES[k]]));   // happy path (D-97)

export const DEFAULT_STORY = {
  v: 2,
  start: "sign-in", scenario: "cat4", offline: "no",
  signIn: "sent", otp: "correct", device: "fingerprint", offer: "enabled", unlock: "success",
  availability: "normal", request: "accepted", caseKind: "normal", prescribe: "saved",
  calls: [defaultAttempt()],
};

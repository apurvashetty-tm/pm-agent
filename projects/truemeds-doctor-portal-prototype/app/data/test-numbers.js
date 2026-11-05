// Test numbers and codes (app-logic §11, agreed Apurva 2026-10-31). Prototype only: the real app gets these answers from the server.
export const SIGN_IN_NUMBERS = {
  "9000000001": "not-registered",   // sign-up route
  "9000000002": "inactive",         // Call Doctor Ops
  "9000000003": "too-many-tries",   // countdown
  "9000000004": "couldnt-send",
  "9000000005": "locked-number",    // five wrong codes earlier
};
export const OTP_CODES = {
  "1234": "correct",                // signs in
  "0000": "expired",
  "9999": "couldnt-verify",         // server error
};
// Any other valid mobile number → code sent. Any other OTP → wrong code; the 5th wrong code locks the number.
export const OTP_LENGTH = 4;

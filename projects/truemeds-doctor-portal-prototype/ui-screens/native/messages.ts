// Generated from ../feedback/messages.json. Do not edit.
export const messages = {
  "signin.smsHelper": "We’ll send you a verification code by SMS.",
  "signin.empty": "Enter your mobile number.",
  "signin.short": "Enter all 10 digits.",
  "signin.prefix": "Mobile numbers start with 6, 7, 8 or 9.",
  "signin.notRegistered": "Number not registered with Truemeds. Already applied? We’ll contact you after approval.",
  "signin.offline": "You’re offline. Check your connection and try again.",
  "signin.couldntSend": "We couldn’t send the code. Please try again.",
  "signin.tooMany": "Too many attempts on this number. Please wait before trying again.",
  "signin.inactive": "This account is inactive.",
  "otp.empty": "Enter the 4-digit code.",
  "otp.short": "Enter all 4 digits.",
  "otp.wrong": "That code isn’t right. Try again.",
  "otp.triesLeft": "That code isn’t right. {count} tries left.",
  "otp.expired": "This code has expired. Get a new one.",
  "otp.newSent": "New code sent.",
  "otp.couldntVerify": "We couldn’t check the code. Tap Verify & sign in to try again.",
  "otp.tooManyResends": "You’ve asked for too many codes. Use the last one, or call Doctor Ops.",
  "otp.locked": "Too many wrong tries. Try again in {time}, or call Doctor Ops.",
  "otp.resendFailed": "We couldn’t send a new code. Please try again.",
  "otp.expiredAndLimited": "This code has expired. Request a new code in {time}, or call Doctor Ops.",
  "home.setupFailed": "Couldn’t set availability. Your selection is saved. Try again.",
  "home.addFailed": "Couldn’t add time. Try again.",
  "home.requestFailed": "Couldn’t request a case. Please try again.",
  "home.offline": "You’re offline. Reconnect to request a case.",
  "home.added": "{minutes} minutes added",
  "home.endingSoon": "Availability ends soon. You can still request a case.",
  "unlock.unavailable": "Faster sign-in isn’t available on this phone right now.",
  "home.noCases": "No cases right now. Try again in a minute.",
  "home.stopPending": "Finishing your last request. Availability ends after that.",
  "home.expiredPending": "Your last request is still active.",
  "home.idleExpired": "Your availability ended. Set it again to request cases.",
  "home.unknownResult": "Checking whether your case request went through…",
  "home.manuallyEnded": "You ended your availability. Set it again to request cases."
} as const;
export type FeedbackMessageId = keyof typeof messages;
export function message(id: FeedbackMessageId, values: Record<string, string | number> = {}): string {
  return messages[id].replace(/\{(\w+)\}/g, (_, key: string) => {
    if (values[key] === undefined) throw new Error('Missing feedback value: ' + key);
    return String(values[key]);
  });
}

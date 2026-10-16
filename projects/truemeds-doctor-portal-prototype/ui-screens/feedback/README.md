# Shared feedback registry

`messages.json` owns exact feedback copy. `metadata.json` gives each message its pattern, trigger, placement, recovery, clearing rule, retained input and copy status. IDs are shared by browser previews and React Native references.

Run `node build-messages.mjs` after editing either JSON file. The build validates matching IDs and allowed placeholders, then generates `messages.js` and `../native/messages.ts`. Do not edit generated files. Browser pages load `messages.js`; native components import `message()`.

`approved` means existing user-approved wording. `existing` means inherited wording from a current reference without separate copy approval. `proposed` requires copy review before shipping. Visual approval remains separate; see `../../docs/feedback-rules.md` and `../../docs/renders/2026-10-13-feedback-review/README.md`.

Do not put real phone numbers, OTPs, patient names or doctor identifiers in fixtures or logs. All values shown in references are synthetic.

"""Run A1 (steps 2-4): adds the labels the approved Home, case and Prescribe pictures already show to the copy registry
(plan B6: "labels still typed in the pictures move into the registry in the step that builds them"). Idempotent.
python3 add-keys.py   (then: node ui-screens/feedback/build-messages.mjs)"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
FB = os.path.normpath(os.path.join(HERE, "../../../../../ui-screens/feedback"))
COPY = "approved picture label (plan B6, run A1 2026-11-09)"
K = {}
def add(group, slot, pairs):
    for k, v in pairs.items(): K[k] = (v, group, slot)

add("Home", "Home label", {
  "common.back": "Back", "common.close": "Close", "common.help": "Help", "common.tryAgain": "Try again",
  "home.notifications": "Notifications", "home.profile": "Profile",
  "home.titleSetup": "Consult on your schedule", "home.subSetup": "Choose how long you’re available today.",
  "home.titleActive": "You’re available for consultations", "home.subActive": "Request a case whenever you have a moment.",
  "home.titleEnded": "Your availability has ended", "home.titleStopping": "Ending availability", "home.subNoNewCases": "You won’t get new cases.",
  "home.rxToday": "Prescriptions today", "home.timeRemaining": "Time remaining", "home.addTime": "+ Add time",
  "home.adjust": "Adjust duration", "home.minimum": "Minimum 15 minutes", "home.hours": "Hours", "home.minutes": "Minutes",
  "home.presetMinutes": "{n} min", "home.presetHour": "1 hour", "home.presetHours": "{n} hours",
  "home.setAvailability": "Set availability", "home.setting": "Setting…", "home.requestCase": "Request a case", "home.requesting": "Requesting…",
  "home.endAvailability": "End availability", "home.ending": "Ending…",
  "home.addTitle": "Add availability", "home.addSub": "Choose how much time to add.", "home.addConfirm": "Add {n} minutes", "home.adding": "Adding…", "home.cancel": "Cancel",
  "home.endTitle": "End availability?", "home.endSub": "You won’t receive new cases after this. A case already assigned to you stays with you.", "home.keepAvailable": "Keep available",
})
add("Profile", "Profile label", {
  "profile.title": "Profile", "profile.doctorName": "Dr. {name}", "profile.earnings": "Today’s earnings", "profile.earned": "Earned",
  "profile.incentive": "Incentive", "profile.amount": "₹{amount}", "profile.userManual": "User manual", "profile.fasterSignIn": "Faster sign-in",
  "profile.logout": "Log out", "profile.logoutTitle": "Log out?", "profile.staySignedIn": "Stay signed in",
})
add("Case page", "case page label", {
  "case.patientMeta": "{age} · {gender}", "case.orderMeta": "Order {id} · {total}", "case.orderDetails": "Order details", "case.viewRx": "View Rx",
  "case.orderCreated": "Order created", "case.expectedDelivery": "Expected delivery", "case.payment": "Payment",
  "case.medicinesTitle": "Medicines to prescribe", "case.medicinesCount": "{n} medicines", "case.medicinesCountOne": "1 medicine",
  "case.qty": "Qty {n}", "case.statusPrescribed": "Prescribed", "case.statusPending": "Pending", "case.statusDisabled": "Disabled", "case.editMedicine": "Edit {name}",
  "case.notesTitle": "Notes & symptoms", "case.symptomsLabel": "Chief complaints / symptoms", "case.symptomsPlaceholder": "e.g., Fever since 2 days, sore throat, mild cough…",
  "case.doctorNotesLabel": "Doctor notes", "case.doctorNotesPlaceholder": "Clinical observations, instructions, internal notes…",
  "case.callPatient": "Call patient", "case.releaseCase": "Release case", "case.releasing": "Releasing…",
  "case.leaveTitle": "Leave this case?", "case.leaveSub": "It goes back to the queue for another doctor.", "case.stay": "Stay",
  "case.loadingLabel": "Loading case", "case.backBlocked": "Finish this case first. Then you can go back to Home.",
  "case.scriptTitle": "End-of-call script", "call.calling": "Calling {name}…", "case.confirmPrescription": "Confirm prescription",
  "case.medicinesTitleClosed": "Medicines", "case.requestNext": "Request next case", "case.backToHome": "Back to Home", "case.confirmedTitle": "Prescription confirmed",
  "rx.title": "Prescription", "rx.zoomOut": "Zoom out", "rx.zoomIn": "Zoom in", "rx.rotate": "Rotate", "rx.reset": "Reset view",
  "rx.hint": "Double-tap to zoom · Pinch to zoom · Drag to pan", "rx.zoom": "{n}%",
})
add("Prescribe", "Prescribe label", {
  "prescribe.disable": "Disable", "prescribe.onPrescription": "On prescription", "prescribe.howOften": "How often",
  "prescribe.daily": "Daily", "prescribe.everyXHours": "Every X hours", "prescribe.altDays": "Alt days", "prescribe.weekly": "Weekly", "prescribe.monthly": "Monthly", "prescribe.sosOnly": "SOS only",
  "prescribe.dose": "Dose", "prescribe.unitHint": "({unit})", "prescribe.doseUnits": "Dose (units)", "prescribe.doseIn": "Dose in {unit}", "prescribe.other": "Other", "prescribe.otherPlaceholder": "e.g. 7.5",
  "prescribe.morning": "Morning", "prescribe.afternoon": "Afternoon", "prescribe.night": "Night", "prescribe.keyMorning": "M", "prescribe.keyAfternoon": "A", "prescribe.keyNight": "N",
  "prescribe.slotNone": "None", "prescribe.slotAria": "{slot}: {dose}", "prescribe.none": "none", "prescribe.apply": "Apply",
  "prescribe.every": "Every", "prescribe.hoursChip": "{n} h", "prescribe.hoursAria": "Every {n} hours", "prescribe.timesADay": "{n} times a day, round the clock",
  "prescribe.maxDoses": "Max doses a day", "prescribe.alsoSos": "Also as needed (SOS)", "prescribe.sosHelp": "Extra doses only when needed, on top of the schedule above.", "prescribe.maxExtra": "Max extra doses a day",
  "prescribe.duration": "Duration", "prescribe.default": "Default", "prescribe.changed": "Changed from default", "prescribe.ongoing": "Ongoing", "prescribe.ongoingValue": "Ongoing ({period})", "prescribe.ongoingAria": "Ongoing, {period}",
  "prescribe.days": "Days", "prescribe.weeks": "Weeks", "prescribe.months": "Months", "prescribe.durationNumber": "Duration number", "prescribe.durationUnit": "Duration unit",
  "prescribe.food": "Food", "prescribe.optional": "(optional)", "prescribe.afterFood": "After food", "prescribe.beforeFood": "Before food", "prescribe.emptyStomach": "Empty stomach",
  "prescribe.notesPlaceholder": "e.g. Stop if rash appears", "prescribe.prescribe": "Prescribe",
  "prescribe.doseError": "Choose a dose for at least one time of day.", "prescribe.otherEmpty": "Enter the dose in {unit}.", "prescribe.otherInvalid": "Use numbers only, e.g. 7.5 {unit}.",
  "prescribe.disableTitle": "Disable {name}", "prescribe.disableSub": "Select reason",
  "prescribe.reasonRemote": "Can’t prescribe remotely", "prescribe.reasonRemoteDesc": "Requires in-person consultation",
  "prescribe.reasonContra": "Contraindicated for patient", "prescribe.reasonContraDesc": "Allergy or known reaction",
  "prescribe.reasonDuplicate": "Duplicate medication", "prescribe.reasonDuplicateDesc": "Already on equivalent drug",
  "prescribe.reasonDeclined": "Patient declined", "prescribe.reasonDeclinedDesc": "Patient refused this medicine",
  "prescribe.reasonStrength": "Wrong strength", "prescribe.reasonStrengthDesc": "The ordered strength isn’t right",
  "prescribe.discardTitle": "Discard changes?", "prescribe.discardSub": "Your changes to this medicine won’t be saved.", "prescribe.discard": "Discard", "prescribe.keepEditing": "Keep editing",
  "form.tablet": "Tablet", "form.capsule": "Capsule", "form.syrup": "Syrup", "form.drops": "Drops", "form.inhaler": "Inhaler", "form.injection": "Injection", "form.cream": "Cream",
})
add("Prescribe", "On prescription line (printed words)", {
  "print.unit.tablet": "tablet", "print.unit.tablets": "tablets", "print.unit.capsule": "capsule", "print.unit.capsules": "capsules",
  "print.unit.ml": "ml", "print.unit.drop": "drop", "print.unit.drops": "drops", "print.unit.puff": "puff", "print.unit.puffs": "puffs",
  "print.unit.dose": "dose", "print.unit.doses": "doses", "print.unit.units": "units", "print.unit.time": "time", "print.unit.times": "times",
  "print.amount": "{n} {unit}", "print.applyMAN": "Apply {man}", "print.everyHours": "{dose} every {n} hours", "print.altDays": "{dose} on alternate days",
  "print.weekly": "{dose} once a week", "print.monthly": "{dose} once a month", "print.asNeeded": "{dose} as needed (max {max}/day)",
  "print.plusSos": "{schedule} + SOS {dose} (max {max}/day)", "print.applyAsNeeded": "Apply as needed (max {max}/day)",
  "print.day": "day", "print.days": "days", "print.week": "week", "print.weeks": "weeks", "print.month": "month", "print.months": "months",
  "print.duration": "{n} {unit}", "print.sep": " · ",
})

msgs = json.load(open(os.path.join(FB, "messages.json")))
meta = json.load(open(os.path.join(FB, "metadata.json")))
added = 0
for k, (v, group, slot) in K.items():
    if k in msgs and msgs[k] != v: raise SystemExit(f"key {k} exists with different copy: {msgs[k]!r}")
    if k not in msgs: added += 1
    msgs[k] = v
    ph = sorted(set(re.findall(r"\{(\w+)\}", v)))
    m = {"pattern": "none", "trigger": f"{group} screen label", "slot": slot, "next": "—", "clear": "—", "retain": "—", "copy": COPY}
    if ph: m["placeholders"] = ph
    meta.setdefault(k, m)
json.dump(msgs, open(os.path.join(FB, "messages.json"), "w"), ensure_ascii=False, indent=2); open(os.path.join(FB, "messages.json"), "a").write("\n")
json.dump(meta, open(os.path.join(FB, "metadata.json"), "w"), ensure_ascii=False, indent=2); open(os.path.join(FB, "metadata.json"), "a").write("\n")
print("added", added, "keys")

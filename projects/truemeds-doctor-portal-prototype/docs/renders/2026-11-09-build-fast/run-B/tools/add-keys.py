# Run B: adds the step-6 picture labels to the copy registry (plan B6: only labels the approved pictures show).
import json
p = 'ui-screens/feedback/'
m = json.load(open(p + 'messages.json'))
md = json.load(open(p + 'metadata.json'))
new = [
    ("case.confirmForward", "Confirm & forward", "Pilot 7d / 16 (Fallback B)", "primary button"),
    ("case.skipHa", "Skip HA", "Pilot B1 / B2 / 13 / 16 (Fallback B)", "secondary button, full width"),
    ("case.transferredTitle", "Transferred to Health Advisor", "Transfer succeeded (14)", "outcome card title"),
    ("case.forwardedTitle", "Forwarded to Health Advisor", "Forward (B3 / 15 / 10b)", "outcome card title"),
    ("skipHa.title", "Skip the Health Advisor call", "Skip HA sheet (B1 / 16)", "sheet title"),
    ("skipHa.selectReason", "Select reason", "Skip HA sheet", "sheet label"),
    ("skipHa.declined", "Patient declined the Health Advisor call", "Skip HA sheet", "reason title"),
    ("skipHa.declinedDesc", "The patient didn’t want the call", "Skip HA sheet", "reason line"),
    ("skipHa.notRequired", "Clinically not required", "Skip HA sheet", "reason title"),
    ("skipHa.notRequiredDesc", "Health Advisor counselling isn’t needed", "Skip HA sheet", "reason line"),
    ("skipHa.repeat", "Repeat patient, familiar with the medicines", "Skip HA sheet", "reason title"),
    ("skipHa.repeatDesc", "Counselled in an earlier order", "Skip HA sheet", "reason line"),
]
for k, v, trig, slot in new:
    if k in m:
        continue
    m[k] = v
    md[k] = {"pattern": "none", "trigger": trig, "slot": slot, "next": "—", "clear": "—", "retain": "—",
             "copy": "approved picture label (plan B6, run B 2026-11-09)"}
for name, obj in (("messages.json", m), ("metadata.json", md)):
    with open(p + name, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")

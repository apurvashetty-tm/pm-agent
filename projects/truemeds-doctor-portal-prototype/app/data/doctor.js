// The sample doctor (D-92, Apurva 2026-11-06): "Dr. Kunal" on the returning-unlock greeting, "Dr. Kunal Wani" / "KW" on Profile.
// In the real app the name comes from the doctor's profile on the server; screens read it from here and never type it.
export const SAMPLE_DOCTOR = { firstName: "Kunal", fullName: "Kunal Wani", initials: "KW", role: "General Physician" };
// The profile the simulated server returns for a signed-in number (every test number belongs to the sample doctor).
export function doctorFor(/* number */) { return SAMPLE_DOCTOR; }

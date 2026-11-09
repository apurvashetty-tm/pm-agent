// Callback times (app-logic §7) — [MOCK ASSUMPTION]: real slots come from the backend. Values are 24 h times; labels as the
// approved c-callback picture shows them.
export const CALLBACK_SLOTS = [
  ["09:00", "9:00 AM"], ["09:30", "9:30 AM"], ["10:00", "10:00 AM"], ["10:30", "10:30 AM"], ["11:00", "11:00 AM"], ["11:30", "11:30 AM"],
  ["12:00", "12:00 PM"], ["14:00", "2:00 PM"], ["15:00", "3:00 PM"], ["16:00", "4:00 PM"], ["17:00", "5:00 PM"], ["18:00", "6:00 PM"],
];
export const slotLabel = (v) => (CALLBACK_SLOTS.find(([k]) => k === v) || [v, v])[1];

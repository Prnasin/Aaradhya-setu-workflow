// The 4 steps every booking goes through, in this exact order.
export const STEPS = ["Booking Confirmed", "Puja Started", "Puja Completed", "Video Available"];

// Button text the admin clicks to move a booking INTO each step
export const ACTION_LABELS = {
  "Puja Started": "▶ Start Puja",
  "Puja Completed": "✔ Mark Puja Completed",
  "Video Available": "🎥 Share Video",
};

// Returns the step after `current`, or null if the booking is already at the last step.
// Because we only ever move to the NEXT step, steps can't be skipped or reversed.
export function getNextStatus(current) {
  const index = STEPS.indexOf(current);
  if (index === -1) throw new Error(`Unknown status: ${current}`);
  return STEPS[index + 1] || null;
}

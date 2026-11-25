// One WhatsApp message template per workflow step.
// {{placeholders}} are replaced with real booking data before sending.
export const TEMPLATES = {
  "Booking Confirmed":
    "🙏 Namaste {{devoteeName}}, your {{pujaName}} is confirmed! Booking ID: {{bookingId}}. We will message you when the puja begins.",
  "Puja Started":
    "🪔 Namaste {{devoteeName}}, your {{pujaName}} (Booking {{bookingId}}) has started. Pandit ji is now performing the rituals in your name.",
  "Puja Completed":
    "✅ Namaste {{devoteeName}}, your {{pujaName}} (Booking {{bookingId}}) has been completed. Your puja video will be shared shortly.",
  "Video Available":
    "🎥 Namaste {{devoteeName}}, the video of your {{pujaName}} (Booking {{bookingId}}) is ready: {{videoUrl}}",
};

// fillTemplate("Hi {{name}}", { name: "Ravi" })  ->  "Hi Ravi"
// Throws if a value is missing, so we never send "Hi {{name}}" to a devotee.
export function fillTemplate(template, data) {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(`Missing value for {{${key}}}`);
    }
    return data[key];
  });
}

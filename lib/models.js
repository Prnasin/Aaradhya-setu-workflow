import mongoose from "mongoose";

// A puja booking and where it is in the workflow
const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true }, // e.g. "AS-1001"
    devoteeName: { type: String, required: true },
    phone: { type: String, required: true },
    pujaName: { type: String, required: true },
    pujaDate: String,
    amount: Number,
    status: String, // one of STEPS in lib/workflow.js
    videoUrl: String, // set when the puja video is ready
    history: [{ status: String, at: Date }], // when each step happened
  },
  { timestamps: true }
);

// Every message we "sent" to a devotee (the notification history)
const notificationSchema = new mongoose.Schema(
  {
    bookingId: String,
    devoteeName: String,
    phone: String,
    status: String, // the workflow step that triggered this message
    message: String, // final text after filling the template
    channel: { type: String, default: "WhatsApp (mock)" },
    deliveryStatus: { type: String, default: "queued" }, // queued -> sent
    providerMessageId: String,
  },
  { timestamps: true }
);

// Only ONE message per booking per step, so a devotee never gets duplicates
notificationSchema.index({ bookingId: 1, status: 1 }, { unique: true });

// `mongoose.models.X ||` stops Next.js from defining the model twice on reload
export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

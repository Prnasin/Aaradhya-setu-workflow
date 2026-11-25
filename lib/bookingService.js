// All the business logic lives here. API routes just call these functions.
import { connectDB } from "./db.js";
import { Booking, Notification } from "./models.js";
import { STEPS, getNextStatus } from "./workflow.js";
import { TEMPLATES, fillTemplate } from "./templates.js";
import { sendWhatsApp } from "./whatsapp.js";
import { httpError } from "./http.js";

// 1. Create a booking -> it starts at "Booking Confirmed" and the devotee gets a message
export async function createBooking({ devoteeName, phone, pujaName, pujaDate, amount }) {
  if (!devoteeName || !phone || !pujaName) {
    throw httpError(400, "Devotee name, phone and puja name are required");
  }
  await connectDB();
  const count = await Booking.countDocuments();
  const booking = await Booking.create({
    bookingId: `AS-${1001 + count}`,
    devoteeName,
    phone,
    pujaName,
    pujaDate,
    amount,
    status: STEPS[0],
    history: [{ status: STEPS[0], at: new Date() }],
  });
  await sendNotification(booking);
  return booking;
}

// 2. Move a booking to the next step -> a message is generated automatically
// `seenStatus` = the step the admin saw on screen when they clicked (optional).
export async function advanceBooking(bookingId, seenStatus) {
  await connectDB();
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw httpError(404, "Booking not found");

  // The admin's screen is out of date (e.g. another tab already moved it) -> don't move it again
  if (seenStatus && seenStatus !== booking.status) {
    throw httpError(409, `This booking is already at "${booking.status}". Please refresh.`);
  }

  const next = getNextStatus(booking.status);
  if (!next) throw httpError(400, "Booking is already at the final step");

  const update = { status: next, $push: { history: { status: next, at: new Date() } } };
  if (next === "Video Available") {
    update.videoUrl = `https://www.aaradhyasetu.com/videos/${bookingId}`; // mock video link
  }

  // Update ONLY if the status is still what we just read.
  // If two admins click at the same moment, one succeeds and the other gets a 409,
  // so a step can never be skipped or run twice.
  const updated = await Booking.findOneAndUpdate(
    { bookingId, status: booking.status },
    update,
    { new: true }
  );
  if (!updated) throw httpError(409, "This booking was just updated by someone else. Please refresh.");

  await sendNotification(updated);
  return updated;
}

// 3. Build the message from the template, save it, then "send" it on WhatsApp
async function sendNotification(booking) {
  const message = fillTemplate(TEMPLATES[booking.status], {
    devoteeName: booking.devoteeName,
    pujaName: booking.pujaName,
    bookingId: booking.bookingId,
    videoUrl: booking.videoUrl,
  });

  // Save first: the unique index (bookingId + status) blocks duplicate messages
  const notification = await Notification.create({
    bookingId: booking.bookingId,
    devoteeName: booking.devoteeName,
    phone: booking.phone,
    status: booking.status,
    message,
  });

  const result = await sendWhatsApp(booking.phone, message);
  notification.deliveryStatus = result.status;
  notification.providerMessageId = result.id;
  await notification.save();
  return notification;
}

// ---- Read functions used by the UI ----

export async function listBookings() {
  await connectDB();
  return Booking.find().sort({ createdAt: -1 });
}

export async function getBooking(bookingId) {
  await connectDB();
  const booking = await Booking.findOne({ bookingId });
  if (!booking) throw httpError(404, "Booking not found");
  const notifications = await Notification.find({ bookingId }).sort({ createdAt: 1 });
  return { booking, notifications };
}

export async function listNotifications() {
  await connectDB();
  return Notification.find().sort({ createdAt: -1 });
}

// ---- Dummy data for the demo ----

const SAMPLES = [
  { devoteeName: "Ramesh Sharma", phone: "+91 90000 00001", pujaName: "Rudrabhishek Puja", pujaDate: "2026-11-26", amount: 1101, steps: 0 },
  { devoteeName: "Priya Iyer", phone: "+91 90000 00002", pujaName: "Satyanarayan Katha", pujaDate: "2026-11-25", amount: 2100, steps: 1 },
  { devoteeName: "Anil Verma", phone: "+91 90000 00003", pujaName: "Maha Mrityunjaya Jaap", pujaDate: "2026-11-24", amount: 5100, steps: 2 },
  { devoteeName: "Sunita Devi", phone: "+91 90000 00004", pujaName: "Lakshmi Puja", pujaDate: "2026-11-22", amount: 1501, steps: 3 },
  { devoteeName: "Karan Mehta", phone: "+91 90000 00005", pujaName: "Navgraha Shanti Puja", pujaDate: "2026-11-28", amount: 2501, steps: 0 },
];

// Clears the database and creates sample bookings at different steps.
// It uses the real createBooking/advanceBooking, so the messages are real too.
export async function seedData() {
  await connectDB();
  await Booking.deleteMany({});
  await Notification.deleteMany({});
  for (const { steps, ...data } of SAMPLES) {
    const booking = await createBooking(data);
    for (let i = 0; i < steps; i++) await advanceBooking(booking.bookingId);
  }
  return { ok: true, bookings: SAMPLES.length };
}

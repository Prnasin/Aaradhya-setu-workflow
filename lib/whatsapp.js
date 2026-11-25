// MOCK WhatsApp sender - no real message is sent.
// In production this would call the WhatsApp Business API (Meta Cloud API, Twilio, Gupshup...).
// Only this file would change; the rest of the app just calls sendWhatsApp().
export async function sendWhatsApp(phone, message) {
  await new Promise((resolve) => setTimeout(resolve, 200)); // pretend network delay
  console.log(`📱 [Mock WhatsApp] to ${phone}: ${message}`);
  return { id: "mock_" + Date.now(), status: "sent" };
}

import { listNotifications } from "@/lib/bookingService";
import { errorResponse } from "@/lib/http";

// GET /api/notifications -> every message sent, newest first
export async function GET() {
  try {
    return Response.json(await listNotifications());
  } catch (err) {
    return errorResponse(err);
  }
}

import { advanceBooking } from "@/lib/bookingService";
import { errorResponse } from "@/lib/http";

// POST /api/bookings/AS-1001/advance   body: { seenStatus: "Booking Confirmed" }
// -> move to the next step + send the message
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { seenStatus } = await request.json().catch(() => ({})); // body is optional
    return Response.json(await advanceBooking(id, seenStatus));
  } catch (err) {
    return errorResponse(err);
  }
}

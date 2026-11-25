import { getBooking } from "@/lib/bookingService";
import { errorResponse } from "@/lib/http";

// GET /api/bookings/AS-1001 -> one booking + its notification history
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    return Response.json(await getBooking(id));
  } catch (err) {
    return errorResponse(err);
  }
}

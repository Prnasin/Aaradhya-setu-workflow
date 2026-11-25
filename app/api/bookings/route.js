import { listBookings, createBooking } from "@/lib/bookingService";
import { errorResponse } from "@/lib/http";

// GET /api/bookings -> all bookings (newest first)
export async function GET() {
  try {
    return Response.json(await listBookings());
  } catch (err) {
    return errorResponse(err);
  }
}

// POST /api/bookings -> create a booking (sends the "Booking Confirmed" message)
export async function POST(request) {
  try {
    const body = await request.json();
    return Response.json(await createBooking(body), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

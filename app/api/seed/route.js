import { seedData } from "@/lib/bookingService";
import { errorResponse } from "@/lib/http";

// POST /api/seed -> reset the database with sample bookings (for the demo)
export async function POST() {
  try {
    return Response.json(await seedData());
  } catch (err) {
    return errorResponse(err);
  }
}

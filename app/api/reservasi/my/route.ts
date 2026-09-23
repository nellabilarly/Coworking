import { NextResponse } from "next/server";
import { readReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function GET() {
  const reservations = await readReservations();

  return NextResponse.json({
    message: "OK",
    data: reservations,
  });
}

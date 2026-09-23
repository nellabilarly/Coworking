import { NextRequest, NextResponse } from "next/server";
import { readReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservations = await readReservations();
  const reservation = reservations.find((item) => String(item.id) === String(id));

  if (!reservation) {
    return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ message: "OK", data: reservation });
}

import { NextRequest, NextResponse } from "next/server";
import { readReservations, writeReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reservations = await readReservations();
  const index = reservations.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
  }

  reservations[index] = { ...reservations[index], status: "AKTIF", updated_at: new Date().toISOString() };
  await writeReservations(reservations);

  return NextResponse.json({ message: "Tamu berhasil check-in.", data: reservations[index] });
}

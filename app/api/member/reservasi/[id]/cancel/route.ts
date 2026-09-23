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

  const status = String(reservations[index].status || "").toUpperCase();
  if (!["PENDING", "BELUM_DIKONFIRM", "BELUM_DIKONFIRMASI"].includes(status)) {
    return NextResponse.json({ message: "Reservasi tidak dapat dibatalkan pada status ini." }, { status: 409 });
  }

  reservations[index] = {
    ...reservations[index],
    status: "CANCELLED",
    updated_at: new Date().toISOString(),
  };
  await writeReservations(reservations);

  return NextResponse.json({ message: "Reservasi berhasil dibatalkan.", data: reservations[index] });
}

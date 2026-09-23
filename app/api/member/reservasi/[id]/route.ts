import { NextRequest, NextResponse } from "next/server";
import { readReservations } from "@/lib/reservasi-store";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [reservations, spaces] = await Promise.all([readReservations(), readSpaces()]);
  const reservation = reservations.find((item) => String(item.id) === String(id));

  if (!reservation) {
    return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
  }

  const space = spaces.find((item) => String(item.id) === String(reservation.id_space));
  const subtotal = Number(space?.harga_per_jam || 0) * Number(reservation.durasi_jam || 0);

  return NextResponse.json({
    message: "OK",
    data: {
      ...reservation,
      space,
      nama_space: space?.nama_space || reservation.nama_space,
      subtotal,
      total_bayar: Number(reservation.total_bayar || 0) || subtotal,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { readReservations, writeReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const status = String(body?.status || "").trim().toUpperCase();

  if (!status) {
    return NextResponse.json({ message: "Status reservasi wajib diisi." }, { status: 400 });
  }

  const reservations = await readReservations();
  const index = reservations.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return NextResponse.json({ message: "Reservasi tidak ditemukan." }, { status: 404 });
  }

  reservations[index] = {
    ...reservations[index],
    status,
    updated_at: new Date().toISOString(),
  };
  await writeReservations(reservations);

  return NextResponse.json({ message: "Status reservasi berhasil diubah.", data: reservations[index] });
}

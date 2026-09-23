import { NextRequest, NextResponse } from "next/server";
import { readReservations } from "@/lib/reservasi-store";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tanggal = request.nextUrl.searchParams.get("tanggal") || "";

  if (!tanggal) {
    return NextResponse.json({ message: "Parameter tanggal wajib diisi." }, { status: 400 });
  }

  const spaces = await readSpaces();
  const space = spaces.find((item) => String(item.id) === String(id));

  if (!space) {
    return NextResponse.json({ message: "Space tidak ditemukan." }, { status: 404 });
  }

  const reservations = await readReservations();
  const occupiedReservations = reservations.filter((item) => {
    const status = String(item.status || "").toUpperCase();
    return (
      String(item.id_space) === String(id) &&
      item.tanggal === tanggal &&
      !["CANCELLED", "DIBATALKAN", "BATAL", "SELESAI"].includes(status)
    );
  });

  const slots = Array.from({ length: 12 }, (_, index) => {
    const startMinutes = (8 + index) * 60;
    const jam_mulai = `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:00`;
    const occupied = occupiedReservations.some((reservation) => {
      const reservationStart = toMinutes(String(reservation.jam_mulai || "09:00"));
      const reservationEnd = reservationStart + Number(reservation.durasi_jam || 1) * 60;
      return startMinutes >= reservationStart && startMinutes < reservationEnd;
    });

    return { jam_mulai, jam_selesai: `${String(Math.floor((startMinutes + 60) / 60)).padStart(2, "0")}:00`, tersedia: !occupied };
  });

  return NextResponse.json({
    message: "OK",
    data: {
      id_space: space.id,
      tanggal,
      slots,
      reservations: occupiedReservations,
    },
  });
}

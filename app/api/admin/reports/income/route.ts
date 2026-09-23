import { NextRequest, NextResponse } from "next/server";
import { readDiskons } from "@/lib/admin-diskon-store";
import { readReservations } from "@/lib/reservasi-store";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const month = params.get("month") || "";
  const year = params.get("year") || "";
  const [reservations, spaces, diskons] = await Promise.all([
    readReservations(),
    readSpaces(),
    readDiskons(),
  ]);
  const spaceMap = new Map(spaces.map((space) => [String(space.id), space]));
  const diskonMap = new Map(
    diskons.map((diskon) => [String(diskon.kode_diskon || "").toUpperCase(), diskon]),
  );

  const totalPendapatanBersih = reservations.reduce((sum, reservation) => {
    const date = String(reservation.tanggal || "");
    if (month && date.slice(5, 7) !== month.padStart(2, "0")) return sum;
    if (year && date.slice(0, 4) !== year) return sum;
    if (String(reservation.status).toUpperCase().includes("BATAL")) return sum;

    const space = spaceMap.get(String(reservation.id_space));
    const gross = Number(reservation.total_bayar || 0) || Number(space?.harga_per_jam || 0) * Number(reservation.durasi_jam || 0);
    const discount = diskonMap.get(String(reservation.kode_diskon || "").toUpperCase());
    return sum + Math.max(0, gross - Number(discount?.nominal_potongan || 0));
  }, 0);

  return NextResponse.json({ message: "OK", data: { totalPendapatanBersih } });
}

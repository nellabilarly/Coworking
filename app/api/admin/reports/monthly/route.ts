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

  const filtered = reservations.filter((reservation) => {
    const date = String(reservation.tanggal || "");
    const matchesMonth = !month || date.slice(5, 7) === month.padStart(2, "0");
    const matchesYear = !year || date.slice(0, 4) === year;
    return matchesMonth && matchesYear && !String(reservation.status).toUpperCase().includes("BATAL");
  });

  let gross = 0;
  let discountTotal = 0;
  let hours = 0;
  const items = filtered.map((reservation) => {
    const space = spaceMap.get(String(reservation.id_space));
    const duration = Number(reservation.durasi_jam || 0);
    const subtotal = Number(reservation.subtotal || 0) || Number(space?.harga_per_jam || 0) * duration;
    const discount = diskonMap.get(String(reservation.kode_diskon || "").toUpperCase());
    const discountAmount = Number(reservation.potongan_diskon || 0) || (
      discount ? Number(discount.nominal_potongan || 0) : Math.max(0, subtotal - Number(reservation.total_bayar || 0))
    );
    const total = Number(reservation.total_bayar || 0) || Math.max(0, subtotal - discountAmount);
    gross += subtotal;
    discountTotal += discountAmount;
    hours += duration;

    return {
      id: reservation.id,
      nama: space?.nama_space || reservation.nama_space || "Ruang coworking",
      tipe: space?.tipe || "space",
      durasi: `${duration} jam`,
      total,
    };
  });

  return NextResponse.json({
    message: "OK",
    data: {
      bulanText: `${month || ""}/${year || ""}`,
      totalTransaksi: filtered.length,
      jamTerpakai: hours,
      omsetKotor: gross,
      potonganDiskon: discountTotal,
      labaBersih: Math.max(0, gross - discountTotal),
      items,
    },
  });
}

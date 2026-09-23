import { NextRequest, NextResponse } from "next/server";
import { readDiskons } from "@/lib/admin-diskon-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const kodePromo = String(request.nextUrl.searchParams.get("kode_promo") || "").trim().toUpperCase();

  if (!kodePromo) {
    return NextResponse.json({ valid: false, message: "Kode promo wajib diisi." }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const diskon = (await readDiskons()).find(
    (item) => String(item.kode_diskon || "").trim().toUpperCase() === kodePromo,
  );

  if (!diskon) {
    return NextResponse.json({ valid: false, message: "Kode promo tidak ditemukan." }, { status: 404 });
  }

  const status = String(diskon.status || "AKTIF").toUpperCase();
  const inPeriod =
    (!diskon.tanggal_mulai || diskon.tanggal_mulai <= today) &&
    (!diskon.tanggal_berakhir || diskon.tanggal_berakhir >= today);

  if (status !== "AKTIF" || Number(diskon.kuota || 0) <= 0 || !inPeriod) {
    return NextResponse.json({ valid: false, message: "Kode promo sudah tidak berlaku." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    message: "Kode promo valid.",
    data: {
      id: diskon.id,
      kode_promo: diskon.kode_diskon,
      nominal_potongan: Number(diskon.nominal_potongan || 0),
      minimal_transaksi: Number(diskon.minimal_transaksi || 0),
      kuota: Number(diskon.kuota || 0),
      tanggal_mulai: diskon.tanggal_mulai,
      tanggal_berakhir: diskon.tanggal_berakhir,
    },
  });
}

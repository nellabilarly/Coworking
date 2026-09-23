import { NextResponse } from "next/server";
import { readDiskons } from "@/lib/admin-diskon-store";

export const runtime = "nodejs";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const diskons = (await readDiskons()).filter((diskon) => {
    const status = String(diskon.status || "AKTIF").toUpperCase();
    const starts = !diskon.tanggal_mulai || diskon.tanggal_mulai <= today;
    const ends = !diskon.tanggal_berakhir || diskon.tanggal_berakhir >= today;
    return status === "AKTIF" && Number(diskon.kuota || 0) > 0 && starts && ends;
  });

  return NextResponse.json({ message: "OK", data: diskons });
}

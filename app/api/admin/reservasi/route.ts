import { NextRequest, NextResponse } from "next/server";
import { readReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const month = params.get("month") || "";
  const year = params.get("year") || "";
  const status = (params.get("status") || "").toLowerCase();
  const idSpace = params.get("id_space") || "";
  const tanggal = params.get("tanggal") || "";
  const reservations = await readReservations();

  const filtered = reservations.filter((item) => {
    const date = String(item.tanggal || "");
    return (
      (!month || date.slice(5, 7) === month.padStart(2, "0")) &&
      (!year || date.slice(0, 4) === year) &&
      (!status || String(item.status || "").toLowerCase() === status) &&
      (!idSpace || String(item.id_space) === idSpace) &&
      (!tanggal || date === tanggal)
    );
  });

  return NextResponse.json({ message: "OK", data: filtered });
}

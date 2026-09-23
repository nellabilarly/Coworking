import { NextRequest, NextResponse } from "next/server";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tipe = (params.get("tipe") || "").trim().toLowerCase();
  const search = (params.get("search") || "").trim().toLowerCase();
  const minHarga = Number(params.get("min_harga"));
  const maxHarga = Number(params.get("max_harga"));
  const spaces = await readSpaces();

  const filtered = spaces.filter((space) => {
    const price = Number(space.harga_per_jam || 0);
    const name = String(space.nama_space || "").toLowerCase();
    const description = String(space.deskripsi || "").toLowerCase();

    return (
      (!tipe || String(space.tipe || "").toLowerCase() === tipe) &&
      (!search || name.includes(search) || description.includes(search)) &&
      (!Number.isFinite(minHarga) || price >= minHarga) &&
      (!Number.isFinite(maxHarga) || price <= maxHarga)
    );
  });

  return NextResponse.json({ message: "OK", data: filtered });
}

import { NextRequest, NextResponse } from "next/server";
import { normalizeDiskonPayload, readDiskons, writeDiskons } from "@/lib/admin-diskon-store";

export const runtime = "nodejs";

export async function GET() {
  const diskons = await readDiskons();

  return NextResponse.json({
    message: "OK",
    data: diskons,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["kode_diskon", "nominal_potongan", "minimal_transaksi", "kuota"];
    const missing = requiredFields.filter((field) => {
      const value = body?.[field];
      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missing.length > 0) {
      return NextResponse.json(
        { message: `Field wajib belum lengkap: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const numericFields = ["nominal_potongan", "minimal_transaksi", "kuota"];
    const invalidNumericField = numericFields.find((field) => {
      const value = Number(body?.[field]);
      return !Number.isFinite(value) || value < 0;
    });

    if (invalidNumericField) {
      return NextResponse.json(
        { message: `Nilai ${invalidNumericField} harus berupa angka yang valid.` },
        { status: 400 },
      );
    }

    if (body?.tanggal_mulai && body?.tanggal_berakhir && body.tanggal_mulai > body.tanggal_berakhir) {
      return NextResponse.json(
        { message: "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir." },
        { status: 400 },
      );
    }

    const payload = normalizeDiskonPayload({
      ...body,
      id: Date.now(),
    });

    const diskons = await readDiskons();
    diskons.push(payload);
    await writeDiskons(diskons);

    return NextResponse.json(
      {
        message: "Diskon berhasil dibuat.",
        data: payload,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Format data tidak valid." },
      { status: 400 },
    );
  }
}

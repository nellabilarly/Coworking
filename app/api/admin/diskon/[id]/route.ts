import { NextRequest, NextResponse } from "next/server";
import { normalizeDiskonPayload, readDiskons, writeDiskons } from "@/lib/admin-diskon-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const diskons = await readDiskons();
  const item = diskons.find((diskon) => String(diskon.id) === String(id));

  if (!item) {
    return NextResponse.json({ message: "Diskon tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ message: "OK", data: item });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const diskons = await readDiskons();
  const foundIndex = diskons.findIndex((item) => String(item.id) === String(id));

  if (foundIndex === -1) {
    return NextResponse.json({ message: "Diskon tidak ditemukan." }, { status: 404 });
  }

  if (body?.tanggal_mulai && body?.tanggal_berakhir && body.tanggal_mulai > body.tanggal_berakhir) {
    return NextResponse.json(
      { message: "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir." },
      { status: 400 },
    );
  }

  const updated = normalizeDiskonPayload({
    ...diskons[foundIndex],
    ...body,
    id,
  });

  diskons[foundIndex] = updated;
  await writeDiskons(diskons);

  return NextResponse.json({ message: "Diskon berhasil diupdate.", data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const diskons = await readDiskons();
  const filtered = diskons.filter((diskon) => String(diskon.id) !== String(id));

  if (filtered.length === diskons.length) {
    return NextResponse.json({ message: "Diskon tidak ditemukan." }, { status: 404 });
  }

  await writeDiskons(filtered);

  return NextResponse.json({ message: "Diskon berhasil dihapus." });
}

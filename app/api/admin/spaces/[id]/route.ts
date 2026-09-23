import { NextRequest, NextResponse } from "next/server";
import { normalizeSpacePayload, readSpaces, saveUploadedSpaceImage, writeSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spaces = await readSpaces();
  const space = spaces.find((item) => String(item.id) === String(id));

  if (!space) {
    return NextResponse.json({ message: "Space tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ message: "OK", data: space });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await request.formData();
  const raw: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    raw[key] = value;
  }

  const spaces = await readSpaces();
  const foundIndex = spaces.findIndex((item) => String(item.id) === String(id));

  if (foundIndex === -1) {
    return NextResponse.json({ message: "Space tidak ditemukan." }, { status: 404 });
  }

  const uploadedFile = raw.foto instanceof File ? raw.foto : null;
  const savedImage = uploadedFile ? await saveUploadedSpaceImage(uploadedFile) : null;

  const updated = normalizeSpacePayload({
    ...spaces[foundIndex],
    ...raw,
    id,
    foto_url: savedImage || raw.foto_url || raw.fotoUrl || raw.image_url || raw.imageUrl || raw.gambar || spaces[foundIndex].foto_url || null,
    foto: savedImage || raw.foto || spaces[foundIndex].foto || null,
    image: savedImage || raw.image || spaces[foundIndex].image || null,
    photo: savedImage || raw.photo || spaces[foundIndex].photo || null,
  });

  spaces[foundIndex] = updated;
  await writeSpaces(spaces);

  return NextResponse.json({ message: "Space berhasil diupdate.", data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spaces = await readSpaces();
  const filtered = spaces.filter((item) => String(item.id) !== String(id));

  if (filtered.length === spaces.length) {
    return NextResponse.json({ message: "Space tidak ditemukan." }, { status: 404 });
  }

  await writeSpaces(filtered);
  return NextResponse.json({ message: "Space berhasil dihapus." });
}

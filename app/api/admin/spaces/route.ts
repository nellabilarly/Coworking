import { NextRequest, NextResponse } from "next/server";
import {
  normalizeSpacePayload,
  readSpaces,
  saveUploadedSpaceImage,
  writeSpaces,
} from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET() {
  const spaces = await readSpaces();

  return NextResponse.json({
    message: "OK",
    data: spaces,
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const raw: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      raw[key] = value;
    } else {
      raw[key] = value;
    }
  }

  const uploadedFile = raw.foto instanceof File ? raw.foto : null;
  const savedImage = uploadedFile ? await saveUploadedSpaceImage(uploadedFile) : null;

  const payload = normalizeSpacePayload({
    ...raw,
    id: Date.now(),
    foto_url: savedImage || raw.foto_url || raw.fotoUrl || raw.image_url || raw.imageUrl || raw.gambar || null,
    foto: savedImage || raw.foto || null,
    image: savedImage || raw.image || null,
    photo: savedImage || raw.photo || null,
  });

  const spaces = await readSpaces();
  spaces.push(payload);
  await writeSpaces(spaces);

  return NextResponse.json(
    {
      message: "Space berhasil ditambahkan.",
      data: payload,
    },
    { status: 201 },
  );
}

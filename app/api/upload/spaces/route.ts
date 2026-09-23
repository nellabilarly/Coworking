import { NextResponse } from "next/server";
import { saveUploadedSpaceImage } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File foto tidak ditemukan." }, { status: 400 });
  }

  const url = await saveUploadedSpaceImage(file);

  return NextResponse.json({
    message: "Foto berhasil diunggah.",
    data: { url },
  });
}
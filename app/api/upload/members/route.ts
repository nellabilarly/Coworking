import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "File foto tidak ditemukan." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "members");
  await fs.mkdir(uploadDir, { recursive: true });
  const extension = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    message: "Foto berhasil diunggah.",
    data: { url: `/uploads/members/${filename}` },
  });
}
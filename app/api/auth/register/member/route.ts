import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { normalizeMemberPayload, readMembers, writeMembers } from "@/lib/admin-members-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body: Record<string, unknown> = {};
  const photo = formData.get("foto");
  for (const [key, value] of formData.entries()) if (!(value instanceof File)) body[key] = value;

  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const namaMember = String(body.nama_member || "").trim();
  if (!username || !password || !namaMember) return NextResponse.json({ message: "Username, password, dan nama member wajib diisi." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });

  const members = await readMembers();
  if (members.some((item) => item.username.toLowerCase() === username.toLowerCase())) return NextResponse.json({ message: "Username member sudah terdaftar." }, { status: 409 });

  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "members");
    await fs.mkdir(uploadDir, { recursive: true });
    const extension = photo.name.includes(".") ? photo.name.split(".").pop() || "jpg" : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    await fs.writeFile(path.join(uploadDir, filename), Buffer.from(await photo.arrayBuffer()));
    photoUrl = `/uploads/members/${filename}`;
  }

  const member = normalizeMemberPayload({
    ...body,
    id: Date.now(),
    role: "member",
    foto: photoUrl,
    foto_url: photoUrl,
    profile_photo: photoUrl,
    photo: photoUrl,
  });
  members.push(member);
  await writeMembers(members);
  const { password: _password, ...user } = member;
  return NextResponse.json({ message: "Registrasi member berhasil.", data: { user }, user }, { status: 201 });
}
import { NextRequest, NextResponse } from "next/server";
import { normalizeAdminProfile } from "@/lib/auth";
import { readAdminProfile, writeAdminProfile } from "@/lib/admin-profile-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const missing = ["nama_pemilik", "nama_coworking", "telp"].filter((field) => !String(body?.[field] || "").trim());

  if (!username || !password || missing.length) return NextResponse.json({ message: `Data admin belum lengkap${missing.length ? `: ${missing.join(", ")}` : "."}` }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ message: "Password minimal 6 karakter." }, { status: 400 });

  const current = await readAdminProfile();
  if (current.username && current.username.toLowerCase() === username.toLowerCase()) return NextResponse.json({ message: "Username admin sudah terdaftar." }, { status: 409 });

  const saved = { ...current, ...body, id: current.id || Date.now(), username, password, role: "admin" as const, updated_at: new Date().toISOString() };
  await writeAdminProfile(saved);
  const user = normalizeAdminProfile(saved);
  return NextResponse.json({ message: "Registrasi admin berhasil.", data: user, user }, { status: 201 });
}
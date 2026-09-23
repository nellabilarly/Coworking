import { NextRequest, NextResponse } from "next/server";
import { readAdminProfile, writeAdminProfile } from "@/lib/admin-profile-store";

export const runtime = "nodejs";

export async function GET() {
  const profile = await readAdminProfile();
  return NextResponse.json({ message: "OK", data: profile });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const current = await readAdminProfile();
    const updated = {
      ...current,
      ...body,
      role: "admin" as const,
      updated_at: new Date().toISOString(),
    };

    delete updated.password;
    await writeAdminProfile(updated);

    return NextResponse.json({ message: "Profil admin berhasil diperbarui.", data: updated });
  } catch {
    return NextResponse.json(
      { message: "Format data profil tidak valid." },
      { status: 400 },
    );
  }
}

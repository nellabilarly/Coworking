import { NextRequest, NextResponse } from "next/server";
import { normalizeMemberPayload, readMembers, writeMembers } from "@/lib/admin-members-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const members = await readMembers();

  const filtered = !search
    ? members
    : members.filter((member) => {
        const haystack = [
          member.username,
          member.nama_member,
          member.instansi,
          member.telp,
          member.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });

  return NextResponse.json({ message: "OK", data: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["username", "password", "nama_member"];
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

    const members = await readMembers();
    const username = String(body.username).trim();

    const existingIndex = members.findIndex(
      (member) => String(member.username).trim().toLowerCase() === username.toLowerCase(),
    );

    if (existingIndex !== -1) {
      const existing = members[existingIndex];
      const isPlaceholder = !existing.nama_member && !existing.instansi && !existing.alamat && !existing.telp && !existing.foto;

      if (!isPlaceholder) {
        return NextResponse.json({ message: "Username member sudah terdaftar." }, { status: 400 });
      }

      const restored = normalizeMemberPayload({
        ...existing,
        ...body,
        id: existing.id,
        username: existing.username,
      });
      members[existingIndex] = restored;
      await writeMembers(members);

      return NextResponse.json({ message: "Data member berhasil dipulihkan.", data: restored });
    }

    const payload = normalizeMemberPayload({
      ...body,
      id: Date.now(),
      role: body.role || "member",
    });

    members.push(payload);
    await writeMembers(members);

    return NextResponse.json(
      {
        message: "Member berhasil dibuat.",
        data: payload,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Format data member tidak valid." }, { status: 400 });
  }
}

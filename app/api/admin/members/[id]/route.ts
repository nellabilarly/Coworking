import { NextRequest, NextResponse } from "next/server";
import { normalizeMemberPayload, readMembers, writeMembers } from "@/lib/admin-members-store";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await readMembers();
  const member = members.find((item) => String(item.id) === String(id));

  if (!member) {
    return NextResponse.json({ message: "Member tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ message: "OK", data: member });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const members = await readMembers();
  const index = members.findIndex((item) => String(item.id) === String(id));

  if (index === -1) {
    return NextResponse.json({ message: "Member tidak ditemukan." }, { status: 404 });
  }

  const next = normalizeMemberPayload({
    ...members[index],
    ...body,
    id,
    password: body.password ?? members[index].password ?? "",
  });

  members[index] = next;
  await writeMembers(members);

  return NextResponse.json({ message: "Member berhasil diupdate.", data: next });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const members = await readMembers();
  const nextMembers = members.filter((item) => String(item.id) !== String(id));

  if (nextMembers.length === members.length) {
    return NextResponse.json({ message: "Member sudah tidak ada." });
  }

  await writeMembers(nextMembers);

  return NextResponse.json({ message: "Member berhasil dihapus." });
}

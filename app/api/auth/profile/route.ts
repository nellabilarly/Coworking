import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { getCookie } from "@/lib/helper";
import { normalizeMemberPayload, readMembers, writeMembers } from "@/lib/admin-members-store";
import { normalizeAdminProfile } from "@/lib/auth";

export const runtime = "nodejs";

type TokenClaims = {
  id?: string | number;
  sub?: string | number;
  username?: string;
  email?: string;
  role?: string;
  foto?: string | null;
  foto_url?: string | null;
  profile_photo?: string | null;
  photo?: string | null;
  nama_pemilik?: string;
  nama_coworking?: string;
  telp?: string;
  user?: TokenClaims;
};

function decodeToken(token: string): TokenClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function existingPhoto(value?: string | null) {
  if (!value || value.startsWith("data:") || value.startsWith("http")) return value || null;

  const relativePath = value.replace(/^\/+/, "");
  if (!relativePath.startsWith("uploads/members/")) return null;

  try {
    await fs.access(path.join(process.cwd(), "public", relativePath));
    return value;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  const token = bearerToken || (await getCookie("token"));

  if (!token) {
    return NextResponse.json({ message: "Sesi login tidak ditemukan." }, { status: 401 });
  }

  const claims = decodeToken(token);
  const identity = claims?.user || claims;
  const role = String(identity?.role || claims?.role || "").toLowerCase();
  const identityId = identity?.id ?? identity?.sub;
  const identityUsername = String(identity?.username || "").trim().toLowerCase();
  const identityEmail = String(identity?.email || "").trim().toLowerCase();

  if (role === "admin" || role === "administrator" || role === "owner") {
    const profile = normalizeAdminProfile({ ...identity, role: "admin" });
    return NextResponse.json({ message: "OK", data: profile });
  }

  const members = await readMembers();

  const member = members.find((item) => {
    const matchesId = identityId != null && String(item.id) === String(identityId);
    const matchesUsername = identityUsername && item.username.toLowerCase() === identityUsername;
    const matchesEmail = identityEmail && String(item.email || "").toLowerCase() === identityEmail;
    return Boolean(matchesId || matchesUsername || matchesEmail);
  });

  if (!member) {
    const recovered = normalizeMemberPayload({
      ...identity,
      id: identityId ?? Date.now(),
      username: identity?.username || identity?.email || "member",
      role: "member",
      foto: identity?.foto || identity?.foto_url || identity?.profile_photo || identity?.photo,
    });

    const recoveredPhoto = await existingPhoto(recovered.foto);
    recovered.foto = recoveredPhoto;
    recovered.foto_url = recoveredPhoto;
    recovered.profile_photo = recoveredPhoto;
    recovered.photo = recoveredPhoto;

    if (!recovered.username) {
      return NextResponse.json(
        { message: "Profil member tidak ditemukan." },
        { status: 404 },
      );
    }

    members.push(recovered);
    await writeMembers(members);

    const { password: _recoveredPassword, ...recoveredProfile } = recovered;
    return NextResponse.json({ message: "OK", data: recoveredProfile });
  }

  const storedPhoto = member.foto || member.foto_url || identity?.foto || identity?.foto_url || identity?.profile_photo || identity?.photo || null;
  const photo = await existingPhoto(storedPhoto);
  const { password: _password, ...profile } = { ...member, foto: photo, foto_url: photo, profile_photo: photo, photo };
  return NextResponse.json({ message: "OK", data: profile });
}

export async function PUT(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  const token = bearerToken || (await getCookie("token"));
  const claims = token ? decodeToken(token) : null;
  const identity = claims?.user || claims;
  const role = String(identity?.role || claims?.role || "").toLowerCase();

  if (!token || role === "admin" || role === "administrator" || role === "owner") {
    return NextResponse.json({ message: "Profil member tidak dapat diubah." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const members = await readMembers();
  const identityId = identity?.id ?? identity?.sub;
  const identityUsername = String(identity?.username || body?.username || "").trim().toLowerCase();
  const index = members.findIndex((item) =>
    (identityId != null && String(item.id) === String(identityId)) ||
    (identityUsername && String(item.username || "").toLowerCase() === identityUsername),
  );

  if (index === -1) {
    if (!identityUsername) {
      return NextResponse.json({ message: "Username member tidak ditemukan." }, { status: 404 });
    }

    const created = normalizeMemberPayload({
      ...body,
      id: identityId ?? Date.now(),
      username: body?.username || identity?.username,
      role: "member",
    });
    members.push(created);
    await writeMembers(members);
    const { password: _createdPassword, ...createdProfile } = created;
    return NextResponse.json({ message: "Profil member berhasil disimpan.", data: createdProfile });
  }

  const next = normalizeMemberPayload({
    ...members[index],
    ...body,
    id: members[index].id,
    username: members[index].username,
    password: members[index].password,
    role: "member",
  });
  members[index] = next;
  await writeMembers(members);

  const { password: _password, ...profile } = next;
  return NextResponse.json({ message: "Profil berhasil diperbarui.", data: profile });
}

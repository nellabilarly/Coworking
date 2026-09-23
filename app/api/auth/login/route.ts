import { NextRequest, NextResponse } from "next/server";
import { normalizeAdminProfile, normalizeAuthUser } from "@/lib/auth";
import { readAdminProfile } from "@/lib/admin-profile-store";
import { readMembers } from "@/lib/admin-members-store";
import { createAuthToken } from "@/lib/auth-token";
import { setCookie, setRoleCookie } from "@/lib/helper";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username || body?.email || "").trim();
  const password = String(body?.password || "");
  const requestedRole = String(body?.role || "").toLowerCase();
  if (!username || !password) return NextResponse.json({ message: "Username dan password wajib diisi." }, { status: 400 });

  const admin = await readAdminProfile();
  let user: Record<string, unknown> | null = null;
  let role: "admin" | "member" = "member";
  if (admin.username?.toLowerCase() === username.toLowerCase() && admin.password === password) {
    user = normalizeAdminProfile(admin);
    role = "admin";
  } else {
    const member = (await readMembers()).find((item) => item.username.toLowerCase() === username.toLowerCase() && item.password === password);
    if (member) user = normalizeAuthUser(member);
  }

  if (!user || (requestedRole && requestedRole !== role)) return NextResponse.json({ message: "Username, password, atau role tidak sesuai." }, { status: 401 });
  const { password: _password, ...safeUser } = user;
  const token = createAuthToken({ id: String(safeUser.id || username), username: String(safeUser.username || username), role, ...safeUser });
  await setCookie("token", token);
  await setRoleCookie(role);
  return NextResponse.json({ access_token: token, token, user: safeUser, data: { access_token: token, user: safeUser } });
}
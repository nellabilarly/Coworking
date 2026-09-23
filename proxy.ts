import { NextRequest, NextResponse } from "next/server";

function decodeRole(token?: string) {
  if (!token) return "";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const candidates = [
      claims?.role,
      claims?.user?.role,
      claims?.data?.role,
      claims?.data?.user?.role,
      claims?.data?.admin?.role,
      claims?.data?.profile?.role,
    ];
    const role = candidates.find((value) => typeof value === "string" && value.trim());
    return String(role || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  } catch {
    return "";
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = decodeRole(token) || String(request.cookies.get("role")?.value || "").toLowerCase();

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/member")) {
    if (!token || role === "admin" || role === "administrator" || role === "owner") {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "?role=member";
      return NextResponse.redirect(destination);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token || !["admin", "admin_space", "administrator", "owner"].includes(role)) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      destination.search = "?role=admin";
      return NextResponse.redirect(destination);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/member/:path*", "/admin/:path*"],
};

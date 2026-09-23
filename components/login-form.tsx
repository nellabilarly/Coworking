"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, saveAuthSession } from "@/lib/auth";
import { clearAuthSession } from "@/lib/auth";
import { logout } from "@/actions/logout";

export function LoginForm() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");

  const [role, setRole] = useState<"member" | "admin">("member");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("last_login_role");
    const nextRole =
      requestedRole === "admin"
        ? "admin"
        : requestedRole === "member"
          ? "member"
          : storedRole === "admin"
            ? "admin"
            : "member";
    setRole(nextRole);

    const usernameFromQuery = searchParams.get("username");
    if (usernameFromQuery) {
      setUsernameOrEmail(usernameFromQuery);
      setIsMounted(true);
      return;
    }

    const pendingUser = localStorage.getItem("pending_member_user");
    const lastLoginUsername = localStorage.getItem("last_login_username");
    if (!pendingUser) {
      setUsernameOrEmail((current) => current || lastLoginUsername || "");
      setIsMounted(true);
      return;
    }

    try {
      const parsed = JSON.parse(pendingUser) as { username?: string };
      setUsernameOrEmail(
        (current) => current || parsed?.username || lastLoginUsername || "",
      );
    } catch {
      setUsernameOrEmail((current) => current || lastLoginUsername || "");
    } finally {
      setIsMounted(true);
    }
  }, [requestedRole, searchParams]);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const registered = searchParams.get("registered") === "1";
  const effectiveRole = isMounted
    ? role
    : requestedRole === "admin"
      ? "admin"
      : "member";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (typeof window !== "undefined" && usernameOrEmail.trim()) {
      localStorage.setItem("last_login_username", usernameOrEmail.trim());
    }

    try {
      const pendingUser =
        typeof window !== "undefined"
          ? localStorage.getItem("pending_member_user")
          : null;
      const fallbackUser = pendingUser ? JSON.parse(pendingUser) : undefined;

      const selectedLoginRole = (
        role ||
        requestedRole ||
        "member"
      ).toLowerCase() as "admin" | "member";
      const responseData = await loginUser({
        username: usernameOrEmail,
        password: password,
        role: selectedLoginRole,
      });

      const loginFallback =
        selectedLoginRole === "admin"
          ? { username: usernameOrEmail, role: "admin" }
          : fallbackUser;
      await saveAuthSession(responseData, loginFallback, selectedLoginRole);

      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_member_user");
        localStorage.setItem("last_login_role", selectedLoginRole);
      }

      if (selectedLoginRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/member");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearSession() {
    clearAuthSession();
    await logout();
    setUsernameOrEmail("");
    setPassword("");
    setErrorMessage("Sesi lama sudah dibersihkan. Silakan login kembali.");
  }

  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-[#EAEFEF] text-[#25343F] md:grid-cols-[0.9fr_1.1fr]">
      {/* Bagian Kiri */}
      <div className="relative z-20 order-2 flex items-center bg-[#EAEFEF] p-8 sm:p-10 md:order-2 md:min-h-screen md:p-14 lg:p-20">
        <div className="w-full max-w-xl mx-auto">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tighter text-[#25343F]">
                  Welcome back
                </h1>
                <p className="mt-2 text-[#25343F]/70">
                  Masuk untuk mengatur reservasi dan menemukan ruang favoritmu.
                </p>
              </div>
            </div>
          </div>

          {registered && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Akun member berhasil dibuat. Silakan login untuk masuk ke halaman
              member.
            </div>
          )}

          <form className="mt-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <label
                  htmlFor="usernameOrEmail"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Username atau Email
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(event) => setUsernameOrEmail(event.target.value)}
                  placeholder="email@example.com"
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#25343F]"
                  >
                    Password
                  </label>
                  <a
                    href="/forgotpass"
                    className="ml-auto text-xs font-medium text-[#25343F] underline-offset-4 hover:text-[#25343F] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="role"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Pilih Role Pendaftaran
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => {
                    const nextRole = e.target.value as "member" | "admin";
                    setRole(nextRole);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("last_login_role", nextRole);
                    }
                  }}
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full cursor-pointer rounded-full bg-[#44444E] font-semibold text-[#EAEFEF] transition hover:bg-[#25343F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Memproses..." : "Login"}
              </button>
              <a
                href={
                  effectiveRole === "admin"
                    ? "/register/admin"
                    : "/register/member"
                }
                className="flex h-11 w-full cursor-pointer items-center justify-center rounded-full border border-[#25343F] bg-transparent font-medium text-[#25343F] transition hover:bg-[#BFC9D1]"
              >
                Sign Up as {effectiveRole === "admin" ? "Admin" : "Member"}
              </a>
              <button
                type="button"
                onClick={handleClearSession}
                className="h-10 w-full cursor-pointer rounded-full text-xs font-medium text-[#25343F]/65 underline underline-offset-4 transition hover:text-[#25343F]"
              >
                Bersihkan sesi login lama
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bagian Kanan */}
      <div className="relative order-1 flex min-h-90 flex-col justify-between overflow-hidden rounded-t-[2.5rem] bg-[#25343F] p-8 text-[#EAEFEF] sm:p-10 md:order-1 md:rounded-tl-none md:rounded-r-[3.5rem] md:min-h-screen md:p-14 lg:p-20">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#BFC9D1] " />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#BFC9D1]/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#EAEFEF 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <a className="text-2xl font-semibold tracking-[-0.06em]">
            LOCAZYY<span className="text-[#BFC9D1]">.</span>
          </a>
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#BFC9D1]/20 bg-white/10 px-3.5 py-1.5 text-xs text-[#BFC9D1] backdrop-blur-md">
            <span>Coworking Space</span>
          </div>
        </div>
        <div className="relative z-10 my-auto py-12">
          <p className="max-w-md text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
            Your space to work, focus, and grow.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#BFC9D1]/90">
            Kembali ke ruang yang nyaman dan hening, dirancang khusus untuk
            membuat setiap pekerjaanmu terasa lebih ringan.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-sm border-t border-[#BFC9D1]/15 pt-8"></div>
        </div>
      </div>
    </div>
  );
}

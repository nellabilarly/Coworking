"use client";

import { LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth";
import { logout } from "@/actions/logout";

export default function MemberLogoutPage() {
  const router = useRouter();

  async function handleLogout() {
    clearAuthSession();
    await logout();
    router.push("/login?role=member");
  }

  return (
    <div className="member-theme fixed inset-0 z-50 flex items-center justify-center bg-[#19352d]/20 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-[28px] border border-white/40 bg-white/70 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
          aria-label="Kembali"
        >
          <X className="h-4 w-4 text-[#19352d]" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3368A0]/10">
            <LogOut className="h-6 w-6 text-[#3368A0]" />
          </div>
          <h1 className="text-3xl font-bold text-[#19352d]">Logout Member</h1>
        </div>

        <p className="mb-8 text-base leading-7 text-[#19352d]">
          Apakah Anda yakin ingin keluar dari akun member?
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl bg-[#3368A0] py-4 text-base font-semibold text-white shadow-lg shadow-[#3368A0]/20 transition hover:bg-[#29598c]"
        >
          Logout Sekarang
        </button>
      </div>
    </div>
  );
}

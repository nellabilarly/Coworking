"use client";

import { LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth";
import { logout } from "@/actions/logout";

export default function AdminLogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    clearAuthSession();
    await logout();
    router.push("/login?role=admin");
  };

  return (
    <div className="admin-theme fixed inset-0 z-50 flex items-center justify-center bg-[#19352d]/10 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
          aria-label="Tutup konfirmasi logout"
        >
          <X className="h-4 w-4 text-[#541A1A]" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3368A0]/10">
            <LogOut className="h-6 w-6 text-[#3368A0]" />
          </div>
          <h1 className="text-2xl font-bold text-[#19352d]">Logout Admin</h1>
        </div>

        <p className="mb-7 text-base leading-7 text-[#19352d]">
          Apakah Anda yakin ingin keluar dari akun admin?
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-[#D8E1E7] bg-white/60 py-3 text-sm font-semibold text-[#19352d] transition hover:bg-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 rounded-xl bg-[#3368A0] py-3 text-sm font-semibold text-white shadow-lg shadow-[#3368A0]/20 transition hover:bg-[#29598c]"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, UserRoundPlus, XCircle } from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { createMemberAccount } from "@/lib/auth";

export default function AdminCreateMemberPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    nama_member: "",
    instansi: "",
    alamat: "",
    telp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2800);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("username", form.username);
      payload.append("password", form.password);
      payload.append("nama_member", form.nama_member);
      payload.append("instansi", form.instansi);
      payload.append("alamat", form.alamat);
      payload.append("telp", form.telp);

      await createMemberAccount(payload);
      showToast("Member baru berhasil dibuat.", "success");
      setTimeout(() => router.push("/admin/member"), 900);
    } catch (error: any) {
      showToast(error.message || "Gagal membuat member baru.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />
      {toast.show && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-bounce">
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/member"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3368A0]"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-[#EEF2F4] bg-[#F6F8F9] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#3368A0]">
                <UserRoundPlus size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Admin / Member
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  Tambah Member
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Username
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2 grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Nama Member
                  </label>
                  <input
                    value={form.nama_member}
                    onChange={(e) =>
                      setForm({ ...form, nama_member: e.target.value })
                    }
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Instansi
                  </label>
                  <input
                    value={form.instansi}
                    onChange={(e) =>
                      setForm({ ...form, instansi: e.target.value })
                    }
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Alamat
                  </label>
                  <input
                    value={form.alamat}
                    onChange={(e) =>
                      setForm({ ...form, alamat: e.target.value })
                    }
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    No. Telp
                  </label>
                  <input
                    value={form.telp}
                    onChange={(e) => setForm({ ...form, telp: e.target.value })}
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-full bg-[#3E3F29] font-semibold text-[#F1F0E4] transition hover:bg-[#7D8D86] disabled:opacity-60"
              >
                {isLoading ? "Menyimpan..." : "Tambah Member"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

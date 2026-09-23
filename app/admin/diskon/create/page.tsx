"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, TicketPercent, XCircle } from "lucide-react";
import Link from "next/link";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { createDiskon } from "@/lib/admin";

export default function AdminCreateDiskonPage() {
  const [kode, setKode] = useState("");
  const [nominal, setNominal] = useState("");
  const [minBelanja, setMinBelanja] = useState("");
  const [kuota, setKuota] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalBerakhir, setTanggalBerakhir] = useState("");
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
  const router = useRouter();

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2800);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tanggalMulai && tanggalBerakhir && tanggalMulai > tanggalBerakhir) {
        showToast(
          "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir.",
          "error",
        );
        setIsLoading(false);
        return;
      }

      const payload = {
        kode_diskon: kode,
        nominal_potongan: Number(nominal),
        minimal_transaksi: Number(minBelanja),
        kuota: Number(kuota),
        ...(tanggalMulai ? { tanggal_mulai: tanggalMulai } : {}),
        ...(tanggalBerakhir ? { tanggal_berakhir: tanggalBerakhir } : {}),
      };

      await createDiskon(payload);

      showToast("Kode voucher diskon berhasil diaktifkan!", "success");
      setTimeout(() => router.push("/admin/diskon"), 900);
    } catch (error: any) {
      showToast(error.message || "Gagal membuat diskon.", "error");
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
            href="/admin/diskon"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3368A0]"
          >
            <ArrowLeft size={16} /> Kembali ke Voucher
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-[#EEF2F4] bg-[#F6F8F9] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#3368A0]">
                <TicketPercent size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Admin / Diskon
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  Buat Diskon Baru
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#19352d]">
                  Kode Kupon
                </label>
                <input
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: COWORKINGSERU"
                  className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#19352d]">
                  Nominal Potongan (Rp)
                </label>
                <input
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  placeholder="10000"
                  className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#19352d]">
                  Minimal Transaksi (Rp)
                </label>
                <input
                  type="number"
                  value={minBelanja}
                  onChange={(e) => setMinBelanja(e.target.value)}
                  placeholder="50000"
                  className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#19352d]">
                  Kuota Penggunaan
                </label>
                <input
                  type="number"
                  value={kuota}
                  onChange={(e) => setKuota(e.target.value)}
                  placeholder="15"
                  className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#19352d]">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    value={tanggalBerakhir}
                    onChange={(e) => setTanggalBerakhir(e.target.value)}
                    className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-full bg-[#3E3F29] font-semibold text-[#F1F0E4] transition hover:bg-[#7D8D86] disabled:opacity-60"
              >
                {isLoading ? "Memproses Pembuatan..." : "Terbitkan Kode Kupon"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

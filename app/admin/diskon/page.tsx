"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Ticket,
  Trash2,
  Loader2,
  BadgePercent,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { deleteDiskon, getDiskonList } from "@/lib/admin";

export default function AdminDiskonPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  async function loadData() {
    setIsLoading(true);
    const list = await getDiskonList();
    setPromos(Array.isArray(list) ? list : []);
    setIsLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Hapus kode promo ini?")) return;

    try {
      await deleteDiskon(id);
      setPromos((prev) => prev.filter((promo) => promo.id !== id));
      showToast("Kode promo berhasil dihapus.", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal menghapus promo.", "error");
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
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                Admin / Diskon
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                Manajemen Diskon & Promo
              </h1>
            </div>
            <Link
              href="/admin/diskon/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3368A0] px-5 py-2.5 text-sm font-semibold text-[#F2EFE7] transition hover:bg-[#29598c]"
            >
              <Plus size={16} /> Tambah Voucher
            </Link>
          </header>

          {!isLoading && promos.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Total voucher
                </p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  {promos.length}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Aktif
                </p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  {
                    promos.filter(
                      (promo) =>
                        (promo.status || "AKTIF").toUpperCase() !== "NONAKTIF",
                    ).length
                  }
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Kuota total
                </p>
                <p className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  {promos.reduce(
                    (sum, promo) => sum + Number(promo.kuota || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex min-h-52 items-center justify-center rounded-[2rem] border border-[#D8E1E7] bg-white text-sm font-medium text-[#5E6C74]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat promo
              aktif...
            </div>
          ) : promos.length === 0 ? (
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-8 text-center text-sm text-[#5E6C74] shadow-sm">
              Belum ada diskon yang tersedia.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#D8E1E7] bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(25,53,45,0.08)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#3368A0] via-[#7BB7D7] to-[#C8E6D4]" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#3368A0]">
                        <BadgePercent size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#3368A0]">
                          {promo.kode_diskon || promo.kode}
                        </span>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                          Voucher
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="rounded-2xl p-2 text-[#B63A3A] transition hover:bg-[#FCE9E9]"
                      title="Hapus voucher"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                      Potongan
                    </p>
                    <h3 className="mt-2 truncate text-[1.5rem] font-bold leading-none tracking-[-0.06em] text-[#19352d]">
                      Rp{" "}
                      {Number(
                        promo.nominal_potongan || promo.potongan || 0,
                      ).toLocaleString("id-ID")}
                    </h3>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#5E6C74]">
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F9FA] px-3 py-2">
                      <span>Min. transaksi</span>
                      <span className="font-semibold text-[#19352d]">
                        Rp{" "}
                        {Number(
                          promo.minimal_transaksi || promo.minimal || 0,
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F9FA] px-3 py-2">
                      <span>Kuota</span>
                      <span className="font-semibold text-[#19352d]">
                        {promo.kuota || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#EEF2F4] pt-4">
                    <span className="inline-flex rounded-full bg-[#EEF2D8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#596B3C]">
                      {promo.status || "AKTIF"}
                    </span>
                    <Link
                      href={`/admin/diskon/${promo.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-[#D8E1E7] bg-white px-3 py-2 text-sm font-semibold text-[#3368A0] transition hover:border-[#3368A0] hover:bg-[#F5F9FC]"
                    >
                      Lihat detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

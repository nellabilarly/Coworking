"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  PencilLine,
  Save,
  ShieldCheck,
  Ticket,
  XCircle,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { getDiskonById, updateDiskon } from "@/lib/admin";

export default function AdminDetailDiskonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [promo, setPromo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [form, setForm] = useState({
    kode_diskon: "",
    nominal_potongan: "",
    minimal_transaksi: "",
    kuota: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    status: "AKTIF",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast((previous) => ({ ...previous, show: false })),
      2800,
    );
  };

  useEffect(() => {
    async function loadData() {
      const data = await getDiskonById(id);
      setPromo(data);
      setForm({
        kode_diskon: data?.kode_diskon || "",
        nominal_potongan: String(data?.nominal_potongan ?? ""),
        minimal_transaksi: String(data?.minimal_transaksi ?? ""),
        kuota: String(data?.kuota ?? ""),
        tanggal_mulai: data?.tanggal_mulai || "",
        tanggal_berakhir: data?.tanggal_berakhir || "",
        status: String(data?.status || "AKTIF"),
      });
    }

    if (id) loadData();
  }, [id]);

  const handleSave = async () => {
    if (!promo) return;

    if (
      form.tanggal_mulai &&
      form.tanggal_berakhir &&
      form.tanggal_mulai > form.tanggal_berakhir
    ) {
      showToast(
        "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir.",
        "error",
      );
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateDiskon(id, {
        ...form,
        nominal_potongan: Number(form.nominal_potongan),
        minimal_transaksi: Number(form.minimal_transaksi),
        kuota: Number(form.kuota),
        status: form.status,
      });

      setPromo(updated);
      setIsEditing(false);
      showToast("Data diskon berhasil diperbarui.", "success");
    } catch (error: any) {
      showToast(error.message || "Gagal memperbarui data diskon.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!promo)
    return <div className="p-8 text-sm">Memuat informasi voucher...</div>;

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
            <ArrowLeft size={16} /> Kembali ke Daftar Diskon
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#EEF2F4] pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4F5] text-[#3368A0]">
                  <Ticket size={24} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                    Voucher Promo
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#EEF2D8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#596B3C]">
                    {promo.status || "AKTIF"}
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#3368A0] transition hover:border-[#3368A0]"
                >
                  <PencilLine size={16} /> Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Kode voucher
                    </label>
                    <input
                      value={form.kode_diskon}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          kode_diskon: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="NONAKTIF">NONAKTIF</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Nominal potongan
                    </label>
                    <input
                      type="number"
                      value={form.nominal_potongan}
                      onChange={(e) =>
                        setForm({ ...form, nominal_potongan: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Minimal transaksi
                    </label>
                    <input
                      type="number"
                      value={form.minimal_transaksi}
                      onChange={(e) =>
                        setForm({ ...form, minimal_transaksi: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Kuota
                    </label>
                    <input
                      type="number"
                      value={form.kuota}
                      onChange={(e) =>
                        setForm({ ...form, kuota: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Tanggal mulai
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={(e) =>
                        setForm({ ...form, tanggal_mulai: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Tanggal berakhir
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_berakhir}
                      onChange={(e) =>
                        setForm({ ...form, tanggal_berakhir: e.target.value })
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#19352d]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#3368A0] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Save size={16} /> {isSaving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Kode voucher
                    </div>
                    <div className="mt-3 font-mono text-xl font-bold text-[#19352d]">
                      {promo.kode_diskon || promo.kode}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Nominal potongan
                    </div>
                    <div className="mt-3 text-2xl font-bold text-[#2F7B57]">
                      Rp{" "}
                      {Number(
                        promo.nominal_potongan || promo.potongan || 0,
                      ).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Minimal transaksi
                    </div>
                    <div className="mt-3 text-lg font-semibold text-[#19352d]">
                      Rp{" "}
                      {Number(
                        promo.minimal_transaksi || promo.minimal || 0,
                      ).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Sisa kuota
                    </div>
                    <div className="mt-3 text-lg font-semibold text-[#19352d]">
                      {promo.kuota || 0} kuota
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Tanggal mulai
                    </div>
                    <div className="mt-3 text-lg font-semibold text-[#19352d]">
                      {promo.tanggal_mulai || "-"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#F7F9FA] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Tanggal berakhir
                    </div>
                    <div className="mt-3 text-lg font-semibold text-[#19352d]">
                      {promo.tanggal_berakhir || "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] p-4">
                  <div className="flex items-center gap-3 text-[#3368A0]">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-semibold">
                      Status validasi sistem
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#5E6C74]">
                    Voucher ini aktif dan siap dipakai untuk member dengan
                    transaksi di atas minimum yang ditentukan.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

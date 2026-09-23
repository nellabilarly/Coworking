"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  LogIn,
  LogOut,
  User,
  Calendar,
  Armchair,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import {
  checkInReservation,
  checkOutReservation,
  getReservationById,
  updateReservationStatus,
} from "@/lib/admin";

export default function AdminDetailReservasiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showTransaction, setShowTransaction] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getReservationById(id);
      setBooking(data);
    }

    if (id) loadData();
  }, [id]);

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    setIsSaving(true);
    setMessage("");
    try {
      const updated = await action();
      setBooking((previous: any) => ({ ...previous, ...(updated as object) }));
      setMessage(successMessage);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Aksi reservasi gagal.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!booking)
    return (
      <div className="p-8 text-sm">Memuat detail riwayat reservasi...</div>
    );

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/reservasi"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3368A0]"
          >
            <ArrowLeft size={16} /> Kembali ke Reservasi
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Nomor Invoice
                </p>
                <p className="mt-2 font-mono text-sm font-bold text-[#19352d]">
                  LCZ-2026-{booking.id}
                </p>
              </div>
              <span className="inline-flex rounded-full bg-[#EEF2D8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#596B3C]">
                {booking.status || "PENDING"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F9FA] p-4">
                <User className="mt-0.5 h-5 w-5 text-[#3368A0]" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Nama Penyewa
                  </div>
                  <div className="mt-2 text-base font-semibold text-[#19352d]">
                    {booking.nama_member}
                  </div>
                  <div className="text-sm text-[#5E6C74]">
                    {booking.instansi || "SMK Telkom Malang"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F9FA] p-4">
                <Armchair className="mt-0.5 h-5 w-5 text-[#3368A0]" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Fasilitas
                  </div>
                  <div className="mt-2 text-base font-semibold text-[#19352d]">
                    {booking.nama_space}
                  </div>
                  <div className="text-sm text-[#5E6C74] uppercase">
                    {booking.tipe_space || "desk"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F9FA] p-4">
                <Calendar className="mt-0.5 h-5 w-5 text-[#3368A0]" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Tanggal Sewa
                  </div>
                  <div className="mt-2 text-base font-semibold text-[#19352d]">
                    {booking.tanggal}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F9FA] p-4">
                <Clock className="mt-0.5 h-5 w-5 text-[#3368A0]" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Waktu & Durasi
                  </div>
                  <div className="mt-2 text-base font-semibold text-[#19352d]">
                    {booking.jam_mulai} ({booking.durasi_jam || 2} Jam)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] p-4">
              <span className="text-sm font-medium text-[#5E6C74]">
                Total biaya sewa:
              </span>
              <span className="text-2xl font-bold text-[#2F7B57]">
                Rp {Number(booking.total_bayar || 0).toLocaleString("id-ID")}
              </span>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-[#D8E1E7] bg-[#F6F8F9] p-4 text-sm text-[#5E6C74]">
                {message}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <select
                value={String(booking.status || "pending").toLowerCase()}
                disabled={isSaving}
                onChange={(event) =>
                  runAction(
                    () => updateReservationStatus(id, event.target.value),
                    "Status reservasi berhasil diubah.",
                  )
                }
                className="h-11 rounded-full border border-[#D8E1E7] bg-white px-4 text-sm font-semibold text-[#19352d]"
              >
                <option value="pending">Pending</option>
                <option value="disetujui">Disetujui</option>
                <option value="dibatalkan">Dibatalkan</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
              </select>
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  runAction(
                    () => checkInReservation(id),
                    "Tamu berhasil check-in.",
                  )
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#3368A0] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                <LogIn size={16} /> Check-In
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  runAction(
                    () => checkOutReservation(id),
                    "Tamu berhasil check-out.",
                  )
                }
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#3E3F29] px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                <LogOut size={16} /> Check-Out
              </button>
              <button
                type="button"
                onClick={() => setShowTransaction((previous) => !previous)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#D8E1E7] px-4 text-sm font-semibold text-[#5E6C74] transition hover:border-[#3368A0] hover:text-[#3368A0]"
              >
                <Check size={16} /> Transaksi
              </button>
            </div>

            {showTransaction && (
              <div className="mt-4 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Detail transaksi
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#19352d]">
                      Pembayaran reservasi
                    </p>
                  </div>
                  <span className="rounded-full bg-[#EEF2D8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#596B3C]">
                    {booking.status || "PENDING"}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-[#5E6C74]">Invoice</p>
                    <p className="mt-1 font-mono font-semibold text-[#19352d]">
                      LCZ-2026-{booking.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#5E6C74]">Metode pembayaran</p>
                    <p className="mt-1 font-semibold text-[#19352d]">
                      {booking.metode_pembayaran || "Pembayaran otomatis"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#5E6C74]">Total dibayar</p>
                    <p className="mt-1 font-semibold text-[#2F7B57]">
                      Rp{" "}
                      {Number(booking.total_bayar || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

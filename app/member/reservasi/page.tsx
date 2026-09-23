"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Ticket,
  XCircle,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import { cancelReservasi, getMyReservations } from "@/lib/reservasi";
import { getSpaces } from "@/lib/spaces";

export default function MemberReservationsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    try {
      const [data, spaceData] = await Promise.all([
        getMyReservations(),
        getSpaces(),
      ]);
      setOrders(Array.isArray(data) ? data : []);
      setSpaces(Array.isArray(spaceData) ? spaceData : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat reservasi aktif.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCancel(id: number | string) {
    if (!confirm("Apakah kamu yakin ingin membatalkan reservasi ini?")) return;

    try {
      await cancelReservasi(id);
      showToast("Reservasi berhasil dibatalkan.", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal membatalkan reservasi.", "error");
    }
  }

  function getStatusClass(status?: string) {
    const normalized = String(status || "").toUpperCase();
    if (normalized.includes("CANCEL") || normalized.includes("BATAL"))
      return "bg-red-100 text-red-700";
    if (normalized.includes("CONFIRM") || normalized.includes("APPROVE"))
      return "bg-emerald-100 text-emerald-700";
    return "bg-amber-100 text-amber-700";
  }

  function canCancel(status?: string) {
    return ["PENDING", "BELUM_DIKONFIRM", "BELUM_DIKONFIRMASI"].includes(
      String(status || "").toUpperCase(),
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

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
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] bg-[#31584D] p-6 text-white shadow-[0_20px_55px_rgba(38,54,46,0.16)] md:p-8">
            <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full border border-white/15" />
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F3D9A7]">
                  Your stays & sessions
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] md:text-4xl">
                  Perjalanan kerja kamu
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">
                  Semua booking ruang, jadwal, dan pengalaman coworking kamu
                  dalam satu itinerary.
                </p>
              </div>

              <Link
                href="/member/reservasi/create"
                className="relative z-20 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F3D9A7] px-5 py-2.5 text-sm font-bold text-[#26362E] transition hover:bg-white"
              >
                <Ticket size={16} />
                Buat booking
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-10 text-center text-sm font-medium text-[#5E6C74]">
              Memuat daftar reservasi...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#D8E1E7] bg-white p-12 text-center text-sm text-[#5E6C74]">
              Belum ada riwayat reservasi.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((item) => {
                const selectedSpace = spaces.find(
                  (space) =>
                    String(space.id ?? space.id_space) ===
                    String(item.id_space ?? item.space_id ?? item.space?.id),
                );
                const image =
                  item?.space?.foto_url ||
                  item?.space?.foto ||
                  item?.foto_url ||
                  selectedSpace?.foto_url ||
                  selectedSpace?.foto ||
                  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80";

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-[#E5DED2] bg-white shadow-[0_10px_30px_rgba(38,54,46,0.06)] md:grid md:grid-cols-[180px_1fr] md:p-0"
                  >
                    <div className="relative h-36 overflow-hidden bg-[#E8E2D7] md:h-full md:min-h-40">
                      <img
                        src={image}
                        alt={
                          item?.space?.nama_space ||
                          selectedSpace?.nama_space ||
                          "Ruang coworking"
                        }
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#26362E]">
                        Work stay
                      </span>
                    </div>
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold tracking-tight text-[#26362E]">
                              {item?.space?.nama_space ||
                                item?.nama_space ||
                                "Ruang coworking"}
                            </h2>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getStatusClass(item?.status)}`}
                            >
                              {item?.status || "Pending"}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5E6C74]">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} />
                              {item?.tanggal || "-"}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={15} />
                              {item?.jam_mulai || "-"} ({item?.durasi_jam || 0}{" "}
                              jam)
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={15} />
                              {item?.space?.tipe || "Coworking"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/member/reservasi/${item.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
                          >
                            Detail
                          </Link>

                          {canCancel(item?.status) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(item.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              <XCircle size={15} />
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F4] pt-3">
                        <p className="text-sm text-[#5E6C74]">
                          Total pembayaran
                        </p>
                        <p className="text-xl font-bold tracking-tighter text-[#19352d]">
                          Rp{" "}
                          {Number(item?.total_bayar || 0).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

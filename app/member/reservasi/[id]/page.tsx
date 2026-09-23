"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Printer, QrCode, UserRound } from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import { getMyReservations } from "@/lib/reservasi";

export default function MemberReservationDetailPage() {
  const params = useParams();
  const reservationId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reservationId) {
      setLoading(false);
      return;
    }

    async function loadReservation() {
      try {
        const data = await getMyReservations();
        const found = Array.isArray(data)
          ? data.find((item: any) => String(item.id) === String(reservationId))
          : null;

        if (found) {
          setBooking(found);
        } else {
          setError("Reservasi tidak ditemukan.");
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail reservasi.");
      } finally {
        setLoading(false);
      }
    }

    loadReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#19352d]">
        <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white px-6 py-4 text-sm font-medium text-[#5E6C74]">
          Memuat detail reservasi...
        </div>
      </div>
    );
  }

  const bookingImage = booking?.space?.foto_url || booking?.space?.foto || booking?.foto_url || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85";

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#19352d]">
        <div className="max-w-md rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Detail reservasi tidak tersedia."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/member/reservasi"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
            <a href={`/api/reservasi/${reservationId}/e-ticket`} className="inline-flex items-center gap-2 rounded-full bg-[#3368A0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#29598c]">
              <Printer size={16} /> Lihat e-ticket
            </a>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#D8E1E2] bg-white shadow-[0_20px_60px_rgba(38,54,46,0.12)]">
            <div className="relative h-48 overflow-hidden md:h-64">
              <img src={bookingImage} alt={booking?.space?.nama_space || "Workspace"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-[#18352d]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-6 text-white md:left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#F3D9A7]">Your work stay</p>
                <p className="mt-2 text-2xl font-semibold">{booking?.space?.nama_space || booking?.nama_space}</p>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative overflow-hidden bg-[#31584D] p-6 text-white md:p-8">
                <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full border border-white/15" />
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F3D9A7]">Locazyy Boarding Pass</p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#F2EFE7]">
                    {booking.status || "Pending"}
                  </span>
                </div>

                <p className="mt-10 text-[10px] uppercase tracking-[0.18em] text-white/60">Workspace destination</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{booking?.space?.nama_space || booking?.nama_space}</h1>

                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <QrCode size={30} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/60">Gate / e-ticket</p>
                    <p className="mt-1 font-mono text-sm">LCZ-{booking.id}</p>
                  </div>
                </div>
              </div>

              <div className="relative p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-dashed border-[#D8E1E2] pb-5">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7661]">Booking status</p><p className="mt-1 text-sm font-semibold text-[#31584D]">Ready for your workday</p></div>
                  <span className="text-xs font-mono text-[#8A7661]">LCZ-{booking.id}</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F6F8F9] p-4">
                    <div className="flex items-center gap-2 text-[#5E6C74]">
                      <CalendarDays size={16} />
                      <span className="text-xs font-semibold uppercase tracking-[0.14em]">Tanggal</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-[#19352d]">{booking.tanggal || "-"}</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F8F9] p-4">
                    <div className="flex items-center gap-2 text-[#5E6C74]">
                      <Clock3 size={16} />
                      <span className="text-xs font-semibold uppercase tracking-[0.14em]">Waktu</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-[#19352d]">
                      {booking.jam_mulai || "-"} • {booking.durasi_jam || 0} jam
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F8F9] p-4">
                    <div className="flex items-center gap-2 text-[#5E6C74]">
                      <UserRound size={16} />
                      <span className="text-xs font-semibold uppercase tracking-[0.14em]">Pemesan</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-[#19352d]">{booking.nama_member || "Member"}</p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F8F9] p-4">
                    <div className="flex items-center gap-2 text-[#5E6C74]">
                      <QrCode size={16} />
                      <span className="text-xs font-semibold uppercase tracking-[0.14em]">Total</span>
                    </div>
                    <p className="mt-3 text-lg font-bold text-[#19352d]">
                      Rp {Number(booking.total_bayar || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#D8E1E7] bg-[#FDFCFB] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">Catatan</p>
                  <p className="mt-2 text-sm leading-7 text-[#5E6C74]">
                    Reservasi ini akan diproses sesuai jadwal yang sudah dipilih. Silakan datang tepat waktu untuk check-in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

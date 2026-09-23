"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Clock3,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import {
  clearStoredUserPhoto,
  getStoredUser,
  normalizePhotoUrl,
} from "@/lib/auth";
import { getMyReservations } from "@/lib/reservasi";
import { getSpaces } from "@/lib/spaces";

const quickActions = [
  {
    title: "Booking ruang",
    description: "Pilih ruang kerja yang paling nyaman untuk kebutuhanmu.",
    href: "/member/spaces",
    icon: Building2,
    accent: "from-[#7BB7D7] to-[#3368A0]",
  },
  {
    title: "Reservasi saya",
    description: "Lihat jadwal aktif dan status booking terbaru.",
    href: "/member/reservasi",
    icon: CalendarCheck2,
    accent: "from-[#B9D8D4] to-[#5D8B87]",
  },
  {
    title: "Riwayat kunjungan",
    description: "Pantau akumulasi jam penggunaanmu di coworking.",
    href: "/member/history",
    icon: Clock3,
    accent: "from-[#F3D9A7] to-[#C58946]",
  },
];

function formatSpaceType(type?: string) {
  if (type === "desk") return "Personal Desk";
  if (type === "meeting_room") return "Meeting Room";
  if (type === "private_office") return "Private Office";
  return type || "Space";
}

export default function MemberPage() {
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    getSpaces()
      .then((spaces) => setRecommendations(Array.isArray(spaces) ? spaces : []))
      .catch(() => setRecommendations([]));

    getMyReservations()
      .then((reservations) => {
        const items = Array.isArray(reservations) ? reservations : [];
        const activeStatuses = [
          "PENDING",
          "DISETUJUI",
          "AKTIF",
          "CONFIRMED",
          "APPROVED",
        ];

        const upcoming = items
          .filter((item) =>
            activeStatuses.includes(String(item?.status || "").toUpperCase()),
          )
          .slice(0, 2);

        setSchedule(upcoming.length ? upcoming : items.slice(0, 2));
      })
      .catch(() => setSchedule([]));

    const token = localStorage.getItem("token");
    fetch("/api/auth/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (result?.data) {
          setUser({
            ...storedUser,
            ...result.data,
            foto:
              result.data.foto ||
              result.data.profile_photo ||
              storedUser?.foto ||
              null,
            foto_url:
              result.data.foto_url ||
              result.data.foto ||
              storedUser?.foto_url ||
              storedUser?.foto ||
              null,
            profile_photo:
              result.data.profile_photo ||
              result.data.foto ||
              storedUser?.profile_photo ||
              storedUser?.foto ||
              null,
            photo:
              result.data.photo ||
              result.data.foto ||
              storedUser?.photo ||
              storedUser?.foto ||
              null,
          });
        }
      })
      .catch(() => {
        // Keep the locally cached profile when the profile API is unavailable.
      });
  }, []);

  const memberName =
    user?.nama_member || user?.name || user?.username || "Member";
  const rawMemberPhoto = normalizePhotoUrl(
    user?.foto || user?.foto_url || user?.profile_photo || user?.photo || null,
  );
  const memberPhoto =
    typeof window !== "undefined" &&
    typeof rawMemberPhoto === "string" &&
    rawMemberPhoto.startsWith("/")
      ? `${window.location.origin}${rawMemberPhoto}`
      : rawMemberPhoto;

  const reservationSummary = schedule.length
    ? `${schedule.length} reservasi tercatat`
    : "Belum ada reservasi";
  const nearestVisit = schedule[0]
    ? `${schedule[0]?.tanggal || "Tanggal belum tersedia"}`
    : "Belum ada kunjungan";

  const formatScheduleTime = (item: any) => {
    if (!item?.jam_mulai) return "Jadwal belum tersedia";

    const [hour, minute] = String(item.jam_mulai).split(":").map(Number);
    const duration = Number(item?.durasi_jam || 0);
    const endHour = hour + duration;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(minute || 0).padStart(2, "0")}`;

    return `${String(item.jam_mulai).padStart(5, "0")} - ${endTime} WIB`;
  };

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header
            className="relative overflow-hidden rounded-[1.5rem] bg-[#31584D] bg-cover bg-center text-white shadow-[0_18px_50px_rgba(38,54,46,0.16)]"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/1200x/47/dc/3c/47dc3c314d0cc0a1567ad20ea68c3b37.jpg')",
            }}
          >
            <div className="absolute inset-0 bg-[#18352d]/55" />
            <div className="relative flex min-h-80 flex-col justify-end p-5 pb-12 sm:min-h-88 sm:p-7 sm:pb-14 md:min-h-96 md:p-8 md:pb-16">
              <div className="max-w-2xl ">
                <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F3D9A7] sm:text-xs">
                  Your next work escape
                </p>
                <h1 className="max-w-xl text-3xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-4xl md:text-5xl">
                  Selamat datang kembali, {memberName}
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-5 text-white/80 md:text-base md:leading-6">
                  Selamat datang kembali, {memberName}. Pilih suasana, tentukan
                  waktumu, dan buat hari kerja terasa lebih ringan.
                </p>

                <Link
                  href="/member/spaces"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F3D9A7] px-4 py-2.5 text-sm font-bold text-[#26362E] transition hover:bg-white"
                >
                  Cari ruang sekarang <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </header>

          <section className="relative z-10 -mt-16 grid gap-3 rounded-[1.75rem] border border-[#E5DED2] bg-white p-4 shadow-[0_18px_45px_rgba(38,54,46,0.12)] md:grid-cols-3 md:p-5">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7661]">
                Ruang tersedia
              </p>
              <div className="rounded-xl border border-[#E5DED2] bg-[#FCFAF6] px-4 py-3 text-sm font-semibold text-[#26362E]">
                {recommendations.length} ruang aktif
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7661]">
                Reservasi saya
              </p>
              <div className="rounded-xl border border-[#E5DED2] bg-[#FCFAF6] px-4 py-3 text-sm font-semibold text-[#26362E]">
                {reservationSummary}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7661]">
                Kunjungan terdekat
              </p>
              <div className="rounded-xl border border-[#E5DED2] bg-[#FCFAF6] px-4 py-3 text-sm font-semibold text-[#26362E]">
                {nearestVisit}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                    Ruang tersedia
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tighter text-[#19352d]">
                    Pilihan berdasarkan data ruang
                  </h3>
                </div>
                <Link
                  href="/member/spaces"
                  className="text-sm font-semibold text-[#3368A0]"
                >
                  Lihat semua
                </Link>
              </div>

              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <p className="rounded-2xl bg-[#F6F8F9] p-4 text-sm text-[#5E6C74]">
                    Belum ada ruang tersedia.
                  </p>
                ) : (
                  recommendations.slice(0, 3).map((item) => (
                    <Link
                      href={`/member/spaces/${item.id ?? item.id_space ?? item.space_id}`}
                      key={item.id ?? item.id_space ?? item.nama_space}
                      className="flex items-center justify-between rounded-2xl bg-[#F6F8F9] p-4 transition hover:bg-[#EAF4F5]"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-bold text-[#19352d]">
                          {item.nama_space || "Space"}
                        </p>
                        <p className="mt-1 text-sm text-[#5E6C74]">
                          {formatSpaceType(item.tipe)} • {item.kapasitas || "-"}{" "}
                          orang
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#3368A0]">
                          Rp{" "}
                          {Number(item.harga_per_jam || 0).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                        <p className="text-[10px] text-[#5E6C74]">per jam</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#D8E1E7] bg-[#FDFCFB] p-5 shadow-sm md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                Data reservasi
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tighter text-[#19352d]">
                Jadwal kunjungan
              </h3>

              <div className="mt-5 space-y-4">
                {schedule.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D8E1E7] bg-white p-4 text-sm text-[#5E6C74]">
                    Belum ada jadwal reservasi.
                  </div>
                ) : (
                  schedule.map((item) => {
                    const status = String(
                      item?.status || "PENDING",
                    ).toUpperCase();
                    const badgeClass = status.includes("CANCEL")
                      ? "bg-red-100 text-red-700"
                      : status.includes("CONFIRM") ||
                          status.includes("APPROVE") ||
                          status.includes("DISETUJUI")
                        ? "bg-[#EEF2D8] text-[#596B3C]"
                        : "bg-[#EAF4F5] text-[#3368A0]";

                    return (
                      <div
                        key={item?.id ?? `${item?.tanggal}-${item?.jam_mulai}`}
                        className="rounded-2xl border border-[#D8E1E7] bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-[#19352d]">
                            {item?.space?.nama_space ||
                              item?.nama_space ||
                              "Ruang coworking"}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${badgeClass}`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#5E6C74]">
                          {item?.tanggal || "-"} • {formatScheduleTime(item)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

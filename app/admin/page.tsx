"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  ChartColumn,
  TicketPercent,
  TrendingUp,
  Users,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import {
  getAdminReservations,
  getAdminReports,
  getDiskonList,
} from "@/lib/admin";
import { getUsers } from "@/lib/user";
import { getSpaces } from "@/lib/spaces";

const baseModules = [
  {
    title: "Diskon",
    description: "Kelola promo dan potongan khusus untuk member.",
    href: "/admin/diskon",
    icon: TicketPercent,
    accent: "from-[#000000] to-[#412D15]",
  },
  {
    title: "Member",
    description: "Pantau data member, aktivitas, dan status akun.",
    href: "/admin/member",
    icon: Users,
    accent: "from-[#1F150C] to-[#412D15]",
  },
  {
    title: "Reports",
    description: "Lihat performa bisnis, statistik, dan laporan harian.",
    href: "/admin/reports",
    icon: BarChart3,
    accent: "from-[#412D15] to-[#1F150C]",
  },
  {
    title: "Reservasi",
    description: "Kelola jadwal ruang, permintaan, dan pembayaran.",
    href: "/admin/reservasi",
    icon: CalendarCheck2,
    accent: "from-[#000000] to-[#1F150C]",
  },
  {
    title: "Spaces",
    description: "Atur daftar ruang kerja dan fasilitas yang tersedia.",
    href: "/admin/spaces",
    icon: Building2,
    accent: "from-[#1F150C] to-[#000000]",
  },
];

export default function AdminPage() {
  const [modules, setModules] = useState(
    baseModules.map((item) => ({ ...item, value: "0" })),
  );
  const [activity, setActivity] = useState<any[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [newMemberCount, setNewMemberCount] = useState(0);
  const [todayReservations, setTodayReservations] = useState(0);
  const [revenue, setRevenue] = useState(0);
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [members, reservations, promos, spaces, report] =
          await Promise.all([
            getUsers().catch(() => []),
            getAdminReservations().catch(() => []),
            getDiskonList().catch(() => []),
            getSpaces().catch(() => []),
            getAdminReports().catch(() => ({
              totalPendapatan: 0,
              totalTransaksi: 0,
              items: [],
            })),
          ]);

        const safeMembers = Array.isArray(members) ? members : [];
        const safeReservations = Array.isArray(reservations)
          ? reservations
          : [];
        const safePromos = Array.isArray(promos) ? promos : [];
        const safeSpaces = Array.isArray(spaces) ? spaces : [];

        const today = new Date().toISOString().slice(0, 10);
        const reservationToday = safeReservations.filter(
          (item: any) => item?.tanggal === today,
        ).length;
        const pending = safeReservations.filter(
          (item: any) => (item?.status || "").toUpperCase() === "PENDING",
        ).length;
        const revenue = Number(report?.totalPendapatan || 0);
        const occupancyRate = safeSpaces.length
          ? Math.min(
              100,
              Math.round(
                (safeReservations.length / safeSpaces.length) * 20 + 45,
              ),
            )
          : 0;

        setModules([
          { ...baseModules[0], value: `${safePromos.length} Promo` },
          { ...baseModules[1], value: `${safeMembers.length} Aktif` },
          { ...baseModules[2], value: `${report?.items?.length || 0} Laporan` },
          { ...baseModules[3], value: `${safeReservations.length} Booking` },
          { ...baseModules[4], value: `${safeSpaces.length} Ruang` },
        ]);

        const list: any[] = [];

        if (safeReservations[0]) {
          const newestReservation = safeReservations[0];
          list.push({
            title: `${newestReservation.nama_member || "Member"} melakukan reservasi`,
            detail: `${newestReservation.nama_space || "Ruang"} • ${newestReservation.tanggal || "Hari ini"}`,
            time: newestReservation.status || "PENDING",
          });
        }

        if (safePromos[0]) {
          const newestPromo = safePromos[0];
          list.push({
            title: `Promo ${newestPromo.kode_diskon || "baru"}`,
            detail: `Potongan Rp ${Number(newestPromo.nominal_potongan || 0).toLocaleString("id-ID")}`,
            time: newestPromo.status || "AKTIF",
          });
        }

        if (safeMembers[0]) {
          const newestMember = safeMembers[0];
          list.push({
            title: "Member baru terdaftar",
            detail:
              newestMember.nama_member ||
              newestMember.username ||
              "Member baru",
            time: "Baru",
          });
        }

        if (safeSpaces[0]) {
          list.push({
            title: "Katalog ruang tersedia",
            detail: `${safeSpaces.length} space siap dikelola`,
            time: "Live",
          });
        }

        setActivity(list.slice(0, 4));
        setOccupancy(occupancyRate);
        setPendingCount(pending);
        setTodayReservations(reservationToday);
        setRevenue(revenue);
        setNewMemberCount(
          Math.min(99, Math.max(0, Math.round(safeMembers.length * 0.12))),
        );
      } catch {
        setModules(baseModules.map((item) => ({ ...item, value: "0" })));
        setActivity([]);
        setOccupancy(0);
        setPendingCount(0);
        setTodayReservations(0);
        setRevenue(0);
        setNewMemberCount(0);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="overflow-hidden rounded-[2rem] bg-[#000000] p-6 text-[#E1DCC9] shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E1DCC9]/20 bg-[#412D15] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#E1DCC9]">
                  Admin Overview
                </div>
                <h1 className="text-3xl font-bold tracking-[-0.06em] md:text-5xl">
                  Dashboard operasional coworking
                </h1>
                <p className="mt-3 max-w-xl text-sm text-[#E1DCC9]/80 md:text-base">
                  Kelola member, promo, reservasi, ruang, dan laporan secara
                  cepat dalam satu tampilan.
                </p>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {modules.map(
              (
                { title, description, href, icon: Icon, value, accent },
                index,
              ) => (
                <Link
                  key={title}
                  href={href}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-[#D8E1E7] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${accent} text-[#E1DCC9]`}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-medium text-[#5E6C74]">{value}</p>
                  <h2 className="mt-2 text-xl font-bold tracking-tighter text-[#19352d]">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#5E6C74]">
                    {description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#412D15]">
                    Open section
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              ),
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                    Activity
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tighter text-[#19352d]">
                    Aktivitas terbaru
                  </h3>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#412D15] px-3 py-1.5 text-sm font-medium text-[#E1DCC9]">
                  <ChartColumn size={16} />
                  Live
                </div>
              </div>

              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="rounded-2xl bg-[#F6F8F9] p-4 text-sm text-[#5E6C74]">
                    Belum ada aktivitas terbaru.
                  </div>
                ) : (
                  activity.map((item) => (
                    <div
                      key={`${item.title}-${item.time}`}
                      className="flex items-start gap-4 rounded-2xl bg-[#F6F8F9] p-3"
                    >
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#412D15] text-[#E1DCC9]">
                        <TrendingUp size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#19352d]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[#5E6C74]">
                          {item.detail}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[#697B82]">
                        {item.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

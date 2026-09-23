"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Filter,
  Loader2,
  UserRound,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { getAdminReservations } from "@/lib/admin";
import { getSpaces } from "@/lib/spaces";
import { normalizePhotoUrl } from "@/lib/auth";

export default function AdminReservasiPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    status: "",
    id_space: "",
    tanggal: "",
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [list, spaceList] = await Promise.all([
        getAdminReservations(filters),
        getSpaces(),
      ]);
      setReservations(Array.isArray(list) ? list : []);
      setSpaces(Array.isArray(spaceList) ? spaceList : []);
      setIsLoading(false);
    }

    loadData();
  }, [filters]);

  const pendingCount = reservations.filter(
    (item) => String(item.status || "").toUpperCase() === "PENDING",
  ).length;
  const approvedCount = reservations.filter((item) =>
    ["DISETUJUI", "APPROVED", "CONFIRMED"].includes(
      String(item.status || "").toUpperCase(),
    ),
  ).length;
  const activeCount = reservations.filter((item) =>
    ["AKTIF", "CHECK_IN"].includes(String(item.status || "").toUpperCase()),
  ).length;

  const getSpace = (id: string | number) =>
    spaces.find((space) => String(space.id ?? space.id_space) === String(id));

  const getSpaceImage = (space: any) =>
    normalizePhotoUrl(
      space?.foto_url ||
        space?.foto ||
        space?.image_url ||
        space?.image ||
        space?.photo_url ||
        space?.photo ||
        null,
    );

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] bg-[#000000] p-6 text-[#E1DCC9] shadow-[0_20px_60px_rgba(0,0,0,0.2)] md:p-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#E1DCC9]/15" />
            <div className="relative z-10 max-w-2xl">
              <p className="mb-3 inline-flex rounded-full border border-[#E1DCC9]/20 bg-[#412D15] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E1DCC9]">
                Admin / Reservasi
              </p>
              <h1 className="text-3xl font-bold tracking-[-0.06em] md:text-5xl">
                Kelola reservasi
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#E1DCC9]/75">
                Pantau jadwal, status tamu, dan transaksi ruang kerja dari satu
                panel operasional.
              </p>
            </div>
          </header>

          <section className="grid gap-3 rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:grid-cols-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#5E6C74] md:col-span-5">
              <Filter size={16} /> Filter transaksi
            </div>
            <input
              type="month"
              value={
                filters.month && filters.year
                  ? `${filters.year}-${filters.month.padStart(2, "0")}`
                  : ""
              }
              onChange={(event) => {
                const [year, month] = event.target.value.split("-");
                setFilters((previous) => ({
                  ...previous,
                  year: year || "",
                  month: month || "",
                }));
              }}
              className="h-10 rounded-xl border border-[#D8E1E7] px-3 text-sm"
            />
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              className="h-10 rounded-xl border border-[#D8E1E7] px-3 text-sm"
            >
              <option value="">Semua status</option>
              <option value="pending">Pending</option>
              <option value="disetujui">Disetujui</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
            <input
              value={filters.id_space}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  id_space: event.target.value,
                }))
              }
              placeholder="ID space"
              className="h-10 rounded-xl border border-[#D8E1E7] px-3 text-sm"
            />
            <input
              type="date"
              value={filters.tanggal}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  tanggal: event.target.value,
                }))
              }
              className="h-10 rounded-xl border border-[#D8E1E7] px-3 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setFilters({
                  month: "",
                  year: "",
                  status: "",
                  id_space: "",
                  tanggal: "",
                })
              }
              className="h-10 rounded-xl border border-[#D8E1E7] px-3 text-sm font-semibold text-[#3368A0]"
            >
              Reset
            </button>
          </section>

          {isLoading ? (
            <div className="flex min-h-52 items-center justify-center rounded-[2rem] border border-[#D8E1E7] bg-white text-sm font-medium text-[#5E6C74]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat
              reservasi...
            </div>
          ) : reservations.length === 0 ? (
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-8 text-center text-sm text-[#5E6C74] shadow-sm">
              Belum ada data reservasi.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reservations.map((item) => {
                const space = getSpace(item.id_space);
                const image = getSpaceImage(space);
                const status = String(item.status || "PENDING").toUpperCase();
                const statusTone = status.includes("BATAL")
                  ? "bg-rose-100 text-rose-700"
                  : status.includes("SELESAI")
                    ? "bg-slate-100 text-slate-700"
                    : status.includes("SETUJUI") || status.includes("APPROV")
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[#F7E9D8] text-[#A5662E]";

                return (
                  <Link
                    href={`/admin/reservasi/${item.id}`}
                    key={item.id}
                    className="group block min-w-0 overflow-hidden rounded-[1.5rem] border border-[#D8E1E7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-36 overflow-hidden bg-[#EAF4F5]">
                      {image ? (
                        <img
                          src={image}
                          alt={space?.nama_space || "Ruang coworking"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#edf5f8,#dfeaec_45%,#cbd9df)] text-[#3368A0]">
                          <Building2 size={34} />
                        </div>
                      )}
                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusTone}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="flex h-full flex-col gap-4">
                      <div className="p-4 pt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5E6C74]">
                          {space?.tipe || "Workspace"}
                        </p>
                        <h2 className="mt-1 truncate text-lg font-bold tracking-tighter text-[#19352d]">
                          {space?.nama_space ||
                            item.nama_space ||
                            "Ruang coworking"}
                        </h2>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF4F5] text-[#3368A0]">
                            <UserRound size={15} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#19352d]">
                              {item.nama_member || item.member || "Member"}
                            </p>
                            <p className="truncate text-xs text-[#5E6C74]">
                              {item.instansi || "Reservasi member"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-[#5E6C74]">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />{" "}
                            {item.tanggal || "Hari ini"}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock3 size={15} /> {item.jam_mulai || "10:00"} -{" "}
                            {item.durasi_jam
                              ? `${item.durasi_jam} jam`
                              : "2 jam"}
                          </span>
                        </div>
                      </div>

                      <span className="mt-auto inline-flex w-fit rounded-full bg-[#EAF4F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3368A0]">
                        Buka detail reservasi
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

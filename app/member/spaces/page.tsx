"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import { getSpaces } from "@/lib/spaces";

const getSpaceId = (space: any) =>
  space?.id ?? space?.id_space ?? space?.space_id;

function formatType(type?: string) {
  if (!type) return "Space";
  if (type === "desk") return "Personal Desk";
  if (type === "meeting_room") return "Meeting Room";
  if (type === "private_office") return "Private Office";
  return type;
}

export default function MemberSpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceOrder, setPriceOrder] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSpaces() {
      try {
        const data = await getSpaces();
        setSpaces(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat katalog ruang.");
      } finally {
        setLoading(false);
      }
    }

    loadSpaces();
  }, []);

  const filteredSpaces = spaces
    .filter((space) => {
      const name = String(space?.nama_space || "").toLowerCase();
      const matchesSearch = name.includes(search.trim().toLowerCase());
      const matchesType = typeFilter === "all" || space?.tipe === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((first, second) => {
      if (priceOrder === "low") {
        return Number(first?.harga_per_jam || 0) - Number(second?.harga_per_jam || 0);
      }
      if (priceOrder === "high") {
        return Number(second?.harga_per_jam || 0) - Number(first?.harga_per_jam || 0);
      }
      return 0;
    });

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="rounded-[2rem] bg-[#31584D] p-6 text-white shadow-[0_20px_55px_rgba(38,54,46,0.16)] md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Locazyy / Work stays
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] md:text-4xl">
                  Ruang untuk bekerja dengan tenang
                </h1>
              </div>

              <Link
                href="/member/reservasi/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F3D9A7] px-5 py-2.5 text-sm font-bold text-[#26362E] transition hover:bg-white"
              >
                <Sparkles size={16} />
                Booking baru
              </Link>
            </div>
          </header>

          {!loading && !error && spaces.length > 0 && (
            <section className="grid gap-3 rounded-2xl border border-[#D8E1E7] bg-white p-4 shadow-sm md:grid-cols-[1.5fr_1fr_1fr]">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5E6C74]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama ruang..."
                  className="h-11 w-full rounded-xl border border-[#D8E1E7] bg-[#F9FBFC] pl-10 pr-3 text-sm text-[#19352d] outline-none focus:border-[#3368A0]"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-11 rounded-xl border border-[#D8E1E7] bg-[#F9FBFC] px-3 text-sm text-[#19352d] outline-none focus:border-[#3368A0]"
              >
                <option value="all">Semua tipe ruang</option>
                <option value="desk">Personal Desk</option>
                <option value="meeting_room">Meeting Room</option>
                <option value="private_office">Private Office</option>
              </select>
              <select
                value={priceOrder}
                onChange={(event) => setPriceOrder(event.target.value)}
                className="h-11 rounded-xl border border-[#D8E1E7] bg-[#F9FBFC] px-3 text-sm text-[#19352d] outline-none focus:border-[#3368A0]"
              >
                <option value="default">Urutan harga</option>
                <option value="low">Harga terendah</option>
                <option value="high">Harga tertinggi</option>
              </select>
            </section>
          )}

          {loading ? (
            <div className="rounded-[2rem] border border-[#D8E1E7] bg-white p-10 text-center text-sm font-medium text-[#5E6C74]">
              Sedang memuat katalog ruang...
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : spaces.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#D8E1E7] bg-white p-10 text-center text-sm text-[#5E6C74]">
              Belum ada ruang tersedia saat ini.
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-[#D8E1E7] bg-white p-10 text-center text-sm text-[#5E6C74]">
              Ruang yang sesuai filter tidak ditemukan.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {filteredSpaces.map((space) => {
                const id = getSpaceId(space);
                const image =
                  space?.foto_url ||
                  space?.foto ||
                  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

                return (
                  <div
                    key={id ?? `${space?.nama_space}-${Math.random()}`}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5DED2] bg-white shadow-[0_12px_35px_rgba(38,54,46,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-36 overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={space?.nama_space || "Space coworking"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#19352d] backdrop-blur-sm">
                        {formatType(space?.tipe)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="truncate text-base font-bold tracking-[-0.04em] text-[#19352d]">
                            {space?.nama_space || "Space"}
                          </h2>
                          <div className="mt-2 flex items-center gap-2 text-xs text-[#5E6C74]">
                            <MapPin size={14} />
                            Lokasi Coworking
                          </div>
                        </div>
                        <div className="rounded-full bg-[#EAF4F5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3368A0]">
                          Ready
                        </div>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-[#3368A0]">
                        Rp{" "}
                        {Number(space?.harga_per_jam || 0).toLocaleString(
                          "id-ID",
                        )}{" "}
                        / jam
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#5E6C74]">
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {space?.kapasitas || "-"} orang
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} />
                          {formatType(space?.tipe)}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#5E6C74]">
                        {space?.deskripsi ||
                          "Ruang kerja nyaman dengan fasilitas pendukung untuk produktivitas harian."}
                      </p>

                      <div className="mt-4 flex gap-2 pt-3">
                        <Link
                          href={`/member/spaces/${id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2.5 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
                        >
                          Detail
                        </Link>
                        <Link
                          href={`/member/reservasi/create?id_space=${id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#19352d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3E3F29]"
                        >
                          Booking <ArrowRight size={16} />
                        </Link>
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

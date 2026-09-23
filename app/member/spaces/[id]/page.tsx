"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock3,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import { getSpaceById } from "@/lib/spaces";

function formatType(type?: string) {
  if (!type) return "Space";
  if (type === "desk") return "Personal Desk";
  if (type === "meeting_room") return "Meeting Room";
  if (type === "private_office") return "Private Office";
  return type;
}

export default function MemberSpaceDetailPage() {
  const params = useParams();
  const spaceId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!spaceId) {
      setError("ID ruang tidak valid.");
      setLoading(false);
      return;
    }

    const numericId = Number(spaceId);
    if (Number.isNaN(numericId)) {
      setError("ID ruang tidak valid.");
      setLoading(false);
      return;
    }

    async function loadSpace() {
      try {
        const data = await getSpaceById(numericId);
        setSpace(data || null);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail ruang.");
      } finally {
        setLoading(false);
      }
    }

    loadSpace();
  }, [spaceId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#19352d]">
        <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white px-6 py-4 text-sm font-medium text-[#5E6C74]">
          Memuat detail ruang...
        </div>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] p-4 text-[#19352d]">
        <div className="max-w-md rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || "Ruang yang kamu cari tidak ditemukan."}
        </div>
      </div>
    );
  }

  const image =
    space?.foto_url ||
    space?.foto ||
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/member/spaces"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[#E5DED2] bg-white shadow-[0_20px_60px_rgba(38,54,46,0.12)]">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative h-full min-h-[320px]">
                <img
                  src={image}
                  alt={space?.nama_space}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#19352d] backdrop-blur-sm">
                  {formatType(space?.tipe)}
                </div>
              </div>

              <div className="bg-[#FCFAF6] p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7661]">
                  Stay productive
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#19352d] md:text-4xl">
                  {space?.nama_space}
                </h1>

                <div className="mt-4 flex items-center gap-4 text-sm text-[#5E6C74]">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={16} />
                    {space?.kapasitas || "-"} orang
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={16} />
                    Flexible booking
                  </span>
                </div>

                <div className="mt-5 rounded-2xl bg-[#EAF4F5] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3368A0]">
                    Harga
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#19352d]">
                    Rp{" "}
                    {Number(space?.harga_per_jam || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-[#5E6C74]">per jam</p>
                </div>

                <div className="mt-6 space-y-3 text-sm text-[#5E6C74]">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#3368A0]" />
                    {formatType(space?.tipe)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#3368A0]" />
                    Coworking lounge area
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/member/reservasi/create?id_space=${spaceId}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#19352d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3E3F29]"
                  >
                    Booking sekarang
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/member/spaces"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-5 py-3 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
                  >
                    Lihat ruang lain
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-[#D8E1E7] bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-2 text-[#3368A0]">
              <Sparkles size={18} />
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                Deskripsi
              </p>
            </div>

            <p className="mt-4 text-base leading-8 text-[#5E6C74]">
              {space?.deskripsi ||
                "Ruang kerja ini dirancang untuk mendukung fokus dan produktivitas dengan tata letak nyaman, pencahayaan yang baik, dan dukungan fasilitas dasar coworking yang siap digunakan."}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

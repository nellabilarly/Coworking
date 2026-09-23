"use client";

import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Eye,
  PencilLine,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const SPACE_CACHE_KEY = "coworking_admin_spaces";

const readSpaceCache = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SPACE_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSpaceCache = (data: any[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SPACE_CACHE_KEY, JSON.stringify(data));
  } catch {
    // no-op if storage is unavailable
  }
};

export default function SpacesAdmin() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast((previous) => ({ ...previous, show: false })),
      2800,
    );
  };

  useEffect(() => {
    const cached = readSpaceCache();
    if (cached.length) {
      setSpaces(cached);
    }

    const loadSpaces = async () => {
      try {
        const res = await fetch("/api/admin/spaces", {
          headers: {
            "x-maker-key": "mk_f4f26052503841eb8f95dee73e036726",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          cache: "no-store",
        });
        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          setSpaces(cached);
          return;
        }

        const normalized = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        setSpaces(normalized);
        writeSpaceCache(normalized);
      } catch {
        setSpaces(cached);
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
    window.addEventListener("pageshow", loadSpaces);

    return () => window.removeEventListener("pageshow", loadSpaces);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah kamu yakin ingin menghapus data space ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/spaces/${id}`, {
        method: "DELETE",
        headers: {
          "x-maker-key": "mk_f4f26052503841eb8f95dee73e036726",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(result?.message || "Gagal menghapus data.", "error");
        return;
      }

      const nextSpaces = (spaces || []).filter(
        (space: any) => Number(space.id) !== Number(id),
      );

      setSpaces(nextSpaces);
      writeSpaceCache(nextSpaces);
      showToast("Space berhasil dihapus!", "success");
    } catch {
      showToast("Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  const typeStyles: Record<string, string> = {
    desk: "bg-[#EAF4F5] text-[#3368A0]",
    meeting_room: "bg-[#EEF2D8] text-[#596B3C]",
    private_office: "bg-[#F7E9D8] text-[#A5662E]",
  };

  const formatType = (tipe: string) => {
    if (tipe === "desk") return "Personal Desk";
    if (tipe === "meeting_room") return "Meeting Room";
    if (tipe === "private_office") return "Private Office";
    return tipe;
  };

  const getSpaceImage = (space: any) => {
    const normalizeImageUrl = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return "";

      if (
        /^https?:\/\//i.test(trimmed) ||
        /^data:image\//i.test(trimmed) ||
        /^blob:/i.test(trimmed)
      ) {
        return trimmed;
      }

      if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
      }

      if (/^(?:\/)?uploads\//i.test(trimmed)) {
        return `http://localhost:3000/${trimmed.replace(/^\//, "")}`;
      }

      if (/^(?:\/)?images\//i.test(trimmed)) {
        return `http://localhost:3000/${trimmed.replace(/^\//, "")}`;
      }

      if (/^(?:\/)?(?:spaces|members)\//i.test(trimmed)) {
        return `http://localhost:3000/uploads/${trimmed.replace(/^\//, "")}`;
      }

      if (trimmed.startsWith("/")) {
        return `${window.location.origin}${trimmed}`;
      }

      return trimmed;
    };

    const flatten = (value: any): string[] => {
      if (!value) return [];
      if (typeof value === "string") return [value];
      if (Array.isArray(value)) {
        return value.flatMap((item) => flatten(item));
      }
      if (typeof value === "object") {
        return Object.values(value).flatMap((item) => flatten(item));
      }
      return [];
    };

    const directCandidates = [
      space?.foto_url,
      space?.fotoUrl,
      space?.image_url,
      space?.imageUrl,
      space?.photo_url,
      space?.photoUrl,
      space?.gambar,
      space?.gambar_url,
      space?.gambarUrl,
      space?.path,
      space?.url,
      space?.file_url,
      space?.fileUrl,
      space?.foto,
      space?.image,
      space?.photo,
      space?.file,
      space?.images,
      space?.foto_path,
      space?.image_path,
      space?.photo_path,
      space?.gambar_path,
    ];

    const allStrings = [...directCandidates, ...flatten(space)]
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizeImageUrl(item));

    const imageLike = allStrings.find((item) => {
      if (!item) return false;
      return (
        /^https?:\/\//i.test(item) ||
        /^data:image\//i.test(item) ||
        /^blob:/i.test(item) ||
        /\/uploads\//i.test(item) ||
        /\/images\//i.test(item) ||
        /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(item)
      );
    });

    return imageLike || "";
  };

  const totalCapacity = spaces.reduce(
    (sum, space) => sum + Number(space.kapasitas || 0),
    0,
  );
  const averagePrice = spaces.length
    ? Math.round(
        spaces.reduce(
          (sum, space) => sum + Number(space.harga_per_jam || 0),
          0,
        ) / spaces.length,
      )
    : 0;

  return (
    <div className="space-y-5">
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

      {loading ? (
        <div className="py-12 text-center text-sm font-medium text-[#5E6C74]">
          Sedang memuat data...
        </div>
      ) : spaces.length === 0 ? (
        <div className="py-12 text-center text-sm font-medium text-[#5E6C74]">
          Belum ada data space. Silakan tambahkan ruang baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {spaces.map((space: any) => {
            const image = getSpaceImage(space);

            return (
              <div
                key={space.id}
                className="group overflow-hidden rounded-[1.5rem] border border-[#dfe7eb] bg-[#f6f6f3] p-2.5 shadow-[0_8px_20px_rgba(24,35,31,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(24,35,31,0.08)]"
              >
                <div className="relative overflow-hidden rounded-[1.2rem]">
                  {image ? (
                    <img
                      src={image}
                      alt={space.nama_space || "Space"}
                      className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[radial-gradient(circle_at_top,#edf5f8,#dfeaec_40%,#d4dfe6)] text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                      Space
                    </div>
                  )}
                  <span
                    className={`absolute left-2.5 top-2.5 inline-flex rounded-[0.7rem] border border-white/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] shadow-sm ${typeStyles[space.tipe] || "bg-[#EAF4F5] text-[#3368A0]"}`}
                  >
                    {formatType(space.tipe)}
                  </span>
                </div>

                <div className="mt-3 space-y-3 px-1 pb-1">
                  <h3 className="text-[1.35rem] font-bold leading-none tracking-[-0.06em] text-[#1f2d2b]">
                    {space.nama_space}
                  </h3>

                  <p className="text-sm text-[#5E6C74] line-clamp-2">
                    {space.deskripsi || "ac"}
                  </p>

                  <div className="flex items-center">
                    <span className="inline-flex items-center rounded-full bg-[#dfeef2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3368A0]">
                      {space.kapasitas || 0} orang
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#e2e7eb] pt-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                        Harga
                      </p>
                      <p className="mt-1 text-[1.45rem] font-bold leading-none tracking-[-0.06em] text-[#1f2d2b]">
                        Rp{" "}
                        {Number(space.harga_per_jam || 0).toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#19352d] text-white shadow-sm transition hover:bg-[#2d4b45]"
                      aria-label="Hapus space"
                      onClick={() => handleDelete(space.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/admin/spaces/${space.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-2.5 py-2.5 text-xs font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
                    >
                      <Eye size={14} />
                      Detail
                    </Link>

                    <Link
                      href={`/admin/spaces/${space.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3368A0] px-2.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#29598c]"
                    >
                      <PencilLine size={14} />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

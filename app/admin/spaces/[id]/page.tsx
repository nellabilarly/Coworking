"use client";

import AdminSidebar from "@/components/sidebar/sidebaradmin";
import {
  ArrowLeft,
  Camera,
  Building2,
  CheckCircle2,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_SPACE_IMAGE =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

export default function SpaceEditPage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [formData, setFormData] = useState({
    nama_space: "",
    harga_per_jam: "",
    tipe: "desk",
    kapasitas: "",
    deskripsi: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string>(DEFAULT_SPACE_IMAGE);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!spaceId) {
      setLoading(false);
      return;
    }

    const BASE_URL =
      (typeof window !== "undefined" && window.location?.origin) ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL_CO ||
      "http://localhost:3000";

    fetch(`${BASE_URL}/api/admin/spaces/${spaceId}`, {
      headers: {
        "x-maker-key": "mk_f4f26052503841eb8f95dee73e036726",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      cache: "no-store",
    })
      .then(async (res) => {
        const resData = await res.json().catch(() => ({}));
        const payload = resData?.data ?? resData;

        if (res.ok && payload) {
          const rawImageValue = [
            payload.foto_url,
            payload.fotoUrl,
            payload.image_url,
            payload.imageUrl,
            payload.photo_url,
            payload.photoUrl,
            payload.gambar,
            payload.gambar_url,
            payload.gambarUrl,
            payload.foto,
            payload.image,
            payload.photo,
            payload.file,
            payload.path,
            payload.url,
          ].find(
            (value) => typeof value === "string" && value.trim().length > 0,
          );

          const normalizedImage = rawImageValue
            ? rawImageValue.startsWith("/uploads/") ||
              rawImageValue.startsWith("/images/")
              ? `http://localhost:3000${rawImageValue}`
              : rawImageValue
            : DEFAULT_SPACE_IMAGE;

          setFormData({
            nama_space: payload.nama_space || "",
            harga_per_jam: payload.harga_per_jam || "",
            tipe: payload.tipe || "desk",
            kapasitas: payload.kapasitas || "",
            deskripsi: payload.deskripsi || "",
          });
          setCurrentImage(normalizedImage);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [spaceId]);

  useEffect(() => {
    if (!foto) {
      setPreviewObjectUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(foto);
    setPreviewObjectUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [foto]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!spaceId) {
      showToast("ID space tidak valid.", "error");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("nama_space", formData.nama_space);
    dataToSend.append("harga_per_jam", formData.harga_per_jam);
    dataToSend.append("tipe", formData.tipe);
    dataToSend.append("kapasitas", formData.kapasitas);
    dataToSend.append("deskripsi", formData.deskripsi);
    if (foto) dataToSend.append("foto", foto);

    const BASE_URL =
      (typeof window !== "undefined" && window.location?.origin) ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL_CO ||
      "http://localhost:3000";

    const res = await fetch(`${BASE_URL}/api/admin/spaces/${spaceId}`, {
      method: "PUT",
      headers: {
        "x-maker-key": "mk_f4f26052503841eb8f95dee73e036726",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: dataToSend,
    });

    if (res.ok) {
      showToast("Data space berhasil diperbarui!", "success");
      setTimeout(() => router.push("/admin/spaces"), 900);
    } else {
      showToast("Gagal memperbarui data.", "error");
    }
  };

  const previewImage = previewObjectUrl || currentImage;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#19352d]">
        <div className="rounded-[1.5rem] border border-[#D8E1E7] bg-white px-6 py-4 text-sm font-medium text-[#5E6C74]">
          Sedang mengambil data space...
        </div>
      </div>
    );
  }

  if (!spaceId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#19352d]">
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-700">
          ID space tidak ditemukan.
        </div>
      </div>
    );
  }

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
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                Admin / Spaces
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                Edit Space
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/spaces")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2.5 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="overflow-hidden rounded-[2rem] bg-linear-to-br from-[#3368A0] via-[#2E5C8A] to-[#19352d] p-6 text-[#F2EFE7] shadow-[0_20px_60px_rgba(51,104,160,0.2)]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <Building2 size={28} />
              </div>

              <div className="mt-6">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDEAF6]">
                  <Sparkles size={12} />
                  Update workspace
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.06em]">
                  Perbarui data ruang agar lebih akurat.
                </h2>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                <img
                  src={previewImage}
                  alt={formData.nama_space || "Preview ruang"}
                  className="h-56 w-full object-cover"
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#DDEAF6]">
                    Nama ruang
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formData.nama_space || "Belum diisi"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#DDEAF6]">
                    Tipe
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formData.tipe === "desk"
                      ? "Personal Desk"
                      : formData.tipe === "meeting_room"
                        ? "Meeting Room"
                        : "Private Office"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-[#DDEAF6]">
                    Harga
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Rp{" "}
                    {Number(formData.harga_per_jam || 0).toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleUpdate}
              className="rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:p-7"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Nama Space
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_space}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, nama_space: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Harga per Jam (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.harga_per_jam}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        harga_per_jam: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Kapasitas Maksimal
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.kapasitas}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, kapasitas: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Tipe Space
                  </label>
                  <select
                    value={formData.tipe}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, tipe: e.target.value })
                    }
                  >
                    <option value="desk">Personal Desk</option>
                    <option value="meeting_room">Meeting Room</option>
                    <option value="private_office">Private Office</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Deskripsi & Fasilitas
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.deskripsi}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Ganti Foto Ruangan (Opsional)
                  </label>
                  <div className="rounded-[1.5rem] border-2 border-dashed border-[#D8E1E7] bg-[#F9FBFC] p-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-[#D8E1E7] bg-white px-4 py-8 text-center transition hover:border-[#3368A0] hover:bg-[#F3F8FC]">
                      {previewImage && (
                        <div className="overflow-hidden rounded-[1rem] border border-[#D8E1E7] bg-[#F5F7F8]">
                          <img
                            src={previewImage}
                            alt="Preview ruang"
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      )}

                      {!previewImage && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF4F5] text-[#3368A0]">
                          <Camera size={20} />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-[#19352d]">
                          {foto ? foto.name : "Upload foto ruangan"}
                        </p>
                        <p className="mt-1 text-xs text-[#5E6C74]">
                          PNG, JPG, atau WEBP maksimal 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setFoto(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/admin/spaces")}
                  className="rounded-full border border-[#D8E1E7] bg-white px-5 py-2.5 text-sm font-semibold text-[#19352d] transition hover:border-[#B6C0C7]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#3368A0] px-5 py-2.5 text-sm font-semibold text-[#F2EFE7] transition hover:bg-[#29598c]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

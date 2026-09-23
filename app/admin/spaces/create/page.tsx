"use client";

import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { ArrowLeft, Camera, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SpaceCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama_space: "",
    harga_per_jam: "",
    tipe: "desk",
    kapasitas: "",
    deskripsi: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 State Baru untuk Pengontrol Toast Notification
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // 🌟 Fungsi untuk Memicu Toast Muncul dan Menghilang Otomatis
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000); // Toast akan otomatis hilang dalam 3 detik
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setFoto(file);

    setPreviewImage((prevUrl) => {
      if (prevUrl && prevUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prevUrl);
      }

      if (!file) {
        return null;
      }

      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setIsLoading(false);
      showToast(
        "Sesi admin habis atau belum login. Silakan login ulang.",
        "error",
      );
      setTimeout(() => {
        router.push("/login?role=admin");
      }, 1200);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("nama_space", formData.nama_space);
    dataToSend.append("harga_per_jam", formData.harga_per_jam);
    dataToSend.append("tipe", formData.tipe);
    dataToSend.append("kapasitas", formData.kapasitas);
    dataToSend.append("deskripsi", formData.deskripsi);

    try {
      if (foto) {
        dataToSend.append("foto", foto);
      }
      const res = await fetch("/api/admin/spaces", {
        method: "POST",
        headers: {
          "x-maker-key": "mk_f4f26052503841eb8f95dee73e036726",
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        // 🌟 Panggil Toast Sukses
        showToast("Space baru berhasil ditambahkan!", "success");
        setTimeout(() => {
          router.push("/admin/spaces");
        }, 1500);
      } else {
        // 🌟 Panggil Toast Gagal sesuai pesan server
        showToast(
          resData.message ||
            "Gagal menambahkan data space. Periksa kembali isian Anda.",
          "error",
        );
      }
    } catch (err) {
      showToast("Terjadi kesalahan koneksi ke server backend.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      {/* 🌟 INTEGRASI KOMPONEN VISUAL TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-bounce transition-all duration-300">
          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
                : "bg-rose-50/90 border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
            <span className="text-sm font-semibold tracking-tight">
              {toast.message}
            </span>
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
                Tambah Ruang Baru
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/spaces")}
              className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2.5 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="overflow-hidden rounded-[2rem] bg-linear-to-br from-[#3368A0] via-[#2E5C8A] to-[#19352d] p-6 text-[#F2EFE7] shadow-[0_20px_60px_rgba(51,104,160,0.2)]">
              <div className="mt-6">
                <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDEAF6]">
                  Workspace ready
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.06em]">
                  Buat ruang yang nyaman untuk member.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white">
                  Tambahkan detail ruangan, kapasitas, dan fasilitas agar calon
                  member mudah memilih space yang paling cocok.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.15em] text-white">
                    Tipe ruang
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
                  <p className="text-xs uppercase tracking-[0.15em] text-white">
                    Kapasitas
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {formData.kapasitas || "Belum diisi"} orang
                  </p>
                </div>
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
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
                    placeholder="Contoh: Personal Desk A1"
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) => handleChange("nama_space", e.target.value)}
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
                    placeholder="15000"
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) =>
                      handleChange("harga_per_jam", e.target.value)
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
                    placeholder="1"
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) => handleChange("kapasitas", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Tipe Space
                  </label>
                  <select
                    value={formData.tipe}
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) => handleChange("tipe", e.target.value)}
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
                    placeholder="Tuliskan fasilitas seperti AC, WiFi, colokan listrik, meja, kursi, dll."
                    className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Foto Ruangan / Meja
                  </label>
                  <div className="rounded-[1.75rem] border-2 border-dashed border-[#D8E1E7]  p-4">
                    <label className="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[1.4rem] border border-[#D8E1E7]  px-4 py-5 text-center ">
                      {previewImage ? (
                        <div className="relative w-full overflow-hidden rounded-[1.15rem] ">
                          <img
                            src={previewImage}
                            alt="Preview ruang"
                            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-[#19352d]/80 to-transparent px-3 py-2 text-left text-white">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                              Preview foto
                            </span>
                            <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-medium backdrop-blur-sm">
                              Ganti foto
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center rounded-[1.15rem]  text-[#3368A0]">
                          <div className="flex h-16 w-16 items-center justify-center">
                            <Camera size={24} />
                          </div>
                        </div>
                      )}

                      <div className="w-full">
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
                        onChange={(e) =>
                          handleFileChange(e.target.files?.[0] || null)
                        }
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
                  Simpan Space
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

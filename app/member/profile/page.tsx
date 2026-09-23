"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Camera,
  MapPin,
  Phone,
  Save,
  UserCircle2,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import {
  clearStoredUserPhoto,
  getStoredUser,
  normalizePhotoUrl,
} from "@/lib/auth";
import { uploadMemberPhoto } from "@/lib/admin";

export default function MemberProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    nama_member: "",
    instansi: "",
    alamat: "",
    telp: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setForm({
      nama_member: storedUser?.nama_member || "",
      instansi: storedUser?.instansi || "",
      alamat: storedUser?.alamat || "",
      telp: storedUser?.telp || "",
    });

    const token = localStorage.getItem("token");
    fetch("/api/auth/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (result?.data) {
          const apiProfile = result.data;
          const profile = {
            ...storedUser,
            ...apiProfile,
            username: apiProfile.username || storedUser?.username || "",
            nama_member:
              apiProfile.nama_member || storedUser?.nama_member || "",
            instansi: apiProfile.instansi || storedUser?.instansi || "",
            alamat: apiProfile.alamat || storedUser?.alamat || "",
            telp: apiProfile.telp || storedUser?.telp || "",
            foto:
              apiProfile.foto ||
              apiProfile.profile_photo ||
              storedUser?.foto ||
              null,
            foto_url:
              apiProfile.foto_url ||
              apiProfile.foto ||
              storedUser?.foto_url ||
              storedUser?.foto ||
              null,
            profile_photo:
              apiProfile.profile_photo ||
              apiProfile.foto ||
              storedUser?.profile_photo ||
              storedUser?.foto ||
              null,
            photo:
              apiProfile.photo ||
              apiProfile.foto ||
              storedUser?.photo ||
              storedUser?.foto ||
              null,
          };
          setUser(profile);
          setForm({
            nama_member: profile.nama_member || "",
            instansi: profile.instansi || "",
            alamat: profile.alamat || "",
            telp: profile.telp || "",
          });
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      let fotoUrl = user?.foto || user?.foto_url || null;
      if (foto) {
        const uploaded = await uploadMemberPhoto(foto);
        fotoUrl = uploaded?.url || uploaded?.path || fotoUrl;
      }
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          username: user?.username,
          foto: fotoUrl,
          foto_url: fotoUrl,
          profile_photo: fotoUrl,
          photo: fotoUrl,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(result.message || "Gagal menyimpan profil.");
      setUser(result.data);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...getStoredUser(), ...result.data }),
      );
      setFoto(null);
      setMessage("Profil berhasil diperbarui.");
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan profil.",
      );
    } finally {
      setSaving(false);
    }
  }

  const rawProfilePhoto = normalizePhotoUrl(
    user?.foto || user?.foto_url || user?.profile_photo || user?.photo || null,
  );
  const profilePhoto =
    typeof window !== "undefined" &&
    typeof rawProfilePhoto === "string" &&
    rawProfilePhoto.startsWith("/")
      ? `${window.location.origin}${rawProfilePhoto}`
      : rawProfilePhoto;

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#E5DED2] bg-white shadow-[0_18px_50px_rgba(38,54,46,0.08)]">
          <div className="bg-[#31584D] px-6 py-8 text-white md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#F3D9A7]">
              Your Locazyy stay
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">
              Profil member
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/70">
              Kelola detail diri dan preferensi kamu untuk pengalaman coworking
              yang lebih personal.
            </p>
          </div>
          <div className="p-6 md:p-8">
            <div className="mt-8 flex flex-col gap-6 rounded-[2rem] border border-[#E5DED2] bg-[#FCFAF6] p-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#D8E1E7] bg-[#EAF4F5] text-[#3368A0] shadow-sm">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Foto profil member"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      clearStoredUserPhoto();
                      setUser((current: any) =>
                        current
                          ? {
                              ...current,
                              foto: null,
                              foto_url: null,
                              profile_photo: null,
                              photo: null,
                            }
                          : current,
                      );
                    }}
                  />
                ) : (
                  <UserCircle2 size={52} />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Akun member
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tighter text-[#19352d]">
                  {user?.nama_member || user?.username || "Member"}
                </h2>
                <p className="mt-1 text-sm text-[#5E6C74]">
                  @{user?.username || "username"}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSave}
              className="mt-8 grid gap-4 md:grid-cols-2"
            >
              <div className="rounded-2xl bg-[#F7F9FA] p-4">
                <div className="flex items-center gap-3">
                  <UserCircle2 className="h-5 w-5 text-[#3368A0]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Nama Lengkap
                  </span>
                </div>
                <input
                  value={form.nama_member}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      nama_member: event.target.value,
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-[#D8E1E7] bg-white px-3 text-sm font-semibold text-[#19352d] outline-none focus:border-[#3368A0]"
                />
              </div>

              <div className="rounded-2xl bg-[#F7F9FA] p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[#3368A0]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Instansi
                  </span>
                </div>
                <input
                  value={form.instansi}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      instansi: event.target.value,
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-[#D8E1E7] bg-white px-3 text-sm font-semibold text-[#19352d] outline-none focus:border-[#3368A0]"
                />
              </div>

              <div className="rounded-2xl bg-[#F7F9FA] p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#3368A0]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Alamat
                  </span>
                </div>
                <input
                  value={form.alamat}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      alamat: event.target.value,
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-[#D8E1E7] bg-white px-3 text-sm font-semibold text-[#19352d] outline-none focus:border-[#3368A0]"
                />
              </div>

              <div className="rounded-2xl bg-[#F7F9FA] p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#3368A0]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    No. Telepon
                  </span>
                </div>
                <input
                  value={form.telp}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      telp: event.target.value,
                    }))
                  }
                  className="mt-2 h-10 w-full rounded-xl border border-[#D8E1E7] bg-white px-3 text-sm font-semibold text-[#19352d] outline-none focus:border-[#3368A0]"
                />
              </div>
              <label className="grid gap-2 rounded-2xl border border-dashed border-[#D8D1C3] bg-[#FCFAF6] p-4 md:col-span-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[#19352d]">
                  <Camera size={16} /> Ganti foto profil
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFoto(event.target.files?.[0] || null)}
                  className="h-11 rounded-2xl border border-[#D8E1E7] bg-white px-3 py-2 text-sm"
                />
                {foto && (
                  <p className="text-xs text-[#5E6C74]">
                    Foto siap diunggah: {foto.name}
                  </p>
                )}
              </label>
              <div className="flex items-center justify-between gap-3 md:col-span-2">
                {message && <p className="text-sm text-[#5E6C74]">{message}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-[#3368A0] px-5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

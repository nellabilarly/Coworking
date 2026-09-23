"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Save, XCircle } from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { getUserById, updateUser } from "@/lib/user";
import { normalizePhotoUrl } from "@/lib/auth";

type MemberForm = {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
};

type MemberData = MemberForm & {
  id: number | string;
  role?: string;
  status?: string;
  name?: string;
  address?: string;
  phone?: string;
  foto?: string | null;
  foto_url?: string | null;
  profile_photo?: string | null;
  photo?: string | null;
};

const emptyForm: MemberForm = {
  username: "",
  password: "",
  nama_member: "",
  instansi: "",
  alamat: "",
  telp: "",
};

export default function AdminMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [member, setMember] = useState<MemberData | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast((previous) => ({ ...previous, show: false })),
      2800,
    );
  };

  useEffect(() => {
    async function loadData() {
      if (!rawId) return;
      try {
        const data = (await getUserById(Number(rawId))) as MemberData;
        setMember(data);
        setForm({
          username: data.username || "",
          password: "",
          nama_member: data.nama_member || data.name || "",
          instansi: data.instansi || "",
          alamat: data.alamat || data.address || "",
          telp: data.telp || data.phone || "",
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat detail member.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [rawId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawId) return;

    setIsSaving(true);
    try {
      const { password, ...profile } = form;
      const payload = password ? form : profile;
      const updated = await updateUser(Number(rawId), payload);
      setMember(updated);
      setForm((previous) => ({ ...previous, password: "" }));
      showToast("Data member berhasil diubah.", "success");
      setTimeout(() => router.push("/admin/member"), 900);
    } catch (saveError) {
      showToast(
        saveError instanceof Error
          ? saveError.message
          : "Gagal mengubah data member.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
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
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/member"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3368A0]"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>

          {isLoading ? (
            <div className="mt-6 rounded-[2rem] border border-[#D8E1E7] bg-white p-8 text-sm text-[#5E6C74] shadow-sm">
              Memuat detail member...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          ) : !member ? (
            <div className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700 shadow-sm">
              Data member tidak ditemukan.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#EEF2F4] bg-[#F6F8F9] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#3368A0] text-lg font-bold uppercase text-[#F2EFE7]">
                    {normalizePhotoUrl(
                      member.foto ||
                        member.foto_url ||
                        member.profile_photo ||
                        member.photo,
                    ) ? (
                      <img
                        src={
                          normalizePhotoUrl(
                            member.foto ||
                              member.foto_url ||
                              member.profile_photo ||
                              member.photo,
                          ) || ""
                        }
                        alt={`Foto ${member.nama_member || "member"}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      member.username?.slice(0, 2) || "MB"
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                      Member Detail
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                      {member.nama_member || member.username}
                    </h1>
                  </div>
                </div>

                <div className="border-b border-[#EEF2F4] px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    Foto profil member
                  </p>
                  {normalizePhotoUrl(
                    member.foto ||
                      member.foto_url ||
                      member.profile_photo ||
                      member.photo,
                  ) ? (
                    <img
                      src={
                        normalizePhotoUrl(
                          member.foto ||
                            member.foto_url ||
                            member.profile_photo ||
                            member.photo,
                        ) || ""
                      }
                      alt={`Foto profil ${member.nama_member || "member"}`}
                      className="mt-3 h-28 w-28 rounded-2xl object-cover"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-[#5E6C74]">
                      Member belum menambahkan foto profil.
                    </p>
                  )}
                </div>
                <span className="inline-flex rounded-full bg-[#EAF4F5] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3368A0]">
                  {member.role || "member"}
                </span>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                {(
                  [
                    ["username", "Username", "text"],
                    ["password", "Password baru", "password"],
                    ["nama_member", "Nama Member", "text"],
                    ["instansi", "Instansi", "text"],
                    ["alamat", "Alamat", "text"],
                    ["telp", "No. Telp", "text"],
                  ] as const
                ).map(([field, label, type]) => (
                  <label
                    key={field}
                    className={`grid gap-2 ${field === "nama_member" || field === "alamat" ? "md:col-span-2" : ""}`}
                  >
                    <span className="text-sm font-medium text-[#19352d]">
                      {label}
                    </span>
                    <input
                      type={type}
                      value={form[field]}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          [field]: event.target.value,
                        }))
                      }
                      placeholder={
                        field === "password"
                          ? "Kosongkan jika tidak diubah"
                          : undefined
                      }
                      className="h-11 rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 text-sm outline-none transition focus:border-[#3368A0]"
                      required={field !== "password"}
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-end border-t border-[#EEF2F4] p-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#3368A0] px-5 text-sm font-semibold text-white transition hover:bg-[#29598c] disabled:opacity-60"
                >
                  <Save size={16} />{" "}
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

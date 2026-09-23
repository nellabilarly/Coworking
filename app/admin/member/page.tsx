"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PencilLine,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import {
  deleteUser,
  getLoggedInMembers,
  rememberDeletedMember,
  removeLoggedInMember,
} from "@/lib/user";
import { normalizePhotoUrl } from "@/lib/auth";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  async function loadMembers() {
    try {
      setIsLoading(true);
      setError("");
      const data = await getLoggedInMembers(search);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data pelanggan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus akun member ini?")) return;
    try {
      const member = members.find((item) => Number(item.id) === id);
      await deleteUser(id);
      rememberDeletedMember(member?.username);
      removeLoggedInMember(id, member?.username);
      showToast("Member berhasil dihapus.", "success");
      await loadMembers();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus.", "error");
    }
  }

  useEffect(() => {
    loadMembers();
  }, [search]);

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
          <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                Admin / Member
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                Kelola Data Member
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/member/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3368A0] px-5 py-2.5 text-sm font-semibold text-[#F2EFE7] transition hover:bg-[#29598c]"
              >
                <Plus size={16} /> Tambah Member
              </Link>
            </div>
          </header>

          <div className="mb-6 flex items-center justify-end">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E6C74]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, username, instansi..."
                className="h-11 w-full rounded-full border border-[#D8E1E7] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#3368A0]"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm font-medium text-[#5E6C74]">
                Memproses data member...
              </div>
            ) : members.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-[#5E6C74]">
                Belum ada member yang sesuai pencarian.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-[#EEF2F4] bg-[#F6F8F9] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5E6C74]">
                  <tr>
                    <th className="px-5 py-4">Member</th>
                    <th className="px-5 py-4">Username</th>
                    <th className="px-5 py-4">Instansi</th>
                    <th className="px-5 py-4">No. Telp</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F4]">
                  {members.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F9FBFC]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF4F5] text-xs font-bold uppercase text-[#3368A0]">
                            {normalizePhotoUrl(
                              user.foto ||
                                user.foto_url ||
                                user.profile_photo ||
                                user.photo,
                            ) ? (
                              <img
                                src={
                                  normalizePhotoUrl(
                                    user.foto ||
                                      user.foto_url ||
                                      user.profile_photo ||
                                      user.photo,
                                  ) || ""
                                }
                                alt={`Foto ${user.nama_member || "member"}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.username?.slice(0, 2) || "MB"
                            )}
                          </div>
                          <div className="font-semibold text-[#19352d]">
                            {user.nama_member || user.username || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#5E6C74]">
                        {user.username || "-"}
                      </td>
                      <td className="px-5 py-4 text-[#5E6C74]">
                        {user.instansi || "-"}
                      </td>
                      <td className="px-5 py-4 text-[#5E6C74]">
                        {user.telp || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/member/${user.id}`}
                            className="rounded-full border border-[#D8E1E7] bg-white p-2 text-[#3368A0] hover:border-[#3368A0]"
                            title="Lihat detail"
                          >
                            <PencilLine className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-full border border-[#F4D7D7] bg-[#FFF7F7] p-2 text-red-600 hover:bg-red-50"
                            title="Hapus member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

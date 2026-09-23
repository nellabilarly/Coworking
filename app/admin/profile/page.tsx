"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { getAdminProfile } from "@/lib/admin";
import { normalizeAdminProfile } from "@/lib/auth";

type AdminProfile = {
  username?: string;
  email?: string;
  nama_pemilik?: string;
  nama_coworking?: string;
  telp?: string;
  foto?: string | null;
  profile_photo?: string | null;
  photo?: string | null;
};

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      let localProfile: AdminProfile | null = null;

      try {
        const adminRaw = localStorage.getItem("admin_profile");
        const userRaw = localStorage.getItem("user");
        const storedAdmin = adminRaw ? JSON.parse(adminRaw) : {};
        const storedUser = userRaw ? JSON.parse(userRaw) : {};

        if (adminRaw || userRaw) {
          localProfile = normalizeAdminProfile(
            storedAdmin,
            normalizeAdminProfile(storedUser),
          );

          if (isMounted) {
            setUser(localProfile);
          }
        }
      } catch {
        localProfile = null;
      }

      try {
        const remoteProfile = await getAdminProfile();
        const profile = normalizeAdminProfile(remoteProfile, localProfile);

        if (isMounted) {
          setUser(profile);
        }
      } catch {
        // Keep the profile captured from the login session.
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const profilePhoto = user?.foto || user?.profile_photo || user?.photo || null;
  const adminName = user?.nama_pemilik || user?.username || "Belum diisi";
  const coworkingName = user?.nama_coworking || "Belum diisi";
  const phoneNumber = user?.telp || "Belum diisi";
  const email = user?.email || "Belum diisi";

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-5xl space-y-5">
          <header className="relative overflow-hidden rounded-[1.75rem] bg-[#19352d] p-5 text-[#E1DCC9] shadow-[0_20px_60px_rgba(25,53,45,0.2)] md:p-7">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#E1DCC9]/15" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-[#E1DCC9]/20 bg-[#3368A0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Admin / Profile
                </p>
                <h1 className="text-3xl font-bold tracking-[-0.06em] md:text-4xl">
                  Profil workspace
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#E1DCC9]/75">
                  {isLoading
                    ? "Memuat data sesi admin..."
                    : `${adminName} • ${coworkingName}`}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#EEF2D8] px-3 py-2 text-xs font-semibold text-[#596B3C] md:self-auto">
                <CheckCircle2 size={15} /> Akun aktif
              </div>
            </div>
          </header>

          <div className="grid gap-5">
            <section className="overflow-hidden rounded-[1.75rem] border border-[#D8E1E7] bg-white shadow-sm">
              <div className="flex flex-col gap-5 bg-[#19352d] p-5 md:flex-row md:items-center md:p-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#EAF4F5] text-[#3368A0] shadow-sm">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={`Foto profil ${adminName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle2 size={52} />
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BFD7D2]">
                    Workspace owner
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tighter text-[#E1DCC9]">
                    {isLoading ? "Memuat profil..." : adminName}
                  </h2>
                  <p className="mt-1 text-sm text-[#BFD7D2]">
                    @{user?.username || "Belum diisi"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
                <div className="rounded-2xl bg-[#F7F9FA] p-4">
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-5 w-5 text-[#3368A0]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Nama Pemilik
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#19352d]">
                    {adminName}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F9FA] p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#3368A0]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Nama Coworking
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#19352d]">
                    {coworkingName}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F9FA] p-4 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#3368A0]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      Username
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#19352d]">
                    {user?.username || "Belum diisi"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F9FA] p-4 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#3368A0]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                      No. Telepon
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[#19352d]">
                    {phoneNumber}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

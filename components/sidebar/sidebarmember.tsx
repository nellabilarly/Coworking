"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import {
  clearAuthSession,
  clearStoredUserPhoto,
  getStoredUser,
  normalizePhotoUrl,
} from "@/lib/auth";
import { logout } from "@/actions/logout";

export default function MemberSidebar() {
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    const token = localStorage.getItem("token");
    fetch("/api/auth/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (result?.data) {
          setUser({
            ...storedUser,
            ...result.data,
            foto:
              result.data.foto ||
              result.data.foto_url ||
              storedUser?.foto ||
              storedUser?.foto_url ||
              null,
            foto_url:
              result.data.foto_url ||
              result.data.foto ||
              storedUser?.foto_url ||
              storedUser?.foto ||
              null,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const displayName =
    user?.nama_member || user?.name || user?.username || "Member";
  const profilePhoto = normalizePhotoUrl(
    user?.foto || user?.foto_url || user?.profile_photo || user?.photo || null,
  );

  const handleLogout = () => {
    setOpen(false);
    setShowLogout(true);
  };

  const confirmLogout = async () => {
    clearAuthSession();
    await logout();
    router.push("/login?role=member");
  };

  const menus = [
    {
      name: "Dashboard",
      href: "/member",
      icon: LayoutDashboard,
    },
    {
      name: "Spaces",
      href: "/member/spaces",
      icon: Building2,
    },
    {
      name: "Reservasi",
      href: "/member/reservasi",
      icon: CalendarDays,
    },
    {
      name: "Profile",
      href: "/member/profile",
      icon: UserCircle,
    },
  ];

  return (
    <>
      <div className="member-theme flex items-center justify-between bg-[#3368A0] p-4 text-[#F2EFE7] md:hidden">
        <span className="text-lg font-semibold tracking-[-0.04em]">
          LOCAZYY<span className="text-[#66A3BF]">.</span>
        </span>
        <button
          type="button"
          aria-label="Buka menu member"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 transition hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#19352d]/35 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {showLogout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#19352d]/10 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setShowLogout(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
              aria-label="Tutup konfirmasi logout"
            >
              <X className="h-4 w-4 text-[#19352d]" />
            </button>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3368A0]/10">
                <LogOut className="h-6 w-6 text-[#3368A0]" />
              </div>
              <h2 className="text-2xl font-bold text-[#19352d]">
                Logout Member
              </h2>
            </div>
            <p className="mb-7 text-base leading-7 text-[#19352d]">
              Apakah Anda yakin ingin keluar dari akun member?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogout(false)}
                className="flex-1 rounded-xl border border-[#D8E1E7] bg-white/60 py-3 text-sm font-semibold text-[#19352d] transition hover:bg-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-[#3368A0] py-3 text-sm font-semibold text-white shadow-lg shadow-[#3368A0]/20 transition hover:bg-[#29598c]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`member-theme fixed left-0 top-0 z-50 flex h-full w-64 flex-col overflow-hidden rounded-r-[3rem] bg-[#3368A0] text-[#F2EFE7] shadow-xl shadow-[#19352d]/10 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-[#C8DFDB]/20" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#F2EFE7 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-7 pb-10 pt-8">
          <Link
            href="/member"
            className="text-2xl font-semibold tracking-[-0.06em]"
          >
            LOCAZYY<span className="text-[#66A3BF]">.</span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu member"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-[#C8DFDB] transition hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative z-10 mx-5 mb-7 flex items-center gap-3 border-b border-[#C8DFDB]/15 px-2 pb-7">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#C8DFDB] text-lg font-semibold text-[#3368A0] ring-4 ring-white/10">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={displayName}
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
              displayName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="mt-0.5 text-xs text-[#C8DFDB]/75">
              {user?.username || "Workspace access"}
            </p>
          </div>
        </div>

        <nav className="relative z-10 flex-1 space-y-1.5 px-4">
          {menus.map(({ name, href, icon: Icon }) => {
            const isActive =
              href === "/member"
                ? pathname === href
                : pathname.startsWith(href);

            return (
              <Link
                key={name}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive ? "bg-[#F2EFE7] font-semibold text-[#3368A0]" : "text-[#C8DFDB]/85 hover:bg-white/10 hover:text-[#F2EFE7]"}`}
              >
                <Icon size={18} />
                <span className="text-sm tracking-[0.01em]">{name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 px-7 pb-28">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[#C8DFDB]/85 transition hover:bg-red-400/15 hover:text-red-100"
          >
            <LogOut size={16} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

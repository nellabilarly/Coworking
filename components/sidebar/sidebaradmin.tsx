"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  Building2,
  CalendarDays,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  TicketPercent,
  Users,
  UserCircle,
} from "lucide-react";
 
export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    setOpen(false);
    router.push("/admin/logout");
  };

  const menus = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Spaces",
      href: "/admin/spaces",
      icon: <Building2 size={18} />,
    },
    {
      name: "Diskon",
      href: "/admin/diskon",
      icon: <TicketPercent size={18} />,
    },
    {
      name: "Member",
      href: "/admin/member",
      icon: <Users size={18} />,
    },
    {
      name: "Reservasi",
      href: "/admin/reservasi",
      icon: <CalendarDays size={18} />,
    },

    {
      name: "Reports",
      href: "/admin/reports",
      icon: <History size={18} />,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: <UserCircle size={18} />,
    },
    
  ];

  return (
    <>
      <div className="admin-theme flex items-center justify-between bg-[#3368A0] p-4 text-[#F2EFE7] md:hidden">
        <span className="text-lg font-semibold tracking-[-0.04em]">
          LOCAZYY<span className="text-[#66A3BF]">.</span>
        </span>
        <button
          type="button"
          aria-label="Buka menu admin"
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
      <aside
        className={`admin-theme
            fixed left-0 top-0 z-50 flex h-full w-64 flex-col
            overflow-hidden rounded-r-[3rem] bg-[#3368A0] text-[#F2EFE7]
            shadow-xl shadow-[#19352d]/10 transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
  `}
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
            href="/admin"
            className="text-2xl font-semibold tracking-[-0.06em]"
          >
            LOCAZYY<span className="text-[#66A3BF]">.</span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-[#C8DFDB] transition hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative z-10 mx-5 mb-7 flex items-center gap-3 border-b border-[#C8DFDB]/15 px-2 pb-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C8DFDB] text-lg font-semibold text-[#3368A0] ring-4 ring-white/10">
            A
          </div>
          <div>
            <p className="text-sm font-semibold">Admin</p>
            <p className="mt-0.5 text-xs text-[#C8DFDB]/75">Manage workspace</p>
          </div>
        </div>

        <nav className="relative z-10 flex-1 space-y-1.5 px-4">
          {menus.map((menu) => {
            const isActive =
              menu.href === "/admin"
                ? pathname === menu.href
                : pathname.startsWith(menu.href);

            return (
              <Link
                key={menu.name}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive ? "bg-[#F2EFE7] font-semibold text-[#3368A0]" : "text-[#C8DFDB]/85 hover:bg-white/10 hover:text-[#F2EFE7]"}`}
              >
                {menu.icon}
                <span className="text-sm tracking-[0.01em]">{menu.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-20 px-7 pb-16">
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

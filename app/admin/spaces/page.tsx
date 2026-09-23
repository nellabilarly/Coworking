import Link from "next/link";
import { Plus } from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import SpacesAdmin from "@/components/spacesadmin";

export default function AdminSpacesPage() {
  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-6 rounded-[2rem] border border-[#D8E1E7] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5E6C74]">
                  Admin / Spaces
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#19352d]">
                  Kelola Space Coworking
                </h1>
              </div>

              <Link
                href="/admin/sp  aces/create"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3368A0] px-5 py-2.5 text-sm font-semibold text-[#F2EFE7] transition hover:bg-[#29598c]"
              >
                <Plus size={16} />
                Tambah Space
              </Link>
            </div>
          </header>

          <SpacesAdmin />
        </div>
      </main>
    </div>
  );
}

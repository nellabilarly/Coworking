"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Loader2, Printer } from "lucide-react";
import AdminSidebar from "@/components/sidebar/sidebaradmin";
import { getAdminIncome, getAdminMonthlyReport } from "@/lib/admin";

type ReportItem = {
  id?: string | number;
  nama?: string;
  tipe?: string;
  durasi?: string;
  total?: number | string;
};

type ReportData = {
  bulanText?: string;
  totalTransaksi?: number;
  totalPendapatan?: number;
  labaBersih?: number;
  items?: ReportItem[];
};

export default function AdminReportsPage() {
  const [bulan, setBulan] = useState("09");
  const [tahun, setTahun] = useState("2026");
  const [reportData, setReportData] = useState<ReportData>({
    bulanText: "September 2026",
    totalTransaksi: 0,
    totalPendapatan: 0,
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [monthly, income] = await Promise.all([
        getAdminMonthlyReport(bulan, tahun),
        getAdminIncome(bulan, tahun),
      ]);
      setReportData({
        ...monthly,
        ...income,
        totalPendapatan:
          income.totalPendapatanBersih ??
          income.totalPendapatan ??
          monthly.labaBersih ??
          0,
      });
      setIsLoading(false);
    }

    loadData();
  }, [bulan, tahun]);

  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#19352d]">
      <AdminSidebar />

      <main className="flex-1 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] bg-[#000000] p-6 text-[#E1DCC9] shadow-[0_20px_60px_rgba(0,0,0,0.2)] md:p-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[#E1DCC9]/15" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-[#E1DCC9]/20 bg-[#412D15] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Admin / Reports
                </p>
                <h1 className="text-3xl font-bold tracking-[-0.06em] md:text-5xl">
                  Laporan keuangan
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#E1DCC9]/75">
                  Baca performa booking, pendapatan, durasi penggunaan, dan
                  dampak promo dalam satu periode.
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-40 rounded-[2rem] border border-[#D8E1E7] bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-10 text-sm font-semibold text-[#5E6C74] md:mr-2">
              <CalendarRange size={17} className="text-[#3368A0]" /> Filter
              laporan
            </div>
            <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
              Bulan
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="h-10 rounded-xl border border-[#D8E1E7] bg-[#F9FBFC] px-3 text-sm font-medium normal-case tracking-normal outline-none"
              >
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
              Tahun
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="h-10 rounded-xl border border-[#D8E1E7] bg-[#F9FBFC] px-3 text-sm font-medium normal-case tracking-normal outline-none"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </label>
            <button
              onClick={() => window.print()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#3368A0] px-4 text-sm font-semibold text-white transition hover:bg-[#29598c] md:ml-auto"
            >
              <Printer size={16} /> Cetak laporan
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-52 items-center justify-center rounded-[2rem] border border-[#D8E1E7] bg-white text-sm font-medium text-[#5E6C74]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat
              laporan...
            </div>
          ) : (
            <section className="overflow-hidden rounded-[2rem] border border-[#D8E1E7] bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#EEF2F4] bg-[#F6F8F9] px-5 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5E6C74]">
                    Rincian laporan
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tighter text-[#19352d]">
                    Transaksi periode{" "}
                    {reportData.bulanText || `${bulan}/${tahun}`}
                  </h2>
                </div>
                <div className="flex gap-2 text-xs font-semibold text-[#5E6C74]">
                  <span className="rounded-full bg-white px-3 py-2">
                    {reportData.totalTransaksi || 0} transaksi
                  </span>
                  <span className="rounded-full bg-[#EEF2D8] px-3 py-2 text-[#596B3C]">
                    Rp{" "}
                    {Number(
                      reportData.totalPendapatan || reportData.labaBersih || 0,
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-175 border-collapse text-left text-sm">
                  <thead className="bg-white text-xs font-semibold uppercase tracking-[0.14em] text-[#5E6C74]">
                    <tr>
                      <th className="px-5 py-4">Nama Fasilitas</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4">Durasi</th>
                      <th className="px-5 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.items || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-12 text-center text-sm text-[#5E6C74]"
                        >
                          Belum ada rincian transaksi pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      (reportData.items || []).map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-[#EEF2F4] hover:bg-[#F9FBFC]"
                        >
                          <td className="px-5 py-4 font-medium text-[#19352d]">
                            {item.nama}
                          </td>
                          <td className="px-5 py-4 text-xs font-mono uppercase text-[#5E6C74]">
                            {item.tipe}
                          </td>
                          <td className="px-5 py-4 text-[#5E6C74]">
                            {item.durasi}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-[#2F7B57]">
                            Rp {Number(item.total || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

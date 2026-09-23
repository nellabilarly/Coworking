"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  XCircle,
} from "lucide-react";
import MemberSidebar from "@/components/sidebar/sidebarmember";
import { createReservasi } from "@/lib/reservasi";
import { getSpaces } from "@/lib/spaces";

function formatType(type?: string) {
  if (!type) return "Space";
  if (type === "desk") return "Personal Desk";
  if (type === "meeting_room") return "Meeting Room";
  if (type === "private_office") return "Private Office";
  return type;
}

export default function MemberCreateReservationPage() {
  const router = useRouter();

  const [spaces, setSpaces] = useState<any[]>([]);
  const [diskons, setDiskons] = useState<any[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountValid, setDiscountValid] = useState<boolean | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityValid, setAvailabilityValid] = useState<boolean | null>(
    null,
  );
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [bookingCreated, setBookingCreated] = useState(false);

  const [form, setForm] = useState({
    id_space: "",
    tanggal: new Date().toISOString().slice(0, 10),
    jam_mulai: "09:00",
    durasi_jam: 2,
    kode_diskon: "",
  });

  useEffect(() => {
    async function loadSpaces() {
      try {
        const [data, discountResponse] = await Promise.all([
          getSpaces(),
          fetch("/api/diskon", { cache: "no-store" }).then((response) =>
            response.ok ? response.json() : { data: [] },
          ),
        ]);
        setSpaces(Array.isArray(data) ? data : []);
        setDiskons(
          Array.isArray(discountResponse?.data) ? discountResponse.data : [],
        );

        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const selectedSpace = params.get("id_space");
          if (selectedSpace) {
            setForm((prev) => ({ ...prev, id_space: selectedSpace }));
          }
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat daftar ruang.");
      } finally {
        setLoadingSpaces(false);
      }
    }

    loadSpaces();
  }, []);

  async function checkDiscount(): Promise<boolean> {
    const code = form.kode_diskon.trim();
    if (!code) {
      setDiscountMessage("Masukkan kode promo terlebih dahulu.");
      setDiscountValid(false);
      return false;
    }

    setCheckingDiscount(true);
    setDiscountMessage("");

    try {
      const response = await fetch(
        `/api/member/diskon/check?kode_promo=${encodeURIComponent(code)}`,
        { cache: "no-store" },
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.valid) {
        setDiscountValid(false);
        setDiscountAmount(0);
        setDiscountMessage(result.message || "Kode promo tidak valid.");
        return false;
      }

      const minimumTransaction = Number(result.data?.minimal_transaksi || 0);
      if (subtotal < minimumTransaction) {
        setDiscountValid(false);
        setDiscountAmount(0);
        setDiscountMessage(
          `Minimal transaksi untuk promo ini Rp ${minimumTransaction.toLocaleString("id-ID")}.`,
        );
        return false;
      }

      setDiscountValid(true);
      setDiscountAmount(Number(result.data?.nominal_potongan || 0));
      setDiscountMessage(
        `Promo valid: potongan Rp ${Number(result.data?.nominal_potongan || 0).toLocaleString("id-ID")}.`,
      );
      return true;
    } catch {
      setDiscountValid(false);
      setDiscountAmount(0);
      setDiscountMessage("Gagal mengecek kode promo.");
      return false;
    } finally {
      setCheckingDiscount(false);
    }
  }

  async function checkAvailability(): Promise<boolean> {
    if (!form.id_space || !form.tanggal) return false;

    setCheckingAvailability(true);
    setAvailabilityMessage("");

    try {
      const response = await fetch(
        `/api/member/spaces/${encodeURIComponent(form.id_space)}/availability?tanggal=${encodeURIComponent(form.tanggal)}`,
        { cache: "no-store" },
      );
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAvailabilityValid(false);
        setAvailabilityMessage(
          result.message || "Gagal mengecek ketersediaan slot.",
        );
        return false;
      }

      const startHour = Number(form.jam_mulai.split(":")[0]);
      const requiredHours = Number(form.durasi_jam) || 1;
      const slots = Array.isArray(result.data?.slots) ? result.data.slots : [];
      const selectedSlots = Array.from(
        { length: requiredHours },
        (_, index) => {
          const hour = String(startHour + index).padStart(2, "0");
          return slots.find((slot: any) => slot.jam_mulai === `${hour}:00`);
        },
      );

      if (selectedSlots.some((slot) => !slot || !slot.tersedia)) {
        setAvailabilityValid(false);
        setAvailabilityMessage(
          "Slot pada waktu tersebut sudah dipesan. Silakan pilih jam lain.",
        );
        return false;
      }

      setAvailabilityValid(true);
      setAvailabilityMessage(
        "Slot tersedia untuk tanggal dan waktu yang dipilih.",
      );
      return true;
    } catch {
      setAvailabilityValid(false);
      setAvailabilityMessage("Gagal mengecek ketersediaan slot.");
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  }

  const selectedSpace = spaces.find(
    (space) => String(space.id ?? space.id_space) === String(form.id_space),
  );
  const subtotal =
    Number(selectedSpace?.harga_per_jam || 0) * Number(form.durasi_jam || 0);
  const discount = discountValid ? Math.min(discountAmount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.id_space) {
      setError("Pilih ruang kerja terlebih dahulu.");
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      setError("Slot reservasi tidak tersedia atau gagal dicek.");
      return;
    }

    if (form.kode_diskon.trim()) {
      const isDiscountValid = await checkDiscount();
      if (!isDiscountValid) {
        setError("Cek kode promo terlebih dahulu sebelum melakukan booking.");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        id_space: Number(form.id_space),
        tanggal: form.tanggal,
        jam_mulai: form.jam_mulai,
        durasi_jam: Number(form.durasi_jam),
        kode_diskon: form.kode_diskon || null,
      };

      await createReservasi(payload);
      setToast({
        show: true,
        message: "Reservasi berhasil dibuat.",
        type: "success",
      });
      setBookingCreated(true);
    } catch (err: any) {
      setError(err.message || "Gagal membuat reservasi.");
      setToast({
        show: true,
        message: err.message || "Gagal membuat reservasi.",
        type: "error",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5F0E7] text-[#26362E]">
      <MemberSidebar />

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
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/member/reservasi"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E1E7] bg-white px-4 py-2 text-sm font-semibold text-[#19352d] transition hover:border-[#3368A0] hover:text-[#3368A0]"
            >
              <ArrowLeft size={16} />
              Kembali
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <aside className="overflow-hidden rounded-[2rem] bg-[#31584D] text-white shadow-[0_20px_60px_rgba(38,54,46,0.16)] lg:sticky lg:top-8 lg:self-start">
              {selectedSpace && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      selectedSpace.foto_url ||
                      selectedSpace.foto ||
                      selectedSpace.image ||
                      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80"
                    }
                    alt={selectedSpace.nama_space || "Ruang pilihan"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#18352d]/35" />
                  <span className="absolute bottom-4 left-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#26362E]">
                    Selected workspace
                  </span>
                </div>
              )}
              <div className="p-6 md:p-7">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <Sparkles size={28} />
                </div>

                <div className="mt-6">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDEAF6]">
                    <CalendarDays size={12} />
                    New work stay
                  </p>
                  <h1 className="mt-4 text-3xl font-semibold tracking-[-0.06em]">
                    Rencanakan hari kerjamu
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Pilih ruang, waktu, dan durasi. Kami siapkan tempat kerja
                    yang pas untukmu.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#DDEAF6]">
                      Pilihan ruang
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {form.id_space
                        ? spaces.find(
                            (space) =>
                              String(space.id ?? space.id_space) ===
                              String(form.id_space),
                          )?.nama_space || "Ruang dipilih"
                        : "Belum memilih"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.15em] text-[#DDEAF6]">
                      Durasi
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {form.durasi_jam} jam
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {bookingCreated ? (
              <div className="flex min-h-105 items-center justify-center rounded-[2rem] border border-[#DCE7D7] bg-[#F6FBF5] p-6 shadow-[0_12px_35px_rgba(38,54,46,0.07)] md:p-10">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7661]">
                    Reservasi berhasil
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-[#19352d]">
                    Booking selesai
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#5E6C74]">
                    Reservasi Anda telah dibuat. Silakan lanjutkan ke daftar reservasi untuk melihat detailnya.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/member/reservasi")}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-[#19352d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f493d]"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-[2rem] border border-[#E5DED2] bg-[#FFFDF9] p-5 shadow-[0_12px_35px_rgba(38,54,46,0.07)] md:p-8"
              >
                <div className="mb-7 flex items-center justify-between border-b border-[#E5DED2] pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A7661]">
                      Complete your booking
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#26362E]">
                      Detail reservasi
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#EAF1EC] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#31584D]">
                    Secure booking
                  </span>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-[#E5DED2] bg-[#FCFAF6] p-4">
                      <div className="flex items-center justify-between text-sm text-[#6F756E]">
                        <span>Harga per jam</span>
                        <span>
                          Rp{" "}
                          {Number(
                            selectedSpace?.harga_per_jam || 0,
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm text-[#5E6C74]">
                        <span>Subtotal ({form.durasi_jam} jam)</span>
                        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      {discount > 0 && (
                        <div className="mt-2 flex items-center justify-between text-sm text-emerald-700">
                          <span>Potongan promo</span>
                          <span>- Rp {discount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between border-t border-[#E5DED2] pt-3 text-base font-bold text-[#26362E]">
                        <span>Total harga</span>
                        <span>Rp {total.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7661]">
                      1. Pilih ruang kerja
                    </label>
                    <select
                      value={form.id_space}
                      onChange={(e) =>
                        setForm({ ...form, id_space: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                      disabled={loadingSpaces}
                    >
                      <option value="">-- Pilih ruang --</option>
                      {spaces.map((space) => (
                        <option
                          key={space.id ?? space.id_space}
                          value={space.id ?? space.id_space}
                        >
                          {space.nama_space} • {formatType(space.tipe)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7661]">
                      2. Tanggal kunjungan
                    </label>
                    <input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) =>
                        setForm({ ...form, tanggal: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7661]">
                      3. Jam mulai
                    </label>
                    <input
                      type="time"
                      value={form.jam_mulai}
                      onChange={(e) =>
                        setForm({ ...form, jam_mulai: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                      required
                    />
                    {availabilityMessage && (
                      <p
                        className={`mt-2 text-xs font-medium ${availabilityValid ? "text-emerald-700" : "text-red-600"}`}
                      >
                        {availabilityMessage}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7661]">
                      4. Durasi (jam)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={form.durasi_jam}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          durasi_jam: Number(e.target.value) || 1,
                        })
                      }
                      className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7661]">
                      Promo code (opsional)
                    </label>
                    <input
                      type="text"
                      list="active-discounts"
                      value={form.kode_diskon}
                      onChange={(e) =>
                        setForm({ ...form, kode_diskon: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#D8E1E7] bg-[#F9FBFC] px-4 py-3 text-sm text-[#19352d] outline-none transition focus:border-[#3368A0] focus:bg-white"
                      placeholder="COZY10"
                    />
                    <button
                      type="button"
                      onClick={checkDiscount}
                      disabled={checkingDiscount || !form.kode_diskon.trim()}
                      className="mt-2 rounded-full border border-[#3368A0] px-4 py-2 text-xs font-semibold text-[#3368A0] transition hover:bg-[#EAF4F5] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {checkingDiscount ? "Mengecek..." : "Cek kode promo"}
                    </button>
                    <datalist id="active-discounts">
                      {diskons.map((diskon) => (
                        <option key={diskon.id} value={diskon.kode_diskon}>
                          Potongan Rp{" "}
                          {Number(diskon.nominal_potongan || 0).toLocaleString(
                            "id-ID",
                          )}
                        </option>
                      ))}
                    </datalist>
                    {diskons.length > 0 && (
                      <p className="mt-1 text-xs text-[#5E6C74]">
                        Kode aktif:{" "}
                        {diskons.map((diskon) => diskon.kode_diskon).join(", ")}
                      </p>
                    )}
                    {discountMessage && (
                      <p
                        className={`mt-2 text-xs font-medium ${discountValid ? "text-emerald-700" : "text-red-600"}`}
                      >
                        {discountMessage}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        loadingSpaces ||
                        checkingAvailability ||
                        checkingDiscount
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#19352d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3E3F29] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Clock3 size={16} />
                      {submitting || checkingAvailability
                        ? "Mengecek slot..."
                        : "Konfirmasi booking"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

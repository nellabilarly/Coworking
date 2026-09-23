import { NextRequest, NextResponse } from "next/server";
import { readReservations, normalizeReservationPayload, writeReservations } from "@/lib/reservasi-store";
import { readDiskons, writeDiskons } from "@/lib/admin-diskon-store";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

function getDuration(jamMulai: string, jamSelesai: string) {
  const [startHour, startMinute] = jamMulai.split(":").map(Number);
  const [endHour, endMinute] = jamSelesai.split(":").map(Number);
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  return minutes > 0 ? Math.ceil(minutes / 60) : 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idSpace = Number(body?.id_space);
    const tanggal = String(body?.tanggal_pinjam || body?.tanggal || "");
    const jamMulai = String(body?.jam_mulai || "");
    const jamSelesai = String(body?.jam_selesai || "");
    const durasi = Number(body?.durasi_jam || getDuration(jamMulai, jamSelesai));

    if (!idSpace || !tanggal || !jamMulai || !jamSelesai || !durasi) {
      return NextResponse.json({ message: "Data reservasi belum lengkap." }, { status: 400 });
    }

    const reservations = await readReservations();
    const spaces = await readSpaces();
    const space = spaces.find((item) => String(item.id) === String(idSpace));

    if (!space) {
      return NextResponse.json({ message: "Space tidak ditemukan." }, { status: 404 });
    }

    const diskons = await readDiskons();
    const promoCode = String(body?.kode_promo ?? body?.kode_diskon ?? "").trim().toUpperCase();
    const promo = promoCode
      ? diskons.find((item) => String(item.kode_diskon || "").toUpperCase() === promoCode)
      : null;
    const subtotal = Number(space.harga_per_jam || 0) * durasi;
    const discount = promo && Number(promo.kuota || 0) > 0 ? Number(promo.nominal_potongan || 0) : 0;
    const totalBayar = Math.max(0, subtotal - discount);

    if (promoCode && !promo) {
      return NextResponse.json({ message: "Kode promo tidak valid." }, { status: 400 });
    }

    if (promo && Number(promo.kuota || 0) <= 0) {
      return NextResponse.json({ message: "Kuota promo sudah habis." }, { status: 400 });
    }

    if (promo && subtotal < Number(promo.minimal_transaksi || 0)) {
      return NextResponse.json({
        message: `Minimal transaksi untuk promo ini Rp ${Number(promo.minimal_transaksi || 0).toLocaleString("id-ID")}.`,
      }, { status: 400 });
    }

    const conflict = reservations.some((item) => {
      const status = String(item.status || "").toUpperCase();
      return String(item.id_space) === String(idSpace) && item.tanggal === tanggal &&
        !["CANCELLED", "DIBATALKAN", "BATAL", "SELESAI"].includes(status) &&
        item.jam_mulai === jamMulai;
    });

    if (conflict) {
      return NextResponse.json({ message: "Slot waktu tersebut sudah dipesan." }, { status: 409 });
    }

    if (promo) {
      promo.kuota = Number(promo.kuota || 0) - 1;
      promo.status = promo.kuota <= 0 ? "NONAKTIF" : "AKTIF";
      promo.updated_at = new Date().toISOString();
      const nextDiskons = diskons.map((item) => String(item.id) === String(promo.id) ? promo : item);
      await writeDiskons(nextDiskons);
    }

    const reservation = normalizeReservationPayload({
      ...body,
      id: Date.now(),
      id_space: idSpace,
      tanggal,
      jam_mulai: jamMulai,
      durasi_jam: durasi,
      kode_diskon: body.kode_promo ?? body.kode_diskon ?? null,
      total_bayar: totalBayar,
      subtotal,
      potongan_diskon: discount,
      status: "PENDING",
    });

    reservations.push(reservation);
    await writeReservations(reservations);

    return NextResponse.json({ message: "Reservasi berhasil dibuat.", data: reservation }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Format data reservasi tidak valid." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const reservations = await readReservations();
  const spaces = await readSpaces();
  const username = String(request.nextUrl.searchParams.get("username") || "").trim().toLowerCase();
  const idMember = request.nextUrl.searchParams.get("id_member") || "";
  const filtered = (username || idMember
    ? reservations.filter((item) =>
        (username && String(item.username || "").toLowerCase() === username) ||
        (idMember && String(item.id_member) === idMember),
      )
    : reservations).map((item) => {
      const space = spaces.find((spaceItem) => String(spaceItem.id) === String(item.id_space));
      const subtotal = Number(space?.harga_per_jam || 0) * Number(item.durasi_jam || 0);

      return {
        ...item,
        subtotal: Number(item.subtotal || 0) || subtotal,
        total_bayar: Number(item.total_bayar || 0) || subtotal,
        space,
      };
    });

  return NextResponse.json({ message: "OK", data: filtered });
}

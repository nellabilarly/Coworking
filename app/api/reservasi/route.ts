import { NextRequest, NextResponse } from "next/server";
import { readDiskons, writeDiskons } from "@/lib/admin-diskon-store";
import { normalizeReservationPayload, readReservations, writeReservations } from "@/lib/reservasi-store";

export const runtime = "nodejs";

export async function GET() {
  const reservations = await readReservations();

  return NextResponse.json({
    message: "OK",
    data: reservations,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idSpace = Number(body?.id_space ?? 0);

    if (!idSpace) {
      return NextResponse.json({ message: "Pilih ruang kerja terlebih dahulu." }, { status: 400 });
    }

    const diskons = await readDiskons();
    const rawCode = String(body?.kode_diskon ?? "").trim();

    if (rawCode) {
      const code = rawCode.toUpperCase();
      const matching = diskons.find((item) => String(item.kode_diskon || "").trim().toUpperCase() === code);

      if (!matching) {
        return NextResponse.json({ message: "Kode diskon tidak valid." }, { status: 400 });
      }

      if (Number(matching.kuota || 0) <= 0) {
        return NextResponse.json({ message: "Kuota diskon sudah habis." }, { status: 400 });
      }

      matching.kuota = Number(matching.kuota || 0) - 1;
      matching.status = Number(matching.kuota || 0) <= 0 ? "NONAKTIF" : "AKTIF";
      matching.updated_at = new Date().toISOString();
      await writeDiskons(diskons);
    }

    const reservations = await readReservations();
    const reservation = normalizeReservationPayload({
      ...body,
      id: Date.now(),
      status: "PENDING",
      kode_diskon: rawCode || null,
    });

    reservations.push(reservation);
    await writeReservations(reservations);

    return NextResponse.json(
      {
        message: "Reservasi berhasil dibuat.",
        data: reservation,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Format data reservasi tidak valid." }, { status: 400 });
  }
}

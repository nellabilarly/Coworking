import fs from "node:fs/promises";
import path from "node:path";

export type ReservationRecord = {
  id: number | string;
  id_space: number | string;
  tanggal?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  durasi_jam?: number | string;
  tanggal_pinjam?: string;
  kode_diskon?: string | null;
  id_member?: number | string | null;
  username?: string;
  nama_member?: string;
  instansi?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reservasi.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readReservations(): Promise<ReservationRecord[]> {
  await ensureStore();

  const raw = await fs.readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeReservations(reservations: ReservationRecord[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(reservations, null, 2), "utf8");
}

export function normalizeReservationPayload(input: Record<string, any>): ReservationRecord {
  return {
    id: input.id ?? Date.now(),
    id_space: Number(input.id_space ?? 0),
    tanggal: input.tanggal ?? new Date().toISOString().slice(0, 10),
    tanggal_pinjam: input.tanggal_pinjam ?? input.tanggal ?? new Date().toISOString().slice(0, 10),
    jam_mulai: input.jam_mulai ?? "09:00",
    jam_selesai: input.jam_selesai ?? "",
    durasi_jam: Number(input.durasi_jam ?? 1),
    kode_diskon: input.kode_diskon ?? null,
    subtotal: Number(input.subtotal ?? 0),
    potongan_diskon: Number(input.potongan_diskon ?? 0),
    total_bayar: Number(input.total_bayar ?? 0),
    id_member: input.id_member ?? null,
    username: input.username ?? "",
    nama_member: input.nama_member ?? "",
    instansi: input.instansi ?? "",
    status: input.status ?? "PENDING",
    created_at: input.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

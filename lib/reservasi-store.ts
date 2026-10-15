import { readJsonFile, writeJsonFile } from "@/lib/server-store";

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

const DATA_FILE = "reservasi.json";

export async function readReservations(): Promise<ReservationRecord[]> {
  const parsed = await readJsonFile<ReservationRecord[]>(DATA_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeReservations(reservations: ReservationRecord[]) {
  await writeJsonFile(DATA_FILE, reservations);
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

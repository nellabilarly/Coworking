import { readJsonFile, writeJsonFile } from "@/lib/server-store";

export type DiskonRecord = {
  id: number | string;
  kode_diskon?: string;
  nominal_potongan?: number | string;
  minimal_transaksi?: number | string;
  kuota?: number | string;
  status?: string;
  tanggal_mulai?: string | null;
  tanggal_berakhir?: string | null;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const DATA_FILE = "admin-diskons.json";

export async function readDiskons(): Promise<DiskonRecord[]> {
  const parsed = await readJsonFile<DiskonRecord[]>(DATA_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeDiskons(diskons: DiskonRecord[]) {
  await writeJsonFile(DATA_FILE, diskons);
}

export function normalizeDiskonPayload(input: Record<string, any>): DiskonRecord {
  const nextStatus = String(input.status || "AKTIF").toUpperCase();

  return {
    id: input.id ?? Date.now(),
    kode_diskon: input.kode_diskon ?? input.kode ?? "",
    nominal_potongan: Number(input.nominal_potongan ?? input.potongan ?? 0),
    minimal_transaksi: Number(input.minimal_transaksi ?? input.minimal ?? 0),
    kuota: Number(input.kuota ?? 0),
    status: nextStatus,
    tanggal_mulai: input.tanggal_mulai ?? input.tgl_mulai ?? input.start_date ?? null,
    tanggal_berakhir: input.tanggal_berakhir ?? input.tgl_berakhir ?? input.end_date ?? null,
    deskripsi: input.deskripsi ?? "",
    created_at: input.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

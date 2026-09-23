import fs from "node:fs/promises";
import path from "node:path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-diskons.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readDiskons(): Promise<DiskonRecord[]> {
  await ensureStore();

  const raw = await fs.readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeDiskons(diskons: DiskonRecord[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(diskons, null, 2), "utf8");
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

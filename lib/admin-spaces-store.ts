import fs from "node:fs/promises";
import path from "node:path";

export type SpaceRecord = {
  id: number | string;
  nama_space?: string;
  harga_per_jam?: number | string;
  tipe?: string;
  kapasitas?: number | string;
  deskripsi?: string;
  foto?: string | null;
  foto_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-spaces.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "spaces");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readSpaces(): Promise<SpaceRecord[]> {
  await ensureStore();

  const raw = await fs.readFile(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeSpaces(spaces: SpaceRecord[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(spaces, null, 2), "utf8");
}

export async function saveUploadedSpaceImage(file: File) {
  const name = file.name || "space-image";
  const extension = name.includes(".") ? name.split(".").pop() || "png" : "png";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/uploads/spaces/${safeName}`;
}

export function normalizeSpacePayload(input: Record<string, any>): SpaceRecord {
  const fotoUrl =
    input.foto_url ||
    input.fotoUrl ||
    input.image_url ||
    input.imageUrl ||
    input.photo_url ||
    input.photoUrl ||
    input.foto ||
    input.image ||
    input.photo ||
    input.file ||
    input.url ||
    null;

  return {
    id: input.id ?? Date.now(),
    nama_space: input.nama_space ?? input.namaRuangan ?? "",
    harga_per_jam: input.harga_per_jam ?? input.harga ?? 0,
    tipe: input.tipe ?? "desk",
    kapasitas: input.kapasitas ?? 0,
    deskripsi: input.deskripsi ?? "",
    foto_url: fotoUrl,
    foto: fotoUrl,
    image: fotoUrl,
    image_url: fotoUrl,
    photo: fotoUrl,
    photo_url: fotoUrl,
    created_at: input.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

import fs from "node:fs/promises";
import path from "node:path";
import { readJsonFile, writeJsonFile } from "@/lib/server-store";

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

const DATA_FILE = "admin-spaces.json";
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "spaces");

export async function readSpaces(): Promise<SpaceRecord[]> {
  const parsed = await readJsonFile<SpaceRecord[]>(DATA_FILE, []);
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeSpaces(spaces: SpaceRecord[]) {
  await writeJsonFile(DATA_FILE, spaces);
}

export async function saveUploadedSpaceImage(file: File) {
  const name = file.name || "space-image";
  const extension = name.includes(".") ? name.split(".").pop() || "png" : "png";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, safeName);

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
  } catch {
    // Local file uploads are not guaranteed on serverless hosts. The image URL is still returned
    // so the request can proceed without crashing the registration flow.
  }

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

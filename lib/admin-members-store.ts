import fs from "node:fs/promises";
import path from "node:path";

export type MemberRecord = {
  id: number | string;
  username: string;
  password?: string;
  nama_member: string;
  instansi?: string;
  alamat?: string;
  telp?: string;
  foto?: string | null;
  foto_url?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-members.json");

export function normalizeMemberPhoto(value?: unknown) {
  const photo = String(value ?? "").trim();
  if (!photo || photo === "null" || photo === "undefined") return null;

  if (photo.startsWith("data:") || photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return photo;
  }

  const normalized = photo.replace(/\\/g, "/");

  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }

  if (normalized.includes("uploads/members/")) {
    return `/${normalized.replace(/^.*?uploads\//, "uploads/")}`;
  }

  if (normalized.includes("/uploads/")) {
    return `/${normalized.replace(/^.*?\/uploads\//, "uploads/")}`;
  }

  if (/\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(normalized)) {
    return `/uploads/members/${normalized}`;
  }

  return `/${normalized}`;
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

export async function readMembers(): Promise<MemberRecord[]> {
  await ensureStore();

  const raw = await fs.readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          foto: normalizeMemberPhoto(item?.foto_url || item?.foto || item?.profile_photo || item?.photo),
          foto_url: normalizeMemberPhoto(item?.foto_url || item?.foto || item?.profile_photo || item?.photo),
          profile_photo: normalizeMemberPhoto(item?.profile_photo || item?.foto_url || item?.foto || item?.photo),
          photo: normalizeMemberPhoto(item?.photo || item?.profile_photo || item?.foto_url || item?.foto),
        }))
      : [];
  } catch {
    return [];
  }
}

export async function writeMembers(members: MemberRecord[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(members, null, 2), "utf8");
}

export function normalizeMemberPayload(input: Record<string, any>): MemberRecord {
  const username = String(input.username ?? "").trim();
  const namaMember = String(input.nama_member ?? input.nama ?? input.name ?? "").trim();
  const instansi = String(input.instansi ?? input.institusi ?? "").trim();
  const alamat = String(input.alamat ?? input.address ?? "").trim();
  const telp = String(input.telp ?? input.phone ?? input.no_telp ?? "").trim();
  const role = String(input.role ?? "member").trim().toLowerCase() === "admin" ? "admin" : "member";
  const photo = normalizeMemberPhoto(
    input.foto_url ?? input.foto ?? input.profile_photo ?? input.photo ?? input.avatar ?? null,
  );

  return {
    id: input.id ?? Date.now(),
    username,
    password: input.password ?? "",
    nama_member: namaMember,
    instansi,
    alamat,
    telp,
    foto: photo,
    foto_url: photo,
    profile_photo: photo,
    photo,
    role,
    status: String(input.status ?? "AKTIF").toUpperCase(),
    created_at: input.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

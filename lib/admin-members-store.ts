import { readJsonFile, writeJsonFile } from "@/lib/server-store";

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

const DATA_FILE = "admin-members.json";

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

export async function readMembers(): Promise<MemberRecord[]> {
  const parsed = await readJsonFile<MemberRecord[]>(DATA_FILE, []);

  return Array.isArray(parsed)
    ? parsed.map((item) => ({
        ...item,
        foto: normalizeMemberPhoto(item?.foto_url || item?.foto || item?.profile_photo || item?.photo),
        foto_url: normalizeMemberPhoto(item?.foto_url || item?.foto || item?.profile_photo || item?.photo),
        profile_photo: normalizeMemberPhoto(item?.profile_photo || item?.foto_url || item?.foto || item?.photo),
        photo: normalizeMemberPhoto(item?.photo || item?.profile_photo || item?.foto_url || item?.foto),
      }))
    : [];
}

export async function writeMembers(members: MemberRecord[]) {
  await writeJsonFile(DATA_FILE, members);
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

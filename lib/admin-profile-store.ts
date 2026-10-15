import { readJsonFile, writeJsonFile } from "@/lib/server-store";

export type AdminProfileRecord = {
  id?: number | string;
  username?: string;
  email?: string;
  nama_pemilik?: string;
  nama_coworking?: string;
  telp?: string;
  alamat?: string;
  foto?: string | null;
  role?: "admin";
  updated_at?: string;
  [key: string]: any;
};

const DATA_FILE = "admin-profile.json";

const DEFAULT_PROFILE: AdminProfileRecord = {
  role: "admin",
  nama_pemilik: "",
  nama_coworking: "",
  telp: "",
  alamat: "",
  foto: null,
};

export async function readAdminProfile(): Promise<AdminProfileRecord> {
  const parsed = await readJsonFile<Record<string, unknown>>(DATA_FILE, DEFAULT_PROFILE);
  return { ...DEFAULT_PROFILE, ...(parsed && typeof parsed === "object" ? parsed : {}) } as AdminProfileRecord;
}

export async function writeAdminProfile(profile: AdminProfileRecord) {
  await writeJsonFile(DATA_FILE, profile);
}

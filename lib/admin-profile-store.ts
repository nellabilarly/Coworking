import fs from "node:fs/promises";
import path from "node:path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "admin-profile.json");

const DEFAULT_PROFILE: AdminProfileRecord = {
  role: "admin",
  nama_pemilik: "",
  nama_coworking: "",
  telp: "",
  alamat: "",
  foto: null,
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2), "utf8");
  }
}

export async function readAdminProfile(): Promise<AdminProfileRecord> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw || "{}");
    return { ...DEFAULT_PROFILE, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export async function writeAdminProfile(profile: AdminProfileRecord) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(profile, null, 2), "utf8");
}

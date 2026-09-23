/* eslint-disable @typescript-eslint/no-explicit-any */

import type { LoginRequest, LoginResponse } from "@/types/auth";
import { setCookie, setRoleCookie } from "./helper";
import { forgetDeletedMember, isDeletedMember, rememberMemberUsername } from "./user";

// 🔴 PENTING: Ganti string di bawah ini dengan App Key (mk_...) asli milikmu yang dari Postman!
const APP_KEY = "mk_f4f26052503841eb8f95dee73e036726";

export function normalizePhotoUrl(value?: string | null) {
  if (!value || value === "null" || value === "undefined") return null;

  const photo = String(value).trim();
  if (!photo) return null;

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

export function normalizeRole(value?: string | null) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "admin" || normalized === "administrator" || normalized === "owner") {
    return "admin";
  }

  return "member";
}

export function normalizeAuthUser(rawUser?: any, fallbackUser?: any) {
  const user = { ...(fallbackUser || {}), ...(rawUser || {}) };
  const photo = normalizePhotoUrl(
    fallbackUser?.foto ||
    fallbackUser?.foto_url ||
    fallbackUser?.profile_photo ||
    fallbackUser?.photo ||
    user.foto ||
    user.profile_photo ||
    user.photo ||
    user.avatar ||
    user.foto_profil ||
    user.fotoProfile ||
    user.image ||
    user.foto_url ||
    null,
  );

  const name =
    fallbackUser?.nama_member ||
    user.nama_member ||
    user.nama ||
    user.name ||
    user.full_name ||
    user.fullName ||
    user.username ||
    fallbackUser?.nama_member ||
    fallbackUser?.name ||
    "Member";

  const instansi =
    fallbackUser?.instansi ||
    user.instansi ||
    user.institusi ||
    user.company ||
    user.perusahaan ||
    user.organization ||
    fallbackUser?.instansi ||
    "";

  const alamat =
    fallbackUser?.alamat ||
    user.alamat ||
    user.address ||
    user.alamat_lengkap ||
    fallbackUser?.alamat ||
    "";

  const telp =
    fallbackUser?.telp ||
    user.telp ||
    user.phone ||
    user.no_telp ||
    user.noTelp ||
    user.phone_number ||
    user.nomor_telepon ||
    fallbackUser?.telp ||
    "";

  return {
    ...user,
    id: user.id ?? fallbackUser?.id ?? null,
    username: user.username || fallbackUser?.username || "",
    email: user.email || user.mail || fallbackUser?.email || "",
    nama_member: user.nama_member || name,
    name,
    instansi,
    alamat,
    telp,
    foto: photo,
    foto_url: photo,
    profile_photo: photo,
    photo,
    avatar: photo,
    role: normalizeRole(user.role || fallbackUser?.role),
  };
}

export function normalizeAdminProfile(rawUser?: any, fallbackUser?: any) {
  const user = { ...(fallbackUser || {}), ...(rawUser || {}) };

  const namaPemilik =
    user.nama_pemilik ||
    user.namaPemilik ||
    user.owner_name ||
    user.ownerName ||
    user.pemilik ||
    user.nama_owner ||
    user.nama ||
    user.full_name ||
    user.name ||
    fallbackUser?.nama_pemilik ||
    "";

  const namaCoworking =
    user.nama_coworking ||
    user.namaCoworking ||
    user.coworking_name ||
    user.coworkingName ||
    user.nama_space ||
    user.space_name ||
    user.workspace_name ||
    user.company ||
    fallbackUser?.nama_coworking ||
    "";

  const telp =
    user.telp ||
    user.phone ||
    user.no_telp ||
    user.noTelp ||
    user.phone_number ||
    user.nomor_telepon ||
    user.no_hp ||
    user.handphone ||
    fallbackUser?.telp ||
    "";

  return {
    ...user,
    id: user.id ?? fallbackUser?.id ?? null,
    username: user.username || user.user_name || fallbackUser?.username || "",
    email: user.email || user.mail || fallbackUser?.email || "",
    nama_pemilik: namaPemilik,
    nama_coworking: namaCoworking,
    telp,
    role: normalizeRole(user.role || fallbackUser?.role || "admin"),
  };
}

export function saveAdminRegistration(data?: any) {
  const rawUser =
    data?.user ||
    data?.data?.user ||
    data?.data?.admin ||
    data?.admin ||
    data ||
    {};

  const normalizedUser = normalizeAdminProfile(rawUser, data);

  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("admin_profile", JSON.stringify(normalizedUser));
  }

  return normalizedUser;
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin_profile");
  localStorage.removeItem("pending_member_user");
  localStorage.removeItem("last_login_role");
  document.cookie = "role=; path=/; max-age=0";
  document.cookie = "token=; path=/; max-age=0";
}

export function getMemberHistory(): any[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem("member_history");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addMemberHistory(member?: any) {
  if (typeof window === "undefined" || !member) {
    return;
  }

  const existing = getMemberHistory();
  const uniqueKey = String(member.id ?? member.username ?? "");

  if (!uniqueKey) {
    return;
  }

  const next = [
    ...existing.filter((item) => String(item.id ?? item.username ?? "") !== uniqueKey),
    {
      id: member.id ?? Date.now(),
      username: member.username || "",
      nama_member: member.nama_member || member.name || member.username || "",
      instansi: member.instansi || "",
      telp: member.telp || member.phone || "",
      role: normalizeRole(member.role || "member"),
      status: member.status || "AKTIF",
      updated_at: new Date().toISOString(),
    },
  ];

  localStorage.setItem("member_history", JSON.stringify(next));
}

export function saveMemberRegistration(data?: any, fallbackUser?: any) {
  const rawUser =
    data?.user ||
    data?.data?.user ||
    data?.data?.member ||
    data?.member ||
    data ||
    {};

  const normalizedUser = normalizeAuthUser(rawUser, fallbackUser || data || rawUser);
  const persistedUser = {
    ...normalizedUser,
    foto: normalizedUser.foto || normalizedUser.foto_url || normalizedUser.profile_photo || normalizedUser.photo || null,
    foto_url: normalizedUser.foto_url || normalizedUser.foto || normalizedUser.profile_photo || normalizedUser.photo || null,
    profile_photo: normalizedUser.profile_photo || normalizedUser.foto || normalizedUser.foto_url || normalizedUser.photo || null,
    photo: normalizedUser.photo || normalizedUser.foto || normalizedUser.foto_url || normalizedUser.profile_photo || null,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(persistedUser));
    localStorage.setItem("pending_member_user", JSON.stringify(persistedUser));
  }

  return persistedUser;
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem("user");
    const pendingRaw = localStorage.getItem("pending_member_user");

    if (raw) {
      const parsedUser = JSON.parse(raw);
      const pendingUser = pendingRaw ? JSON.parse(pendingRaw) : null;
      return normalizeAuthUser(parsedUser, pendingUser);
    }

    if (pendingRaw) {
      return normalizeAuthUser(JSON.parse(pendingRaw));
    }

    return null;
  } catch {
    try {
      const pendingRaw = localStorage.getItem("pending_member_user");
      if (!pendingRaw) return null;
      return normalizeAuthUser(JSON.parse(pendingRaw));
    } catch {
      return null;
    }
  }
}

export function clearStoredUserPhoto() {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem("user");
    if (!raw) return;

    const user = JSON.parse(raw);
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, foto: null, foto_url: null, profile_photo: null, photo: null, avatar: null }),
    );
  } catch {
    // Ignore malformed cached session data.
  }
}

export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  if (isDeletedMember(credentials.username)) {
    throw new Error("Akun member ini sudah dihapus oleh admin. Silakan register kembali.");
  }

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL_CO;

  if (!baseUrl) {
    throw new Error("URL backend belum dikonfigurasi di .env");
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-maker-key": APP_KEY,
    },
    body: JSON.stringify(credentials),
  });

  const responseData: LoginResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || "Login gagal.");
  }

  return responseData;
}

export async function saveAuthSession(responseData: any, fallbackUser?: any, forcedRole?: string) {
  const token =
    responseData?.access_token ||
    responseData?.token ||
    responseData?.data?.access_token ||
    responseData?.data?.token ||
    responseData?.jwt ||
    responseData?.data?.jwt ||
    responseData?.data?.data?.access_token ||
    null;

  const pendingUserRaw =
    typeof window !== "undefined" ? localStorage.getItem("pending_member_user") : null;
  const pendingUser = pendingUserRaw ? JSON.parse(pendingUserRaw) : null;

  const existingAdminProfileRaw =
    typeof window !== "undefined" ? localStorage.getItem("admin_profile") : null;
  const existingAdminProfile = existingAdminProfileRaw ? JSON.parse(existingAdminProfileRaw) : null;

  const rawUser =
    responseData?.user ||
    responseData?.data?.user ||
    responseData?.data?.admin ||
    responseData?.data?.profile ||
    responseData?.data?.member ||
    responseData?.member ||
    responseData?.userData ||
    responseData?.data ||
    fallbackUser ||
    pendingUser ||
    existingAdminProfile;

  const role = normalizeRole(
    forcedRole || rawUser?.role || fallbackUser?.role || pendingUser?.role || existingAdminProfile?.role || "member",
  );

  const user =
    role === "admin"
      ? normalizeAdminProfile({ ...(existingAdminProfile || {}), ...(rawUser || {}), role }, fallbackUser || pendingUser || existingAdminProfile)
      : normalizeAuthUser({ ...(rawUser || {}), role }, fallbackUser || pendingUser || existingAdminProfile);

  if (!token) {
    throw new Error("Token tidak ditemukan dari server.");
  }

  await setCookie("token", token);
  await setRoleCookie(role);

  if (typeof window !== "undefined") {
    document.cookie = `role=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24}`;
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (role === "admin") {
        localStorage.setItem("admin_profile", JSON.stringify(user));
      } else {
        addMemberHistory(user);
      }
      localStorage.removeItem("pending_member_user");
    } else {
      localStorage.removeItem("user");
    }

    if (role === "member" && user) {
      try {
        const memberId = user.id;
        const memberPayload = {
          id: memberId,
          username: user.username,
          nama_member: user.nama_member || user.name || user.username,
          instansi: user.instansi || "",
          alamat: user.alamat || "",
          telp: user.telp || "",
          role: "member",
          foto: user.foto || user.foto_url || user.profile_photo || user.photo || null,
          foto_url: user.foto_url || user.foto || user.profile_photo || user.photo || null,
          profile_photo: user.profile_photo || user.foto || user.foto_url || user.photo || null,
          photo: user.photo || user.foto || user.foto_url || user.profile_photo || null,
          ...(fallbackUser?.password ? { password: fallbackUser.password } : {}),
        };
        const syncUrl = memberId ? `/api/admin/members/${encodeURIComponent(String(memberId))}` : "/api/admin/members";
        const syncMethod = memberId ? "PUT" : "POST";
        await fetch(syncUrl, {
          method: syncMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberPayload),
        });
      } catch {
        // Login should still complete when the admin member mirror is unavailable.
      }
    }
  }

  return user;
}

// 🌟 TAMBAHAN KELOMPOK BARU: Fungsi Register Admin Space (Menggunakan JSON raw)
export async function registerAdmin(payload: any): Promise<any> {
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL_CO;

  if (!baseUrl) {
    throw new Error("URL backend belum dikonfigurasi.");
  }

  const response = await fetch(`${baseUrl}/api/auth/register/admin-space`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-maker-key": APP_KEY,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal melakukan registrasi admin.");
  }

  const registrationData =
    result?.data && typeof result.data === "object" ? result.data : {};
  const savedUser = saveAdminRegistration({
    ...payload,
    ...registrationData,
    ...(result?.user || {}),
    role: "admin",
  });
  return { ...result, user: savedUser };
}

async function registerMemberAccount(formData: FormData): Promise<any> {
  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL_CO;

  if (!baseUrl) {
    throw new Error("URL backend belum dikonfigurasi.");
  }

  const response = await fetch(`${baseUrl}/api/auth/register/member`, {
    method: "POST",
    headers: {
      "x-maker-key": APP_KEY,
    },
    body: formData, // Mengirimkan objek FormData langsung (boundary otomatis dibuat browser)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal melakukan registrasi member.");
  }

  return result;
}

// Fungsi Register Member Baru (Mendukung file binary/Foto profil via FormData)
export async function registerMember(formData: FormData): Promise<any> {
  const result = await registerMemberAccount(formData);
  const username = String(formData.get("username") || "");
  forgetDeletedMember(username);
  rememberMemberUsername(username, String(formData.get("nama_member") || ""));

  const fallbackUser: any = {
    username: formData.get("username") || "",
    nama_member: formData.get("nama_member") || "",
    instansi: formData.get("instansi") || "",
    alamat: formData.get("alamat") || "",
    telp: formData.get("telp") || "",
    role: "member",
    foto: null,
  };

  const savedUser = saveMemberRegistration(result?.data ?? result ?? {}, fallbackUser);
  return { ...result, user: savedUser };
}

export async function createMemberAccount(formData: FormData): Promise<any> {
  const result = await registerMemberAccount(formData);
  const username = String(formData.get("username") || "");
  forgetDeletedMember(username);
  rememberMemberUsername(username, String(formData.get("nama_member") || ""));
  return result?.data ?? result;
}

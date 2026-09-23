import { normalizeAdminProfile } from "@/lib/auth";

const APP_KEY = "mk_f4f26052503841eb8f95dee73e036726";

export function getAdminBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL_CO ||
    "http://localhost:3000"
  );
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "x-maker-key": APP_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function safeAdminFetch<T>(path: string, fallback: T, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${getAdminBaseUrl()}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return fallback;
    }

    return (payload.data ?? payload ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export async function getDiskonList() {
  return safeAdminFetch<any[]>(`/api/admin/diskon`, []);
}

export async function getDiskonById(id: string | number) {
  return safeAdminFetch<any>(`/api/admin/diskon/${id}`, null);
}

export async function createDiskon(payload: Record<string, any>) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/diskon`, {
    method: "POST",
    headers: {
      ...getAuthHeaders({ "Content-Type": "application/json" }),
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambah diskon.");
  }

  return result.data ?? result;
}

export async function updateDiskon(id: string | number, payload: Record<string, any>) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/diskon/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders({ "Content-Type": "application/json" }),
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui diskon.");
  }

  return result.data ?? result;
}

export async function deleteDiskon(id: string | number) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/diskon/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus diskon.");
  }

  return result;
}

export async function getAdminReservations(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  ).toString();
  return safeAdminFetch<any[]>(`/api/admin/reservasi${query ? `?${query}` : ""}`, []);
}

export async function updateReservationStatus(id: string | number, status: string) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/reservasi/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
    body: JSON.stringify({ status }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Gagal mengubah status reservasi.");
  return result.data ?? result;
}

export async function checkInReservation(id: string | number) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/reservasi/${id}/check-in`, {
    method: "POST",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Gagal melakukan check-in.");
  return result.data ?? result;
}

export async function checkOutReservation(id: string | number) {
  const response = await fetch(`${getAdminBaseUrl()}/api/admin/reservasi/${id}/check-out`, {
    method: "POST",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Gagal melakukan check-out.");
  return result.data ?? result;
}

export async function getReservationById(id: string | number) {
  return safeAdminFetch<any>(`/api/admin/reservasi/${id}`, null);
}

export async function getAdminReports() {
  const current = new Date();
  return getAdminMonthlyReport(String(current.getMonth() + 1).padStart(2, "0"), String(current.getFullYear()));
}

export async function getAdminMonthlyReport(month?: string, year = "2026") {
  const query = new URLSearchParams();
  if (month) query.set("month", month);
  if (year) query.set("year", year);
  return safeAdminFetch<any>(`/api/admin/reports/monthly?${query.toString()}`, {
    bulanText: `${month || ""}/${year}`,
    totalTransaksi: 0,
    jamTerpakai: 0,
    omsetKotor: 0,
    potonganDiskon: 0,
    labaBersih: 0,
    items: [],
  });
}

export async function getAdminIncome(month?: string, year = "2026") {
  const query = new URLSearchParams();
  if (month) query.set("month", month);
  if (year) query.set("year", year);
  return safeAdminFetch<any>(`/api/admin/reports/income?${query.toString()}`, {
    totalPendapatanBersih: 0,
    bulanText: `${month || ""}/${year}`,
  });
}

async function uploadMedia(path: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getAdminBaseUrl()}${path}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || "Gagal mengunggah file.");
  return result.data ?? result;
}

export function uploadSpacePhoto(file: File) {
  return uploadMedia("/api/upload/spaces", file);
}

export function uploadMemberPhoto(file: File) {
  return uploadMedia("/api/upload/members", file);
}

export async function getAdminProfile() {
  const fallback = {
    username: "",
    nama_pemilik: "",
    nama_coworking: "",
    telp: "",
    role: "admin",
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const response = await fetch(`${getAdminBaseUrl()}/api/admin/profile`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok && payload?.data) {
      const normalized = normalizeAdminProfile(payload.data, fallback);
      localStorage.setItem("admin_profile", JSON.stringify(normalized));
      return normalized;
    }
  } catch {
    // Fall back to the locally cached admin profile.
  }

  const rawAdminProfile = localStorage.getItem("admin_profile");
  const rawUser = localStorage.getItem("user");
  const raw = rawAdminProfile || rawUser;

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeAdminProfile(parsed, fallback);

    if (typeof window !== "undefined") {
      localStorage.setItem("admin_profile", JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return fallback;
  }
}

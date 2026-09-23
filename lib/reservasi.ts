import { getCookie } from "./helper";

const APP_KEY = "mk_f4f26052503841eb8f95dee73e036726"; // 🔴 SAMAKAN DENGAN APP KEY KAMU

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const routeMatch = window.location.pathname.match(
      /^(.*?)(?:\/(?:member|Member|admin|Admin)(?:\/|$))/,
    );
    return `${window.location.origin}${routeMatch?.[1] || ""}`;
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL_CO ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"
  );
}

async function getAuthHeaders() {
  const token = await getCookie("token");
  return {
    "Content-Type": "application/json",
    "x-maker-key": APP_KEY,
    "Authorization": `Bearer ${token}`, // Membawa token otorisasi login
  };
}

export async function createReservasi(payload: {
  id_space: number;
  kode_diskon?: string | null;
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number;
}) {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;

  const response = await fetch(`${baseUrl}/api/member/reservasi`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...payload,
      tanggal_pinjam: payload.tanggal,
      jam_selesai: `${String(Number(payload.jam_mulai.split(":")[0]) + payload.durasi_jam).padStart(2, "0")}:${payload.jam_mulai.split(":")[1] || "00"}`,
      kode_promo: payload.kode_diskon || null,
      id_member: user?.id ?? user?.user_id ?? null,
      username: user?.username ?? "",
      nama_member: user?.nama_member ?? user?.name ?? "",
      instansi: user?.instansi ?? "",
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal membuat transaksi reservasi.");
  return result;
}

export async function getMyReservations() {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const query = new URLSearchParams();
  if (user?.username) query.set("username", user.username);
  if (user?.id) query.set("id_member", String(user.id));

  const response = await fetch(`${baseUrl}/api/member/reservasi${query.toString() ? `?${query}` : ""}`, {
    headers,
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal mengambil daftar reservasi aktif.");
  return result.data || result;
}

export async function getReservationHistory(bulan?: string) {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const query = new URLSearchParams();
  if (bulan) query.set("bulan", bulan);
  if (user?.username) query.set("username", user.username);
  if (user?.id) query.set("id_member", String(user.id));
  const url = `${baseUrl}/api/member/reservasi${query.toString() ? `?${query}` : ""}`;

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal mengambil histori transaksi.");
  return result.data || result;
}

export async function getETicket(id: string | number) {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(`${baseUrl}/api/reservasi/${id}/e-ticket`, {
    headers,
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal mengambil data e-ticket.");
  return result.data || result;
}

export async function cancelReservasi(id: string | number) {
  const baseUrl = getApiBaseUrl();
  const headers = await getAuthHeaders();

  const response = await fetch(`${baseUrl}/api/member/reservasi/${id}/cancel`, {
    method: "POST",
    headers,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal membatalkan reservasi.");
  return result;
}

import { getCookie } from "./helper";

const APP_KEY = "mk_f4f26052503841eb8f95dee73e036726";

interface User {
  id: number;
  username: string;
  nama_member?: string;
  role: string;
  [key: string]: any;
}

function getStoredMemberHistory(): User[] {
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

function getMemberUsernameMap(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem("member_username_map");
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberMemberUsername(username: string, name?: string) {
  if (typeof window === "undefined" || !username.trim()) return;

  const map = getMemberUsernameMap();
  map[username.trim().toLowerCase()] = username.trim();
  if (name?.trim()) map[`name:${name.trim().toLowerCase()}`] = username.trim();
  localStorage.setItem("member_username_map", JSON.stringify(map));
}

function normalizeMember(member: Record<string, any>): User {
  return {
    ...member,
    id: Number(member.id ?? member.user_id ?? 0) || 0,
    username: member.username || member.user_name || member.userName || member.login || member.email || "",
    nama_member: member.nama_member || member.nama || member.name || member.full_name || member.username || member.user_name || "",
    role: member.role || member.user_role || "member",
    instansi: member.instansi || member.institusi || member.company || "",
    telp: member.telp || member.phone || member.no_telp || "",
  };
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL_CO || "http://localhost:3000";
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return {
    "x-maker-key": APP_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export async function getUsers(search?: string): Promise<User[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  let serverMembers: User[] = [];

  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/members${query}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data user");
    }

    serverMembers = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
  } catch {
    serverMembers = [];
  }

  const localMembers = getStoredMemberHistory();
  const usernameMap = getMemberUsernameMap();
  const merged = [...serverMembers, ...localMembers];
  const map = new Map<string, User>();

  for (const member of merged) {
    const normalizedMember = normalizeMember(member);
    const mappedUsername =
      usernameMap[`name:${normalizedMember.nama_member?.trim().toLowerCase()}`] ||
      usernameMap[normalizedMember.username?.trim().toLowerCase()];
    if (!normalizedMember.username && mappedUsername) {
      normalizedMember.username = mappedUsername;
    }
    const key = String(normalizedMember.id || normalizedMember.username || normalizedMember.nama_member || "");
    if (!key) continue;
    const existingKey = Array.from(map.entries()).find(([, existing]) =>
      normalizedMember.nama_member &&
      existing.nama_member?.toLowerCase() === normalizedMember.nama_member.toLowerCase(),
    )?.[0];
    const resolvedKey = existingKey || key;
    const existingMember = map.get(resolvedKey);
    map.set(resolvedKey, {
      ...existingMember,
      ...normalizedMember,
      username: normalizedMember.username || existingMember?.username || "",
      nama_member: normalizedMember.nama_member || existingMember?.nama_member || "",
      instansi: normalizedMember.instansi || existingMember?.instansi || "",
      telp: normalizedMember.telp || existingMember?.telp || "",
    });
  }

  const finalMembers = Array.from(map.values());

  if (!search) {
    return finalMembers;
  }

  const term = search.trim().toLowerCase();
  return finalMembers.filter((member) => {
    const haystack = [
      member.username,
      member.nama_member,
      member.instansi,
      member.telp,
      member.role,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

export async function getLoggedInMembers(search?: string): Promise<User[]> {
  const members = await getUsers(search);

  return members.filter((member) => String(member.role || "member").toLowerCase() === "member");
}

export function removeLoggedInMember(id: number | string, username?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUsername = String(username || "").trim().toLowerCase();
  const members = getStoredMemberHistory().filter((member) =>
    String(member.id) !== String(id) &&
    (!normalizedUsername || String(member.username || "").trim().toLowerCase() !== normalizedUsername),
  );
  localStorage.setItem("member_history", JSON.stringify(members));
}

export function rememberDeletedMember(username?: string) {
  if (typeof window === "undefined" || !username) return;

  const key = username.trim().toLowerCase();
  let deleted: unknown = [];
  try {
    const raw = localStorage.getItem("deleted_member_usernames");
    deleted = raw ? JSON.parse(raw) : [];
  } catch {
    deleted = [];
  }
  const next = Array.isArray(deleted) ? deleted.filter((item) => item !== key) : [];
  next.push(key);
  localStorage.setItem("deleted_member_usernames", JSON.stringify(next));
}

export function isDeletedMember(username?: string) {
  if (typeof window === "undefined" || !username) return false;

  try {
    const raw = localStorage.getItem("deleted_member_usernames");
    const deleted = raw ? JSON.parse(raw) : [];
    return Array.isArray(deleted) && deleted.includes(username.trim().toLowerCase());
  } catch {
    return false;
  }
}

export function forgetDeletedMember(username?: string) {
  if (typeof window === "undefined" || !username) return;

  try {
    const raw = localStorage.getItem("deleted_member_usernames");
    const deleted = raw ? JSON.parse(raw) : [];
    if (Array.isArray(deleted)) {
      localStorage.setItem(
        "deleted_member_usernames",
        JSON.stringify(deleted.filter((item) => item !== username.trim().toLowerCase())),
      );
    }
  } catch {
    localStorage.removeItem("deleted_member_usernames");
  }
}

export async function getUserById(id: number) {
  const response = await fetch(`${getBaseUrl()}/api/admin/members/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail user");
  }

  return result.data || result;
}

export async function createUser(payload: Record<string, any>) {
  const response = await fetch(`${getBaseUrl()}/api/admin/members`, {
    method: "POST",
    headers: {
      ...getAuthHeaders({ "Content-Type": "application/json" }),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambah member.");
  }

  return result.data ?? result;
}

export async function updateUser(id: number, payload: Record<string, any>) {
  const response = await fetch(`${getBaseUrl()}/api/admin/members/${id}`, {
    method: "PUT",
    headers: {
      ...getAuthHeaders({ "Content-Type": "application/json" }),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengubah member.");
  }

  if (payload.username) {
    rememberMemberUsername(String(payload.username), String(payload.nama_member || ""));
  }

  return result.data ?? result;
}

export async function deleteUser(id: number) {
  const response = await fetch(`${getBaseUrl()}/api/admin/members/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 404) {
    removeLoggedInMember(id);
    return { message: "Member sudah tidak ada di server dan dihapus dari cache lokal." };
  }

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus user");
  }

  return result;
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

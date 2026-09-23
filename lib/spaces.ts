const APP_KEY = "mk_f4f26052503841eb8f95dee73e036726";

function normalizeSpaces(raw: any): any[] {
  if (Array.isArray(raw)) {
    return raw.filter((item) => item && typeof item === "object");
  }

  if (!raw || typeof raw !== "object") {
    return [];
  }

  if (Array.isArray(raw.data)) {
    return normalizeSpaces(raw.data);
  }

  if (Array.isArray(raw.items)) {
    return normalizeSpaces(raw.items);
  }

  const nested = Object.values(raw)
    .filter((value) => Array.isArray(value))
    .flatMap((value) => value as any[]);

  if (nested.length) {
    return normalizeSpaces(nested);
  }

  return [raw];
}

function getClientTokenHeader() {
  if (typeof window === "undefined") {
    return {} as Record<string, string>;
  }

  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const routeMatch = window.location.pathname.match(
      /^(.*?)(?:\/(?:member|Member|admin|Admin)(?:\/|$))/,
    );
    const appPrefix = routeMatch?.[1] || "";
    return `${window.location.origin}${appPrefix}`;
  }

  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL_CO ||
    "http://localhost:3000"
  );
}

async function safeFetchJson<T>(input: RequestInfo | URL, init: RequestInit = {}, fallback: T): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      "x-maker-key": APP_KEY,
      ...getClientTokenHeader(),
      ...(init.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || "Permintaan gagal.";
    throw new Error(message);
  }

  return (payload.data ?? payload ?? fallback) as T;
}

export async function getSpaces() {
  const baseUrl = getApiBaseUrl();

  const headers = { "x-maker-key": APP_KEY };
  const response = await fetch(`${baseUrl}/api/member/spaces`, {
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));

  let spaces = normalizeSpaces(result.data ?? result ?? []);

  if (!response.ok || spaces.length === 0) {
    const adminResponse = await fetch(`${baseUrl}/api/admin/spaces`, {
      headers,
      cache: "no-store",
    });
    const adminResult = await adminResponse.json().catch(() => ({}));

    if (!adminResponse.ok && !response.ok) {
      throw new Error(
        adminResult.message || result.message || "Gagal mengambil katalog ruangan.",
      );
    }

    spaces = normalizeSpaces(adminResult.data ?? adminResult ?? []);
  }

  return spaces.filter((space) => {
    const isSpaceLike =
      space &&
      typeof space === "object" &&
      (space.id || space.id_space || space.nama_space || space.tipe || space.harga_per_jam != null);

    return Boolean(isSpaceLike);
  });
}

export async function getSpaceById(id: string | number) {
  const baseUrl = getApiBaseUrl();

  const response = await fetch(`${baseUrl}/api/member/spaces/${id}`, {
    headers: {
      "x-maker-key": APP_KEY,
    },
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal mengambil detail ruangan.");
  return result.data || result;
}

export async function getAdminSpaces() {
  return safeFetchJson<any[]>("/api/admin/spaces", {}, []);
}

export async function getAdminSpaceById(id: string | number) {
  return safeFetchJson<any>(`/api/admin/spaces/${id}`, {}, {});
}

export async function createAdminSpace(formData: FormData) {
  return safeFetchJson<any>("/api/admin/spaces", {
    method: "POST",
    body: formData,
  }, {});
}

export async function updateAdminSpace(id: string | number, formData: FormData) {
  return safeFetchJson<any>(`/api/admin/spaces/${id}`, {
    method: "PUT",
    body: formData,
  }, {});
}

export async function deleteAdminSpace(id: string | number) {
  return safeFetchJson<any>(`/api/admin/spaces/${id}`, {
    method: "DELETE",
  }, {});
}

export async function checkAvailability(params: {
  id_space: number;
  tipe: "desk" | "meeting_room" | "private_office";
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number;
}) {
  const baseUrl = getApiBaseUrl();

  const query = new URLSearchParams(params as any).toString();

  const response = await fetch(`${baseUrl}/api/member/spaces/${params.id_space}/availability?${query}`, {
    headers: {
      "x-maker-key": APP_KEY,
    },
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal memeriksa ketersediaan.");
  return result;
}

"use server";

import { cookies } from "next/headers";

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set("token", "", { path: "/", maxAge: 0 });
  cookieStore.set("role", "", { path: "/", maxAge: 0 });
  cookieStore.delete("next-auth.session-token");
  cookieStore.delete("__Secure-next-auth.session-token");
}

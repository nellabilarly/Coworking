"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadMemberPhoto } from "@/lib/admin";
import { loginUser, registerMember, saveAuthSession } from "@/lib/auth";

const inputClassName =
  "h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40";

export function SignupMember() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nama_member: "",
    instansi: "",
    alamat: "",
    telp: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Password dan konfirmasi password belum sama.");
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("username", form.username);
      payload.append("password", form.password);
      payload.append("nama_member", form.nama_member);
      payload.append("instansi", form.instansi);
      payload.append("alamat", form.alamat);
      payload.append("telp", form.telp);

      if (foto) {
        payload.append("foto", foto);
      }

      const registerResult = await registerMember(payload);
      let fotoUrl =
        registerResult?.user?.foto_url ||
        registerResult?.user?.foto ||
        registerResult?.data?.user?.foto_url ||
        registerResult?.data?.user?.foto ||
        "";

      if (foto) {
        try {
          const uploaded = await uploadMemberPhoto(foto);
          fotoUrl = uploaded?.url || uploaded?.path || uploaded?.file_url || "";
        } catch {
          // The local preview remains available if image storage is unavailable.
        }
      }

      const memberId =
        registerResult?.user?.id ?? registerResult?.data?.user?.id;
      const localMemberResponse = await fetch(
        memberId ? `/api/admin/members/${memberId}` : "/api/admin/members",
        {
          method: memberId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: memberId ?? undefined,
            username: form.username,
            password: form.password,
            nama_member: form.nama_member,
            instansi: form.instansi,
            alamat: form.alamat,
            telp: form.telp,
            role: "member",
            foto: fotoUrl || null,
            foto_url: fotoUrl || null,
            profile_photo: fotoUrl || null,
            photo: fotoUrl || null,
          }),
        },
      );

      if (!localMemberResponse.ok) {
        const localResult = await localMemberResponse.json().catch(() => ({}));
        const isDuplicate = String(localResult?.message || "")
          .toLowerCase()
          .includes("sudah terdaftar");
        if (!isDuplicate) {
          throw new Error(
            localResult?.message || "Data member gagal disimpan.",
          );
        }
      }

      const fallbackUser: any = {
        id: registerResult?.user?.id ?? registerResult?.data?.user?.id ?? null,
        username: form.username,
        nama_member: form.nama_member,
        instansi: form.instansi,
        alamat: form.alamat,
        telp: form.telp,
        role: "member",
        foto: fotoUrl || null,
      };

      if (foto) {
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () =>
            reject(new Error("Gagal membaca foto profil."));
          reader.readAsDataURL(foto);
        });

        fallbackUser.foto = fotoUrl || preview;
        fallbackUser.foto_url = fotoUrl || preview;
        fallbackUser.profile_photo = fotoUrl || preview;
        fallbackUser.photo = fotoUrl || preview;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "pending_member_user",
          JSON.stringify(fallbackUser),
        );
      }

      router.replace(
        `/login?role=member&registered=1&username=${encodeURIComponent(form.username)}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mendaftar.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-[#BFC9D1] text-[#25343F] md:h-screen md:grid-cols-[0.9fr_1.1fr]">
      <div className="relative order-2 flex min-h-90 flex-col justify-between overflow-hidden bg-[#25343F] p-8 text-[#EAEFEF] sm:p-10 md:order-2 md:h-screen md:min-h-screen md:p-14 lg:p-20">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#BFC9D1]/20" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#BFC9D1]/30 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#EAEFEF 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <a
            href="/login"
            className="text-2xl font-semibold tracking-[-0.06em]"
          >
            LOCAZYY<span className="text-[#BFC9D1]">.</span>
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-[#BFC9D1]/20 bg-white/10 px-3.5 py-1.5 text-xs text-[#BFC9D1] backdrop-blur-md sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[#BFC9D1]" />
            <span>Coworking Space</span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12">
          <p className="max-w-md text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
            Find your space to work, focus, and grow.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#BFC9D1]/90">
            Buat akun member dan temukan ruang kerja yang nyaman untuk setiap
            langkahmu.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-[#BFC9D1]/10 pt-6" />
      </div>
      <div className="relative order-1 z-20 flex items-start overflow-y-auto  bg-[#EAEFEF] p-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tighter text-[#25343F]">
                Create member account
              </h1>
              <p className="mt-2 text-[#25343F]/65">
                Daftarkan akun untuk mulai menemukan ruang favoritmu.
              </p>
            </div>
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                  placeholder="usernamekamu"
                  className={inputClassName}
                  required
                />
                <p className="text-xs text-[#25343F]/55">
                  Username untuk login
                </p>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  className={inputClassName}
                  required
                  minLength={6}
                />
                <p className="text-xs text-[#25343F]/55">
                  Password minimal 6 karakter
                </p>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Konfirmasi Password *
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm({ ...form, confirmPassword: event.target.value })
                  }
                  className={`${inputClassName} ${!passwordsMatch ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
                  required
                  minLength={6}
                  aria-invalid={!passwordsMatch}
                />
                {!passwordsMatch && (
                  <p className="text-xs text-red-500">Password belum sama.</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="nama_member"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Nama Member *
                </label>
                <input
                  id="nama_member"
                  name="nama_member"
                  type="text"
                  value={form.nama_member}
                  onChange={(event) =>
                    setForm({ ...form, nama_member: event.target.value })
                  }
                  placeholder="Nama lengkap"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="instansi"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Instansi / Perusahaan *
                </label>
                <input
                  id="instansi"
                  name="instansi"
                  type="text"
                  value={form.instansi}
                  onChange={(event) =>
                    setForm({ ...form, instansi: event.target.value })
                  }
                  placeholder="Nama instansi atau perusahaan"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="alamat"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Alamat *
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={form.alamat}
                  onChange={(event) =>
                    setForm({ ...form, alamat: event.target.value })
                  }
                  placeholder="Alamat lengkap"
                  className="min-h-20 w-full resize-y rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 py-2.5 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="telp"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Nomor Telepon / WhatsApp *
                </label>
                <input
                  id="telp"
                  name="telp"
                  type="tel"
                  value={form.telp}
                  onChange={(event) =>
                    setForm({ ...form, telp: event.target.value })
                  }
                  placeholder="081234567890"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="foto"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Foto Profil
                </label>
                <input
                  id="foto"
                  name="foto"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFoto(event.target.files?.[0] || null)}
                  className="h-11 w-full cursor-pointer rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 py-2 text-sm text-[#25343F] file:mr-3 file:rounded-full file:border-0 file:bg-[#BFC9D1] file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#25343F]"
                />
                <p className="text-xs text-[#25343F]/55">
                  Upload foto profil (opsional)
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="submit"
                disabled={
                  isLoading || !passwordsMatch || form.password.length < 6
                }
                className="h-11 w-full cursor-pointer rounded-full bg-[#25343F] font-semibold text-[#EAEFEF] transition hover:bg-[#1b2a33] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Mendaftar..." : "Create Member Account"}
              </button>
              <a
                href="/login"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#25343F] bg-transparent font-medium text-[#25343F] transition hover:bg-[#BFC9D1]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

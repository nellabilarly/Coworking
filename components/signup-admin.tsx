"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation"; // 🌟 Untuk mengontrol alur navigasi halaman
import { registerAdmin } from "@/lib/auth"; // 🌟 Menghubungkan ke fungsi service API yang kita buat

export function SignupAdmin() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [namaCoworking, setNamaCoworking] = useState("");
  const [namaPemilik, setNamaPemilik] = useState("");
  const [telp, setTelp] = useState("");

  // 🌟 State Pengontrol Transaksi & Notifikasi UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // 🌟 Fungsi submit data formulir langsung ke server backend sekolah
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Password dan konfirmasi password belum sama.");
      return;
    }

    setIsLoading(true);

    try {
      await registerAdmin({
        username: username,
        password: password,
        nama_coworking: namaCoworking,
        nama_pemilik: namaPemilik,
        telp: telp,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("last_login_role", "admin");
      }

      setSuccessMessage(
        "Registrasi Admin Berhasil! Mengalihkan ke halaman login...",
      );

      setTimeout(() => {
        router.replace(
          `/login?role=admin&username=${encodeURIComponent(username)}`,
        );
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat pendaftaran.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const passwordsMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-[#25343F] text-[#25343F] md:grid-cols-[0.9fr_1.1fr]">
      {/* Sisi Banner Kiri */}
      <div className="relative flex min-h-90 flex-col justify-between overflow-hidden bg-[#25343F] p-8 text-[#EAEFEF] sm:p-10 md:min-h-screen md:p-14 lg:p-20">
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
            <span>Coworking Space</span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12">
          <p className="max-w-md text-4xl font-semibold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
            Build a better space to work and grow.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#BFC9D1]/90">
            Kelola ruang kerja yang nyaman dan bantu lebih banyak orang bekerja
            dengan fokus.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-[#BFC9D1]/10 pt-6" />
      </div>

      {/* Sisi Input Form Kanan */}
      <div className="relative z-20 flex items-start overflow-y-auto rounded-t-[2.5rem] bg-[#EAEFEF] p-8 md:h-screen md:min-h-screen md:rounded-l-[3.5rem] md:rounded-tr-none md:p-14 lg:p-20">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tighter text-[#25343F]">
                Create admin account
              </h1>
              <p className="mt-2 text-[#25343F]/65">
                Daftarkan akun admin untuk mengelola coworking space-mu.
              </p>
            </div>
          </div>

          <form className="mt-9" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              {/* Username */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="isi username mu"
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              {/* Nama Pemilik */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="nama_pemilik"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Nama Pemilik
                </label>
                <input
                  id="nama_pemilik"
                  type="text"
                  value={namaPemilik}
                  onChange={(e) => setNamaPemilik(e.target.value)}
                  placeholder="isi nama mu"
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              {/* Nama Coworking */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="nama_coworking"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Nama Coworking
                </label>
                <input
                  id="nama_coworking"
                  type="text"
                  value={namaCoworking}
                  onChange={(e) => setNamaCoworking(e.target.value)}
                  placeholder="Nama Coworking Space"
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              {/* No. Telepon */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="telp"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Nomor Telepon
                </label>
                <input
                  id="telp"
                  type="tel"
                  value={telp}
                  onChange={(e) => setTelp(e.target.value)}
                  placeholder="no telpon mu"
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none placeholder:text-[#25343F]/45 focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                />
              </div>

              {/* Password */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-md border border-[#BFC9D1]/80 bg-white/70 px-3 text-[#25343F] outline-none focus:border-[#25343F] focus:ring-2 focus:ring-[#BFC9D1]/40"
                  required
                  minLength={6}
                />
              </div>

              {/* Konfirmasi Password */}
              <div className="grid gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-[#25343F]"
                >
                  Konfirmasi Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 w-full rounded-md border bg-white/70 px-3 text-[#25343F] outline-none focus:ring-2 ${
                    passwordsMatch
                      ? "border-[#BFC9D1]/80 focus:border-[#25343F] focus:ring-[#BFC9D1]/40"
                      : "border-red-400 focus:border-red-500 focus:ring-red-200"
                  }`}
                  required
                  minLength={6}
                />
                {!passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">
                    Password belum sama.
                  </p>
                )}
              </div>
            </div>

            {/* Balasan Notifikasi Server */}
            {errorMessage && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">
                {successMessage}
              </p>
            )}

            {/* Tombol Aksi */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="submit"
                disabled={
                  isLoading || !passwordsMatch || !username || !password
                }
                className="h-11 w-full cursor-pointer rounded-full bg-[#25343F] font-semibold text-[#EAEFEF] transition hover:bg-[#1b2a33] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create Admin Account
              </button>

              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#25343F] bg-transparent font-medium text-[#25343F] transition hover:bg-[#BFC9D1]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

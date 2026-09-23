"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="grid min-h-screen w-full overflow-hidden bg-[#3368A0] text-[#3368A0] md:grid-cols-[0.9fr_1.1fr]">
      {/* Sisi Kiri (Banner Info) */}
      <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-[#3368A0] p-8 text-[#F2EFE7] sm:p-10 md:min-h-screen md:p-14 lg:p-20">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[#C8DFDB]/30" />
        <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-[#66A3BF]/30 blur-3xl" />

        <div className="relative z-10">
          <a href="/login" className="text-2xl font-semibold tracking-[-0.06em]">
            LOCAZYY<span className="text-[#66A3BF]">.</span>
          </a>

          <p className="mt-16 max-w-md text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Don&apos;t worry, we&apos;ve got your back.
          </p>

          <p className="mt-5 max-w-xs text-sm leading-6 text-[#C8DFDB]">
            Atur ulang kata sandi dan kembali ke ruang kerjamu dengan mudah.
          </p>
        </div>
      </div>

      {/* Sisi Kanan (Form Lupa Password) */}
      <div className="relative z-20 flex items-center bg-white p-8 rounded-t-[2.5rem] md:rounded-tr-none md:rounded-l-[3.5rem] sm:p-10 md:min-h-screen md:p-14 lg:p-20">
        <div className="w-full max-w-xl">
          {/* Tombol Kembali ke Login */}
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#3368A0]/70 transition hover:text-[#3368A0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </a>

          {/* Header */}
          <div className="mt-6">
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#3368A0]">
              Forgot Password?
            </h1>
            <p className="mt-2 text-[#3368A0]/65">
              Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk me-reset password milikmu.
            </p>
          </div>

          {/* Tampilan Berhasil Kirim Email */}
          {isSubmitted ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl bg-[#C8DFDB]/20 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-[#3368A0]" />
              <h3 className="mt-3 text-lg font-semibold text-[#3368A0]">
                Email Terkirim!
              </h3>
              <p className="mt-1 text-sm text-[#3368A0]/70">
                Kami telah mengirimkan tautan reset password ke{" "}
                <span className="font-semibold">{email}</span>. Silakan cek kotak masuk atau folder spam kamu.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-6 text-xs font-semibold text-[#3368A0] underline underline-offset-4 hover:opacity-80"
              >
                Kirim ulang email
              </button>
            </div>
          ) : (
            /* Form Input Email */
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#3368A0]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="h-11 w-full rounded-md border border-[#66A3BF]/40 bg-white/55 px-3 text-[#3368A0] outline-none placeholder:text-[#3368A0]/40 focus:border-[#3368A0] focus:ring-2 focus:ring-[#66A3BF]/30"
                  required
                />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="h-11 w-full cursor-pointer rounded-full bg-[#3C467B] font-semibold text-[#F2EFE7] transition hover:bg-[#66A3BF]"
                >
                  Reset Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Clock3,
  Coffee,
  MapPin,
  Menu,
  Sparkles,
  Users,
} from "lucide-react";

export default function Home() {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const spaces = [
    {
      number: "01",
      icon: Coffee,
      title: "Open Desk",
      text: "Energi komunitas untuk hari-hari yang dinamis.",
    },
    {
      number: "02",
      icon: Sparkles,
      title: "Private Office",
      text: "Privasi tenang untuk fokus tanpa gangguan.",
    },
    {
      number: "03",
      icon: Users,
      title: "Meeting Room",
      text: "Ruang nyaman untuk ide yang perlu dibagikan.",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#EAEFEF] text-[#25343F]">
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
          scroll
            ? "border-b border-[#25343F]/10 bg-[#EAEFEF]/85 shadow-[0_10px_40px_rgba(37,52,63,0.08)] backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a className="group flex items-center gap-2 text-2xl font-semibold tracking-[-0.07em]">
            LOKAZYY
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden rounded-full px-5 py-2.5 text-sm font-bold text-[#25343F] transition hover:bg-[#BFC9D1] hover:text-[#25343F] sm:block"
            >
              Login
            </a>

            <a
              href="/register/member"
              className="group inline-flex items-center rounded-full bg-[#25343F] px-5 py-2.5 text-sm font-semibold text-[#EAEFEF] shadow-[0_10px_30px_rgba(37,52,63,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(37,52,63,0.22)]"
            >
              Register
              <ArrowUpRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            <button
              aria-label="Open menu"
              className="ml-1 rounded-full border border-[#25343F]/15 bg-[#EAEFEF]/50 p-2.5 transition hover:bg-[#BFC9D1]/40 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EAEFEF]">
        {/* Decorative giant circles */}
        <div className="pointer-events-none absolute -right-48 -top-48 h-[650px] w-[650px] rounded-full border border-[#25343F]/10" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full border border-[#25343F]/10" />

        {/* Left soft shape */}
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#BFC9D1]/40 blur-3xl" />

        {/* Small decorative square */}
        <div className="pointer-events-none absolute left-[10%] top-[30%] hidden h-3 w-3 rotate-45 bg-[#25343F]/30 lg:block" />

        {/* Small decorative circle */}
        <div className="pointer-events-none absolute bottom-[25%] right-[12%] hidden h-4 w-4 rounded-full bg-[#25343F]/20 lg:block" />

        {/* Main Content */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-16 pt-28 text-center lg:px-10">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[#25343F]/50" />

            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#25343F]/60">
              Your Space, Your Way
            </span>

            <span className="h-px w-12 bg-[#25343F]/50" />
          </div>

          <h1 className="mx-auto max-w-5xl text-[4rem] font-semibold leading-[0.88] tracking-[-0.075em] sm:text-6xl md:text-7xl lg:text-[7.5rem]">
            A space to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 font-serif font-normal italic">
                work,
              </span>

              <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[#BFC9D1]/80 sm:h-4" />
            </span>
            <br />
            <span className="font-serif font-normal italic">focus,</span> and
            grow
          </h1>
          {/* Description */}
          <p className="mx-auto mt-9 max-w-2xl text-base leading-7 text-[#25343F]/65 sm:text-lg">
            Pilih ruangmu, atur waktumu, dan ciptakan suasana yang tepat untuk
            menyelesaikan hal yang penting bagimu.
          </p>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <a
              href="/register/member"
              className="group inline-flex items-center gap-3 rounded-full bg-[#25343F] px-7 py-4 text-sm font-semibold text-[#EAEFEF] shadow-[0_15px_40px_rgba(37,52,63,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(37,52,63,0.25)]"
            >
              Jelajahi Sekarang
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAEFEF]/10 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </div>

          {/* Bottom detail */}
          <div className="mt-10 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#25343F]/40">
            <span>Explore</span>

            <span className="h-px w-10 bg-[#25343F]/20" />

            <span>Find your space</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[#25343F]/40">
          <span className="text-[10px] uppercase tracking-[0.25em]">
            Scroll
          </span>

          <ArrowDown className="h-3 w-3 animate-bounce" />
        </div>
      </section>

      <section
        id="spaces"
        className="relative overflow-hidden bg-[#25343F] px-6 py-24 text-[#EAEFEF] lg:px-10 lg:py-32"
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full border border-[#BFC9D1]/10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#BFC9D1]">
                Choose your flow
              </p>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Ruang yang mengikuti{" "}
                <span className="font-serif font-normal italic text-[#BFC9D1]">
                  caramu bekerja.
                </span>
              </h2>
            </div>

            <p className="max-w-xs text-sm leading-6 text-[#EAEFEF]/50">
              Setiap ruang punya suasana berbeda. Pilih yang paling cocok dengan
              ritmemu.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[#BFC9D1]/15 bg-[#BFC9D1]/15 md:grid-cols-3">
            {spaces.map(({ number, icon: Icon, title, text }, index) => (
              <div
                key={title}
                className={`group relative min-h-[330px] overflow-hidden bg-[#25343F] p-7 transition duration-500 hover:bg-[#BFC9D1] hover:text-[#25343F] ${
                  index === 1 ? "md:-translate-y-5 md:rounded-t-[2rem]" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-[#BFC9D1]/60 group-hover:text-[#25343F]/50">
                    {number}
                  </span>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFC9D1]/20 transition duration-500 group-hover:rotate-12 group-hover:border-[#25343F]/20">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="absolute bottom-7 left-7 right-7">
                  <div className="mb-5 h-px w-8 bg-[#BFC9D1]/40 transition-all duration-500 group-hover:w-full group-hover:bg-[#25343F]/20" />

                  <h3 className="text-2xl font-semibold tracking-tight">
                    {title}
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 opacity-55 group-hover:opacity-70">
                    {text}
                  </p>

                  <div className="mt-5 flex items-center text-xs font-semibold uppercase tracking-[0.15em] opacity-0 transition duration-300 group-hover:opacity-70">
                    Explore
                    <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                  </div>
                </div>

                <span className="pointer-events-none absolute -bottom-16 -right-10 text-[9rem] font-semibold leading-none opacity-[0.035] transition duration-500 group-hover:opacity-[0.08]">
                  {number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="why-us"
        className="relative overflow-hidden bg-[#EAEFEF] px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#BFC9D1]/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_0.9fr]">
          {/* IMAGE */}
          <div className="relative">
            <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full border border-[#25343F]/15" />

            <div className="absolute -bottom-5 -right-5 h-32 w-32 rounded-full bg-[#BFC9D1]/60" />

            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#BFC9D1] p-3 shadow-[0_30px_70px_rgba(37,52,63,0.12)]">
              <div className="relative overflow-hidden rounded-[2rem]">
                <img
                  src="/awalan.jpg"
                  alt="Locazyy workspace"
                  className="h-[500px] w-full object-cover grayscale transition duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-[#25343F]/10" />

                <div className="absolute bottom-6 left-6 rounded-full bg-[#EAEFEF]/90 px-4 py-2 text-xs font-semibold text-[#25343F] backdrop-blur-md">
                  Made for focus.
                </div>
              </div>
            </div>
          </div>

          {/* TEXT */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#25343F]/55">
              The Locazyy feeling
            </p>

            <h2 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              More than a desk.
              <br />
              <span className="font-serif font-normal italic text-[#25343F]/65">
                A daily ritual.
              </span>
            </h2>

            <p className="mt-7 max-w-lg leading-7 text-[#25343F]/65">
              Kami merancang setiap sudut agar kamu bisa datang, merasa nyaman,
              lalu melakukan pekerjaan terbaikmu. Semua yang kamu butuhkan sudah
              dekat.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {[
                "High-speed Wi-Fi",
                "Unlimited coffee",
                "Community events",
                "Flexible hours",
              ].map((item, index) => (
                <div
                  key={item}
                  className="group flex items-center gap-3 border-b border-[#25343F]/10 py-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25343F] transition duration-300 group-hover:scale-110">
                    <Check className="h-4 w-4 text-[#EAEFEF]" />
                  </span>

                  <span className="text-sm">{item}</span>

                  <span className="ml-auto text-[10px] text-[#25343F]/30">
                    0{index + 1}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20LOKAZYY,%20saya%20tertarik%20untuk%20bergabung."
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center rounded-full bg-[#25343F] px-6 py-4 text-sm font-semibold text-[#EAEFEF] shadow-[0_15px_35px_rgba(37,52,63,0.16)] transition duration-300 hover:-translate-y-1"
            >
              Join our community
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </section>
      <footer
        id="footer"
        className="relative overflow-hidden bg-[#25343F] px-6 pb-6 pt-20 text-[#EAEFEF] lg:px-10"
      >
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full border border-[#BFC9D1]/10" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-20 grid gap-14 md:grid-cols-[1.4fr_0.7fr_1fr]">
            {/* BRAND */}
            <div>
              <a
                href="/"
                className="group inline-flex items-center gap-2 text-3xl font-semibold tracking-[-0.07em]"
              >
                LOKAZYY
                <span className="h-2.5 w-2.5 rounded-full bg-[#BFC9D1] transition-transform duration-300 group-hover:scale-150" />
              </a>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#EAEFEF]/50">
                Platform reservasi coworking space yang membantu kamu menemukan
                ruang kerja nyaman, fleksibel, dan sesuai kebutuhan.
              </p>

              <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#BFC9D1]/60">
                <span className="h-px w-10 bg-[#BFC9D1]/30" />
                Your space. Your way.
              </div>
            </div>

            {/* COMPANY */}
            <div>
              <h3 className="mb-6 text-xs uppercase tracking-[0.2em] text-[#BFC9D1]">
                Company
              </h3>

              <div className="flex flex-col gap-4 text-sm text-[#EAEFEF]/55">
                <a
                  href="#spaces"
                  className="transition hover:translate-x-1 hover:text-[#EAEFEF]"
                >
                  Our Spaces
                </a>

                <a
                  href="#why-us"
                  className="transition hover:translate-x-1 hover:text-[#EAEFEF]"
                >
                  Why Locazyy
                </a>

                <a
                  href="/login"
                  className="transition hover:translate-x-1 hover:text-[#EAEFEF]"
                >
                  Login
                </a>

                <a
                  href="/register"
                  className="transition hover:translate-x-1 hover:text-[#EAEFEF]"
                >
                  Register
                </a>
              </div>
            </div>

            {/* CONTACT */}
            <div>
              <h3 className="mb-6 text-xs uppercase tracking-[0.2em] text-[#BFC9D1]">
                Contact
              </h3>

              <div className="flex flex-col gap-4 text-sm text-[#EAEFEF]/55">
                <span className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[#BFC9D1]" />
                  Malang, Indonesia
                </span>

                <span>hello@locazyy.id</span>

                <span>+62 812-3456-7890</span>

                <span className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#BFC9D1]" />
                  Open every day, 08:00–22:00
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex flex-col justify-between gap-4 border-t border-[#BFC9D1]/15 pt-6 text-xs text-[#EAEFEF]/40 sm:flex-row">
            <p>© 2026 LOKAZYY. All rights reserved.</p>

            <p className="uppercase tracking-[0.15em]">
              Coworking Space Reservation
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

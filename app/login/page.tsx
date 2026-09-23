import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F2EFE7]">
      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[#C8DFDB]/70 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#66A3BF]/20 blur-3xl" />
      <div className="relative min-h-screen w-full">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F2EFE7] text-[#3E3F29]">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

import { SignupMember } from "@/components/signup-member";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F2EFE7]">
      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[#C8DFDB]/70 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#66A3BF]/20 blur-3xl" />
      <div className="relative min-h-screen w-full"><SignupMember /></div>
    </main>
  );
}
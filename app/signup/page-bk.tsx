import AuthForm from "@/app/components/auth/AuthForm";
import Link from "next/link";

export const metadata = {
  title: "Sign up - PetCare",
};

export default function SignUpPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(1200px_600px_at_80%_-10%,#ffe7d6,transparent),radial-gradient(1000px_500px_at_-10%_10%,#fff0e5,transparent)]">
      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-[#ff8a1e]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-[#ff6a3d]/20 blur-3xl" />

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          {/* Glass card */}
          <div className="relative rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
            {/* subtle top highlight */}
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-white/40 via-white/70 to-white/40" />
            <div className="p-8 sm:p-10">
              <AuthForm mode="signup" />
              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

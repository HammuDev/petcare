"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PawPrint,
  ShieldAlert,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  Mic,
  ShieldCheck,
  ShieldPlus,
  Check,
  HeartPulse,
} from "lucide-react";

interface VetAuthCardProps {
  initialMode: "login" | "signup";
}

export default function VetAuthCard({ initialMode }: VetAuthCardProps) {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState<boolean>(initialMode === "signup");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsSignup(path.includes("signup"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchMode = (toSignup: boolean) => {
    if (isSignup === toSignup) return;
    setAlertMsg("");
    setNameError(false);
    setEmailError(false);
    setPasswordError(false);
    setIsSignup(toSignup);

    // Update browser URL seamlessly without page reload
    window.history.pushState(null, "", toSignup ? "/signup" : "/login");
    document.title = toSignup ? "Sign up | Vet365.AI" : "Log in | Vet365.AI";
  };

  const togglePw = () => setShowPassword((prev) => !prev);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    if (password.length >= 8 && /[0-9]/.test(password) && /[A-Z]/.test(password)) {
      return 3;
    }
    if (password.length >= 6) {
      return 2;
    }
    return 1;
  };

  const strength = getPasswordStrength();

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg("");

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isPwValid = password.length >= 6;

    setEmailError(!isEmailValid);
    setPasswordError(!isPwValid);

    if (!isEmailValid || !isPwValid) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "We could not find an account with those details.");
      }

      localStorage.setItem("user_data", JSON.stringify(data));
      router.push("/chat");
      router.refresh();
    } catch (err: any) {
      setAlertMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg("");

    const isNameValid = name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isPwValid = password.length >= 6;

    setNameError(!isNameValid);
    setEmailError(!isEmailValid);
    setPasswordError(!isPwValid);

    if (!isNameValid || !isEmailValid || !isPwValid) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed. Please try again.");
      }

      localStorage.setItem("user_data", JSON.stringify(data));
      router.push("/chat");
      router.refresh();
    } catch (err: any) {
      setAlertMsg(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#16332A] via-[#0A1512] to-[#06100D] min-h-screen font-sans text-[#EAF3ED] flex items-center justify-center p-3 sm:p-6 md:p-8 selection:bg-[#17C97F] selection:text-[#0A1512] relative overflow-x-hidden w-full max-w-[100vw]">
      {/* Ambient Glowing Background Blobs */}
      <div className="fixed -top-28 -left-28 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] bg-[#17C97F]/20 rounded-full blur-[110px] animate-drift1 pointer-events-none" />
      <div
        className="fixed -bottom-28 -right-28 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-[#FF6A4D]/15 rounded-full blur-[110px] animate-drift2 pointer-events-none"
        style={{ animationDelay: "-6s" }}
      />

      {/* Top Logo Link */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-7 sm:left-8 flex items-center gap-2.5 sm:gap-3 font-display font-bold text-base sm:text-lg text-white hover:opacity-90 transition z-30"
      >
        <img
          src="/paw.png"
          alt="VET365.AI Logo"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-lg shadow-[#17C97F]/30"
        />
        <span>VET365.AI</span>
      </Link>

      {/* Main Split Box with Fast Snappy Sliding Panels */}
      <div
        className={`w-full max-w-5xl bg-[#0F241D]/90 border rounded-2xl sm:rounded-[30px] shadow-2xl backdrop-blur-2xl z-20 overflow-hidden relative min-h-[520px] lg:min-h-[640px] mt-12 sm:mt-0 transition-colors duration-300 ${
          isSignup
            ? "border-[#FF6A4D]/30 shadow-[#FF6A4D]/15"
            : "border-[#17C97F]/30 shadow-[#17C97F]/15"
        }`}
      >
        {/* DESKTOP VIEW: Fast Snappy 350ms Sliding Panels */}
        <div className="hidden lg:block w-full h-full relative min-h-[640px]">
          {/* ========================================================================= */}
          {/* PANEL 1: GRAPHIC / VISUAL SCENE PANEL */}
          {/* ========================================================================= */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full z-10 p-12 overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSignup
                ? "translate-x-full bg-gradient-to-bl from-[#1f3f33]/90 via-[#0F241D] to-[#081711] border-l border-[#17C97F]/10"
                : "translate-x-0 bg-gradient-to-br from-[#123A2C]/90 via-[#0F241D] to-[#081711] border-r border-[#17C97F]/10"
            }`}
          >
            {/* Ambient Inner Glow */}
            <div
              className={`absolute -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-350 ${
                isSignup
                  ? "-left-12 bg-[#FF6A4D]/20"
                  : "-right-12 bg-[#17C97F]/20"
              }`}
            />

            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top Badge */}
              <div className="flex items-center justify-between">
                {!isSignup ? (
                  <>
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-[#7DE8B8] bg-[#17C97F]/10 border border-[#17C97F]/25 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#17C97F] animate-pulse-dot" />
                      KORA | AI VET ON CALL
                    </span>
                    <span className="text-xs font-mono text-[#9AB0A5]">v2.4 Active</span>
                  </>
                ) : (
                  <div className="w-full flex justify-end">
                    <span className="inline-flex items-center gap-2 font-mono text-xs text-[#FFA08B] bg-[#FF6A4D]/10 border border-[#FF6A4D]/25 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#FF6A4D] animate-pulse-dot" />
                      NEW MEMBER REGISTRATION
                    </span>
                  </div>
                )}
              </div>

              {/* Center Graphic Card */}
              <div className="my-auto flex flex-col items-center justify-center">
                {!isSignup ? (
                  /* LOGIN GRAPHIC */
                  <div className="relative w-full max-w-[310px] animate-modal-in">
                    <div className="bg-[#081711]/90 border border-[#17C97F]/30 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#17C97F] to-[#7DE8B8] flex items-center justify-center text-[#06180F] shadow-md shadow-[#17C97F]/20">
                            <Stethoscope className="w-5 h-5 text-[#06180F]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">Live Health Triage</h4>
                            <p className="text-[11px] text-[#9AB0A5]">Canine and Feline Clinical AI</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#17C97F]/15 text-[#17C97F] font-mono border border-[#17C97F]/30 font-bold">
                          ACTIVE
                        </span>
                      </div>

                      {/* Animated ECG Waveform */}
                      <div className="bg-[#050E0B] p-3 rounded-xl border border-[#17C97F]/15">
                        <svg className="w-full h-8" viewBox="0 0 340 36">
                          <path
                            d="M0 18 H120 L134 4 L148 32 L162 10 L176 18 H340"
                            stroke="#17C97F"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="340"
                            strokeDashoffset="340"
                            className="animate-draw-line"
                          />
                        </svg>
                      </div>

                      {/* Stats Bar */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px]">
                        <div className="text-[#9AB0A5]">
                          Avg. Response: <b className="text-[#7DE8B8] font-mono">&lt;60s</b>
                        </div>
                        <div className="text-right text-[#9AB0A5]">
                          Trained by: <b className="text-white">DVM Vet</b>
                        </div>
                      </div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -top-4 -left-5 bg-gradient-to-r from-[#FF6A4D] to-[#E24E30] text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg shadow-[#FF6A4D]/30 flex items-center gap-1.5 border border-[#FFB4A3]/30">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Voice Ready</span>
                    </div>

                    <div className="absolute -bottom-4 -right-4 bg-[#0F241D]/90 text-[#7DE8B8] text-[11px] font-medium px-3.5 py-1.5 rounded-xl shadow-xl border border-[#17C97F]/30 flex items-center gap-1.5 backdrop-blur-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#17C97F]" />
                      <span>100% Private</span>
                    </div>
                  </div>
                ) : (
                  /* SIGNUP GRAPHIC */
                  <div className="relative w-full max-w-[310px] animate-modal-in">
                    <div className="bg-[#081711]/90 border border-[#FF6A4D]/30 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6A4D]/20 text-[#FFA08B] flex items-center justify-center flex-shrink-0">
                          <ShieldPlus className="w-5 h-5 text-[#FF6A4D]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Instant AI Care Portal</h4>
                          <p className="text-[11px] text-[#9AB0A5]">Ready for 2 AM emergencies</p>
                        </div>
                      </div>

                      {/* Setup Progress Bar */}
                      <div className="bg-[#050E0B] p-3.5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between text-[11px] text-[#9AB0A5]">
                          <span>Pet Profile Sync</span>
                          <span className="text-[#FFA08B] font-mono font-semibold">Ready</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-[#FF6A4D] via-[#F4B740] to-[#17C97F] rounded-full" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#9AB0A5]">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#17C97F]" /> No wait times
                        </span>
                        <span className="text-[#7DE8B8] font-semibold">Cancel anytime</span>
                      </div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -top-3 -right-4 bg-[#17C97F] text-[#0A1512] text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 border border-[#17C97F]/30">
                      <HeartPulse className="w-3.5 h-3.5 text-[#0A1512]" /> Pet First
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Doctor Quote */}
              <div
                className={`pt-4 border-t border-white/5 transition-all duration-300 ${
                  isSignup ? "text-right" : "text-left"
                }`}
              >
                <p className="font-display italic text-xs text-[#8FAFA0] leading-relaxed">
                  {!isSignup
                    ? '"Every response is shaped by real veterinary experience."'
                    : '"Every pet and every concern deserves more than surface-level advice."'}
                </p>
                <p className="text-[11px] text-[#5A6E64] font-mono mt-1">Dr. Alexis Kole, DVM</p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL 2: FORM PANEL */}
          {/* ========================================================================= */}
          <div
            className={`absolute top-0 left-0 w-1/2 h-full z-10 p-12 overflow-y-auto flex flex-col justify-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSignup ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="max-w-sm w-full mx-auto">
              {!isSignup ? (
                /* ================= LOGIN FORM ================= */
                <div className="space-y-6 animate-modal-in">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#17C97F] to-[#0E9C63] flex items-center justify-center shadow-lg shadow-[#17C97F]/30 mb-4">
                      <ShieldAlert className="w-5 h-5 text-[#06180F]" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                      Welcome back
                    </h1>
                    <p className="text-xs text-[#7DE8B8] font-mono uppercase tracking-wider mt-1.5">
                      Log in to your account
                    </p>
                    <p className="text-xs text-[#9AB0A5] mt-1">
                      Enter your details below to continue.
                    </p>
                  </div>

                  {alertMsg && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FF6A4D]/10 border border-[#FF6A4D]/30 text-[#FFA08B] text-xs">
                      <AlertCircle className="w-4 h-4 text-[#FF6A4D] flex-shrink-0 mt-0.5" />
                      <span>{alertMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(false);
                        }}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 bg-[#081711] border rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none transition ${
                          emailError
                            ? "border-[#FF6A4D] ring-2 ring-[#FF6A4D]/20"
                            : "border-[#17C97F]/20 focus:border-[#17C97F] focus:ring-2 focus:ring-[#17C97F]/20"
                        }`}
                      />
                      {emailError && (
                        <p className="text-xs text-[#FF8B72] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Enter a valid email address.</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                          }}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pr-11 bg-[#081711] border rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none transition ${
                            passwordError
                              ? "border-[#FF6A4D] ring-2 ring-[#FF6A4D]/20"
                              : "border-[#17C97F]/20 focus:border-[#17C97F] focus:ring-2 focus:ring-[#17C97F]/20"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={togglePw}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9689] hover:text-[#7DE8B8] transition cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-xs text-[#FF8B72] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Password must be at least 6 characters.</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6A4D] to-[#E24E30] hover:from-[#E24E30] hover:to-[#FF6A4D] text-white font-semibold text-sm rounded-full shadow-lg shadow-[#FF6A4D]/30 transition duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>{isLoading ? "Verifying..." : "Log in"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Switch to Signup Button */}
                  <p className="text-center text-xs text-[#9AB0A5]">
                    Do not have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className="text-[#7DE8B8] font-bold hover:underline ml-1 cursor-pointer transition-colors"
                    >
                      Sign up
                    </button>
                  </p>

                  <div className="text-center p-2.5 bg-[#081711]/70 rounded-xl border border-white/5 text-[11px] text-[#5A6E64]">
                    Demo: use <b className="text-[#7C9689]">admin@gmail.com</b> with your password.
                  </div>
                </div>
              ) : (
                /* ================= SIGNUP FORM ================= */
                <div className="space-y-5 animate-modal-in">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6A4D] to-[#E24E30] flex items-center justify-center shadow-lg shadow-[#FF6A4D]/30 mb-3">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                      Create account
                    </h1>
                    <p className="text-xs text-[#FFB4A3] font-mono uppercase tracking-wider mt-1.5">
                      Join the Pack
                    </p>
                    <p className="text-xs text-[#9AB0A5] mt-1">
                      Sign up with your email and a password.
                    </p>
                  </div>

                  {alertMsg && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FF6A4D]/10 border border-[#FF6A4D]/30 text-[#FFA08B] text-xs">
                      <AlertCircle className="w-4 h-4 text-[#FF6A4D] flex-shrink-0 mt-0.5" />
                      <span>{alertMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-3.5" noValidate>
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError(false);
                        }}
                        placeholder="Your name"
                        className={`w-full px-4 py-2.5 bg-[#081711] border rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none transition ${
                          nameError
                            ? "border-[#FF6A4D] ring-2 ring-[#FF6A4D]/20"
                            : "border-[#17C97F]/20 focus:border-[#FF6A4D] focus:ring-2 focus:ring-[#FF6A4D]/20"
                        }`}
                      />
                      {nameError && (
                        <p className="text-xs text-[#FF8B72] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Tell us what to call you.</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(false);
                        }}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-2.5 bg-[#081711] border rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none transition ${
                          emailError
                            ? "border-[#FF6A4D] ring-2 ring-[#FF6A4D]/20"
                            : "border-[#17C97F]/20 focus:border-[#FF6A4D] focus:ring-2 focus:ring-[#FF6A4D]/20"
                        }`}
                      />
                      {emailError && (
                        <p className="text-xs text-[#FF8B72] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Enter a valid email address.</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                          }}
                          placeholder="••••••••"
                          className={`w-full px-4 py-2.5 pr-11 bg-[#081711] border rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none transition ${
                            passwordError
                              ? "border-[#FF6A4D] ring-2 ring-[#FF6A4D]/20"
                              : "border-[#17C97F]/20 focus:border-[#FF6A4D] focus:ring-2 focus:ring-[#FF6A4D]/20"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={togglePw}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9689] hover:text-[#FFA08B] transition cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Strength Indicator */}
                      <div className="flex gap-1.5 pt-1.5">
                        <div
                          className={`h-1 flex-1 rounded transition-colors duration-300 ${
                            strength === 1
                              ? "bg-[#FF6A4D]"
                              : strength === 2
                              ? "bg-amber-400"
                              : strength === 3
                              ? "bg-[#17C97F]"
                              : "bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded transition-colors duration-300 ${
                            strength === 2
                              ? "bg-amber-400"
                              : strength === 3
                              ? "bg-[#17C97F]"
                              : "bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-1 flex-1 rounded transition-colors duration-300 ${
                            strength === 3 ? "bg-[#17C97F]" : "bg-white/10"
                          }`}
                        />
                      </div>

                      {passwordError && (
                        <p className="text-xs text-[#FF8B72] font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Password must be at least 6 characters.</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6A4D] to-[#E24E30] hover:from-[#E24E30] hover:to-[#FF6A4D] text-white font-semibold text-sm rounded-full shadow-lg shadow-[#FF6A4D]/30 transition duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 mt-3 cursor-pointer disabled:opacity-60"
                    >
                      <span>{isLoading ? "Creating Account..." : "Sign up"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Switch to Login Button */}
                  <p className="text-center text-xs text-[#9AB0A5] pt-1">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode(false)}
                      className="text-[#FFA08B] font-bold hover:underline ml-1 cursor-pointer transition-colors"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (<lg) */}
        <div className="lg:hidden p-6 sm:p-8">
          {!isSignup ? (
            /* MOBILE LOGIN */
            <div className="space-y-6">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#17C97F] to-[#0E9C63] flex items-center justify-center shadow-lg shadow-[#17C97F]/30 mb-4">
                  <ShieldAlert className="w-5 h-5 text-[#06180F]" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-[#7DE8B8] font-mono uppercase tracking-wider mt-1.5">
                  Log in to your account
                </p>
              </div>

              {alertMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FF6A4D]/10 border border-[#FF6A4D]/30 text-[#FFA08B] text-xs">
                  <AlertCircle className="w-4 h-4 text-[#FF6A4D] flex-shrink-0 mt-0.5" />
                  <span>{alertMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-[#081711] border border-[#17C97F]/20 rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(false);
                      }}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 bg-[#081711] border border-[#17C97F]/20 rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={togglePw}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9689]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6A4D] to-[#E24E30] text-white font-semibold text-sm rounded-full shadow-lg"
                >
                  <span>{isLoading ? "Verifying..." : "Log in"}</span>
                </button>
              </form>

              <p className="text-center text-xs text-[#9AB0A5]">
                Do not have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className="text-[#7DE8B8] font-bold hover:underline ml-1"
                >
                  Sign up
                </button>
              </p>
            </div>
          ) : (
            /* MOBILE SIGNUP */
            <div className="space-y-5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6A4D] to-[#E24E30] flex items-center justify-center shadow-lg shadow-[#FF6A4D]/30 mb-3">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                  Create account
                </h1>
                <p className="text-xs text-[#FFB4A3] font-mono uppercase tracking-wider mt-1.5">
                  Join the Pack
                </p>
              </div>

              {alertMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FF6A4D]/10 border border-[#FF6A4D]/30 text-[#FFA08B] text-xs">
                  <AlertCircle className="w-4 h-4 text-[#FF6A4D] flex-shrink-0 mt-0.5" />
                  <span>{alertMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-3.5" noValidate>
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 bg-[#081711] border border-[#17C97F]/20 rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-[#081711] border border-[#17C97F]/20 rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#9AB0A5]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 bg-[#081711] border border-[#17C97F]/20 rounded-xl text-sm text-white placeholder-[#5A6E64] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={togglePw}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7C9689]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#FF6A4D] to-[#E24E30] text-white font-semibold text-sm rounded-full shadow-lg"
                >
                  <span>{isLoading ? "Creating Account..." : "Sign up"}</span>
                </button>
              </form>

              <p className="text-center text-xs text-[#9AB0A5]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="text-[#FFA08B] font-bold hover:underline ml-1"
                >
                  Log in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import {
  Clock,
  Stethoscope,
  AlertTriangle,
  ListChecks,
  MapPin,
  Mic,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ArrowRight,
  PawPrint,
} from "lucide-react";
import VetNavHeader from "./components/common/VetNavHeader";
import PaymentModal from "./components/home/PaymentModal";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "professional" | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Live Console transcript simulation
  const [simIndex, setSimIndex] = useState(0);
  const simScript = [
    { who: "user", text: "My dog just ate a small piece of dark chocolate. Should I be worried?" },
    {
      who: "ai",
      tag: "Kora | Clinical Triage",
      text: "It depends on his weight and the percentage of cacao. Tell me his approximate weight and if he is showing any symptoms.",
    },
    { who: "user", text: "He is a 24kg Golden Retriever, happened about 10 minutes ago." },
    {
      who: "ai",
      tag: "Kora | Clinical Triage",
      text: "At 24kg, a single small piece is below the toxic threshold. Monitor for mild restlessness or upset stomach over the next 4 hours and keep fresh water accessible.",
    },
    { who: "user", text: "Should I induce vomiting or call the clinic tonight?" },
    {
      who: "ai",
      tag: "Kora | Clinical Triage",
      text: "Do not induce vomiting at home. An emergency visit is not necessary right now, but contact your clinic if you notice severe agitation or vomiting.",
    },
    { who: "user", text: "That is such a relief. Thank you so much!" },
    {
      who: "ai",
      tag: "Kora | Clinical Triage",
      text: "Anytime! Give him a gentle ear rub from us and rest easy tonight.",
    },
  ];

  const [visibleBubbles, setVisibleBubbles] = useState([
    simScript[0],
    simScript[1],
    simScript[2],
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimIndex((prev) => {
        const nextIdx = (prev + 3) % simScript.length;
        setVisibleBubbles([
          simScript[nextIdx % simScript.length],
          simScript[(nextIdx + 1) % simScript.length],
          simScript[(nextIdx + 2) % simScript.length],
        ]);
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id) setUserId(parsed.id);
      } catch (e) {}
    }
  }, []);

  const openPlanModal = (plan: "basic" | "premium" | "professional") => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const elevenLabsAgentId =
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_HOME ||
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
    "agent_4901k6njbw0bfpwvfkb9vd073zz6";

  const triggerLiveVoice = () => {
    const widget = document.querySelector("elevenlabs-convai") as any;
    if (widget && typeof widget.startCall === "function") {
      widget.startCall();
    } else if (widget) {
      widget.dispatchEvent(new Event("click"));
    }
  };

  const faqItems = [
    {
      q: "Is Vet365.AI a replacement for my regular veterinarian?",
      a: "No. Kora is designed to provide rapid clinical veterinary triage and help you determine the safest next step, including when to visit your local clinic or an emergency animal hospital. It complements hands-on veterinary care, but does not replace physical examinations, lab diagnostics, or prescription treatments.",
    },
    {
      q: "How does Kora handle genuine pet emergencies?",
      a: "Kora is trained on emergency triage protocols to immediately identify red-flag symptoms such as respiratory distress, toxin exposure, or acute bloat. In critical situations, Kora gives concise immediate stabilization advice and routes you directly to the nearest 24/7 emergency animal hospital.",
    },
    {
      q: "How is Kora different from searching online?",
      a: "Online searches return overwhelming and generic lists of worst-case scenarios. Kora was built by a licensed practicing veterinarian using verified clinical literature. It conducts structured triage tailored to your pet's species, weight, and history to deliver a clear, actionable plan.",
    },
    {
      q: "What is the difference between the two plans?",
      a: "The Just Sniffing It Out option is a starter consult pack with no ongoing commitment, ideal for quick first-time guidance. The Pawblem Solver membership includes 20 monthly minutes, full minute rollover, priority response times, and member discounts on minute top-ups.",
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. Both plans are completely flexible with no long-term lock-in. You can modify or cancel your subscription at any time with one click in your account settings.",
    },
  ];

  return (
    <>
      {/* ElevenLabs Widget Script */}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-[#FBF7EC] text-[#10201A] overflow-x-hidden font-sans">
        {/* Navigation */}
        <VetNavHeader showNavLinks={true} />

        {/* Hero Section */}
        <section className="relative bg-[radial-gradient(120%_100%_at_50%_-10%,#16332A_0%,#0A1512_55%)] text-white pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 overflow-hidden w-full">
          <div className="absolute w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] rounded-full bg-[#17C97F] opacity-20 -top-40 -left-[140px] blur-[110px] pointer-events-none animate-drift1" />
          <div className="absolute w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-full bg-[#FF6A4D] opacity-15 top-[60px] -right-[140px] blur-[110px] pointer-events-none animate-drift2" />

          <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 sm:gap-12 lg:gap-16 items-center relative z-10 w-full">
            {/* Left Copy */}
            <div className="w-full">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#7DE8B8] bg-[#17C97F]/10 border border-[#17C97F]/25 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full mb-4 sm:mb-5">
                <span className="w-2 h-2 rounded-full bg-[#17C97F] animate-pulse-dot" />
                <span>Vet-Trained AI on Call 24/7</span>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] font-display font-extrabold leading-[1.12] sm:leading-[1.08] tracking-tight mb-4 sm:mb-5 text-white">
                Wondering if it is<br />
                <span className="bg-[linear-gradient(100deg,#17C97F_10%,#7DE8B8_45%,#F4B740_90%)] bg-clip-text text-transparent">
                  normal or a real problem?
                </span>
              </h1>

              <p className="text-[#9AB0A5] text-sm sm:text-lg leading-relaxed max-w-[500px] mb-6 sm:mb-8">
                Vet365.AI turns late-night worry into a clear clinical next step. Speak or type with Kora to get veterinary-grade guidance in seconds without the waiting room stress.
              </p>

              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-3.5 mb-8 sm:mb-10">
                <a
                  href="#pricing"
                  className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_8px_20px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(255,106,77,0.45)] transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Start Your First Consult</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm text-[#EAF3ED] bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-all text-center"
                >
                  See How It Works
                </a>
              </div>

              {/* Proof badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5 sm:pt-6 border-t border-white/10 text-[11px] sm:text-sm text-[#9AB0A5]">
                <div>
                  <b className="block text-lg sm:text-2xl font-bold text-white mb-0.5 font-display">24/7</b>
                  <span className="leading-tight block">Real-time availability</span>
                </div>
                <div>
                  <b className="block text-lg sm:text-2xl font-bold text-white mb-0.5 font-display">DVM</b>
                  <span className="leading-tight block">Practicing vet-trained</span>
                </div>
                <div>
                  <b className="block text-lg sm:text-2xl font-bold text-white mb-0.5 font-display">Live Voice</b>
                  <span className="leading-tight block">Conversational audio</span>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Console Simulation */}
            <div className="relative w-full max-w-full">
              {/* Top Floating Badge */}
              <div className="hidden sm:flex absolute -top-4 right-4 bg-white text-[#10201A] rounded-2xl px-4 py-2 shadow-xl items-center gap-2 text-xs font-bold z-20 animate-modal-in border border-[#E6DDC0]/60">
                <CheckCircle2 className="w-4 h-4 text-[#0E9C63]" />
                <span>Clinical Triage Verified</span>
              </div>

              <div className="bg-[linear-gradient(165deg,#0F241D,#0A1712)] border border-[#7DE8B8]/20 rounded-2xl sm:rounded-[28px] p-4 sm:p-6 shadow-[0_30px_80px_-28px_rgba(6,14,11,0.5),0_0_60px_-10px_rgba(23,201,127,0.2)] w-full">
                {/* Console Top */}
                <div className="flex items-center justify-between mb-3.5 sm:mb-4 px-1 pb-2.5 sm:pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#EAF2ED] font-semibold tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#17C97F] animate-pulse-dot" />
                    <span>KORA | LIVE CONSULT</span>
                  </div>
                  <span className="text-[10.5px] sm:text-[11px] font-mono text-[#7DE8B8] bg-[#17C97F]/10 px-2 py-0.5 rounded-md border border-[#17C97F]/20">
                    Active
                  </span>
                </div>

                {/* Console Messages Box */}
                <div className="bg-[#081711] rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[250px] sm:min-h-[290px] max-h-[330px] overflow-y-auto flex flex-col gap-2.5 sm:gap-3 border border-white/[0.04] custom-scroll text-xs sm:text-sm">
                  {visibleBubbles.map((b, i) => (
                    <div
                      key={i}
                      className={`max-w-[92%] sm:max-w-[86%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl leading-relaxed animate-modal-in ${
                        b.who === "user"
                          ? "self-end bg-[#173A2E] text-[#EAF2ED] rounded-br-[4px] border border-[#7DE8B8]/15"
                          : "self-start bg-[#F7F5EE] text-[#132119] rounded-bl-[4px]"
                      }`}
                    >
                      {b.tag && (
                        <span className="block font-mono text-[9.5px] sm:text-[10px] text-[#0E9C63] uppercase tracking-wider font-semibold mb-0.5">
                          {b.tag}
                        </span>
                      )}
                      <p className="text-xs sm:text-sm">{b.text}</p>
                    </div>
                  ))}
                </div>

                {/* Vitals wave */}
                <div className="mt-3 pt-1">
                  <svg viewBox="0 0 340 32" className="w-full h-6 sm:h-7">
                    <path
                      d="M0 16 H120 L134 4 L148 28 L162 8 L176 16 H340"
                      stroke="#17C97F"
                      strokeWidth="1.8"
                      fill="none"
                      className="animate-draw-line"
                    />
                  </svg>
                </div>

                {/* Console Footer */}
                <div className="flex items-center gap-2 sm:gap-2.5 mt-3">
                  <div className="flex-1 bg-[#081711] border border-[#1E3D32] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-[#7C9689] text-xs font-sans truncate">
                    Kora is listening...
                  </div>
                  <button
                    type="button"
                    onClick={triggerLiveVoice}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#17C97F]/15 border border-[#17C97F]/30 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-[#17C97F] text-[#7DE8B8] hover:text-[#06180F] transition-all"
                    title="Speak to Kora"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Floating Badge */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-white text-[#10201A] rounded-2xl px-4 py-2 shadow-xl items-center gap-2 text-xs font-bold z-20 border border-[#E6DDC0]/60">
                <Sparkles className="w-4 h-4 text-[#FF6A4D]" />
                <span>Response time under 60s</span>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Proof Statistics Bar */}
        <section className="bg-[#132A22] border-y border-white/[0.08] text-white py-6 sm:py-7 px-4 sm:px-8 w-full">
          <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="border-l-2 border-[#17C97F]/50 pl-3 sm:pl-4">
              <b className="text-xl sm:text-3xl font-display font-bold bg-[linear-gradient(100deg,#fff,#9AE8C6)] bg-clip-text text-transparent block">
                7+ Years
              </b>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#9AB0A5]">
                Clinical Experience
              </span>
            </div>

            <div className="border-l-2 border-[#17C97F]/50 pl-3 sm:pl-4">
              <b className="text-xl sm:text-3xl font-display font-bold bg-[linear-gradient(100deg,#fff,#9AE8C6)] bg-clip-text text-transparent block">
                24/7/365
              </b>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#9AB0A5]">
                Instant Availability
              </span>
            </div>

            <div className="border-l-2 border-[#17C97F]/50 pl-3 sm:pl-4">
              <b className="text-xl sm:text-3xl font-display font-bold bg-[linear-gradient(100deg,#fff,#9AE8C6)] bg-clip-text text-transparent block">
                100%
              </b>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#9AB0A5]">
                Vet-Backed Sources
              </span>
            </div>

            <div className="border-l-2 border-[#17C97F]/50 pl-3 sm:pl-4">
              <b className="text-xl sm:text-3xl font-display font-bold bg-[linear-gradient(100deg,#fff,#9AE8C6)] bg-clip-text text-transparent block">
                0 Mins
              </b>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#9AB0A5]">
                Waiting Room Delay
              </span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#FBF7EC] w-full" id="mission">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="relative w-full">
              <img
                src="https://images.unsplash.com/photo-1765934785570-beb8c9a36446?fm=jpg&q=80&w=1200&auto=format&fit=crop"
                alt="Compassionate veterinarian examining pet"
                className="rounded-2xl sm:rounded-3xl w-full h-[260px] sm:h-[420px] md:h-[450px] object-cover shadow-xl border border-[#E6DDC0]"
              />
              <div className="absolute -bottom-4 right-2 sm:-bottom-5 sm:-right-5 bg-white border border-[#E6DDC0] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl max-w-[210px] sm:max-w-[240px]">
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#0E9C63] font-bold block mb-0.5 sm:mb-1">
                  Our Mission
                </span>
                <p className="text-[11px] sm:text-xs text-[#4C5C53] leading-relaxed">
                  Developed and trained by a licensed veterinarian using accredited, peer-reviewed clinical protocols.
                </p>
              </div>
            </div>

            <div className="w-full">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0E9C63] mb-2 sm:mb-3">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>Built by a Vet, Designed for Pet Parents</span>
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-[#10201A] tracking-tight mb-4 sm:mb-5 leading-tight">
                The precision of AI, with the heart of a real veterinarian.
              </h2>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-base text-[#4C5C53] leading-relaxed mb-6 sm:mb-8">
                <p>
                  Every pet parent knows the feeling: staring at your pet at midnight, wondering if a symptom is normal or an urgent emergency. We have been there, which is why Vet365.AI was created.
                </p>
                <p>
                  <strong className="text-[#10201A]">No panic searches, no second-guessing.</strong> Just calm, clear, evidence-based guidance from a clinically trained veterinary AI that actually understands pet symptoms.
                </p>
                <p>
                  Whether it is a quick dietary question or a sudden symptom, you will get sequential steps to go from anxious to assured in a single consult.
                </p>
              </div>

              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] shadow-[0_6px_20px_rgba(23,201,127,0.3)] hover:-translate-y-0.5 transition-all"
              >
                <span>Get Answers Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#F2EAD3]/40 border-y border-[#E6DDC0]/70 w-full" id="how">
          <div className="max-w-[1180px] mx-auto">
            <div className="max-w-[620px] mb-8 sm:mb-12">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0E9C63] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>How It Works</span>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-[#10201A] tracking-tight">
                From symptom to a clear plan in three simple steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              <div className="bg-white border border-[#E6DDC0] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:-translate-y-1 hover:border-[#17C97F] transition-all">
                <span className="font-mono text-xs text-[#E24E30] bg-[#FFE8DF] font-bold px-3 py-1 rounded-full inline-block mb-3 sm:mb-4">
                  01
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#10201A] mb-1.5 sm:mb-2">Describe the Symptom</h3>
                <p className="text-xs sm:text-sm text-[#4C5C53] leading-relaxed">
                  Tell Kora what is happening: a limp, unusual snack, coughing, or sudden change in energy. Speak out loud or type naturally.
                </p>
              </div>

              <div className="bg-white border border-[#E6DDC0] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:-translate-y-1 hover:border-[#17C97F] transition-all">
                <span className="font-mono text-xs text-[#0E9C63] bg-[#DDF7E9] font-bold px-3 py-1 rounded-full inline-block mb-3 sm:mb-4">
                  02
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#10201A] mb-1.5 sm:mb-2">Clinical Veterinary Triage</h3>
                <p className="text-xs sm:text-sm text-[#4C5C53] leading-relaxed">
                  Kora asks the exact follow-up questions a vet would ask in a clinic, evaluating severity, species, weight, and timeline.
                </p>
              </div>

              <div className="bg-white border border-[#E6DDC0] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs hover:-translate-y-1 hover:border-[#17C97F] transition-all">
                <span className="font-mono text-xs text-[#F4B740] bg-amber-100 font-bold px-3 py-1 rounded-full inline-block mb-3 sm:mb-4">
                  03
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#10201A] mb-1.5 sm:mb-2">Actionable Next Steps</h3>
                <p className="text-xs sm:text-sm text-[#4C5C53] leading-relaxed">
                  Receive concrete structured guidance: monitor safely at home, schedule a routine clinic appointment, or head to emergency care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#0A1512] text-white relative overflow-hidden w-full" id="features">
          <div className="absolute w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full bg-[#17C97F] opacity-15 -top-28 -right-28 blur-[100px] pointer-events-none" />

          <div className="max-w-[1180px] mx-auto relative z-10 w-full">
            <div className="max-w-[620px] mb-8 sm:mb-14">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#7DE8B8] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>Comprehensive Care</span>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mb-2 sm:mb-3">
                Everything you need for your pet's peace of mind.
              </h2>
              <p className="text-[#9AB0A5] text-xs sm:text-base">
                Available 24/7 on your phone or computer for toxin checks, symptom triage, medication questions, and emergency routing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Real-Time Any Hour</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  No scheduling or waiting rooms. Immediate, vet-trained guidance whenever you need it most.
                </p>
              </div>

              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Vet-Approved Protocols</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  Every recommendation is built on accredited clinical veterinary protocols and practicing experience.
                </p>
              </div>

              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Toxicity &amp; Hazard Checks</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  Instantly verify toxic plants, household foods, chemicals, and human medications.
                </p>
              </div>

              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <ListChecks className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Sequential Action Steps</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  Clear, ordered steps in an emergency: what to inspect first, second, and how to safely transport.
                </p>
              </div>

              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Emergency Clinic Routing</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  When symptoms require immediate intervention, Kora helps locate the closest open emergency hospital.
                </p>
              </div>

              <div className="bg-[#0F1F19] border border-white/[0.08] rounded-2xl p-5 sm:p-6 hover:bg-[#15342A] transition-colors">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#17C97F]/15 border border-[#17C97F]/25 flex items-center justify-center mb-3 sm:mb-4 text-[#17C97F]">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-white mb-1">Talk or Type Naturally</h3>
                <p className="text-xs sm:text-sm text-[#9AB0A5] leading-relaxed">
                  Hands-free natural conversational voice consults or standard text messaging, tailored to your choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#FBF7EC] w-full" id="pricing">
          <div className="max-w-[1180px] mx-auto">
            <div className="max-w-[620px] mx-auto text-center mb-8 sm:mb-14">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0E9C63] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>Transparent Membership</span>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-[#10201A] tracking-tight mb-2">
                Predictable plans for every pet family.
              </h2>
              <p className="text-[#4C5C53] text-xs sm:text-base">
                Try a single consult pack or get continuous monthly peace of mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-[920px] mx-auto items-stretch">
              {/* Basic Plan */}
              <div className="bg-white border border-[#E6DDC0] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-all w-full">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#10201A] mb-1">Just Sniffing It Out</h3>
                  <p className="text-xs sm:text-sm text-[#4C5C53] mb-5 sm:mb-6">
                    A starter pack for first-timers wanting quick veterinary guidance without recurring fees.
                  </p>
                  <div className="text-3xl sm:text-5xl font-display font-extrabold text-[#10201A] mb-1">
                    $5.99<span className="text-xs sm:text-sm font-sans font-medium text-[#4C5C53]">/mo</span>
                  </div>
                  <p className="font-mono text-xs text-[#0E9C63] font-semibold mb-5 sm:mb-6">
                    10-minute starter consult pack
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-[#4C5C53] mb-6 sm:mb-8 border-t border-[#E6DDC0] pt-5 sm:pt-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span>No long-term contracts. Try once with zero hassle.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span>Add extra minutes anytime as needed.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span>Full access to 24/7 AI veterinary triage.</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openPlanModal("basic")}
                  className="w-full py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-[#10201A] bg-[#F2EAD3] hover:bg-[#E6DDC0] transition-colors cursor-pointer"
                >
                  Join with Basic
                </button>
              </div>

              {/* Pawblem Solver Pro Plan */}
              <div className="bg-[linear-gradient(165deg,#0F241D,#0A1712)] text-white border-2 border-[#17C97F] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-[0_24px_60px_-20px_rgba(23,201,127,0.3)] relative hover:-translate-y-1 transition-all w-full mt-3 sm:mt-0">
                <span className="absolute -top-3.5 right-6 sm:right-8 bg-gradient-to-r from-[#17C97F] to-[#0E9C63] text-[#06180F] font-mono text-[11px] sm:text-xs font-bold px-3.5 sm:px-4 py-1 rounded-full shadow-md">
                  Most Popular
                </span>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Pawblem Solver</h3>
                  <p className="text-xs sm:text-sm text-[#9AB0A5] mb-5 sm:mb-6">
                    Full peace of mind for dedicated pet parents who want answers always within reach.
                  </p>
                  <div className="text-3xl sm:text-5xl font-display font-extrabold bg-[linear-gradient(100deg,#fff,#9AE8C6)] bg-clip-text text-transparent mb-1">
                    $14.99<span className="text-xs sm:text-sm font-sans font-medium text-[#9AB0A5]">/mo</span>
                  </div>
                  <p className="font-mono text-xs text-[#7DE8B8] font-semibold mb-5 sm:mb-6">
                    Includes 20 vet-trained minutes every month
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-[#D3E0D8] mb-6 sm:mb-8 border-t border-white/10 pt-5 sm:pt-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span><b>20 minutes included</b> monthly for voice and text.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span><b>Rollover unused minutes</b> month to month.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span><b>Exclusive member discounts</b> on top-up packs.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#17C97F] flex-shrink-0 mt-0.5" />
                      <span><b>Priority triage routing</b> and emergency locator.</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openPlanModal("premium")}
                  className="w-full py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_6px_20px_rgba(255,106,77,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Join the Pack &rarr;
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-[#4C5C53] mt-6 sm:mt-8">
              Cancel anytime with one click. No hidden fees or surprise charges.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#F2EAD3]/40 border-t border-[#E6DDC0]/70 w-full" id="founder">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 sm:gap-12 items-start">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E6DDC0] text-center shadow-xs lg:sticky lg:top-24 w-full">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-[#17C97F] to-[#0E9C63] flex items-center justify-center text-[#06180F] font-bold text-xl sm:text-2xl shadow-[0_8px_24px_rgba(23,201,127,0.3)]">
                AK
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#10201A]">Dr. Alexis Kole</h3>
              <div className="text-xs font-semibold text-[#0E9C63] mt-1 mb-3 sm:mb-4">
                DVM | Founder and Chief Veterinarian
              </div>
              <p className="text-xs text-[#4C5C53] leading-relaxed mb-5 sm:mb-6">
                Practicing veterinarian, lifelong animal advocate, and the clinical clinical force behind Vet365.AI.
              </p>
              <div className="flex justify-center gap-6 pt-4 sm:pt-5 border-t border-[#E6DDC0]">
                <div>
                  <b className="block text-lg sm:text-xl font-bold text-[#10201A] font-display">7+</b>
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-mono text-[#4C5C53]">Years in Practice</span>
                </div>
                <div>
                  <b className="block text-lg sm:text-xl font-bold text-[#10201A] font-display">1</b>
                  <span className="text-[10px] sm:text-[10.5px] uppercase font-mono text-[#4C5C53]">AI Companion, Kora</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0E9C63] mb-2 sm:mb-3">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>Meet the Heart Behind Vet365.AI</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#10201A] tracking-tight mb-4 sm:mb-5 leading-tight">
                "Communication is not just a clinical skill, it is the foundation of preventive medicine."
              </h2>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-base text-[#4C5C53] leading-relaxed">
                <p>
                  For nearly seven years, Dr. Kole has treated animals in emergency rooms, urgent care clinics, and routine wellness visits. One constant pattern stood out: parents in distress searching for answers at odd hours.
                </p>
                <blockquote className="font-display text-base sm:text-xl font-medium text-[#10201A] pl-4 sm:pl-5 border-l-4 border-[#17C97F] my-4 sm:my-5 italic">
                  "I wish I could answer every pet parent personally, because every concern deserves more than surface-level advice. So I built Kora."
                </blockquote>
                <p>
                  Kora delivers the same structured, accurate guidance Dr. Kole would provide in an initial consult. Every answer is refined by real clinical protocols, so you can act with confidence and clarity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-14 sm:py-24 px-4 sm:px-8 bg-[#FBF7EC] w-full" id="faq">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#0E9C63] mb-2">
                <span className="w-2 h-2 rounded-full bg-[#17C97F]" />
                <span>Frequently Asked Questions</span>
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-[#10201A] tracking-tight">
                Clear answers to common questions.
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#E6DDC0] rounded-xl sm:rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-base text-[#10201A] cursor-pointer gap-3 sm:gap-4"
                    >
                      <span className="leading-snug">{item.q}</span>
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-xs transition-transform duration-200 ${
                          isOpen
                            ? "bg-[#17C97F] text-[#06180F] border-[#17C97F] rotate-180"
                            : "border-[#E6DDC0] text-[#10201A]"
                        }`}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-[#4C5C53] leading-relaxed border-t border-[#E6DDC0]/40 pt-3 animate-modal-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[radial-gradient(120%_140%_at_50%_20%,#16332A_0%,#0A1512_60%)] text-white text-center py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden w-full">
          <div className="absolute w-[360px] sm:w-[600px] h-[360px] sm:h-[600px] rounded-full bg-[#17C97F] opacity-15 -bottom-[260px] left-1/2 -translate-x-1/2 blur-[110px] pointer-events-none" />

          <div className="max-w-[640px] mx-auto relative z-10">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#7DE8B8] mb-3">
              <span>Your Vet Brain on Call 24/7</span>
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
              Because your pet health does not take a day off, and neither do we.
            </h2>
            <p className="text-[#9AB0A5] text-xs sm:text-base mb-6 sm:mb-8 max-w-[540px] mx-auto">
              Start with a single question, or get continuous monthly peace of mind. Kora is ready whenever you are.
            </p>
            <div className="flex flex-col xs:flex-row justify-center items-center gap-3 sm:gap-4 max-w-sm mx-auto xs:max-w-none">
              <a
                href="#pricing"
                className="w-full xs:w-auto px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_10px_24px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Start Your First Consult</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#faq"
                className="w-full xs:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-semibold text-xs sm:text-sm text-[#EAF3ED] bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-all text-center"
              >
                Read the FAQ
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#081310] text-[#9AB0A5] pt-12 sm:pt-16 pb-8 px-4 sm:px-8 border-t border-white/[0.06] w-full">
          <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div>
              <div className="flex items-center gap-2.5 font-display font-bold text-base sm:text-lg text-white mb-3">
                <img
                  src="/paw.png"
                  alt="VET365.AI Logo"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-[0_4px_12px_rgba(23,201,127,0.3)]"
                />
                <span>VET365.AI</span>
              </div>
              <p className="text-xs text-[#71877B] leading-relaxed max-w-xs">
                Clinical AI veterinary guidance available anytime. Checks foods, toxic plants, emergency triage, and clinic routing.
              </p>
            </div>

            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-[#5E7166] font-bold mb-3 sm:mb-4">
                General
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#mission" className="hover:text-[#17C97F] transition-colors">Mission</a></li>
                <li><a href="#how" className="hover:text-[#17C97F] transition-colors">How It Works</a></li>
                <li><a href="#founder" className="hover:text-[#17C97F] transition-colors">About Dr. Kole</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-[#5E7166] font-bold mb-3 sm:mb-4">
                Access
              </h5>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link href="/login" className="hover:text-[#17C97F] transition-colors">Log In</Link></li>
                <li><Link href="/signup" className="hover:text-[#17C97F] transition-colors">Sign Up</Link></li>
                <li><Link href="/chat" className="hover:text-[#17C97F] transition-colors">Live Voice Consult</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-mono text-xs uppercase tracking-wider text-[#5E7166] font-bold mb-3 sm:mb-4">
                Clinical Disclaimer
              </h5>
              <p className="text-xs text-[#71877B] leading-relaxed">
                Vet365.AI is a decision-support and triage tool and does not provide formal medical diagnoses or prescriptions.
              </p>
            </div>
          </div>

          <div className="max-w-[1180px] mx-auto pt-6 border-t border-[#1B2A22] flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-[#5E7166] gap-3 text-center sm:text-left">
            <span>Vet365.AI &copy; {new Date().getFullYear()}. All rights reserved.</span>
            <span>Accredited Clinical Veterinary AI System</span>
          </div>
        </footer>

        {/* Payment Modal for Stripe Subscriptions */}
        {isModalOpen && (
          <PaymentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            plan={selectedPlan}
            userId={userId || ""}
            onPaymentSuccess={() => setIsModalOpen(false)}
          />
        )}
      </div>

      {/* ElevenLabs Conversational AI Widget Web Component */}
      <elevenlabs-convai agent-id={elevenLabsAgentId}></elevenlabs-convai>
    </>
  );
}

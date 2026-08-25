"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

interface ChatMessage {
  who: "user" | "ai";
  text: string;
  tag?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { who: "user", text: "My dog just ate a small piece of dark chocolate. Should I be worried?" },
  {
    who: "ai",
    tag: "Kora · Vet-trained guidance",
    text: "Depends on his weight and the amount. Tell me his weight and I'll walk you through what to watch for and whether this needs a clinic visit tonight.",
  },
];

const CHAT_SIMULATION_FLOW: ChatMessage[] = [
  { who: "user", text: "He's about 24kg." },
  {
    who: "ai",
    tag: "Kora · Vet-trained guidance",
    text: "Good - at that weight, that small amount is unlikely to be dangerous, but keep an eye out for restlessness over the next few hours.",
  },
  { who: "user", text: "Should I still call the clinic tonight?" },
  {
    who: "ai",
    tag: "Kora · Vet-trained guidance",
    text: "Not urgently. Monitor him tonight, skip his usual treats tomorrow, and call your vet if anything changes.",
  },
];

const PROOF_ITEMS = [
  { value: "24/7", label: "Real-time, any hour" },
  { value: "DVM", label: "Practicing vet logic" },
  { value: "🎙️ Voice", label: "Live audio AI" },
] as const;

const STAT_ITEMS = [
  { value: "7+ yrs", label: "Clinical vet experience" },
  { value: "24/7", label: "Availability, no bookings" },
  { value: "2", label: "Simple, transparent plans" },
  { value: "0", label: "Waiting rooms" },
] as const;

export default function VetHero() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();

  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");

  // Canvas Star Particles Engine with IntersectionObserver optimization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let isVisible = true;
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let stars: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
      vx: number;
      vy: number;
      color: string;
    }> = [];

    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      createStars();
    };

    const createStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 9000) || 35;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          baseAlpha: Math.random() * 0.5 + 0.2,
          alpha: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          color: Math.random() > 0.3 ? "#17C97F" : "#F4B740",
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    resize();

    // Pause rendering loop when hero is out of viewport (Performance / GPU saver)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) render();
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    const render = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.twinklePhase += star.twinkleSpeed;
        star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.25;
        if (star.alpha < 0.1) star.alpha = 0.1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          star.color === "#17C97F"
            ? `rgba(23, 201, 127, ${star.alpha})`
            : `rgba(244, 183, 64, ${star.alpha})`;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();

        // Mouse interactive connection lines
        const mouseDist = Math.hypot(star.x - mouse.x, star.y - mouse.y);
        if (mouseDist < 120) {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(125, 232, 184, ${0.2 * (1 - mouseDist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Inter-star constellation links
        for (let j = i + 1; j < stars.length; j++) {
          const star2 = stars[j];
          const dist = Math.hypot(star.x - star2.x, star.y - star2.y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star2.x, star2.y);
            ctx.strokeStyle = `rgba(234, 243, 238, ${0.06 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Automated Chat Simulator
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let step = 0;

    const executeStep = () => {
      if (step >= CHAT_SIMULATION_FLOW.length) return;
      const current = CHAT_SIMULATION_FLOW[step];

      if (current.who === "user") {
        setMessages((prev) => [...prev, current]);
        step++;
        timerId = setTimeout(() => {
          setIsTyping(true);
          timerId = setTimeout(() => {
            setIsTyping(false);
            executeStep();
          }, 1500);
        }, 800);
      } else {
        setMessages((prev) => [...prev, current]);
        step++;
        timerId = setTimeout(executeStep, 3000);
      }
    };

    const initialDelay = setTimeout(executeStep, 3500);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timerId);
    };
  }, []);

  // Auto-scroll chat body
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle manual message entry
  // const handleManualChat = useCallback(
  //   (e: React.FormEvent) => {
  //     e.preventDefault();
  //     const text = chatInput.trim();
  //     if (!text) return;

  //     setMessages((prev) => [...prev, { who: "user", text }]);
  //     setChatInput("");
  //     setIsTyping(true);

  //     setTimeout(() => {
  //       setIsTyping(false);
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           who: "ai",
  //           tag: "Kora · Vet-trained guidance",
  //           text: "Evaluating symptom parameters against clinical vet resources… Ask anything about food, medications, or behavioral changes.",
  //         },
  //       ]);
  //     }, 1200);
  //   },
  //   [chatInput]
  // );

  // Trigger Voice Consult via ElevenLabs ConvAI widget
  const handleOpenVoiceConsult = useCallback(() => {
    const widget = document.querySelector("elevenlabs-convai") as any;
    if (widget && typeof widget.startCall === "function") {
      widget.startCall();
    } else if (widget) {
      widget.click?.();
    } else {
      router.push(isAuthenticated ? "/chat" : "/signup");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="hero-viewport">
      <section className="hero on-dark" ref={heroRef} aria-label="Introduction">
        <canvas ref={canvasRef} id="starCanvas" aria-hidden="true"></canvas>

        {/* Ambient Glow Meshes */}
        <div
          className="glow-mesh"
          style={{
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, var(--emerald-glow) 0%, transparent 70%)",
            top: "-100px",
            left: "-80px",
          }}
          aria-hidden="true"
        ></div>
        <div
          className="glow-mesh"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, var(--coral-glow) 0%, transparent 70%)",
            top: "80px",
            right: "-100px",
          }}
          aria-hidden="true"
        ></div>

        <div className="wrap hero-grid">
          {/* Left Column: Heading & Value Proposition */}
          <div>
            <span className="badge on-dark">
              <span className="badge-pulse" aria-hidden="true"></span> Vet-trained AI, on call 24/7
            </span>
            <h1>
              Wondering if it&apos;s
              <br />
              <span className="grad">normal - or a problem?</span>
            </h1>
            <p className="lead">
              Vet365.AI turns 2am worry into a clear next step. Ask Kora anything about your pet and get
              vet-grade guidance in minutes - not a waiting room.
            </p>

            <div className="hero-ctas">
              {isAuthenticated ? (
                <Link href="/chat" className="btn btn-cta">
                  Start your consult
                </Link>
              ) : (
                <a href="#pricing" className="btn btn-cta">
                  Start your first consult
                </a>
              )}
              <a href="#how" className="btn btn-ghost-dark">
                See how it works
              </a>
            </div>

            {/* Value Badges */}
            <div className="hero-proof">
              {PROOF_ITEMS.map((item) => (
                <div key={item.label} className="proof-item">
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Kora Console */}
          <div>
            <div className="console" role="region" aria-label="Interactive AI Vet Consultation Demo">
              <div className="console-top">
                <div className="console-brand">
                  <span className="badge-pulse" aria-hidden="true"></span> KORA · LIVE CONSULT
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#7DE8B8" }}>
                  ACTIVE SESSION
                </span>
              </div>

              {/* Chat Message List */}
              <div className="console-body" id="chatBody" ref={chatBodyRef} tabIndex={0}>
                {messages.map((msg, index) => (
                  <div key={index} className={`bubble ${msg.who}`}>
                    {msg.who === "ai" && (
                      <span className="tag">{msg.tag || "Kora · Vet-trained guidance"}</span>
                    )}
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="typing-box" aria-label="Kora is typing...">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>

              {/* Animated ECG Track */}
              <div className="vitals-track" aria-hidden="true">
                <svg viewBox="0 0 340 28">
                  <path d="M0 14 H100 L115 2 L130 26 L145 8 L160 14 H340" />
                </svg>
              </div>

              {/* Input & Voice Controls */}
              {/* <form className="console-foot" onSubmit={handleManualChat}>
                <input
                  type="text"
                  className="console-input"
                  id="chatInput"
                  placeholder="Kora is listening…"
                  autoComplete="off"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  aria-label="Ask Kora a question"
                />
                <button
                  className="console-mic"
                  type="button"
                  onClick={handleOpenVoiceConsult}
                  aria-label="Talk to Kora via Voice AI"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                      stroke="#7DE8B8"
                      strokeWidth="2"
                    />
                    <path
                      d="M6 11a6 6 0 0 0 12 0M12 17v4"
                      stroke="#7DE8B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </form> */}
            </div>
          </div>
        </div>
      </section>

      {/* Stat Bar */}
      <section className="statbar on-dark" aria-label="Key Statistics">
        <div className="wrap">
          <div className="stat-grid">
            {STAT_ITEMS.map((stat) => (
              <div key={stat.label} className="stat-item">
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

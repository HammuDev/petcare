"use client";

import React from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
    title: "Real-time, day or night",
    desc: "No booking, no waiting. Vet-trained answers whenever the worry hits, 24 hours a day.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 3l7 3v6c0 5-3 7.6-7 9-4-1.4-7-4-7-9V6l7-3Z" />
      </svg>
    ),
    title: "Vet-approved sources",
    desc: "Every response is shaped by trusted clinical resources and real veterinary experience.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 2v20M2 12h20" />
        <path d="M12 6l2 2-2 2-2-2 2-2Z" />
      </svg>
    ),
    title: "Danger checks",
    desc: "Ask about foods, plants, or household chemicals and find out fast if they're a risk to your pet.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 12l5 5L20 6" />
      </svg>
    ),
    title: "Step-by-step guidance",
    desc: "Clear, sequential instructions in an emergency - what to do first, second, and next.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 10.5c0 6-9 11-9 11s-9-5-9-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 10.5Z" />
      </svg>
    ),
    title: "Nearest emergency vet",
    desc: "When it's serious, Kora helps you find and route to the closest emergency clinic.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
      </svg>
    ),
    title: "Talk or type - your call",
    desc: "Prefer to speak out loud? Kora runs on live voice AI, powered by ElevenLabs, exactly like a phone call.",
  },
];

export default function VetFeatures() {
  return (
    <section className="section dark on-dark" id="features" aria-label="Features and Capabilities">
      <div className="wrap">
        <div className="section-head">
          <span className="badge on-dark">What you get</span>
          <h2>Everything a worried pet parent actually needs.</h2>
          <p>
            Vet365.AI is available anytime on your phone or computer - it checks if foods, chemicals, or
            plants are dangerous, guides you in emergencies, and finds the nearest emergency vet fast.
          </p>
        </div>

        <div className="feat-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feat-card">
              <div className="feat-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

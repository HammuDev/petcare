"use client";

import React from "react";

interface Step {
  num: string;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "Describe the symptom",
    desc: "Tell Kora what's going on - a limp, a strange snack, an off mood. Add details the way you'd explain it to your own vet.",
  },
  {
    num: "02",
    title: "Get vet-trained guidance",
    desc: "Kora asks the right follow-up questions and responds with clear, vet-reviewed reasoning - not a generic search result.",
  },
  {
    num: "03",
    title: "Know your next move",
    desc: "Leave with a concrete next step: monitor at home, call your clinic tonight, or head to an emergency vet - and why.",
  },
];

export default function VetHowItWorks() {
  return (
    <section className="section alt on-light" id="how" aria-label="How It Works">
      <div className="wrap">
        <div className="section-head">
          <span className="badge on-light">How it works</span>
          <h2>From worry to a clear plan, in three steps.</h2>
          <p>No account setup required to see how it feels - start a session and get guidance in minutes.</p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <article key={step.num} className="step-card">
              <span className="step-num" aria-hidden="true">
                {step.num}
              </span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

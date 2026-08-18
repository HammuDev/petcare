"use client";

import React from "react";

export default function VetFounder() {
  return (
    <section className="section alt on-light" id="founder" aria-label="About the Founder">
      <div className="wrap founder-grid">
        <aside className="founder-card">
          <div className="avatar" aria-hidden="true">
            AK
          </div>
          <h3 style={{ fontSize: "18px" }}>Dr. Alexis Kole</h3>
          <p style={{ color: "var(--emerald-deep)", fontSize: "12.5px", fontWeight: 600, marginBottom: "8px" }}>
            DVM · Founder &amp; Chief Veterinarian
          </p>
          <p style={{ fontSize: "13px", color: "var(--ink-soft)" }}>
            Veterinarian, lifelong animal lover, and the human heart behind Vet365.AI.
          </p>
        </aside>

        <div className="founder-copy">
          <span className="badge on-light">Meet the heart behind Vet365.AI</span>
          <h2 style={{ margin: "14px 0 18px" }}>
            &ldquo;Communication isn&apos;t just a skill - it&apos;s the foundation of prevention.&rdquo;
          </h2>
          <p>
            For nearly seven years, Dr. Kole has cared for pets in emergencies, urgent situations, and everyday
            life, always guided by one principle: understanding the <em>why</em> behind what&apos;s happening.
          </p>
          <blockquote>
            &ldquo;I wish I could answer every question personally, because every pet - and every concern -
            deserves more than surface-level advice. So I built Kora.&rdquo;
          </blockquote>
          <p>
            Kora delivers the same thoughtful, articulate, and accurate guidance Dr. Kole would give in person.
          </p>
        </div>
      </div>
    </section>
  );
}

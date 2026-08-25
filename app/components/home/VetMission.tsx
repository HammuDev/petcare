"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

export default function VetMission() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="section on-light" id="mission" aria-label="Our Mission">
      <div className="wrap mission-grid">
        <div className="mission-media">
          <img
            src="https://images.unsplash.com/photo-1765934785570-beb8c9a36446?fm=jpg&q=80&w=1200&auto=format&fit=crop"
            alt="Attentive, healthy dog looking calm and supported by veterinary care"
            loading="lazy"
          />
          <div className="mission-overlay">
            <span className="badge on-light" style={{ marginBottom: "4px" }}>
              Our mission
            </span>
            <p>Built and trained by a real veterinarian, using trusted, vet-approved resources.</p>
          </div>
        </div>

        <div className="mission-copy">
          <span className="badge on-light">Built by a vet, designed for you</span>
          <h2 style={{ margin: "14px 0 18px" }}>
            The brains of AI, with the heart of a real veterinarian.
          </h2>
          <p>
            Every pet parent knows the feeling: staring at your dog or cat, wondering{" "}
            <em>&ldquo;is that normal, or do we have a situation?&rdquo;</em> We&apos;ve been there - which is why
            Vet365.AI exists.
          </p>
          <p>
            <strong>No waiting rooms. No late-night panic searches.</strong> Just calm, compassionate guidance
            from an AI vet that actually gets it - your go-to for real, reliable pet care, any day, any hour.
          </p>
          {isAuthenticated ? (
            <Link href="/chat" className="btn btn-emerald" style={{ marginTop: "6px" }}>
              Get answers now
            </Link>
          ) : (
            <a href="#pricing" className="btn btn-emerald" style={{ marginTop: "6px" }}>
              Get answers now
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

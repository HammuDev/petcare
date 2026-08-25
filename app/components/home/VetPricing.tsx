"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import PaymentModal from "./PaymentModal";
import MinutesPaymentModal from "../MinutesPaymentModal";

export default function VetPricing() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "professional" | null>(null);

  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<"20" | "40" | "60" | null>(null);

  const handleSelectBasicPlan = () => {
    if (isAuthenticated) {
      setSelectedPlan("basic");
      setIsPaymentModalOpen(true);
    } else {
      router.push("/signup?plan=basic");
    }
  };

  const handleSelectProPlan = () => {
    if (isAuthenticated) {
      setSelectedPlan("premium");
      setIsPaymentModalOpen(true);
    } else {
      router.push("/signup?plan=pro");
    }
  };

  return (
    <section className="section on-light" id="pricing" aria-label="Subscription Plans">
      <div className="wrap">
        <div className="section-head center">
          <span className="badge on-light">Pricing</span>
          <h2>Choose the right plan for you &amp; your pet.</h2>
          <p>Try it once with no strings attached, or go all-in for unlimited peace of mind.</p>
        </div>

        <div className="pricing-grid">
          {/* Plan 1: Basic */}
          <article className="plan-card basic">
            <h3>Just Sniffing It Out?</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "13.5px", marginBottom: "12px" }}>
              A little sniff before you commit - perfect for first-timers wanting quick answers.
            </p>
            <div className="price">
              $5.99<span>/mo</span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--coral-deep)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                marginBottom: "14px",
              }}
            >
              10 min of real-time guidance for $8.99
            </p>
            <ul>
              <li>
                <span style={{ color: "var(--coral-deep)" }} aria-hidden="true">🐾</span>{" "}
                <span>
                  No subscription needed - <b>try it once</b>, no strings.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--coral-deep)" }} aria-hidden="true">🐾</span>{" "}
                <span>
                  <b>Pay-as-you-go</b> pet advice, quick, easy, anytime.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--coral-deep)" }} aria-hidden="true">🐾</span>{" "}
                <span>
                  <b>Real vet-trained answers</b>, 24/7, fast and reliable.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--coral-deep)" }} aria-hidden="true">🐾</span>{" "}
                <span>
                  A first taste of full <b>AI vet support</b>.
                </span>
              </li>
            </ul>
            <button
              type="button"
              onClick={handleSelectBasicPlan}
              className="btn btn-ghost-light"
            >
              Join the pack
            </button>
          </article>

          {/* Plan 2: Pro */}
          <article className="plan-card pro">
            <span className="plan-badge">Welcome offer $4.99</span>
            <h3>Pawblem Solver</h3>
            <p style={{ color: "var(--text-mute-light)", fontSize: "13.5px", marginBottom: "12px" }}>
              Go all in on unlimited peace of mind - an answer always within paw&apos;s reach.
            </p>
            <div className="price">
              $14.99<span>/mo</span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--gold)",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                marginBottom: "14px",
              }}
            >
              First month intro pricing included
            </p>
            <ul>
              <li>
                <span style={{ color: "var(--emerald)" }} aria-hidden="true">✓</span>{" "}
                <span>
                  <b>20 vet-trained minutes</b> included every month.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--emerald)" }} aria-hidden="true">✓</span>{" "}
                <span>
                  <b>Rollover unused minutes</b> - no catch.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--emerald)" }} aria-hidden="true">✓</span>{" "}
                <span>
                  <b>Add extra minutes anytime</b> with member discounts.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--emerald)" }} aria-hidden="true">✓</span>{" "}
                <span>
                  <b>Real-time answers</b>, day or night - no waiting.
                </span>
              </li>
              <li>
                <span style={{ color: "var(--emerald)" }} aria-hidden="true">✓</span>{" "}
                <span>
                  <b>Step-by-step guidance</b> from trusted resources.
                </span>
              </li>
            </ul>
            <button
              type="button"
              onClick={handleSelectProPlan}
              className="btn btn-cta"
            >
              Join the pack
            </button>
          </article>
        </div>
      </div>

      {/* Stripe Payment Modal for Subscriptions */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          plan={selectedPlan}
          userId={userId}
          onPaymentSuccess={() => {
            setIsPaymentModalOpen(false);
            router.push("/chat");
          }}
        />
      )}

      {/* Stripe Payment Modal for Minutes Packages */}
      {isMinutesModalOpen && (
        <MinutesPaymentModal
          isOpen={isMinutesModalOpen}
          onClose={() => setIsMinutesModalOpen(false)}
          minutes={selectedMinutes}
          userId={userId}
          onPaymentSuccess={() => {
            setIsMinutesModalOpen(false);
            router.push("/chat");
          }}
        />
      )}
    </section>
  );
}

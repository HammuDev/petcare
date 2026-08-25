"use client";

import React, { useState, useEffect } from "react";
import { Mic, Zap, ShieldCheck } from "lucide-react";
import MinutesPaymentModal from "../components/MinutesPaymentModal";

interface MinutesSectionProps {
  userId: string;
  currentMinutes?: number;
  onPaymentSuccess?: () => void;
}

const MINUTES_PACKAGES = [
  {
    minutes: "20",
    amount: 20,
    price: "$4.99",
    description: "Perfect for quick symptom checks and immediate questions",
    popular: false,
    perMin: "$0.25 / min",
  },
  {
    minutes: "40",
    amount: 40,
    price: "$9.99",
    description: "Great for comprehensive consultations and follow-up guidance",
    popular: true,
    perMin: "$0.24 / min",
  },
  {
    minutes: "60",
    amount: 60,
    price: "$14.99",
    description: "Best value pack for ongoing care and multiple pets",
    popular: false,
    perMin: "$0.24 / min",
  },
];

export default function MinutesSection({
  userId,
  currentMinutes: initialMinutes,
  onPaymentSuccess,
}: MinutesSectionProps) {
  const [currentMinutes, setCurrentMinutes] = useState(initialMinutes || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<"20" | "40" | "60" | null>(null);

  // Fetch current minutes from backend
  const fetchCurrentMinutes = async () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        const uid = parsed?.id;
        if (!uid) return;

        const res = await fetch(`/api/users/${uid}`);
        const data = await res.json();
        if (res.ok) {
          setCurrentMinutes(data.total_time || 0);
        }
      } catch (e) {
        console.error("Failed to fetch user data:", e);
      }
    }
  };

  useEffect(() => {
    fetchCurrentMinutes();
  }, [userId]);

  const handlePurchase = (minutes: "20" | "40" | "60") => {
    setSelectedMinutes(minutes);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMinutes(null);
  };

  const handlePaymentSuccess = () => {
    fetchCurrentMinutes();
    onPaymentSuccess?.();
  };

  return (
    <div className="space-y-6">
      {/* Available Minutes Overview Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#EAF8F1] to-[#DDF7E9] border border-[#17C97F]/30 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#0E9C63] flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
            🎙️
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#06180F]">
              Available Talk Time
            </h3>
            <p className="text-xs sm:text-sm text-[#0E9C63]">
              Use your minutes for live AI voice consultations with Kora
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2 sm:text-right">
          <span className="font-extrabold text-3xl sm:text-4xl text-[#06180F] tracking-tight">
            {currentMinutes || 0}
          </span>
          <span className="text-xs font-semibold uppercase text-[#0E9C63] font-mono">
            Minutes Left
          </span>
        </div>
      </div>

      {/* Purchase Minutes Packages Section */}
      <div>
        <div className="mb-6">
          <span className="font-mono text-xs text-[#0E9C63] uppercase tracking-wider font-bold block mb-1">
            Top Up Your Account
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#10201A]">
            Purchase Additional Chat Minutes
          </h2>
          <p className="text-xs sm:text-sm text-[#4C5C53] mt-0.5">
            Add minutes anytime. All purchased minutes rollover and never expire.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {MINUTES_PACKAGES.map((pkg) => (
            <div
              key={pkg.minutes}
              onClick={() => handlePurchase(pkg.minutes as "20" | "40" | "60")}
              className={`
                relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300
                hover:-translate-y-1
                ${
                  pkg.popular
                    ? "bg-white border-2 border-[#17C97F] shadow-[0_16px_36px_-8px_rgba(23,201,127,0.22)] ring-4 ring-[#17C97F]/10"
                    : "bg-white border border-[#E6DDC0] shadow-xs hover:border-[#17C97F]/60 hover:shadow-sm"
                }
              `}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#17C97F] to-[#0E9C63] text-[#06180F] px-4 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Most Popular</span>
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-[#10201A]">{pkg.amount} Minutes</h3>
                  <span className="text-[11px] font-mono font-semibold text-[#0E9C63] bg-[#EAF8F1] px-2.5 py-0.5 rounded-full">
                    {pkg.perMin}
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-[#10201A] mb-2 tracking-tight">
                  {pkg.price}
                </div>

                <p className="text-xs text-[#4C5C53] leading-relaxed mb-6 min-h-[36px]">
                  {pkg.description}
                </p>
              </div>

              <button
                type="button"
                className={`
                  w-full py-3 rounded-full font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs
                  ${
                    pkg.popular
                      ? "bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] text-white shadow-[0_4px_14px_rgba(255,106,77,0.35)] hover:-translate-y-0.5"
                      : "bg-[#F2EAD3] text-[#10201A] hover:bg-[#E6DDC0]"
                  }
                `}
              >
                <span>+</span>
                <span>Select and Purchase</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center text-xs text-[#4C5C53] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0E9C63]" />
          <span>Secure 256-bit payment powered by Stripe. Minutes never expire.</span>
        </div>
      </div>

      {/* Stripe Payment Modal for Minutes */}
      {isModalOpen && (
        <MinutesPaymentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          minutes={selectedMinutes}
          userId={userId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import VetNavHeader from "../components/common/VetNavHeader";
import MinutesSection from "./MinutesSection";

interface Transaction {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  stripePaymentIntentId: string;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [parsedUserData, setParsedUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (uid?: string) => {
    const userId = uid || parsedUserData?.id;
    if (!userId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/get-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setParsedUserData(parsed);
        if (parsed?.id) fetchTransactions(parsed.id);
      } catch (e) {
        console.error("Failed to parse user_data:", e);
      }
    } else {
      router.push("/login");
    }
  }, []);

  const formatAmount = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#0E9C63] bg-[#DDF7E9]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="capitalize">Completed</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-[#E24E30] bg-[#FFE8DF]">
            <XCircle className="w-3.5 h-3.5" />
            <span className="capitalize">Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-100">
            <Clock className="w-3.5 h-3.5" />
            <span className="capitalize">Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#10201A] w-full max-w-[100vw] overflow-x-hidden">
      <VetNavHeader />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#16332A_0%,#0A1512_65%)] text-white pt-10 sm:pt-12 pb-14 sm:pb-16 px-4 sm:px-8 text-center w-full">
        <div className="absolute w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full bg-[#17C97F] opacity-20 -top-32 -left-20 blur-[90px] pointer-events-none animate-drift1" />
        <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-[#FF6A4D] opacity-[0.15] -bottom-32 -right-20 blur-[90px] pointer-events-none animate-drift2" />

        {/* Back Link */}
        <div className="max-w-[1140px] mx-auto text-left mb-5 sm:mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#EAF3ED] bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-[640px] mx-auto">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs text-[#7DE8B8] bg-[#17C97F]/12 border border-[#17C97F]/25 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full mb-3 sm:mb-4 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7DE8B8] animate-pulse-dot" />
            <span>Billing | Talk Time Minutes</span>
          </span>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-display font-extrabold text-white mb-2 tracking-tight">
            Transaction History &amp; Top-Ups
          </h1>
          <p className="text-[#9AB0A5] text-xs sm:text-base">
            Review your subscription history, minute purchases, and Stripe payment receipts.
          </p>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-8 -mt-8 pb-20 relative z-20 space-y-8">
        {/* Minutes Purchase / Top-Up Section */}
        <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 sm:p-8 shadow-xs">
          <MinutesSection
            userId={parsedUserData?.id}
            onPaymentSuccess={() => {
              if (parsedUserData?.id) fetchTransactions(parsedUserData.id);
            }}
          />
        </div>

        {/* Transactions List */}
        <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#10201A] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0E9C63]" />
              <span>Payment Receipts</span>
            </h3>
            <span className="text-xs font-mono text-[#4C5C53] bg-[#F2EAD3]/40 px-3 py-1 rounded-full border border-[#E6DDC0]/60">
              {transactions.length} record{transactions.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-[#4C5C53]">
              <div className="w-7 h-7 rounded-full border-2 border-[#17C97F] border-t-transparent animate-spin" />
              <span>Loading payment history...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-14 text-[#4C5C53]">
              <div className="w-14 h-14 rounded-2xl bg-[#F2EAD3] text-[#10201A] mx-auto flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-[#4C5C53]" />
              </div>
              <h4 className="font-bold text-base text-[#10201A] mb-1">No transactions found</h4>
              <p className="text-xs max-w-sm mx-auto mb-5">
                You haven't made any purchases or subscriptions yet. Choose a plan to unlock full access to Kora.
              </p>
              <Link
                href="/#pricing"
                className="px-6 py-2.5 rounded-full font-bold text-xs text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] shadow-sm hover:-translate-y-0.5 transition-all inline-block"
              >
                Browse Plans
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border border-[#E6DDC0] rounded-2xl bg-[#F2EAD3]/15 hover:bg-[#F2EAD3]/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E6DDC0] flex items-center justify-center flex-shrink-0 text-base text-[#0E9C63]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#10201A] capitalize">
                        {tx.plan} Plan
                      </h4>
                      <p className="text-xs text-[#4C5C53] mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Card & ID details */}
                  {(tx.cardLast4 || tx.cardBrand || tx.stripePaymentIntentId) && (
                    <div className="text-xs text-[#4C5C53] flex items-center gap-3">
                      {tx.cardBrand && (
                        <span className="capitalize font-medium">
                          {tx.cardBrand} ending in {tx.cardLast4}
                        </span>
                      )}
                      {tx.stripePaymentIntentId && (
                        <span className="font-mono text-[10.5px] bg-white border border-[#E6DDC0] px-2 py-0.5 rounded-md">
                          ID: {tx.stripePaymentIntentId.slice(-8)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Amount & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right">
                    <div className="font-bold text-base text-[#10201A]">
                      {formatAmount(tx.amount, tx.currency)}
                    </div>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

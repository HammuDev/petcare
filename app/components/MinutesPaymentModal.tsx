"use client";

import React, { useState, useEffect, useMemo } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface MinutesPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  minutes: "20" | "40" | "60" | null;
  userId: string;
  onPaymentSuccess?: () => void;
}

const MINUTES_PACKAGES = {
  "20": { minutes: 20, price: "$4.99", description: "Perfect for quick consultations" },
  "40": { minutes: 40, price: "$9.99", description: "Great for detailed discussions" },
  "60": { minutes: 60, price: "$14.99", description: "Best value for comprehensive care" },
};

const CardForm = ({
  minutes,
  userId,
  onClose,
  clientSecret,
  onPaymentSuccess,
  paymentMethods,
  useNewCard,
  setUseNewCard,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: {
  minutes: string;
  userId: string;
  onClose: () => void;
  clientSecret: string;
  onPaymentSuccess?: () => void;
  paymentMethods: any[];
  useNewCard: boolean;
  setUseNewCard: (value: boolean) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (value: string) => void;
}) => {
  const stripe = useStripe();
  const router = useRouter();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !clientSecret) {
      setError("Payment system not ready");
      return;
    }

    if (useNewCard) {
      if (!elements || !cardholderName.trim()) {
        setError("Please enter the cardholder name");
        return;
      }
    } else {
      if (!selectedPaymentMethod) {
        setError("Please select a payment method");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      let paymentIntent;

      if (useNewCard) {
        const cardElement = elements?.getElement(CardElement);
        if (!cardElement) {
          setError("Card element not found");
          return;
        }

        const { error: confirmError, paymentIntent: pi } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
            },
          },
        });

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
          return;
        }
        paymentIntent = pi;
      } else {
        const { error: confirmError, paymentIntent: pi } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedPaymentMethod,
        });

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
          return;
        }
        paymentIntent = pi;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        const response = await fetch("/api/purchase-minutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Payment processing failed");
          return;
        }

        if (data.success) {
          const currentUserData = localStorage.getItem("user_data");
          if (currentUserData) {
            try {
              const userData = JSON.parse(currentUserData);
              if (userData && userData.data) {
                userData.data.total_time = (userData.data.total_time || 0) + parseInt(minutes);
                localStorage.setItem("user_data", JSON.stringify(userData));
              }
            } catch (e) {}
          }

          onClose();
          onPaymentSuccess?.();
          router.refresh();

          setTimeout(() => {
            Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              text: `${data.minutesAdded} minutes have been added to your account.`,
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }, 100);
        } else {
          setError("Payment processing failed");
        }
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const packageInfo = MINUTES_PACKAGES[minutes as keyof typeof MINUTES_PACKAGES];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Method Tabs */}
      {paymentMethods.length > 0 && (
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setUseNewCard(false)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
              !useNewCard
                ? "bg-gradient-to-br from-[#17C97F] to-[#0E9C63] text-[#06180F] border-transparent shadow-xs"
                : "bg-white border-[#E6DDC0] text-[#4C5C53] hover:bg-[#F2EAD3]/30"
            }`}
          >
            Saved Card
          </button>
          <button
            type="button"
            onClick={() => setUseNewCard(true)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer border transition-all ${
              useNewCard
                ? "bg-gradient-to-br from-[#17C97F] to-[#0E9C63] text-[#06180F] border-transparent shadow-xs"
                : "bg-white border-[#E6DDC0] text-[#4C5C53] hover:bg-[#F2EAD3]/30"
            }`}
          >
            New Card
          </button>
        </div>
      )}

      {/* Saved Cards Selection */}
      {!useNewCard && paymentMethods.length > 0 && (
        <div className="space-y-2">
          {paymentMethods.map((pm) => (
            <label
              key={pm.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                selectedPaymentMethod === pm.id
                  ? "border-[#17C97F] bg-[#F3FBF6]"
                  : "border-[#E6DDC0] bg-white hover:bg-[#F2EAD3]/20"
              }`}
            >
              <input
                type="radio"
                name="savedMethod"
                value={pm.id}
                checked={selectedPaymentMethod === pm.id}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="accent-[#0E9C63] w-4 h-4"
              />
              <div className="flex-1 text-xs">
                <span className="font-bold capitalize text-[#10201A]">
                  {pm.card?.brand} ending in {pm.card?.last4}
                </span>
                <span className="block text-[11px] text-[#4C5C53]">
                  Exp: {pm.card?.exp_month}/{pm.card?.exp_year}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* New Card Form */}
      {useNewCard && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#4C5C53] mb-1 uppercase tracking-wider">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6DDC0] bg-[#F2EAD3]/20 text-xs font-sans text-[#10201A] focus:outline-none focus:border-[#17C97F]"
              placeholder="Full Name on Card"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4C5C53] mb-1 uppercase tracking-wider">
              Card Details
            </label>
            <div className="p-3 border border-[#E6DDC0] rounded-xl bg-white focus-within:border-[#17C97F]">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "14px",
                      color: "#10201A",
                      fontFamily: "Inter, sans-serif",
                      "::placeholder": {
                        color: "#9AB0A5",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FFE8DF] border border-[#FF6A4D]/30 text-[#E24E30] text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-3 rounded-full border border-[#E6DDC0] text-xs font-bold text-[#4C5C53] hover:bg-[#F2EAD3]/40 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || (!useNewCard && !selectedPaymentMethod)}
          className="flex-1 py-3 rounded-full font-bold text-xs text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_6px_16px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Processing..." : `Pay ${packageInfo?.price}`}
        </button>
      </div>
    </form>
  );
};

export default function MinutesPaymentModal({
  isOpen,
  onClose,
  minutes,
  userId,
  onPaymentSuccess,
}: MinutesPaymentModalProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [useNewCard, setUseNewCard] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    if (isOpen && (!userId || userId.trim() === "")) {
      router.push("/login");
      onClose();
    }
  }, [isOpen, userId, router, onClose]);

  useEffect(() => {
    if (isOpen && minutes && userId && userId.trim() !== "") {
      fetch("/api/create-minutes-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes, userId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        })
        .catch((err) => console.error("Failed to create payment intent:", err));
    }
  }, [isOpen, minutes, userId]);

  useEffect(() => {
    if (isOpen && userId && userId.trim() !== "") {
      setLoadingPaymentMethods(true);
      fetch("/api/get-payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.paymentMethods && data.paymentMethods.length > 0) {
            setPaymentMethods(data.paymentMethods);
            setSelectedPaymentMethod(data.paymentMethods[0].id);
            setUseNewCard(false);
          } else {
            setUseNewCard(true);
          }
        })
        .catch((err) => console.error("Failed to fetch payment methods:", err))
        .finally(() => setLoadingPaymentMethods(false));
    }
  }, [isOpen, userId]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      labels: "floating",
    },
  };

  const memoizedOptions = useMemo(() => options, [clientSecret]);

  if (!isOpen || !minutes) return null;

  const packageInfo = MINUTES_PACKAGES[minutes as keyof typeof MINUTES_PACKAGES];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-modal-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-[#E6DDC0]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFE8DF] text-[#E24E30] hover:bg-[#FF6A4D] hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-[#DDF7E9] rounded-2xl flex items-center justify-center text-2xl text-[#0E9C63]">
            🎙️
          </div>
          <h2 className="text-xl font-bold text-[#10201A] mb-1">
            Purchase {packageInfo?.minutes} Minutes
          </h2>
          <p className="text-2xl font-extrabold text-[#0E9C63] mb-1">
            {packageInfo?.price}
          </p>
          <p className="text-xs text-[#4C5C53]">
            {packageInfo?.description}. Minutes never expire.
          </p>
        </div>

        {clientSecret ? (
          <Elements options={memoizedOptions} stripe={stripePromise}>
            <CardForm
              minutes={minutes}
              userId={userId}
              onClose={onClose}
              clientSecret={clientSecret}
              onPaymentSuccess={onPaymentSuccess}
              paymentMethods={paymentMethods}
              useNewCard={useNewCard}
              setUseNewCard={setUseNewCard}
              selectedPaymentMethod={selectedPaymentMethod}
              setSelectedPaymentMethod={setSelectedPaymentMethod}
            />
          </Elements>
        ) : (
          <div className="text-center py-8 text-xs text-[#4C5C53]">
            <div className="w-6 h-6 border-2 border-[#17C97F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Preparing secure checkout...</span>
          </div>
        )}
      </div>
    </div>
  );
}

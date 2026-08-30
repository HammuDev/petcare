"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Camera,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import VetNavHeader from "../components/common/VetNavHeader";
import PaymentModal from "../components/home/PaymentModal";

export default function ProfilePage() {
  const router = useRouter();
  const [parsedUserData, setParsedUserData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [updatingRenewal, setUpdatingRenewal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [latestSubscription, setLatestSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "professional" | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Unknown") return "Active Member";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Active Member";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setParsedUserData(parsed);
        if (parsed?.id) {
          fetchPaymentMethods(parsed.id);
          fetchLatestSubscription(parsed.id);
          getProfileImage(parsed.id);
        }
      } catch (e) {
        console.error("Failed to parse user_data:", e);
      }
    } else {
      router.push("/login");
    }
  }, []);

  const getProfileImage = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (res.ok && data.profileImage) {
        setProfileImage(data.profileImage);
      }
    } catch (err) {
      console.error("Error fetching profile image:", err);
    }
  };

  const fetchLatestSubscription = async (userId: string) => {
    setLoadingSubscription(true);
    try {
      const res = await fetch(`/api/latest-subscription?userId=${userId}`);
      const data = await res.json();
      if (res.ok && data.subscription) {
        setLatestSubscription(data.subscription);
      }
    } catch (err) {
      console.error("Error fetching latest subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const fetchPaymentMethods = async (userId: string) => {
    if (!userId) return;
    setLoadingPaymentMethods(true);
    try {
      const res = await fetch("/api/get-payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !parsedUserData?.id) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("userId", parsedUserData.id);

      const res = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.imageUrl) {
        const updated = {
          ...parsedUserData,
          profileImage: data.imageUrl,
        };
        setParsedUserData(updated);
        setProfileImage(data.imageUrl);
        localStorage.setItem("user_data", JSON.stringify(updated));
        showToast("Profile image updated successfully!");
      } else {
        showToast(data.error || "Failed to upload image.", "error");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      showToast("Error uploading image.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const updateRenewalSetting = async (renew: boolean) => {
    if (!parsedUserData?.id) return;

    setUpdatingRenewal(true);
    try {
      const res = await fetch("/api/update-renewal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parsedUserData.id,
          renew,
        }),
      });

      if (res.ok) {
        const updated = {
          ...parsedUserData,
          data: {
            ...parsedUserData.data,
            renew,
          },
        };
        setParsedUserData(updated);
        localStorage.setItem("user_data", JSON.stringify(updated));
        showToast(renew ? "Auto-renewal enabled." : "Auto-renewal turned off.");
      } else {
        showToast("Failed to update renewal setting.", "error");
      }
    } catch (err) {
      console.error("Error updating renewal:", err);
      showToast("Error updating renewal.", "error");
    } finally {
      setUpdatingRenewal(false);
    }
  };

  const openUpgradeModal = (plan: "basic" | "premium" | "professional") => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#10201A] w-full max-w-[100vw] overflow-x-hidden">
      <VetNavHeader />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#16332A_0%,#0A1512_65%)] text-white pt-10 sm:pt-14 pb-14 sm:pb-16 px-4 sm:px-8 text-center w-full">
        <div className="absolute w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full bg-[#17C97F] opacity-20 -top-32 -left-20 blur-[90px] pointer-events-none animate-drift1" />
        <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-[#FF6A4D] opacity-[0.15] -bottom-32 -right-20 blur-[90px] pointer-events-none animate-drift2" />

        <div className="relative z-10 max-w-[640px] mx-auto">
          {/* Avatar with Camera Icon Badge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#17C97F] to-[#0E9C63] text-[#06180F] font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(23,201,127,0.45),0_0_0_6px_rgba(23,201,127,0.15)] overflow-hidden border-2 border-white/20">
            {profileImage ? (
              <img
                src={profileImage}
                alt={parsedUserData?.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{parsedUserData?.name ? parsedUserData.name.charAt(0).toUpperCase() : "U"}</span>
            )}

            {uploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex justify-center mb-3">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-semibold text-[#EAF3ED] cursor-pointer transition-colors">
              <Camera className="w-3.5 h-3.5 text-[#17C97F]" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-display font-extrabold text-white mb-2 tracking-tight">
            Welcome back, {parsedUserData?.name || "Pet Parent"}!
          </h1>
          <p className="text-[#9AB0A5] text-xs sm:text-base">
            Manage your Vet365 account, talk minutes, and billing preferences.
          </p>
        </div>
      </section>

      {/* Main Profile Dashboard */}
      <main className="max-w-[1140px] mx-auto px-4 sm:px-8 -mt-8 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          {/* Left Column: Account Information & Payment Methods */}
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 sm:p-7 shadow-xs">
              <h3 className="text-lg font-bold text-[#10201A] mb-5 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0E9C63]" />
                <span>Account Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4C5C53] mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-[#E6DDC0] bg-[#F2EAD3]/30 font-semibold text-sm text-[#10201A]">
                    {parsedUserData?.name || "Pet Parent"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4C5C53] mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-[#E6DDC0] bg-[#F2EAD3]/30 font-semibold text-sm text-[#10201A] truncate">
                    {parsedUserData?.email || "Not set"}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4C5C53] mb-1.5 uppercase tracking-wider">
                    Membership Status
                  </label>
                  <div className="px-4 py-3 rounded-xl border border-[#E6DDC0] bg-[#F2EAD3]/30 font-semibold text-sm text-[#10201A] flex items-center justify-between">
                    <span>{formatDate(parsedUserData?.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#0E9C63] font-bold bg-[#DDF7E9] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#10201A] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0E9C63]" />
                  <span>Saved Payment Methods</span>
                </h3>
                <Link
                  href="/transactions"
                  className="text-xs font-bold text-[#0E9C63] hover:underline flex items-center gap-1"
                >
                  <span>Billing History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingPaymentMethods ? (
                <div className="flex items-center justify-center py-8 text-xs text-[#4C5C53] gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-[#17C97F] border-t-transparent animate-spin" />
                  <span>Loading payment methods...</span>
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="flex items-center justify-between gap-3 p-4 border border-[#E6DDC0] rounded-2xl bg-[#F2EAD3]/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E6DDC0] flex items-center justify-center flex-shrink-0 text-base text-[#10201A]">
                          <CreditCard className="w-5 h-5 text-[#0E9C63]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#10201A] capitalize">
                            {pm.card?.brand} ending in {pm.card?.last4}
                          </p>
                          <p className="text-xs text-[#4C5C53]">
                            Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E9C63] bg-[#DDF7E9] px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Default</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#4C5C53]">
                  <div className="w-12 h-12 rounded-full bg-[#F2EAD3] text-[#4C5C53] mx-auto flex items-center justify-center text-xl mb-2">
                    <CreditCard className="w-5 h-5 text-[#4C5C53]" />
                  </div>
                  <p className="font-bold text-sm text-[#10201A] mb-1">No payment cards stored</p>
                  <p>Cards are saved automatically after your first subscription or minute purchase.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Stats, Subscription, Actions */}
          <div className="space-y-6">
            {/* Talk Time & Account Stats */}
            <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#10201A] mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0E9C63]" />
                <span>Talk Time Balance</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-br from-[#EAF8F1] to-[#DDF7E9] border border-[#17C97F]/30">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0E9C63] flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                    🎙️
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-2xl text-[#06180F] tracking-tight">
                      {parsedUserData?.data?.total_time || parsedUserData?.total_time || 0} mins
                    </p>
                    <p className="text-xs text-[#0E9C63] font-semibold">Available for AI voice consults</p>
                  </div>
                  <Link
                    href="/transactions"
                    className="px-3.5 py-1.5 bg-[#0E9C63] text-white rounded-full text-xs font-bold shadow-xs hover:bg-[#17C97F] hover:text-[#06180F] transition-colors"
                  >
                    + Top Up
                  </Link>
                </div>
              </div>
            </div>

            {/* Subscription & Auto-renewal Details */}
            <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#10201A] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0E9C63]" />
                <span>Subscription Details</span>
              </h3>

              <div className="space-y-4">
                {/* Auto-renewal Switch */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F2EAD3]/30 border border-[#E6DDC0]">
                  <div>
                    <p className="text-sm font-bold text-[#10201A]">Monthly Auto-Renewal</p>
                    <p className="text-xs text-[#4C5C53]">
                      {parsedUserData?.data?.renew !== false
                        ? "Renews automatically every 30 days"
                        : "Manual renewal only"}
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parsedUserData?.data?.renew !== false}
                      onChange={() => updateRenewalSetting(parsedUserData?.data?.renew === false)}
                      disabled={updatingRenewal}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E6DDC0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-br peer-checked:from-[#17C97F] peer-checked:to-[#0E9C63]" />
                  </label>
                </div>

                {latestSubscription && (
                  <div className="p-3.5 rounded-2xl border border-[#17C97F]/30 bg-[#EAF8F1] flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#06180F] capitalize">
                        {latestSubscription.plan === "basic" ? "Basic Plan" : "Pawblem Solver Pro"}
                      </p>
                      <p className="text-xs text-[#0E9C63]">
                        {formatDate(latestSubscription.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#06180F]">
                        ${(latestSubscription.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-[#4C5C53]">
                        {latestSubscription.plan === "basic" ? "10 min pack" : "20 min/mo"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upgrade Trigger if on basic */}
              {(!latestSubscription || latestSubscription.plan === "basic") && (
                <div className="mt-4 pt-4 border-t border-[#E6DDC0]">
                  <p className="text-xs font-mono font-bold text-[#FF6A4D] uppercase tracking-wider mb-1">
                    Upgrade &amp; Save
                  </p>
                  <h4 className="text-sm font-bold text-[#10201A] mb-1">Pawblem Solver Pro</h4>
                  <p className="text-xs text-[#4C5C53] mb-3">
                    20 vet-trained minutes every month + rollover unused minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => openUpgradeModal("premium")}
                    className="w-full py-2.5 rounded-full font-bold text-xs text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_4px_16px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Upgrade to Pro ($14.99/mo)
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-[#10201A] mb-2">Account Actions</h3>

              <Link
                href="/transactions"
                className="w-full py-3 rounded-full font-bold text-xs text-center block text-[#10201A] bg-[#F2EAD3] hover:bg-[#E6DDC0] transition-colors"
              >
                View Transaction Receipts
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-full font-bold text-xs text-white bg-gradient-to-br from-[#FF6A4D] to-[#D63A1F] shadow-[0_4px_14px_rgba(255,106,77,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[900] flex items-center gap-3 bg-[#0F241D] border border-[#7DE8B8]/30 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm font-medium shadow-2xl animate-toast-in">
          <span className="w-5 h-5 rounded-full bg-[#17C97F]/20 flex items-center justify-center text-[#17C97F]">
            {toastMessage.type === "success" ? "✓" : "!"}
          </span>
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stripe Payment Modal */}
      {isModalOpen && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={selectedPlan || "premium"}
          userId={parsedUserData?.id || ""}
          onPaymentSuccess={() => {
            setIsModalOpen(false);
            showToast("Plan updated successfully!");
            if (parsedUserData?.id) fetchLatestSubscription(parsedUserData.id);
          }}
        />
      )}
    </div>
  );
}

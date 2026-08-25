"use client";

import React, { useState, useRef, useEffect } from "react";
import { Role, useConversation } from "@elevenlabs/react";
import { useRouter } from "next/navigation";
import MinutesSection from "@/app/transactions/MinutesSection";
import PaymentModal from "@/app/components/home/PaymentModal";

interface VetVoiceChatProps {
  sessionId: string;
  userId?: string;
  onMessage?: (message: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }) => void;
  onError?: (error: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function VetVoiceChat({
  sessionId,
  userId,
  onMessage,
  onError,
}: VetVoiceChatProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const callStartTimeRef = useRef<Date | null>(null);
  const [parsedUserData, setParsedUserData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "professional" | null>(null);

  // Fetch latest user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      const stored = localStorage.getItem("user_data");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const uid = parsed?.id;
          if (uid) {
            const res = await fetch(`/api/users/${uid}`);
            const data = await res.json();
            if (res.ok) {
              localStorage.setItem("user_data", JSON.stringify(data));
              setParsedUserData(data);
              setTotalTime(data?.total_time || 0);
            }
          }
        } catch (e) {
          console.error("Failed to parse user_data:", e);
        }
      }
    };
    fetchUserData();
  }, [refreshTrigger]);

  // Request microphone permission on mount
  useEffect(() => {
    const requestMic = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (err) {
        const msg = "Microphone access denied. Please grant permission in your browser.";
        setErrorMessage(msg);
        onError?.(msg);
      }
    };
    requestMic();
  }, [onError]);

  // Handle call end & deduct duration from minutes balance
  const handleCallEnd = async () => {
    let startTime = callStartTimeRef.current;
    if (!startTime) {
      startTime = new Date(Date.now() - 60000);
      callStartTimeRef.current = startTime;
    }

    const callEndTime = new Date();
    const durationMs = callEndTime.getTime() - startTime.getTime();
    const durationSeconds = durationMs / 1000;
    const minutes = Math.floor(durationSeconds / 60);
    const remainderSeconds = durationSeconds % 60;
    const callDurationMinutes = remainderSeconds > 30 ? minutes + 1 : minutes;

    if (callDurationMinutes <= 0 || !parsedUserData?.id) return;

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parsedUserData.id,
          total_time: Math.max(0, totalTime - callDurationMinutes),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const updated = {
          ...parsedUserData,
          data: {
            ...parsedUserData.data,
            total_time: result.user.total_time,
          },
        };
        localStorage.setItem("user_data", JSON.stringify(updated));
        setTotalTime(result.user.total_time);
        setParsedUserData(updated);
      }
    } catch (err) {
      console.error("Error updating call duration:", err);
    }

    callStartTimeRef.current = null;
  };

  // ElevenLabs Conversational AI hook
  const conversation = useConversation({
    onConnect: () => {
      setErrorMessage("");
      callStartTimeRef.current = new Date();
    },
    onDisconnect: () => {
      handleCallEnd();
    },
    onMessage: (message: string | { message: string; source: Role }) => {
      const content = typeof message === "string" ? message : message.message;
      const assistantMessage: Message = {
        role: "assistant",
        content,
        timestamp: new Date(),
      };
      onMessage?.(assistantMessage);
      saveMessageToDB(assistantMessage);
    },
    onError: (error: string | Error) => {
      const errorMsg = typeof error === "string" ? error : error.message;
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    },
  });

  const { status, isSpeaking } = conversation;
  const isLive = status === "connected";

  // Save message to MongoDB chat collection
  const saveMessageToDB = async (message: Message) => {
    try {
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId: userId || parsedUserData?.id,
          message: message.content,
          role: message.role,
        }),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  };

  // Start voice conversation
  const handleStartConversation = async () => {
    try {
      if (parsedUserData?.id) {
        const checkRes = await fetch(`/api/check-subscription?userId=${parsedUserData.id}`);
        const checkData = await checkRes.json();
        if (!checkData.hasTransaction) {
          setSelectedPlan("basic");
          setShowPlansModal(true);
          return;
        }
      }

      if (totalTime <= 0) {
        setShowMinutesModal(true);
        return;
      }

      const agentId =
        process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
        "agent_4901k6njbw0bfpwvfkb9vd073zz6";

      await conversation.startSession({
        agentId,
        userId: sessionId,
        connectionType: "websocket",
      });
    } catch (err) {
      const msg = "Failed to start voice consult. Please try again.";
      setErrorMessage(msg);
      onError?.(msg);
    }
  };

  // End voice conversation
  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      setCurrentTranscript("");
    } catch (err) {
      console.error("Error ending voice conversation:", err);
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (err) {
      console.error("Failed to toggle volume:", err);
    }
  };

  return (
    <div className="w-full max-w-[560px] mx-auto text-center relative z-10 px-4 py-8">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-[#0E9C63] mb-3">
        <span className="w-2 h-2 rounded-full bg-[#FF6A4D] shadow-[0_0_0_4px_rgba(255,106,77,0.25)]" />
        <span>Live voice consult</span>
      </div>

      {/* Main Title & Lead */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10201A] tracking-tight mb-2">
        Voice Chat Assistant
      </h1>
      <p className="text-[#4C5C53] text-sm sm:text-base mb-8 max-w-[440px] mx-auto leading-relaxed">
        Speak naturally and <b className="text-[#0E9C63]">I'll help you with your pet care questions.</b>
      </p>

      {/* Voice Control Card */}
      <div className="bg-white border border-[#E6DDC0] rounded-3xl p-6 sm:p-8 shadow-[0_16px_36px_-12px_rgba(10,21,18,0.1)] max-w-[420px] mx-auto relative overflow-hidden">
        {/* Top bar inside card */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-left">
            <h3 className="font-bold text-base text-[#10201A]">Voice Chat</h3>
            <span className="text-xs text-[#4C5C53]">
              Available time: <b className="text-[#0E9C63]">{totalTime} mins</b>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            disabled={!isLive}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isLive
                ? isMuted
                  ? "bg-[#FFE8DF] text-[#E24E30]"
                  : "bg-[#EAF8F1] text-[#0E9C63]"
                : "bg-[#F2EAD3]/60 text-gray-400 cursor-not-allowed"
            }`}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        </div>

        {/* Status Pill */}
        <div className="mb-7">
          <div
            className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
              isLive
                ? "bg-[#DDF7E9] text-[#0E9C63]"
                : status === "connecting"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-[#F2EAD3] text-[#4C5C53]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? "bg-[#17C97F] animate-pulse-dot"
                  : status === "connecting"
                  ? "bg-yellow-500 animate-pulse-dot"
                  : "bg-[#B7BFB9]"
              }`}
            />
            <span>
              Status: {isLive ? "connected" : status === "connecting" ? "connecting..." : "disconnected"}
            </span>
          </div>
        </div>

        {/* Pulsing Orb & Microphone Button */}
        <div className="relative w-[170px] h-[170px] mx-auto flex items-center justify-center">
          {/* Animated concentric rings when active */}
          {isLive && (
            <>
              <div className="absolute inset-0 rounded-full border border-[#17C97F]/40 animate-ring-pulse" />
              <div
                className="absolute inset-0 rounded-full border border-[#17C97F]/30 animate-ring-pulse"
                style={{ animationDelay: "1.2s" }}
              />
            </>
          )}

          <button
            type="button"
            onClick={isLive ? handleEndConversation : handleStartConversation}
            className={`
              relative w-[140px] h-[140px] rounded-full border-none cursor-pointer
              flex items-center justify-center transition-all duration-300
              ${
                isLive
                  ? "bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_20px_50px_rgba(255,106,77,0.45)] scale-105"
                  : "bg-[radial-gradient(circle_at_35%_30%,#2FE6A6,#0E9C63)] shadow-[0_20px_50px_rgba(23,201,127,0.45)] hover:scale-105"
              }
            `}
            aria-label={isLive ? "End voice consult" : "Start voice consult"}
          >
            <div className="w-[46px] h-[46px] text-white flex items-center justify-center">
              {isLive ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                  <path d="M6 18L18 6M6 6l12 12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                  <path
                    d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
                    stroke="#fff"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Action Caption */}
        <p className="text-xs text-[#4C5C53] mt-5 font-medium">
          {isLive
            ? "Live conversation in progress. Click the orb to disconnect."
            : "Click the orb to start live voice consultation with Kora"}
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Minutes Top-up Modal */}
      {showMinutesModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-in">
          <div className="relative max-w-[540px] w-full bg-white rounded-3xl p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowMinutesModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFE8DF] text-[#E24E30] font-bold flex items-center justify-center hover:bg-[#FF6A4D] hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-center mb-1">Add Talk Time Minutes</h3>
            <p className="text-xs text-[#4C5C53] text-center mb-4">
              You need talk time minutes to consult with Kora.
            </p>
            <MinutesSection
              userId={parsedUserData?.id}
              onPaymentSuccess={() => {
                setShowMinutesModal(false);
                setRefreshTrigger((prev) => !prev);
              }}
            />
          </div>
        </div>
      )}

      {/* Subscription Plan Modal */}
      {showPlansModal && (
        <PaymentModal
          isOpen={showPlansModal}
          onClose={() => setShowPlansModal(false)}
          plan={selectedPlan || "basic"}
          userId={parsedUserData?.id}
          onPaymentSuccess={() => {
            setShowPlansModal(false);
            setRefreshTrigger((prev) => !prev);
          }}
        />
      )}
    </div>
  );
}

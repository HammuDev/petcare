"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VetChatLayout from "../components/layout/VetChatLayout";
import VetVoiceChat from "../components/chat/VetVoiceChat";

export default function ChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
    const stored = localStorage.getItem("user_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserId(parsed.id);
      } catch (e) {
        console.error("Failed to parse user_data:", e);
      }
    } else {
      router.push("/login");
    }
  }, []);

  const generateSessionId = () => {
    return "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  };

  const initializeSession = () => {
    if (typeof window === "undefined") return;
    setSessionId(generateSessionId());
  };

  const handleNewChat = () => {
    setSessionId(generateSessionId());
  };

  return (
    <VetChatLayout onNewChat={handleNewChat} userId={userId || undefined}>
      <div className="flex-1 bg-[#F2EAD3]/35 flex items-center justify-center p-3 sm:p-6 md:p-8 relative overflow-x-hidden overflow-y-auto min-h-0 w-full max-w-full custom-scroll">
        {/* Background glow blobs - strictly contained */}
        <div className="absolute w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-full blur-[90px] bg-[#17C97F] opacity-[0.12] -top-[140px] -right-[100px] pointer-events-none animate-drift1" />
        <div className="absolute w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-full blur-[80px] bg-[#FF6A4D] opacity-[0.10] -bottom-[140px] -left-[80px] pointer-events-none animate-drift2" />

        {/* Voice Chat Component */}
        <VetVoiceChat
          sessionId={sessionId}
          userId={userId || undefined}
        />
      </div>
    </VetChatLayout>
  );
}

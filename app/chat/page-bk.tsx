"use client";

import React, { useState, useEffect } from "react";
import ChatLayout from "../components/layout/ChatLayout";
import VoiceChat from "../components/chat/VoiceChat";
// import Link from "next/link";
import { useRouter } from "next/navigation";
import ChatMenu from "../components/chat/ChatMenu";
// import { getCurrentUserId } from "../../lib/auth";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  messages: Message[];
  chatId?: string;
  sessionId: string;
}

const page = () => {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [error, setError] = useState("");
  // const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeChatSession();
    // initializeUserId();
    const user_data = localStorage.getItem("user_data");
    if (user_data) {
      const userData = JSON.parse(user_data);
      console.log("Setting userId from localStorage:", userData.id); // Debug log
      setUserId(userData.id);
    } else {
      router.push("/login");
      console.log("No user_data found in localStorage"); // Debug log
    }
  }, []);

  const generateNewSessionId = () => {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  };

  const initializeChatSession = async () => {
    if (typeof window === "undefined") return;

    try {
      // Always generate a new unique session ID for each chat session
      const currentSessionId = generateNewSessionId();
      setSessionId(currentSessionId);
    } catch (err) {
      console.error("Failed to initialize chat session:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleNewChatSession = () => {
    // Generate a new session ID when user wants to start a fresh chat
    const newSessionId = generateNewSessionId();
    setSessionId(newSessionId);
    setChatHistory([]); // Clear chat history for new session
  };

  return (
    <ChatLayout onNewChat={handleNewChatSession} userId={userId || undefined}>
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ff4d2d] to-[#ff7a18] bg-clip-text text-transparent mb-4">
                  Voice Chat Assistant
                </h1>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Speak
                  naturally and I'll help you with your pet care questions.
                </p>
              </div>
            </div>
            <ChatMenu />
          </div>

          <div className="mb-8 max-w-md mx-auto">
            <VoiceChat
              sessionId={sessionId}
              userId={userId || undefined}
              onMessage={(message) => {
                setChatHistory((prev) => [...prev, message]);
              }}
              onError={(error) => {
                setError(error);
              }}
            />
          </div>
        </div>
      </div>
    </ChatLayout>
  );
};

export default page;

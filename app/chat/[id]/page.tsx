"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Send, Stethoscope, Sparkles, Clock, CheckCheck } from "lucide-react";
import VetChatLayout from "../../components/layout/VetChatLayout";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string | Date;
}

export default function ChatThreadPage() {
  const params = useParams();
  const chatId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Retrieve user authentication data
  useEffect(() => {
    const stored = localStorage.getItem("user_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserId(parsed.id);
      } catch (e) {}
    }
  }, []);

  // Fetch messages for this chat thread
  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat/${chatId}?userId=${userId || ""}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching chat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Send text message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: chatId,
          userId: userId || undefined,
          message: text,
          role: "user",
        }),
      });

      // Show typing indicator
      setIsAiTyping(true);

      setTimeout(async () => {
        const replyText =
          "Thanks for providing this detail. I'm reviewing your pet's information against veterinary protocols. If you observe any other symptoms such as vomiting, lethargy, or rapid breathing, please let me know right away.";
        const aiMsg: Message = {
          role: "assistant",
          content: replyText,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsAiTyping(false);

        await fetch("/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: chatId,
            userId: userId || undefined,
            message: replyText,
            role: "assistant",
          }),
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <VetChatLayout userId={userId || undefined}>
      <div className="flex-1 bg-[#FBF7EC]/60 flex flex-col relative overflow-hidden min-h-0">
        {/* Ambient Top Glow */}
        <div className="absolute w-[420px] h-[420px] rounded-full blur-[100px] bg-[#17C97F] opacity-[0.08] -top-40 -right-[120px] pointer-events-none" />

        {/* Thread Top Bar */}
        <div className="bg-white border-b border-[#E6DDC0] flex-shrink-0 px-6 sm:px-8 py-3.5 flex items-center justify-between relative z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAF8F1] text-[#0E9C63] flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#10201A] flex items-center gap-2">
                <span>Kora | AI Veterinary Consult</span>
                <span className="w-2 h-2 rounded-full bg-[#17C97F] animate-pulse-dot" />
              </h1>
              <p className="text-[11px] text-[#4C5C53] font-mono">
                Consultation #{chatId.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        {/* Thread Messages List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 flex flex-col gap-4 relative z-10 max-w-[860px] mx-auto w-full custom-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-xs text-[#4C5C53]">
              <div className="w-6 h-6 rounded-full border-2 border-[#17C97F] border-t-transparent animate-spin" />
              <span>Loading consultation transcript...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 text-[#4C5C53]">
              <div className="w-12 h-12 rounded-2xl bg-[#DDF7E9] text-[#0E9C63] mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[#10201A] mb-1">Start a Conversation</h3>
              <p className="text-xs max-w-xs mx-auto">
                Send a question below to begin your veterinary triage with Kora.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAi = msg.role === "assistant";
              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col max-w-[88%] sm:max-w-[75%] ${
                    isAi ? "self-start items-start" : "self-end items-end"
                  }`}
                >
                  <div
                    className={`px-4.5 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAi
                        ? "bg-white border border-[#E6DDC0] text-[#10201A] rounded-bl-[4px]"
                        : "bg-gradient-to-br from-[#0E9C63] to-[#17C97F] text-[#06180F] font-medium rounded-br-[4px]"
                    }`}
                  >
                    {isAi && (
                      <span className="block font-mono text-[10px] uppercase tracking-[0.08em] font-bold text-[#0E9C63] mb-1">
                        Kora | Clinical Triage
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-[#4C5C53] mt-1 px-1">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {!isAi && <CheckCheck className="w-3 h-3 text-[#0E9C63]" />}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isAiTyping && (
            <div className="self-start items-start flex flex-col max-w-[85%] sm:max-w-[75%] animate-modal-in">
              <div className="bg-white border border-[#E6DDC0] px-4 py-2.5 rounded-2xl rounded-bl-[4px] shadow-xs flex items-center gap-2">
                <span className="font-mono text-[10.5px] text-[#0E9C63] font-semibold">Kora is evaluating</span>
                <div className="inline-flex gap-1 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9C63] animate-typing-dot" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0E9C63] animate-typing-dot"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#0E9C63] animate-typing-dot"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Bar */}
        <div className="bg-white border-t border-[#E6DDC0] flex-shrink-0 px-4 sm:px-8 py-3.5 relative z-10 shadow-xs">
          <form
            onSubmit={handleSendMessage}
            className="max-w-[860px] mx-auto w-full flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Kora about symptoms, dosages, or advice..."
              className="flex-1 px-5 py-2.5 rounded-full border border-[#E6DDC0] bg-[#F2EAD3]/25 font-sans text-xs sm:text-sm text-[#10201A] transition-all focus:outline-none focus:border-[#17C97F] focus:bg-white focus:ring-2 focus:ring-[#17C97F]/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] text-white border-none flex items-center justify-center cursor-pointer flex-shrink-0 shadow-[0_4px_12px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </VetChatLayout>
  );
}

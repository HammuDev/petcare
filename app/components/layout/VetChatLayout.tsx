"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Clock,
  Mic,
  X as CloseIcon,
  Menu as MenuIcon,
  Search,
  ChevronRight,
} from "lucide-react";
import VetNavHeader from "../common/VetNavHeader";

interface ChatSession {
  id: string;
  title?: string;
  createdAt: string;
  lastMessage?: string;
  messageCount?: number;
}

interface VetChatLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
  userId?: string;
}

export default function VetChatLayout({
  children,
  onNewChat,
  userId,
}: VetChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userId) {
      loadChatSessions();
    } else {
      const stored = localStorage.getItem("user_data");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) fetchSessions(parsed.id);
        } catch (e) {}
      }
    }
  }, [userId]);

  const fetchSessions = async (uid: string) => {
    try {
      const res = await fetch(`/api/chat/all_sessions?userId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setChatSessions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadChatSessions = () => {
    if (userId) fetchSessions(userId);
  };

  const handleStartNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      router.push("/chat");
    }
    setSidebarOpen(false);
  };

  const filteredSessions = chatSessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.lastMessage && s.lastMessage.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FBF7EC] text-[#10201A] w-full max-w-[100vw]">
      {/* Top Navigation */}
      <VetNavHeader />

      {/* Main Grid: Sidebar + Chat Body */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] flex-1 min-h-0 overflow-hidden relative w-full max-w-full">
        {/* Mobile History Bar */}
        <div className="md:hidden flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-white border-b border-[#E6DDC0]/70 z-30 shadow-xs w-full flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-semibold text-[#10201A]"
          >
            <MenuIcon className="w-4 h-4 text-[#0E9C63]" />
            <span>{sidebarOpen ? "Hide Consultations" : "Past Consultations"}</span>
          </button>
          <button
            type="button"
            onClick={handleStartNewChat}
            className="text-xs font-bold text-[#0E9C63] flex items-center gap-1 bg-[#EAF8F1] px-3 py-1 rounded-full border border-[#17C97F]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Consult</span>
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-40 md:z-10 w-[300px] md:w-full bg-white border-r border-[#E6DDC0]
            flex flex-col min-h-0 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
            ${
              sidebarOpen
                ? "translate-x-0 top-[60px] visible pointer-events-auto"
                : "-translate-x-full md:translate-x-0 invisible md:visible pointer-events-none md:pointer-events-auto"
            }
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#E6DDC0] flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EAF8F1] text-[#0E9C63] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#10201A] tracking-tight">
                  Consultation History
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9AB0A5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E6DDC0] bg-[#F2EAD3]/20 text-xs text-[#10201A] placeholder-[#9AB0A5] focus:outline-none focus:border-[#17C97F]"
              />
            </div>
          </div>

          {/* Sidebar Session List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1.5 custom-scroll">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-xs text-[#4C5C53]">
                <div className="w-5 h-5 rounded-full border-2 border-[#17C97F] border-t-transparent animate-spin" />
                <span>Loading consultations...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-10 px-4 text-xs text-[#4C5C53]">
                <p className="font-bold text-sm mb-1 text-[#10201A]">No history found</p>
                <p className="text-[11.5px] leading-relaxed">
                  {searchQuery ? "No matching conversations." : "Previous consultations will appear here automatically."}
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = pathname === `/chat/${session.id}`;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      router.push(`/chat/${session.id}`);
                      setSidebarOpen(false);
                    }}
                    className={`
                      p-3 rounded-2xl cursor-pointer border transition-all duration-150 group
                      ${
                        isActive
                          ? "bg-[#EAF8F1] border-[#17C97F]/50 shadow-xs"
                          : "bg-white border-transparent hover:bg-[#F2EAD3]/30 hover:border-[#E6DDC0]"
                      }
                    `}
                  >
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-[#10201A] truncate max-w-[170px]">
                        {session.title || `Consult #${session.id.slice(-5)}`}
                      </span>
                      <span className="text-[10px] text-[#4C5C53] font-mono flex-shrink-0">
                        {new Date(session.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#4C5C53] line-clamp-2 leading-relaxed mb-1.5">
                      {session.lastMessage || "Voice conversation session"}
                    </p>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-[#0E9C63] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.messageCount || 0} messages</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9AB0A5] group-hover:text-[#10201A] transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar CTA */}
          <div className="p-3.5 border-t border-[#E6DDC0] flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full py-3 px-4 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_4px_14px_rgba(255,106,77,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,106,77,0.45)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start New Voice Consult</span>
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Chat Main Area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-x-hidden overflow-y-auto relative w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

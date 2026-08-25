"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatLayout from "../../components/layout/ChatLayout";
import ChatMenu from "@/app/components/chat/ChatMenu";

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get userId from localStorage
  useEffect(() => {
    const user_data = localStorage.getItem("user_data");
    if (user_data) {
      const userData = JSON.parse(user_data);
      setUserId(userData.id);
    }
  }, []);

  // Fetch messages from API
  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}?userId=${userId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching chat:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId]);

  return (
    <ChatLayout userId={userId || undefined}>
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="p-6 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff4d2d] to-[#ff7a18] bg-clip-text text-transparent">
              Chat with AI
            </h1>
            <p className="text-sm text-gray-600 mt-1">Conversation history</p>
          </div>
          <ChatMenu />
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="ml-4 text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation to see your chat history here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`group max-w-2xl ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
                      {/* Message bubble */}
                      <div
                        className={`relative px-6 py-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                            : "bg-white/80 backdrop-blur-sm text-gray-800 border border-white/50 rounded-bl-md"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-0">
                            {msg.content}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <div className={`flex items-center justify-between mt-3 text-xs ${
                          msg.role === "user" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          <span className="opacity-75">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {msg.role === "user" && (
                            <span className="opacity-50">You</span>
                          )}
                        </div>

                        {/* Message tail */}
                        <div className={`absolute top-4 w-3 h-3 ${
                          msg.role === "user"
                            ? "right-0 bg-gradient-to-br from-blue-500 to-blue-600 transform rotate-45 -mr-1"
                            : "left-0 bg-white transform rotate-45 -ml-1 border-l border-t border-white/50"
                        }`}></div>
                      </div>

                      {/* Avatar placeholder */}
                      {/* <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-2 ${
                        msg.role === "user"
                          ? "ml-auto mr-2 bg-gradient-to-br from-blue-400 to-blue-500"
                          : "mr-auto ml-2 bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}>
                        <span className="text-xs font-semibold text-white">
                          {msg.role === "user" ? "U" : "AI"}
                        </span>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ChatLayout>
  );
}

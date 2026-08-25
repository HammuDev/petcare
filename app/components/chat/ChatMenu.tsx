"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChatMenu() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const logout = () => {
    localStorage.removeItem("user_data");
    router.push("/");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm bg-gradient-to-br from-[#17C97F] to-[#0E9C63] text-[#06180F] shadow-[0_4px_16px_rgba(23,201,127,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(23,201,127,0.45)] transition-all cursor-pointer"
      >
        <span>☰</span>
        <span>Menu</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[220px] bg-[#0F241D] border border-[#7DE8B8]/20 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-modal-in">
          <Link
            href="/profile"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
              <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Profile
          </Link>

          <Link
            href="/transactions"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            Transactions
          </Link>

          <Link
            href="/chat"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.7" />
              <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Voice Chat
          </Link>

          <hr className="border-0 border-t border-white/[0.08] my-1.5 mx-1" />

          <button
            onClick={() => {
              setIsMenuOpen(false);
              logout();
            }}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#FFA08B] hover:bg-[#FF6A4D]/15 hover:text-white transition-colors cursor-pointer text-left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
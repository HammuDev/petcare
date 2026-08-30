"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PawPrint,
  User,
  CreditCard,
  Mic,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronDown,
} from "lucide-react";

interface VetNavHeaderProps {
  showNavLinks?: boolean;
}

export default function VetNavHeader({ showNavLinks = false }: VetNavHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    setIsLoggedIn(!!userData);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user_data");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
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
    <header className="sticky top-0 z-[200] bg-[#0A1512]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all w-full">
      <nav className="max-w-[1180px] mx-auto flex items-center justify-between px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-base sm:text-lg md:text-xl text-white tracking-tight hover:opacity-95 transition-opacity flex-shrink-0"
        >
          <img
            src="/paw.png"
            alt="VET365.AI Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-[0_4px_12px_rgba(23,201,127,0.3)]"
          />
          <span className="font-semibold tracking-wide">VET365.AI</span>
        </Link>

        {/* Desktop Anchor Navigation (for Landing Page) */}
        {showNavLinks && (
          <div className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-[#9AB0A5]">
            <a href="#mission" className="hover:text-white transition-colors">Mission</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#founder" className="hover:text-white transition-colors">About</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
          {showNavLinks ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {isLoggedIn ? (
                <Link
                  href="/chat"
                  className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] rounded-full shadow-[0_4px_14px_rgba(23,201,127,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Voice Consult</span>
                  <span className="xs:hidden">Chat</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#EAF3ED] bg-white/[0.06] hover:bg-white/10 border border-white/10 rounded-full transition-colors whitespace-nowrap"
                  >
                    Log In
                  </Link>
                  <Link
                    href="#pricing"
                    className="hidden sm:inline-flex px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] rounded-full shadow-[0_4px_14px_rgba(23,201,127,0.3)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={toggleMobileNav}
                className="lg:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Toggle menu"
              >
                {isMobileNavOpen ? <CloseIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <MenuIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          ) : (
            /* Logged-In Dropdown Menu on App Pages */
            <div className="relative">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-br from-[#17C97F] to-[#0E9C63] text-[#06180F] shadow-[0_4px_14px_rgba(23,201,127,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <MenuIcon className="w-3.5 h-3.5" />
                <span>Account</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[210px] bg-[#0F241D] border border-[#7DE8B8]/20 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-modal-in">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#17C97F]" />
                    <span>Profile &amp; Settings</span>
                  </Link>

                  <Link
                    href="/transactions"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-[#17C97F]" />
                    <span>Billing &amp; Top Up</span>
                  </Link>

                  <Link
                    href="/chat"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#EAF3ED] hover:bg-[#17C97F]/15 hover:text-[#7DE8B8] transition-colors"
                  >
                    <Mic className="w-4 h-4 text-[#17C97F]" />
                    <span>Voice Consult</span>
                  </Link>

                  <hr className="border-0 border-t border-white/[0.08] my-1 mx-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#FFA08B] hover:bg-[#FF6A4D]/15 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-[#FF6A4D]" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer (When on Landing Page) */}
      {showNavLinks && isMobileNavOpen && (
        <div className="lg:hidden bg-[#0A1512]/98 border-b border-white/[0.1] px-5 py-5 space-y-4 animate-modal-in max-h-[calc(100vh-64px)] overflow-y-auto custom-scroll">
          <div className="space-y-1 pb-3 border-b border-white/[0.08]">
            <a
              href="#mission"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              Mission
            </a>
            <a
              href="#how"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              Pricing &amp; Plans
            </a>
            <a
              href="#founder"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              About Dr. Kole
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileNavOpen(false)}
              className="block text-sm font-medium text-[#EAF3ED] py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-[#17C97F] transition-colors"
            >
              FAQ
            </a>
          </div>

          {/* Action Buttons in Drawer */}
          <div className="flex flex-col gap-2.5 pt-1">
            {isLoggedIn ? (
              <>
                <Link
                  href="/chat"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full py-3 px-4 rounded-full text-center text-xs font-bold text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] shadow-[0_4px_14px_rgba(23,201,127,0.3)] flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Open Voice Chat</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full py-2.5 px-4 rounded-full text-center text-xs font-medium text-[#EAF3ED] bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Profile &amp; Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-full text-center text-xs font-medium text-[#FFA08B] bg-[#FF6A4D]/10 border border-[#FF6A4D]/25 hover:bg-[#FF6A4D]/20 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full py-2.5 px-4 rounded-full text-center text-xs font-medium text-[#EAF3ED] bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full py-2.5 px-4 rounded-full text-center text-xs font-bold text-white bg-gradient-to-br from-[#FF6A4D] to-[#E24E30] shadow-[0_4px_14px_rgba(255,106,77,0.35)]"
                >
                  Create Free Account
                </Link>
                <a
                  href="#pricing"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full py-2.5 px-4 rounded-full text-center text-xs font-bold text-[#06180F] bg-gradient-to-br from-[#17C97F] to-[#0E9C63] shadow-[0_4px_14px_rgba(23,201,127,0.3)]"
                >
                  Start Your First Consult
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

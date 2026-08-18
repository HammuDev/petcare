"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

const NAV_LINKS = [
  { href: "#mission", label: "Mission" },
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#founder", label: "About" },
  { href: "#faq", label: "FAQ" },
] as const;

export default function VetHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="vet-header" role="banner">
      <nav className="wrap vet-nav" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link href="/" className="logo" onClick={closeMenu} aria-label="Vet365.AI Home">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="#17C97F" />
            <path
              d="M20 11c-3.5 0-6 3-6 6.6 0 2.6 1.6 4.2 3 5.7 1 1 1.6 1.9 1.6 3.1v.4a1.4 1.4 0 0 0 2.8 0v-.4c0-1.2.6-2.1 1.6-3.1 1.4-1.5 3-3.1 3-5.7 0-3.6-2.5-6.6-6-6.6Z"
              stroke="#06180F"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 17.2c-1.4-.3-3-1.6-3-3.6M25 17.2c1.4-.3 3-1.6 3-3.6"
              stroke="#06180F"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span>VET365.AI</span>
        </Link>

        {/* Navigation Links */}
        <div
          className={`nav-links ${mobileOpen ? "active" : ""}`}
          id="navLinks"
          role="navigation"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}
          {isAuthenticated && (
            <Link href="/chat" onClick={closeMenu}>
              AI Chat
            </Link>
          )}
        </div>

        {/* Action Controls */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="btn btn-ghost-dark btn-sm">
                Profile
              </Link>
              <Link href="/chat" className="btn btn-emerald btn-sm">
                Chat Now
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost-dark btn-sm">
                Sign in
              </Link>
              <Link href="/signup" className="btn btn-emerald btn-sm">
                Get started
              </Link>
            </>
          )}

          {/* Hamburger Mobile Toggle */}
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="navLinks"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}

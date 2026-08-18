"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

export default function VetFooter() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <footer className="vet-footer" role="contentinfo">
      <div className="wrap">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="logo" aria-label="Vet365.AI">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <rect width="40" height="40" rx="10" fill="#17C97F" />
                <path
                  d="M20 11c-3.5 0-6 3-6 6.6 0 2.6 1.6 4.2 3 5.7 1 1 1.6 1.9 1.6 3.1v.4a1.4 1.4 0 0 0 2.8 0v-.4c0-1.2.6-2.1 1.6-3.1 1.4-1.5 3-3.1 3-5.7 0-3.6-2.5-6.6-6-6.6Z"
                  stroke="#06180F"
                  strokeWidth="1.8"
                />
              </svg>
              <span>VET365.AI</span>
            </Link>
            <p style={{ maxWidth: "320px", fontSize: "13px", color: "#71877B", marginTop: "12px" }}>
              Available anytime on your phone or computer. Vet365.AI checks dangers, guides you through
              emergencies, and finds emergency clinics fast.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="footer-col">
            <h5>General</h5>
            <a href="#mission">Home</a>
            <a href="#how">How it works</a>
            <a href="#founder">About us</a>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                Sign out
              </button>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </div>

          {/* Legal Links */}
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy policy</a>
            <a href="#">Terms &amp; conditions</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>Vet365.AI &copy; {new Date().getFullYear()}. All rights reserved.</span>
          <span>Not a substitute for emergency veterinary care.</span>
        </div>
      </div>
    </footer>
  );
}

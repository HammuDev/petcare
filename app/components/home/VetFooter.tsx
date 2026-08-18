"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
              <Image
                src="/paw.png"
                alt="VET365.AI Logo"
                width={28}
                height={28}
                className="object-contain"
              />
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

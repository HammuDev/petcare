"use client";

import React from "react";
import Script from "next/script";
import "./components/home/vetTheme.css";

// Modular Components
import VetHeader from "./components/home/VetHeader";
import VetHero from "./components/home/VetHero";
import VetMission from "./components/home/VetMission";
import VetHowItWorks from "./components/home/VetHowItWorks";
import VetFeatures from "./components/home/VetFeatures";
import VetPricing from "./components/home/VetPricing";
import VetFounder from "./components/home/VetFounder";
import VetFaq from "./components/home/VetFaq";
import VetFooter from "./components/home/VetFooter";

/**
 * ----------------------------------------------------------------------
 * PREVIOUS HOME PAGE CODE (PRESERVED & COMMENTED OUT):
 * ----------------------------------------------------------------------
 * import About from "./components/home/About";
 * import Banner2 from "./components/home/Banner2";
 * import Plans from "./components/home/Plans";
 * import Footer2 from "./components/layout/Footer2";
 * import Banner3 from "./components/home/Banner3";
 * import Founder from "./components/home/Founder";
 * import Support from "./components/home/Support";
 * import Chat from "./components/chat/Chat";
 * import { Conversation } from "./components/chat/Conversation";
 *
 * export default function HomeOld() {
 *   return (
 *     <>
 *       <div className="font-sans text-gray-800 min-h-screen bg-white" style={{ overflowX: "hidden" }}>
 *         <Banner3/>
 *         <Support />
 *         <Plans/>
 *         <Founder />
 *         <Footer2/>
 *       </div>
 *     </>
 *   );
 * }
 * ----------------------------------------------------------------------
 */

export default function Home() {
  const elevenLabsAgentId =
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_HOME ||
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
    "agent_4901k6njbw0bfpwvfkb9vd073zz6";

  return (
    <>
      {/* ElevenLabs Widget Script */}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
      />

      <div className="font-sans min-h-screen" style={{ overflowX: "hidden" }}>
        {/* Navigation Header */}
        <VetHeader />

        {/* Main Content Sections */}
        <main>
          {/* Hero Section (Live Star Canvas + Kora Interactive Console + Stats) */}
          <VetHero />

          {/* Mission Section */}
          <VetMission />

          {/* How It Works Section */}
          <VetHowItWorks />

          {/* Features Section */}
          <VetFeatures />

          {/* Pricing Section (with Stripe Payment Modals) */}
          <VetPricing />

          {/* Founder Section */}
          <VetFounder />

          {/* Interactive FAQ Section */}
          <VetFaq />
        </main>

        {/* Footer */}
        <VetFooter />
      </div>

      {/* ElevenLabs Voice Agent Custom Element */}
      <elevenlabs-convai agent-id={elevenLabsAgentId}></elevenlabs-convai>
    </>
  );
}

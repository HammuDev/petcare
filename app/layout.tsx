import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Vet365.ai | 24/7 AI Veterinary Consultation & Triage",
  description: "Get instant answers to your pet's health questions with our AI-powered veterinary assistant. Available 24/7.",
  icons: {
    icon: "/paw.png",
    shortcut: "/paw.png",
    apple: "/paw.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased w-full max-w-[100vw] overflow-x-hidden bg-[#FBF7EC] text-[#10201A]`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Barlow, Geist, Geist_Mono, Poppins, Syne } from "next/font/google";
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
const barlow = Barlow({
  weight: ["400", "500", "600", "700"], // choose what you need
  subsets: ["latin"],
  variable: "--font-barlow",
});




export const metadata: Metadata = {
  title: "Vet365.ai",
  description: "Get instant answers to your pet's health questions with our AI-powered veterinary assistant.",
  icons: {
    icon: "/paw.png",
    shortcut: "/paw.png",
    apple: "/paw.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${barlow.variable} antialiased font-[var(--font-barlow)]`}
      >
        {children}
       
      </body>
    </html>
  );
}

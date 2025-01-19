import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Review Radar - Review Analysis & Generation Tool",
  description:
    "AI-powered tool for analyzing Google Maps reviews and generating personalized review responses. Detect fake reviews and create authentic responses.",
  keywords: [
    "Google Maps",
    "Review Analysis",
    "Review Generation",
    "AI",
    "Fake Review Detection",
    "Review Management",
    "Merchant Reviews",
    "User Reviews",
  ],
  authors: [{ name: "Trie Chen" }],
  creator: "Trie Chen",
  openGraph: {
    title: "AI Review Radar - Review Analysis & Generation Tool",
    description:
      "AI-powered tool for analyzing Google Maps reviews and generating personalized review responses. Detect fake reviews and create authentic responses.",
    url: "https://review-radar.vercel.app",
    siteName: "AI Review Radar",
    images: [
      {
        url: "/review-radar.png",
        width: 800,
        height: 600,
        alt: "AI Review Radar Screenshot",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Review Radar - Review Analysis & Generation Tool",
    description:
      "AI-powered tool for analyzing Google Maps reviews and generating personalized review responses. Detect fake reviews and create authentic responses.",
    images: ["/review-radar.png"],
    creator: "@TrieChen",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="icon" href="/review-radar.png" />
        <link rel="apple-touch-icon" href="/review-radar.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Review Radar" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Review Radar" />
        <meta
          name="description"
          content="AI-powered tool for analyzing Google Maps reviews and generating personalized review responses. Detect fake reviews and create authentic responses."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Review Radar - 智能評論分析工具",
  description:
    "使用 AI 技術分析 Google Maps 評論的真實性，偵測可疑的評論模式，協助您做出更明智的決策。",
  keywords: [
    "AI",
    "評論分析",
    "Google Maps",
    "洗評論",
    "真實性分析",
    "商家評價",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "AI Review Radar - 智能評論分析工具",
    description:
      "使用 AI 技術分析 Google Maps 評論的真實性，偵測可疑的評論模式。",
    images: [
      {
        url: "/review-radar.png",
        width: 1200,
        height: 630,
        alt: "AI Review Radar Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Review Radar - 智能評論分析工具",
    description:
      "使用 AI 技術分析 Google Maps 評論的真實性，偵測可疑的評論模式。",
    images: ["/review-radar.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/review-radar.png" />
        <link rel="apple-touch-icon" href="/review-radar.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

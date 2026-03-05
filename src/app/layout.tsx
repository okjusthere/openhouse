import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpenHouse Pro — AI-Powered Open House Platform for Real Estate Agents",
  description:
    "The smartest Open House sign-in tool for real estate agents. AI lead scoring, People Data Lab enrichment, property Q&A chatbot, and automated follow-ups. Free to start.",
  keywords: [
    "open house",
    "real estate",
    "sign-in app",
    "lead scoring",
    "AI",
    "real estate agent",
    "CRM",
    "open house app",
  ],
  authors: [{ name: "OpenHouse Pro" }],
  openGraph: {
    title: "OpenHouse Pro — AI-Powered Open House Platform",
    description:
      "Stop using paper sign-in sheets. Capture leads, score them with AI, and close more deals.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenHouse Pro — AI-Powered Open House Platform",
    description:
      "Stop using paper sign-in sheets. Capture leads, score them with AI, and close more deals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}

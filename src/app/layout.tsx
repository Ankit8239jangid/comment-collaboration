import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeBootstrap } from "@/components/comments/ThemeBootstrap";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SeekHelpers BackOffice — Candidate Collaboration",
  description: "Modern candidate comments and collaboration system for recruitment teams.",
  keywords: ["SeekHelpers", "Recruitment", "Collaboration", "Comments"],
  authors: [{ name: "SeekHelpers" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="gray">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeBootstrap />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

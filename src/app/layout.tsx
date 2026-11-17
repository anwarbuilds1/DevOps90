import type { Metadata, Viewport } from "next";
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
  title: "DevOps 90 Tracker — Master DevOps, Cloud & SRE",
  description:
    "A 90-day structured roadmap and application tracker covering Linux, Networking, Docker, AWS, Terraform, Kubernetes, EKS, GitOps, Observability, and Interview Mastery.",
  keywords: [
    "DevOps",
    "Kubernetes",
    "Terraform",
    "AWS",
    "Docker",
    "SRE",
    "Cloud Engineer",
    "Roadmap",
    "Interview Prep",
  ],
  authors: [{ name: "DevOps 90 Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/20 selection:text-blue-500`}
      >
        {children}
      </body>
    </html>
  );
}

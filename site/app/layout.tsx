import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leanbean — Strength & Nutrition Journal",
  description: "A private nutrition and strength training journal with progress analytics.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

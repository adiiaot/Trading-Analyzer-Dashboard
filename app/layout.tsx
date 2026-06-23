import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Command Center - XAU/USD",
  description: "Professional trading platform for XAU/USD scalp trading with live data, analytics, and learning hub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}

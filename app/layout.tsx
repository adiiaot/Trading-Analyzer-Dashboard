import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AOT Analyzer - Intraday Trading Center",
  description: "Professional XAU/USD signal engine, real-time analytics, and compounding tracker for serious gold traders.",
  icons: { icon: "/images/aot-analyzer-logo-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
                var observer = new IntersectionObserver(function(entries) {
                  entries.forEach(function(e) {
                    if (e.isIntersecting) e.target.classList.add('visible');
                  });
                }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
                document.addEventListener('DOMContentLoaded', function() {
                  document.querySelectorAll('.scroll-reveal').forEach(function(el) { observer.observe(el); });
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

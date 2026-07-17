"use client";

import { Menu, Search, Sun, Moon, Send, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "aot_analyzer_bot";
const TELEGRAM_LINK = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="glass h-14 flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-text-secondary hover:text-text-primary p-1.5 -ml-1.5">
          <Menu className="w-5 h-5" />
        </button>
        <a href="/dashboard" className="hidden sm:flex items-center gap-2.5">
          <img
            src="/images/aot-analyzer-logo-icon.png"
            alt="AOT Analyzer"
            className="w-7 h-7 rounded"
          />
          <span className="text-sm font-bold text-accent-gold hidden sm:inline">AOT Analyzer</span>
        </a>
        <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 w-56 transition-all duration-200"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search signals, trades..."
            className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Mobile search toggle */}
        <button
          onClick={() => setMobileSearch(!mobileSearch)}
          className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary transition-all"
          style={{
            background: mobileSearch ? "rgba(240, 180, 41, 0.1)" : "transparent",
          }}
        >
          {mobileSearch ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
        </button>

        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: "rgba(240, 180, 41, 0.1)",
            color: "rgb(var(--accent-gold-rgb))",
            border: "1px solid rgba(240, 180, 41, 0.15)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(240, 180, 41, 0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(240, 180, 41, 0.1)"}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telegram Bot</span>
        </a>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-all"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {mounted && theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>

      {/* Mobile search bar — slides down */}
      {mobileSearch && (
        <div
          className="absolute top-14 left-0 right-0 p-3 sm:hidden z-50"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--glass-border)",
          }}
        >
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <Search className="w-4 h-4 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search signals, trades..."
              className="bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}

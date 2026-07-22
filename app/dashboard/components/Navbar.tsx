"use client";

import { Menu, Sun, Moon, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT || "aot_analyzer_bot";
const TELEGRAM_LINK = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="glass h-14 flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-text-secondary hover:text-text-primary p-1.5 -ml-1.5">
          <Menu className="w-5 h-5" />
        </button>
        <a href="/dashboard" className="flex items-center gap-2.5">
          <img
            src="/images/aot-analyzer-logo-icon.png"
            alt="AOT Analyzer"
            className="w-7 h-7 rounded"
          />
          <span className="text-sm font-bold text-accent-gold hidden sm:inline">AOT Analyzer</span>
        </a>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{
            background: "rgb(var(--surface-overlay-rgb))",
            color: "var(--accent-gold)",
            border: "1px solid rgb(var(--accent-gold-rgb))",
          }}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telegram Bot</span>
        </a>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg transition-all"
          style={{
            background: "rgb(var(--surface-overlay-rgb))",
            color: "var(--accent-gold)",
            border: "1px solid rgb(var(--accent-gold-rgb))",
          }}
        >
          {mounted && theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>

    </header>
  );
}

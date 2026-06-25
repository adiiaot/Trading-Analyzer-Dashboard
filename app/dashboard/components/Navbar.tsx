"use client";

import { Menu, Search, Sun, Moon, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const TELEGRAM_BOT_USERNAME = "aot_analyzer_bot";
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
    </header>
  );
}

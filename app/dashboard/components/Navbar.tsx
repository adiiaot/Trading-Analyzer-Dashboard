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
    <header className="glass h-14 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-text-secondary hover:text-text-primary p-1.5 -ml-1.5">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-surface-overlay border border-surface-border rounded-lg px-3 py-1.5 w-56">
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 transition-all text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telegram Bot</span>
        </a>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-all"
        >
          {mounted && theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>
      </div>
    </header>
  );
}

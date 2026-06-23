"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Market Overview", href: "/market-overview", icon: "📊" },
  { label: "Deep Analysis", href: "/analysis", icon: "🔍" },
  { label: "Learning Hub", href: "/learning", icon: "📚" },
  { label: "Bot Signals", href: "/signals", icon: "🚀" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-bg-secondary border-r border-bg-tertiary p-6 overflow-y-auto flex flex-col">
      <h1 className="text-2xl font-bold gold-text mb-8">TRADE</h1>

      <nav className="space-y-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-bg-tertiary gold-border text-text-primary"
                  : "text-text-secondary hover:bg-bg-tertiary"
              )}
              style={isActive ? { borderLeftWidth: "4px", borderLeftColor: "#d4af37" } : {}}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-bg-tertiary text-xs text-text-muted">
        <p>Session Window:</p>
        <p className="text-accent-gold font-mono">3:00 PM - 5:00 PM</p>
        <p className="mt-1 text-text-secondary">Tue-Thu only</p>
      </div>
    </div>
  );
}

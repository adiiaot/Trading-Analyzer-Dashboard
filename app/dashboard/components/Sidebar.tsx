"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Radio, GraduationCap,
  Settings, ChevronLeft, ChevronRight, X, BarChart4,
  BookOpen,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { label: "Backtest", href: "/dashboard/backtest", icon: BarChart4 },
  { label: "Learning", href: "/dashboard/learning", icon: GraduationCap },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" },
  }),
};

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 border-r ${
          collapsed ? "w-[68px]" : "w-56"
        } ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "var(--glass-border)",
        }}
      >
        <div className={`flex items-center border-b h-14 shrink-0 ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}
          style={{ borderColor: "var(--glass-border)" }}>
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <Image
              src="/images/tcc-logo.jpg"
              alt="TCC Logo"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-text-primary truncate">TCC</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest truncate">Command Center</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item, i) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <motion.div
                key={item.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={sidebarVariants}
              >
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    active
                      ? "text-accent-gold shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  style={active ? {
                    background: "rgba(240, 180, 41, 0.08)",
                    border: "1px solid rgba(240, 180, 41, 0.12)",
                  } : {}}
                >
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                  </motion.div>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <a
          href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT || "aot_analyzer_bot"}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-lg text-sm font-medium transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          style={{
            background: "rgba(240, 180, 41, 0.08)",
            color: "rgb(var(--accent-gold-rgb))",
            border: "1px solid rgba(240, 180, 41, 0.12)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(240, 180, 41, 0.15)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(240, 180, 41, 0.08)"}
        >
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21.5 2.5L2.5 10.5L9.5 14.5L13.5 21.5L21.5 2.5Z" strokeLinejoin="round"/>
              <path d="M9.5 14.5L14.5 9.5" strokeLinecap="round"/>
            </svg>
          </motion.div>
          {!collapsed && <span className="truncate">Telegram Bot</span>}
        </a>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center h-10 text-text-muted hover:text-text-primary transition-colors"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.div>
        </button>

        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center h-10 text-text-muted hover:text-text-primary"
          style={{ borderTop: "1px solid var(--glass-border)" }}
        >
          <X className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
}

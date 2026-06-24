"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, BookOpen, Radio, GraduationCap,
  Shield, Calendar, Settings, ChevronLeft, ChevronRight, X,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Journal", href: "/dashboard/journal", icon: BookOpen },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Learning", href: "/dashboard/learning", icon: GraduationCap },
  { label: "Risk Calculator", href: "/dashboard/risk-calculator", icon: Shield },
  { label: "Calendar", href: "/dashboard/economic-calendar", icon: Calendar },
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
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-surface-raised border-r border-surface-border flex flex-col transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-56"
        } ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className={`flex items-center border-b border-surface-border h-14 shrink-0 ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center shrink-0"
          >
            <span className="text-accent-gold font-bold text-sm">A</span>
          </motion.div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-text-primary truncate">AOT</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest truncate">Analyzer Bot</p>
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
                      ? "bg-accent-gold/8 text-accent-gold shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                  }`}
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
          href="https://t.me/aot_analyzer_bot"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-lg text-sm font-medium transition-all bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 ${collapsed ? "justify-center" : ""}`}
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
          className="hidden md:flex items-center justify-center h-10 border-t border-surface-border text-text-muted hover:text-text-primary transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.div>
        </button>

        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center h-10 border-t border-surface-border text-text-muted hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>
    </>
  );
}

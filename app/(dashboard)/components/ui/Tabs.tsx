"use client";

import { useState } from "react";
import clsx from "clsx";

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  defaultTab?: number;
}

export function Tabs({ tabs, defaultTab = 0 }: TabsProps) {
  const [active, setActive] = useState(defaultTab);

  return (
    <div>
      <div className="flex space-x-4 border-b border-bg-tertiary mb-6 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={clsx(
              "pb-3 px-4 font-semibold transition-all whitespace-nowrap",
              active === idx
                ? "border-b-2 text-accent-gold"
                : "text-text-secondary hover:text-text-primary"
            )}
            style={active === idx ? { borderBottom: "2px solid #d4af37" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}

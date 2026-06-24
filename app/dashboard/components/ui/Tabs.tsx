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
      <div className="flex gap-1 border-b border-surface-border mb-5 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={clsx(
              "px-4 pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-[1px]",
              active === idx
                ? "text-accent-gold border-accent-gold"
                : "text-text-muted border-transparent hover:text-text-secondary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}

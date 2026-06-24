"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: string;
  glow?: boolean;
  delay?: number;
  [key: string]: any;
}

export function Card({ children, className, header, glow, delay = 0, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={clsx(glow ? "card-glow" : "card", className)}
      {...props}
    >
      {header && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-text-primary">{header}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}

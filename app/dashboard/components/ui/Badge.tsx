import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "win" | "loss" | "warn" | "info" | "gold";
  className?: string;
}

export function Badge({ children, variant = "info", className }: BadgeProps) {
  const variants = {
    win: "badge-win",
    loss: "badge-loss",
    warn: "badge-warn",
    info: "badge-info",
    gold: "badge-gold",
  };

  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  );
}

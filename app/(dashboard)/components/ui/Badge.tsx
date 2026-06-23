import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "info" | "gold";
  className?: string;
}

export function Badge({ children, variant = "info", className }: BadgeProps) {
  const variants = {
    success: "bg-accent-green/20 text-accent-green",
    danger: "bg-accent-red/20 text-accent-red",
    warning: "bg-yellow-500/20 text-yellow-400",
    info: "bg-accent-blue/20 text-accent-blue",
    gold: "bg-accent-gold/20 text-accent-gold",
  };

  return (
    <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

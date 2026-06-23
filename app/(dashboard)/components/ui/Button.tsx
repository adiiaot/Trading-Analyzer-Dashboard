import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-accent-gold text-bg-primary hover:bg-yellow-500",
    secondary: "bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-bg-tertiary",
    danger: "bg-accent-red text-white hover:bg-red-600",
  };

  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-lg font-semibold transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  header?: string;
}

export function Card({ children, className, header, ...props }: CardProps) {
  return (
    <div className={clsx("bg-bg-secondary rounded-lg p-6 border border-bg-tertiary", className)} {...props}>
      {header && <h3 className="text-lg font-bold mb-4 text-text-primary">{header}</h3>}
      {children}
    </div>
  );
}

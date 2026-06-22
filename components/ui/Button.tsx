import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  const base = 'font-semibold rounded-btn transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-neon-green hover:bg-neon-green-hover text-dark-bg',
    secondary: 'bg-transparent border border-dark-border text-text-secondary hover:bg-dark-card',
    ghost: 'hover:bg-dark-card text-text-secondary',
    danger: 'bg-alert-loss hover:bg-alert-loss/80 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1 text-small',
    md: 'px-5 py-2 text-body',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

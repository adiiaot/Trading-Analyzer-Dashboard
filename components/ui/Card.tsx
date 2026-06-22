import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-dark-card border border-dark-border rounded-card p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: CardProps) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: CardProps) => (
  <h3 className={`text-text-primary font-bold text-lg ${className}`}>{children}</h3>
);

export const CardContent = ({ children, className = '' }: CardProps) => (
  <div className={className}>{children}</div>
);

import React, { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type RiskLevel = 'low' | 'medium' | 'high';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  confidence?: number; // 0-100
  riskLevel?: RiskLevel; //
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-teal-100 text-teal-700',
};

export function Badge({
  variant,
  children,
  className = '',
  confidence,
  riskLevel,
}: BadgeProps) {
  let computedVariant: BadgeVariant = 'default';

  if (riskLevel) {
    const level = riskLevel.toLowerCase(); 
    if (level === 'high') computedVariant = 'danger';
    else if (level === 'medium') computedVariant = 'warning';
    else if (level === 'low') computedVariant = 'success';
  }
  else if (confidence !== undefined && !isNaN(confidence)) {
    if (confidence < 50) computedVariant = 'danger';
    else if (confidence < 75) computedVariant = 'warning';
    else computedVariant = 'success';
  }
  else if (variant && variantStyles[variant]) {
    computedVariant = variant;
  }

  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${variantStyles[computedVariant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

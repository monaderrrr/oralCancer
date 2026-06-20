import React, { ReactNode } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  riskLevel?: 'low' | 'medium' | 'high'; 
}

export function Card({ children, className = '', riskLevel }: CardProps) {
  const riskStyles = {
    high: 'border-red-200 shadow-red-50',
    medium: 'border-orange-200 shadow-orange-50',
    low: 'border-emerald-200 shadow-emerald-50',
  };

  return (
    <div className={`
      bg-white rounded-2xl border transition-all duration-300
      ${riskLevel ? riskStyles[riskLevel] : 'border-slate-100'} 
      ${className}
    `}>
      {children}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
type ProgressBarProps = {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  showLabel?: boolean;
};
const variantStyles = {
  default: 'from-teal-500 to-cyan-500',
  success: 'from-emerald-500 to-green-500',
  warning: 'from-amber-500 to-orange-500',
  danger: 'from-red-500 to-rose-500'
};
export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  className = '',
  showLabel = false
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  return <div className={`w-full ${className}`}>
      {showLabel && <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium text-slate-900">
            {Math.round(percentage)}%
          </span>
        </div>}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div initial={{
        width: 0
      }} animate={{
        width: `${percentage}%`
      }} transition={{
        duration: 0.5,
        ease: 'easeOut'
      }} className={`h-full bg-gradient-to-r ${variantStyles[variant]} rounded-full`} />
      </div>
    </div>;
}
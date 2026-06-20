import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react'; // generic icon type

type StepCardProps = {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
  status?: 'completed' | 'attention' | 'pending'; // AI-driven status
};

export function StepCard({
  step,
  icon: Icon,
  title,
  description,
  isLast = false,
  status = 'pending'
}: StepCardProps) {
  // Colors based on AI status
  const statusConfig = {
    completed: {
      bg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      numberBg: 'from-emerald-500 to-teal-400'
    },
    attention: {
      bg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      numberBg: 'from-amber-500 to-orange-400'
    },
    pending: {
      bg: 'bg-white',
      iconColor: 'text-teal-600',
      numberBg: 'from-teal-500 to-cyan-500'
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: step * 0.15 }}
      className="relative flex gap-6"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-7 top-16 w-0.5 h-full bg-gradient-to-b from-teal-200 to-transparent" />
      )}

      {/* Step number */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.numberBg} flex items-center justify-center shadow-lg shadow-teal-500/25`}
        >
          <span className="text-white font-bold text-lg">{step}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <div
          className={`rounded-2xl p-6 shadow-sm border border-slate-100 ${config.bg}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
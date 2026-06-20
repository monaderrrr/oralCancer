import React from 'react';
import { motion } from 'framer-motion';
import { BoxIcon } from 'lucide-react';
type SymptomCardProps = {
  icon: BoxIcon;
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'urgent';
  index?: number;
};
const severityStyles = {
  info: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  }
};
export function SymptomCard({
  icon: Icon,
  title,
  description,
  severity = 'info',
  index = 0
}: SymptomCardProps) {
  const styles = severityStyles[severity] || severityStyles.info;
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true
  }} transition={{
    duration: 0.4,
    delay: index * 0.1
  }} className={`${styles.bg} border ${styles.border} rounded-xl p-5`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>;
}
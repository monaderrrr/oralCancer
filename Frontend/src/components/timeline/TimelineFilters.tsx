import React from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle, CheckSquare, MessageCircle, LayoutList } from 'lucide-react';
import { EventType } from './TimelineEvent';
interface TimelineFiltersProps {
  activeFilter: EventType | 'all';
  onFilterChange: (filter: EventType | 'all') => void;
  counts: Record<EventType | 'all', number>;
}
const filterConfig = {
  all: {
    icon: LayoutList,
    label: 'All Events',
    color: 'slate'
  },
  scan: {
    icon: Camera,
    label: 'Scans',
    color: 'teal'
  },
  symptom: {
    icon: AlertCircle,
    label: 'Symptoms',
    color: 'amber'
  },
  recommendation: {
    icon: CheckSquare,
    label: 'Actions',
    color: 'emerald'
  },
  message: {
    icon: MessageCircle,
    label: 'Messages',
    color: 'violet'
  }
};
export function TimelineFilters({
  activeFilter,
  onFilterChange,
  counts
}: TimelineFiltersProps) {
  const filters: (EventType | 'all')[] = ['all', 'scan', 'symptom', 'recommendation', 'message'];
  return <div className="flex flex-wrap gap-2">
      {filters.map(filter => {
      const config = filterConfig[filter];
      const Icon = config.icon;
      const isActive = activeFilter === filter;
      const count = counts[filter] || 0;
      return <motion.button key={filter} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => onFilterChange(filter)} className={`
              px-4 py-2.5 rounded-xl border-2 transition-all duration-200
              flex items-center gap-2 font-medium text-sm
              ${isActive ? `border-${config.color}-500 bg-${config.color}-50 text-${config.color}-700` : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
            `}>
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-semibold
              ${isActive ? `bg-${config.color}-100 text-${config.color}-700` : 'bg-slate-100 text-slate-600'}
            `}>
              {count}
            </span>
          </motion.button>;
    })}
    </div>;
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from 'lucide-react';

export type Finding = {
  id: string;
  title: string;
  description: string;
  status: 'normal' | 'attention' | 'concern';
  confidence?: number; // Optional: AI confidence score (0-100)
};

type ResultsSectionProps = {
  title: string;
  findings: Finding[];
};

const statusConfig = {
  normal: { icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Normal' },
  attention: { icon: InfoIcon, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Needs Attention' },
  concern: { icon: AlertCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Concern' },
};

export function ResultsSection({ title, findings }: ResultsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  // Sort findings: concern -> attention -> normal
  const sortedFindings = [...findings].sort((a, b) => {
    const order = { concern: 0, attention: 1, normal: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button
          onClick={() => setExpandAll(prev => !prev)}
          className="text-sm text-teal-600 font-medium hover:underline"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-3">
        {sortedFindings.map((finding, index) => {
          const config = statusConfig[finding.status] || statusConfig.normal;
          const Icon = config.icon;
          const isExpanded = expandAll || expandedId === finding.id;

          return (
            <motion.div
              key={finding.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${config.bg} rounded-xl overflow-hidden`}
            >
              <button
                onClick={() => setExpandedId(expandAll ? null : isExpanded ? null : finding.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="font-medium text-slate-900">{finding.title}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${config.color} border-current`}>
                    {config.label}
                  </span>
                  {finding.confidence !== undefined && (
                    <span className="ml-2 text-xs text-slate-500">{finding.confidence}% AI Confidence</span>
                  )}
                </div>

                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-slate-600 text-sm leading-relaxed pl-8">{finding.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

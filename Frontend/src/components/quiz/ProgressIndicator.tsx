import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({
  currentStep = 0,
  totalSteps = 1
}: ProgressIndicatorProps) {

  const safeTotal = totalSteps > 0 ? totalSteps : 1;
  const safeCurrent = Math.min(Math.max(currentStep, 0), safeTotal - 1);

  const progress = ((safeCurrent + 1) / safeTotal) * 100;

  return (
    <div className="w-full mb-8">

      <div className="flex justify-between text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      <div className="mt-2 text-center text-sm text-slate-400">
        Question {safeCurrent + 1} of {safeTotal}
      </div>

    </div>
  );
}
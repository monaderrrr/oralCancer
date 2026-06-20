import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
interface PaymentTooltipProps {
  content: string;
  label?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}
export function PaymentTooltip({
  content,
  label,
  position = 'top'
}: PaymentTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  return <div className="relative inline-flex items-center gap-1 cursor-help" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} onClick={() => setIsVisible(!isVisible)} role="button" tabIndex={0} aria-label={`More info about ${label || 'this item'}`}>
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <Info className="w-4 h-4 text-gray-400 hover:text-teal-600 transition-colors" />

      <AnimatePresence>
        {isVisible && <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 5
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 5
      }} transition={{
        duration: 0.2
      }} className={`absolute z-50 w-64 p-3 text-sm text-gray-700 bg-white rounded-lg shadow-xl border border-gray-100 ${position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : position === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'}`}>
            {content}
            <div className={`absolute w-2 h-2 bg-white transform rotate-45 border-r border-b border-gray-100 ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' : position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0 border-t border-l' : position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0 border-t border-r' : 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0 border-b border-l'}`} />
          </motion.div>}
      </AnimatePresence>
    </div>;
}
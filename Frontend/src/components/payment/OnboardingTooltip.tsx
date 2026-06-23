import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next'; 

interface OnboardingTooltipProps {
  step: number;
  totalSteps: number;
  title: string;
  content: string;
  onNext: () => void;
  onSkip: () => void;
  isVisible: boolean;
  targetId?: string;
}

export function OnboardingTooltip({
  step,
  totalSteps,
  title,
  content,
  onNext,
  onSkip,
  isVisible,
  targetId
}: OnboardingTooltipProps) {
  const { t } = useTranslation(); 
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (isVisible && targetId) {
      const updatePosition = () => {
        const element = document.getElementById(targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          setPosition({
            top: rect.top + scrollTop,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }
      };
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isVisible, targetId]);

  if (!isVisible) return null;

  return <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 pointer-events-none" />

      {targetId && <div className="absolute z-40 transition-all duration-300 ease-in-out border-2 border-teal-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none" style={{
        top: position.top - 4,
        left: position.left - 4,
        width: position.width + 8,
        height: position.height + 8
      }} />}

      <motion.div initial={{
        opacity: 0,
        y: 10,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="absolute z-50 w-80 bg-white rounded-xl shadow-2xl p-5" style={{
        top: position.top + position.height + 16,
        left: position.left + position.width / 2 - 160
      }}>
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold tracking-wider text-teal-600 uppercase">
            {t("onboarding.step", "Step")} {step} {t("onboarding.of", "of")} {totalSteps}
          </span>
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close tutorial">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">{content}</p>

        <div className="flex justify-between items-center">
          <button onClick={onSkip} className="text-sm text-gray-500 hover:text-gray-800 font-medium">
            {t("onboarding.skipBtn", "Skip")}
          </button>
          <Button size="sm" onClick={onNext} className="flex items-center">
            {step === totalSteps ? t("onboarding.finishBtn", "Finish") : t("onboarding.nextBtn", "Next")}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" />
      </motion.div>
    </AnimatePresence>;
}
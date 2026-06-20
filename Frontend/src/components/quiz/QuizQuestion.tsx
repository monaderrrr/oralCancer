import React from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion as QuestionType } from '../../utils/mockQuizData';
import { Button } from '../ui/Button';
interface QuizQuestionProps {
  question: QuestionType;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
}
export function QuizQuestion({
  question,
  value,
  onChange,
  onNext
}: QuizQuestionProps) {
  const handleOptionClick = (optionValue: any) => {
    if (question.type === 'multiple') {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue) ? currentValues.filter((v: any) => v !== optionValue) : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      // Auto-advance for single choice after short delay
      if (question.type !== 'scale') {
        setTimeout(onNext, 300);
      }
    }
  };
  return <motion.div initial={{
    opacity: 0,
    x: 20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: -20
  }} className="w-full max-w-lg mx-auto">
      <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center leading-tight">
        {question.text}
      </h3>

      <div className="space-y-3">
        {question.type === 'scale' ? <div className="flex flex-col gap-6">
            <div className="flex justify-between px-2">
              {[1, 2, 3, 4, 5].map(rating => <button key={rating} onClick={() => onChange(rating)} className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all
                    ${value === rating ? 'bg-teal-600 text-white scale-110 shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-400'}
                  `}>
                  {rating}
                </button>)}
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium px-1">
              <span>{question.minLabel}</span>
              <span>{question.maxLabel}</span>
            </div>
            <Button onClick={onNext} className="mt-4" disabled={!value}>
              Next Question
            </Button>
          </div> : question.options?.map(option => {
        const isSelected = question.type === 'multiple' ? Array.isArray(value) && value.includes(option.value) : value === option.value;
        return <button key={option.label} onClick={() => handleOptionClick(option.value)} className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group
                  ${isSelected ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-slate-50'}
                `}>
                <span className="font-medium text-lg">{option.label}</span>
                {isSelected && <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>}
              </button>;
      })}
      </div>

      {question.type === 'multiple' && <div className="mt-8 text-center">
          <Button onClick={onNext} size="lg" className="px-12">
            Continue
          </Button>
        </div>}
    </motion.div>;
}
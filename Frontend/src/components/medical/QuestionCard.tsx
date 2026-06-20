import React from "react";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: Array<{ label: string; value: string } | string>;
}

interface QuestionCardProps {
  question: Question;
  answer: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  isFirst,
  isLast,
}: QuestionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-bold text-teal-600 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${
                i + 1 <= currentStep ? "bg-teal-500" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">{question.text}</h2>

      <div className="space-y-3 mb-8">
        {question.options?.map((option, idx) => {
          // استخراج الـ label والـ value سواء كان الخيار string أو object
          const label = typeof option === "string" ? option : option.label;
          const value = typeof option === "string" ? option.toLowerCase() : option.value;
          const isSelected = answer === value;

          return (
            <button
              key={idx}
              onClick={() => onAnswer(value)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex justify-between items-center ${
                isSelected
                  ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20"
                  : "border-slate-100 hover:border-teal-200 hover:bg-slate-50"
              }`}
            >
              <span className={`font-semibold ${isSelected ? "text-teal-900" : "text-slate-700"}`}>
                {label}
              </span>
              {isSelected && <CheckCircle className="w-5 h-5 text-teal-600" />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        {!isFirst && (
          <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!answer}
          className="flex-1 gap-2 bg-slate-900 hover:bg-slate-800"
        >
          {isLast ? "Review Summary" : "Next Question"} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
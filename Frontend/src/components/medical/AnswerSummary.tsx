import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Edit2, ArrowRight, Activity } from 'lucide-react';
import { Question } from './QuestionCard';
import { useTranslation } from "react-i18next"; 

interface AIResult {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  prediction: string;
  imageUrl?: string;
}

interface AnswerSummaryProps {
  questions: Question[];
  answers: Record<string, string>;
  aiResult?: AIResult;
  onEdit: (questionIndex: number) => void;
  onContinue: () => void;
}

export function AnswerSummary({
  questions,
  answers,
  aiResult,
  onEdit,
  onContinue
}: AnswerSummaryProps) {
  const { t } = useTranslation(); 

  const getRiskColor = () => {
    if (!aiResult) return 'text-slate-600';

    switch (aiResult.riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-slate-600';
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-teal-600" />
        </motion.div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t("summary.title", "Questions Complete")}
        </h2>

        <p className="text-slate-600">
          {t("summary.description", "Review your answers and AI analysis before generating final results")}
        </p>
      </div>


      {/* AI Result Section */}
      {aiResult && (
        <Card className="p-6 mb-6 border-2 border-teal-200 bg-teal-50">

          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-teal-600" />
            <h3 className="font-semibold text-lg">
              {t("summary.aiAnalysis", "AI Scan Analysis")}
            </h3>
          </div>

          <div className="space-y-2">

            <p>
              <span className="font-medium">{t("summary.prediction", "Prediction")}:</span>{" "}
              {aiResult.prediction}
            </p>

            <p>
              <span className="font-medium">{t("summary.riskLevel", "Risk Level")}:</span>{" "}
              <span className={`font-semibold ${getRiskColor()}`}>
                {t(`riskLevels.${aiResult.riskLevel}`, aiResult.riskLevel).toUpperCase()}
              </span>
            </p>

            <p>
              <span className="font-medium">{t("summary.confidence", "Confidence")}:</span>{" "}
              {aiResult.confidence}%
            </p>

            {aiResult.imageUrl && (
              <img
                src={aiResult.imageUrl}
                alt="AI Scan"
                className="mt-4 rounded-lg border"
              />
            )}

          </div>
        </Card>
      )}


      {/* Answers Summary */}
      <Card className="p-6 mb-6 shadow-lg border-2 border-slate-100">

        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {t("summary.responses", "Your Responses")}
        </h3>

        <div className="space-y-4">

          {questions.map((question, index) => (

            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="pb-4 border-b border-slate-100 last:border-0 last:pb-0"
            >

              <div className="flex justify-between items-start gap-4">

                <div className="flex-1">

                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {t("summary.questionIndex", "Question")} {index + 1}
                  </p>

                  <p className="text-slate-900 mb-2">
                    {question.text}
                  </p>

                  <p className="text-teal-700 font-medium">
                    {answers[question.id] || t("summary.noAnswer", "No answer")}
                  </p>

                </div>

                <button
                  onClick={() => onEdit(index)}
                  className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  title={t("summary.edit", "Edit")}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </Card>


      {/* Continue Button */}
      <Button
        onClick={onContinue}
        className="w-full py-4 text-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/25"
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        {t("summary.continueBtn", "View Final AI Diagnosis")}
      </Button>

    </motion.div>
  );
}
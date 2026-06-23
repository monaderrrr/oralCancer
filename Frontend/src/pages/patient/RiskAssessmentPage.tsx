import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ClipboardCheck, Loader2 } from 'lucide-react';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { ProgressIndicator } from '../../components/quiz/ProgressIndicator';
import { QuizQuestion } from '../../components/quiz/QuizQuestion';
import { riskAssessmentQuestions } from '../../utils/mockQuizData';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import API from '../../Api';
import { useTranslation } from 'react-i18next'; 

export function RiskAssessmentPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (value: any) => {
    const questionId = riskAssessmentQuestions[currentStep].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const submitAssessment = async (finalAnswers: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      const response = await API.post('/patient/scans', {
        type: "risk-assessment",
        answers: finalAnswers,
        createdAt: new Date().toISOString()
      });

      if (response.data?.success || response.status === 201) {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error("Failed to submit risk assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < riskAssessmentQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitAssessment(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-left">
        <TopNavigation />

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 md:p-12 text-center border-slate-200">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10 text-teal-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {t('quiz.title', 'Oral Health Risk Assessment')}
            </h1>

            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              {t('quiz.description', 'This quick assessment helps us estimate your oral health risk level.')}
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button size="lg" onClick={() => setStarted(true)}>
                {t('quiz.startBtn', 'Start Assessment')}
              </Button>

              <p className="text-xs text-slate-400 mt-2">
                {t('quiz.meta', 'Takes about 2 minutes • Confidential')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-left">
      <TopNavigation />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            disabled={isSubmitting}
            onClick={currentStep === 0 ? () => setStarted(false) : handleBack}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('common.back', 'Back')}
          </button>
        </div>

        <Card className="p-6 md:p-10 min-h-[500px] flex flex-col relative border-slate-200">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
              <p className="text-slate-700 font-medium">
                {t('quiz.saving', 'Saving your assessment...')}
              </p>
            </div>
          )}

          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={riskAssessmentQuestions.length}
          />

          <div className="flex-grow flex items-center justify-center py-8">
            <AnimatePresence mode="wait">
              <QuizQuestion
                key={currentStep}
                question={riskAssessmentQuestions[currentStep]}
                value={answers[riskAssessmentQuestions[currentStep].id]}
                onChange={handleAnswer}
                onNext={handleNext}
              />
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
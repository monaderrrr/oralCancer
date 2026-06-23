import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next'; 

export function SymptomCheckerPage() {
  const { t } = useTranslation(); 
  const [step, setStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const symptoms = ['Mouth sores', 'Red patches', 'White patches', 'Bleeding', 'Loose teeth', 'Pain when swallowing', 'Lump in neck', 'Ear pain'];

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-left" dir="rtl">
      <TopNavigation />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8 text-teal-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {t('symptomChecker.title', 'Symptom Checker')}
              </h1>
              <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
                {t('symptomChecker.subtitle', 'This tool can help you understand your symptoms, but it does not replace a professional medical diagnosis.')}
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  {t('symptomChecker.warning', 'If you are experiencing severe pain, heavy bleeding, or difficulty breathing, please seek immediate medical attention.')}
                </p>
              </div>
              <Button size="lg" onClick={() => setStep(1)}>
                {t('symptomChecker.startCheck', 'Start Check')}
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {t('symptomChecker.question', 'What are you experiencing?')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {symptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                      selectedSymptoms.includes(symptom) 
                        ? 'border-teal-500 bg-teal-50 text-teal-900' 
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <span className="font-medium">{t(`symptoms.${symptom}`, symptom)}</span>
                    {selectedSymptoms.includes(symptom) && <Check className="w-5 h-5 text-teal-600" />}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  {t('common.back', 'Back')}
                </Button>
                <Button onClick={() => setStep(2)} disabled={selectedSymptoms.length === 0} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t('symptomChecker.analyze', 'Analyze Symptoms')}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {t('symptomChecker.resultTitle', 'Analysis Result')}
              </h2>

              <div className="bg-slate-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {t('symptomChecker.basedOn', 'Based on your symptoms:')}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSymptoms.map(s => (
                    <span key={s} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600">
                      {t(`symptoms.${s}`, s)}
                    </span>
                  ))}
                </div>
                <p className="text-slate-600">
                  {t('symptomChecker.recommendation', 'These symptoms may indicate early signs of oral health issues. We recommend scheduling a consultation with a specialist for a thorough examination.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" fullWidth onClick={() => setStep(0)}>
                  {t('symptomChecker.checkAgain', 'Check Again')}
                </Button>
                <Button fullWidth>{t('symptomChecker.findDoctor', 'Find a Doctor')}</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
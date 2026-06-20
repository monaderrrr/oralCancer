// src/pages/SymptomsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CircleDot, CheckCircle, Calendar, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SymptomCard } from '../components/medical/SymptomCard';

export function SymptomsPage() {
  const navigate = useNavigate();

  const symptoms = [
    {
      icon: AlertCircle,
      title: 'Persistent Mouth Ulcers',
      description: 'Ulcers that do not heal within 2-3 weeks are the most common early sign.',
      severity: 'urgent' as const,
    },
    {
      icon: CircleDot,
      title: 'White or Red Patches',
      description: 'Velvety white (leukoplakia) or red (erythroplakia) patches inside the mouth.',
      severity: 'warning' as const,
    },
    {
      icon: CircleDot,
      title: 'Unexplained Lumps',
      description: 'Thickening, lumps, or rough spots on the lips, gums, or inside the mouth.',
      severity: 'warning' as const,
    },
    {
      icon: AlertCircle,
      title: 'Difficulty Swallowing',
      description: 'Feeling like something is caught in your throat or pain when swallowing.',
      severity: 'urgent' as const,
    },
    {
      icon: CircleDot,
      title: 'Persistent Sore Throat',
      description: "A chronic sore throat or hoarseness that doesn't go away.",
      severity: 'warning' as const,
    },
    {
      icon: AlertCircle,
      title: 'Numbness or Pain',
      description: 'Unexplained numbness, loss of feeling, or pain in any area of the face/mouth.',
      severity: 'urgent' as const,
    },
    {
      icon: CircleDot,
      title: 'Loose Teeth',
      description: 'Teeth becoming loose for no apparent reason or dentures not fitting.',
      severity: 'warning' as const,
    },
    {
      icon: CircleDot,
      title: 'Ear Pain',
      description: 'Pain in the ear without any loss of hearing.',
      severity: 'info' as const,
    },
  ];

  const riskFactors = [
    {
      icon: <Activity className="h-6 w-6 text-teal-600" />,
      title: 'Tobacco Use',
      desc: 'Smoking or chewing tobacco is the #1 risk factor.',
    },
    {
      icon: <Activity className="h-6 w-6 text-teal-600" />,
      title: 'Alcohol',
      desc: 'Heavy alcohol consumption increases risk significantly.',
    },
    {
      icon: <Activity className="h-6 w-6 text-teal-600" />,
      title: 'HPV Infection',
      desc: 'Human Papillomavirus is a growing cause of oral cancers.',
    },
    {
      icon: <Activity className="h-6 w-6 text-teal-600" />,
      title: 'Sun Exposure',
      desc: 'Excessive sun exposure is a major risk for lip cancer.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Understanding Oral Cancer</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Early detection saves lives. Knowing the signs and symptoms is the first step towards prevention and timely treatment.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        {/* Symptoms */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="h-8 w-8 text-teal-600" />
            <h2 className="text-3xl font-bold text-gray-900">Common Symptoms</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {symptoms.map((symptom, idx) => (
              <SymptomCard key={idx} {...symptom} index={idx} />
            ))}
          </div>
        </section>

        {/* Risk Factors */}
        <section className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Risk Factors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              While anyone can develop oral cancer, certain behaviors and factors can significantly increase your risk.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {riskFactors.map((factor, idx) => (
              <Card key={idx} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {factor.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{factor.title}</h3>
                <p className="text-sm text-gray-600">{factor.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Doctor Advice Section */}
        <section>
          <div className="bg-teal-900 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
              <div className="text-white space-y-6">
                <h2 className="text-3xl font-bold">When should you see a doctor?</h2>
                <p className="text-teal-100 text-lg">
                  If you notice any of these symptoms lasting more than{' '}
                  <span className="font-bold text-white">2 weeks</span>, don't wait. Early stage oral cancer is highly treatable.
                </p>
                <ul className="space-y-3">
                  {['Persistent pain or discomfort', 'Difficulty moving jaw or tongue', 'Changes in voice'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-teal-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button size="lg" onClick={() => navigate('/patient/upload')} className="bg-teal-500 hover:bg-teal-400 text-white border-none">
                    Start AI Scan
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/patient/chat')} className="border-white text-white hover:bg-white/10">
                    Chat with Doctor
                  </Button>
                </div>
              </div>
              <div className="relative h-full min-h-[300px] bg-teal-800 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Regular Check-ups</h3>
                  <p className="text-teal-200">
                    Regular dental visits are your best defense. Dentists are trained to spot early signs of oral cancer during routine exams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
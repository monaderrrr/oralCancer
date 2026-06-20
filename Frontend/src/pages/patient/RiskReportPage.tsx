import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { TopNavigation } from '../../components/timeline/TopNavigation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
export function RiskReportPage() {
  const navigate = useNavigate();
  // Mock result data
  const riskScore = 35; // Low risk
  const riskLevel = 'Low Risk';
  return <div className="min-h-screen bg-slate-50 pb-12">
      <TopNavigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Your Risk Report
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className="md:col-span-2 p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-teal-50/50">
            <div className="relative w-40 h-40 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                <motion.circle initial={{
                strokeDasharray: '0 440'
              }} animate={{
                strokeDasharray: `${riskScore * 4.4} 440`
              }} transition={{
                duration: 1.5,
                ease: 'easeOut'
              }} cx="80" cy="80" r="70" stroke="#0d9488" strokeWidth="12" fill="none" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">
                  {riskScore}
                </span>
                <span className="text-xs text-slate-500 uppercase font-medium">
                  Score
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  Low Risk Level
                </h2>
                <Badge variant="success">Maintained</Badge>
              </div>
              <p className="text-slate-600 mb-4">
                Great job! Your lifestyle choices and health history indicate a
                low risk for oral health issues. Keep up your current habits.
              </p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="text-slate-600">Lifestyle: Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">History: Clear</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Card */}
          <Card className="p-6 bg-teal-900 text-white flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Next Screening</h3>
              <p className="text-teal-100 text-sm mb-6">
                Based on your risk profile, we recommend your next screening in:
              </p>
              <div className="text-3xl font-bold mb-1">6 Months</div>
              <div className="text-teal-300 text-sm">April 2024</div>
            </div>
            <Button className="w-full bg-white text-teal-900 hover:bg-teal-50 border-none mt-4" onClick={() => navigate('/patient/doctors')}>
              Find a Specialist
            </Button>
          </Card>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-5 border-l-4 border-emerald-500">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Maintain Oral Hygiene
                </h4>
                <p className="text-sm text-slate-600">
                  Continue brushing twice daily and flossing. Consider adding an
                  antiseptic mouthwash.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-amber-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-1">
                  Monitor Alcohol Intake
                </h4>
                <p className="text-sm text-slate-600">
                  Try to limit alcohol consumption to moderate levels to keep
                  your risk low.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => navigate('/patient/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>;
}

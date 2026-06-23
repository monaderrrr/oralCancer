import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, AlertCircle, CheckCircle, Share2, History } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RiskScoreCard } from '../../components/medical/RiskScoreCard';
import { useTranslation } from 'react-i18next'; 

export function ReportDetailPage() {
  const { t } = useTranslation(); 
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  // Mock report data
  const report = {
    id: id || '1',
    date: '2024-03-15',
    riskLevel: 'low' as const,
    confidence: 94,
    findings: [{
      id: '1',
      title: 'Tissue Coloration',
      description: 'Normal pink coloration observed throughout oral cavity',
      status: 'normal' as const
    }, {
      id: '2',
      title: 'Surface Texture',
      description: 'Smooth, uniform texture with no irregularities detected',
      status: 'normal' as const
    }, {
      id: '3',
      title: 'Lesion Detection',
      description: 'No suspicious lesions or abnormalities identified',
      status: 'normal' as const
    }],
    recommendations: ['Continue regular oral hygiene routine', 'Schedule next screening in 6 months', 'Monitor for any changes in oral tissue'],
    doctorNotes: 'Scan reviewed by Dr. Sarah Johnson on March 16, 2024'
  };
  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} className="mb-8">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/patient/reports')} className="mb-4">
            {t('reports.back', 'Back to Reports')}
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {t('reports.scanReport', 'Scan Report')}
              </h1>
              <p className="text-slate-600">
                {new Date(report.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => alert('PDF download (UI only)')}>
                {t('common.download', 'Download')}
              </Button>
              <Button variant="outline" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={() => alert('Share report (UI only)')}>
                {t('common.share', 'Share')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Risk Score */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <RiskScoreCard riskLevel={report.riskLevel} confidence={report.confidence} date={report.date} />
        </motion.div>

        {/* Detailed Findings */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {t('reports.findings', 'Detailed Findings')}
            </h2>
            <div className="space-y-4">
              {report.findings.map((finding, index) => <div key={finding.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {finding.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {finding.description}
                      </p>
                    </div>
                  </div>
                </div>)}
            </div>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {t('reports.recommendations', 'Recommendations')}
            </h2>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{rec}</span>
                </li>)}
            </ul>
          </Card>
        </motion.div>

        {/* Doctor Notes */}
        {report.doctorNotes && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }} className="mb-8">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {t('reports.doctorNotes', "Doctor's Notes")}
                  </h3>
                  <p className="text-sm text-slate-700">{report.doctorNotes}</p>
                </div>
              </div>
            </Card>
          </motion.div>}

        {/* Action Buttons */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.5
      }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" leftIcon={<AlertCircle className="w-4 h-4" />} onClick={() => navigate('/patient/doctors')}>
            {t('reports.findSpecialist', 'Find a Specialist')}
          </Button>
          <Button variant="outline" leftIcon={<History className="w-4 h-4" />} onClick={() => navigate('/patient/scan-history')}>
            {t('reports.viewAllScans', 'View All Scans')}
          </Button>
        </motion.div>
      </div>
    </div>;
}
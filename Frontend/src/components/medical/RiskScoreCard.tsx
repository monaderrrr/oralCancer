import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from "react-i18next"; 

interface RiskScoreCardProps {
  riskLevel?: 'low' | 'medium' | 'high'; 
  confidence?: number; 
  date?: string;
}

export function RiskScoreCard({
  riskLevel,
  confidence,
  date,
}: RiskScoreCardProps) {
  const { t } = useTranslation(); 

  const getRiskConfig = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          barColor: 'bg-red-600',
          icon: AlertCircle,
          label: t("riskCard.labels.high", "High Risk Detected"),
          description: t("riskCard.descriptions.high", "The AI detected patterns strongly associated with oral health concerns."),
        };
      case 'medium':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          barColor: 'bg-orange-500',
          icon: AlertTriangle,
          label: t("riskCard.labels.medium", "Medium Risk Detected"),
          description: t("riskCard.descriptions.medium", "The AI found some irregularities that may require professional attention."),
        };
      case 'low':
      default:
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          barColor: 'bg-green-600',
          icon: CheckCircle,
          label: t("riskCard.labels.low", "Low Risk Detected"),
          description: t("riskCard.descriptions.low", "No significant irregularities were detected by the AI."),
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;
  const safeConfidence = confidence !== undefined ? confidence : 0;

  return (
    <Card riskLevel={riskLevel || 'low'} className="overflow-hidden border-2">
      <div className={`p-6 ${config.bgColor}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white/60 ${config.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${config.color}`}>{config.label}</h2>
              <p className={`text-sm ${config.color} opacity-90`}>
                {t("riskCard.scanDate", "Scan Date")}: {date || new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <Badge riskLevel={riskLevel} confidence={safeConfidence} className="font-bold px-3 py-1">
            {t(`riskLevels.${riskLevel || "low"}`, riskLevel || "low").toUpperCase()}
          </Badge>
        </div>

        {/* Description */}
        <p className={`${config.color} mb-6 max-w-2xl`}>{config.description}</p>

        {/* Confidence Bar */}
        <div className="bg-white/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${config.color}`}>{t("riskCard.confidenceScore", "AI Confidence Score")}</span>
            <span className={`text-sm font-bold ${config.color}`}>{safeConfidence}%</span>
          </div>

          <div className="h-3 bg-white rounded-full overflow-hidden border border-white/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${config.barColor}`}
              style={{ width: `${safeConfidence}%` }}
            />
          </div>

          <div className="flex items-start gap-2 mt-3">
            <Info className={`w-4 h-4 mt-0.5 ${config.color} opacity-70`} />
            <p className={`text-xs ${config.color} opacity-80 leading-relaxed`}>
              {t("riskCard.infoNotice", "This confidence score reflects the AI model's certainty based on image quality and detected patterns.")}
              <span className="font-semibold ml-1">{t("riskCard.notFinal", "It is not a final medical diagnosis.")}</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
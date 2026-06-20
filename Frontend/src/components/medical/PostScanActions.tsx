import React from "react";
import { Button } from "../ui/Button";
import {
  Stethoscope,
  Building2,
  ChevronRight,
  RefreshCw,
  Activity
} from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface PostScanActionsProps {
  riskLevel?: RiskLevel;              // يأتي من نتائج AI
  onBookDoctor: () => void;
  onFindHospital: () => void;
  onScanAgain?: () => void;
}

export function PostScanActions({
  riskLevel,
  onBookDoctor,
  onFindHospital,
  onScanAgain
}: PostScanActionsProps) {

  const getMessage = () => {
    switch (riskLevel) {
      case "high":
        return "Your scan suggests a high risk. Please consult a specialist as soon as possible.";
      case "medium":
        return "Some irregularities were detected. A medical consultation is recommended.";
      case "low":
        return "No major risks detected, but you may still consult a specialist if needed.";
      default:
        return "Choose an option below to proceed with professional medical consultation.";
    }
  };

  return (
    <div className="space-y-4">

      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Activity className="w-5 h-5 text-teal-600" />
        Next Steps
      </h3>

      <p className="text-gray-600">
        {getMessage()}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Book Doctor */}
        <Button
          variant="primary"
          onClick={onBookDoctor}
          className="h-auto py-6 px-6 flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Book a Doctor</div>
              <div className="text-sm opacity-90 font-normal">Find a specialist near you</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Find Hospital */}
        <Button
          variant="outline"
          onClick={onFindHospital}
          className="h-auto py-6 px-6 flex items-center justify-between group bg-white hover:bg-gray-50 border-2"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg text-gray-900">Find a Hospital</div>
              <div className="text-sm text-gray-500 font-normal">Locate nearby clinics</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Button>

      </div>

      {/* Scan Again */}
      {onScanAgain && (
        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={onScanAgain}
            className="flex items-center gap-2 text-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
            Scan Again
          </Button>
        </div>
      )}

    </div>
  );
}

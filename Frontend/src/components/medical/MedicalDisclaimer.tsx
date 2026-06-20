import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";

type MedicalDisclaimerProps = {
  variant?: "compact" | "default" | "banner";
};

export function MedicalDisclaimer({
  variant = "default",
}: MedicalDisclaimerProps) {

  if (variant === "compact") {
    return (
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

        <p>
          AI screening results are for informational purposes only and
          should not replace professional medical advice.
        </p>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-teal-600" />
        AI analysis is not a medical diagnosis. Always consult a doctor.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-4"
    >

      <div className="flex items-start gap-3">

        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>

        <div>

          <h4 className="font-medium text-amber-800 mb-1">
            Medical Disclaimer
          </h4>

          <p className="text-sm text-amber-700 leading-relaxed">
            This AI-powered oral health screening tool provides automated
            analysis based on image recognition and machine learning.
            It is intended for informational purposes only and does not
            replace professional medical diagnosis, treatment, or advice.
            Always consult a qualified healthcare professional regarding
            any medical concerns.
          </p>

        </div>

      </div>

    </motion.div>
  );
}
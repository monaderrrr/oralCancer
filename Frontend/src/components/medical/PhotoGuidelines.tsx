import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sun,
  Camera,
  Focus,
  Scan
} from "lucide-react";

export function PhotoGuidelines() {

  const guidelines = [
    {
      icon: Sun,
      title: "Good Lighting",
      description: "Use natural light or bright artificial lighting",
      do: "Well-lit environment",
      dont: "Dark or shadowy areas",
    },
    {
      icon: Camera,
      title: "Clear View",
      description: "Open mouth wide and keep the tongue down",
      do: "Full oral cavity visible",
      dont: "Partial or obstructed view",
    },
    {
      icon: Focus,
      title: "Sharp Focus",
      description: "Hold the camera steady and close enough",
      do: "Clear, focused image",
      dont: "Blurry or shaky photos",
    },
    {
      icon: Scan,
      title: "Center the Area",
      description: "Place the suspicious area in the center of the photo",
      do: "Lesion centered in frame",
      dont: "Off-center or cropped image",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >

      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-teal-600" />
        Photo Guidelines
      </h3>

      {/* AI Tip */}
      <div className="mb-5 bg-teal-50 border border-teal-200 text-sm text-teal-700 rounded-lg px-3 py-2">
        For best AI analysis results, follow these photo guidelines carefully.
      </div>

      <div className="space-y-4">

        {guidelines.map((guideline, index) => (

          <motion.div
            key={guideline.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
          >

            <div className="flex items-start gap-3 mb-2">

              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <guideline.icon className="w-4 h-4 text-teal-600" />
              </div>

              <div>
                <h4 className="font-medium text-slate-900">
                  {guideline.title}
                </h4>

                <p className="text-sm text-slate-500">
                  {guideline.description}
                </p>
              </div>

            </div>

            <div className="ml-11 flex flex-col sm:flex-row gap-2 text-sm">

              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                {guideline.do}
              </span>

              <span className="flex items-center gap-1 text-red-500">
                <X className="w-3.5 h-3.5" />
                {guideline.dont}
              </span>

            </div>

          </motion.div>

        ))}

      </div>

    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;

  // AI related
  isAI?: boolean;

  // optional button
  actionLabel?: string;
  onAction?: () => void;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
  isAI = false,
  actionLabel,
  onAction,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
      }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all"
    >
      {/* AI Badge */}
      {isAI && (
        <div className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-200 w-fit px-2 py-1 rounded mb-4">
          <Sparkles className="w-3 h-3" />
          AI Powered
        </div>
      )}

      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-teal-600" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-600 leading-relaxed mb-4">
        {description}
      </p>

      {/* Optional Action */}
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          {actionLabel} →
        </button>
      )}
    </motion.div>
  );
}
import React from "react";
import { Card } from "../ui/Card";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next"; // استدعاء الترجمة هنا

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "teal" | "blue" | "indigo" | "emerald" | "amber" | "rose";
  loading?: boolean;
}

const colorStyles = {
  teal: "bg-teal-50 text-teal-600",
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "teal",
  loading = false,
}: StatCardProps) {
  const { t } = useTranslation(); // تفعيل الهُوك

  return (
    <Card className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          {/* Value (from backend) */}
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-2" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {value}
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Trend from backend */}
      {trend && !loading && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`font-medium ${
              trend.direction === "up"
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {trend.direction === "up" ? "+" : "-"}
            {trend.value}%
          </span>

          {/* ترجمة الجملة الثابتة هنا */}
          <span className="mx-2 text-slate-500">
            {t("dashboard.fromAnalytics", "from backend analytics")}
          </span>
        </div>
      )}
    </Card>
  );
}
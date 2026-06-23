import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next"; 

export interface TrendData {
  date: string;
  riskScore: number;
  riskLabel?: "Low" | "Medium" | "High";
}

interface TrendChartProps {
  data: TrendData[];
}

export function TrendChart({ data = [] }: TrendChartProps) {
  const { t } = useTranslation(); 

  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
        {t("chart.noData", "No chart data available")}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>

          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              const d = payload[0].payload;

              const color =
                d.riskLabel === "High"
                  ? "#ef4444"
                  : d.riskLabel === "Medium"
                  ? "#f59e0b"
                  : "#10b981";

              const safeLabel = d.riskLabel ? d.riskLabel.toLowerCase() : "low";

              return (
                <div className="bg-white p-3 rounded-lg shadow-md border text-left">
                  <p className="text-xs text-slate-500 mb-1">
                    {formatDate(label)}
                  </p>

                  <p
                    className="font-bold text-sm"
                    style={{ color }}
                  >
                    {t(`riskLevels.${safeLabel}`, d.riskLabel)} ({d.riskScore}%)
                  </p>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="riskScore"
            stroke="#14b8a6"
            strokeWidth={3}
            fill="url(#riskGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
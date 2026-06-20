import React from "react";
import {
  MessageSquare,
  FileText,
  AlertTriangle,
  ChevronRight,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ActivityFeedItemProps {
  id: string;
  type: string;
  patientName?: string;
  createdAt?: string;
  message?: string;
  metadata?: {
    conversationId?: string;
    scanId?: string;
    riskLevel?: string;
  };
}

export function ActivityFeedItem({
  type,
  patientName,
  createdAt,
  message,
  metadata,
}: ActivityFeedItemProps) {

  // 🔥 Normalize type (important fix)
  const safeType = (type || "activity").toLowerCase();

  const activityConfigs: Record<string, any> = {
    message: {
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Message",
    },
    scan: {
      icon: FileText,
      color: "text-teal-600",
      bg: "bg-teal-50",
      label: "Scan",
    },
    alert: {
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Alert",
    },
    symptom: {
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
      label: "Symptom",
    },
  };

  const config = activityConfigs[safeType] || activityConfigs.scan;
  const Icon = config.icon;

  // 🔥 SAFE ROUTING (important fix)
  const getLink = () => {
    if (safeType === "message" && metadata?.conversationId) {
      return `/doctor/messages/${metadata.conversationId}`;
    }

    if (metadata?.scanId) {
      return `/doctor/scans/${metadata.scanId}`;
    }

    return "/doctor/dashboard";
  };

  // 🔥 SAFE DATE
  const formatDate = (date?: string) => {
    if (!date) return "Just now";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Recent";

    return parsed.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link to={getLink()} className="block group">
      <div className="flex items-start gap-4 p-4 hover:bg-slate-50 rounded-xl transition border-b border-slate-100">

        {/* ICON */}
        <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center group-hover:scale-110 transition`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-slate-900 truncate">
              {patientName || "Unknown Patient"}
            </p>

            <span className="text-xs text-slate-400">
              {formatDate(createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] uppercase font-bold ${config.color}`}>
              {config.label}
            </span>

            <span className="text-slate-300">•</span>

            <p className="text-sm text-slate-600 truncate">
              {message || "No activity details"}
            </p>
          </div>
        </div>

        {/* ARROW */}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition" />
      </div>
    </Link>
  );
}
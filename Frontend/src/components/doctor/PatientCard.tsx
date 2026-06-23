import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useTranslation } from "react-i18next"; 

interface PatientCardProps {
  patient: {
    patientId: string;
    name?: string;
    fullName?: string;
    lastScanDate?: string | null;
    currentRiskLevel?: "high" | "medium" | "low" | "unknown";
    lesionType?: string | null;
    diagnosis?: string | null;
  };
}

export function PatientCard({ patient }: PatientCardProps) {
  const { t } = useTranslation(); 

  const patientName =
    patient.fullName ?? patient.name ?? t("patientCard.unknownPatient", "Unknown Patient");

  // ================= RISK BADGE =================
  const renderRiskBadge = (level?: string) => {
    const safe = level?.toLowerCase() || "unknown";

    const styles: Record<string, string> = {
      low: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-amber-100 text-amber-700 border-amber-200",
      high: "bg-red-100 text-red-700 border-red-200",
      unknown: "bg-slate-100 text-slate-600 border-slate-200",
    };

    const label: Record<string, string> = {
      low: t("riskLevels.low", "Low Risk"),
      medium: t("riskLevels.medium", "Medium Risk"),
      high: t("riskLevels.high", "High Risk"),
      unknown: t("riskLevels.noData", "No Data"),
    };

    return (
      <Badge className={`px-3 py-1 text-xs rounded-full border ${styles[safe]}`}>
        {label[safe] || t("riskLevels.noData", "No Data")}
      </Badge>
    );
  };

  // ================= LESION BADGE =================
  const renderLesionBadge = (type?: string | null) => {
    if (!type) {
      return (
        <Badge className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 text-xs rounded-full">
          {t("patientCard.notSpecified", "Not Specified")}
        </Badge>
      );
    }

    const normalized = type.toLowerCase();

    const color =
      normalized.includes("ulcer")
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : normalized.includes("white")
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : normalized.includes("red")
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-indigo-100 text-indigo-700 border-indigo-200";

    return (
      <Badge className={`px-3 py-1 text-xs rounded-full border ${color}`}>
        {type}
      </Badge>
    );
  };

  const formatDate = (date?: string | null) => {
    if (!date) return t("patientCard.noScans", "No scans yet");

    const d = new Date(date);
    if (isNaN(d.getTime())) return t("patientCard.invalidDate", "Invalid date");

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayValue = (value?: string | null) =>
    value && value.trim() !== "" ? value : t("patientCard.notAvailable", "Not available");

  return (
    <Card className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">
            {patientName}
          </h3>

          <p className="text-xs text-slate-500">
            {t("patientCard.subtitle", "Oral Cancer Screening Patient")}
          </p>
        </div>

        {renderRiskBadge(patient.currentRiskLevel)}

      </div>

      <div className="h-px bg-slate-100 mb-5" />

      {/* BODY */}
      <div className="grid grid-cols-2 gap-5">

        {/* LESION TYPE */}
        <div className="col-span-2 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border">
          <p className="text-[11px] uppercase text-slate-400 mb-2">
            {t("patientCard.lesionTypeLabel", "Lesion Type")}
          </p>
          {renderLesionBadge(patient.lesionType)}
        </div>

        {/* LAST SCAN */}
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-[11px] uppercase text-slate-400 mb-1">
            {t("patientCard.lastScanLabel", "Last Scan")}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {formatDate(patient.lastScanDate)}
          </p>
        </div>

        {/* DIAGNOSIS */}
        <div className="p-3 rounded-xl bg-slate-50">
          <p className="text-[11px] uppercase text-slate-400 mb-1">
            {t("patientCard.diagnosisLabel", "Latest Diagnosis")}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {displayValue(patient.diagnosis)}
          </p>
        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">

        <span className="text-xs text-slate-400">
          {t("patientCard.statusUpdated", "Status updated from latest scan")}
        </span>

        <span className="text-xs text-slate-400">
          {formatDate(patient.lastScanDate)}
        </span>

      </div>

    </Card>
  );
}
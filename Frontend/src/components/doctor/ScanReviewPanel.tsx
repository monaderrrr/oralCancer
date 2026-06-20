import { useState, useEffect, ChangeEvent } from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import {
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Save,
} from "lucide-react";

interface ScanData {
  id: string;
  patientName: string;
  date: string;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  riskScore?: number;
  imageUrl: string;
  findings: string[];
  notes?: string | null;
  patientNotes?: string | null;
  userAnswers?: Record<string, string>;
  diagnosis?: string | null;
  doctorReview?: {
    doctorName?: string | null;
    notes?: string;
    recommendations?: string;
    severity?: string | null;
    reviewedAt?: string | null;
  } | null;
}

interface Props {
  scan: ScanData;
  onSubmit: (
    notes: string,
    recommendations: string,
    severity: "Low" | "Mild" | "Moderate" | "High"
  ) => void;
  submitting?: boolean;
}

export function ScanReviewPanel({ scan, onSubmit, submitting = false }: Props) {
  const [notes, setNotes] = useState(scan.doctorReview?.notes || "");
  const [recommendations, setRecommendations] = useState(scan.doctorReview?.recommendations || "");
  const [severity, setSeverity] = useState<"Low" | "Mild" | "Moderate" | "High">(
    (scan.doctorReview?.severity as "Low" | "Mild" | "Moderate" | "High") || "Low"
  );
  const [formError, setFormError] = useState<string>("");

  useEffect(() => {
    setNotes(scan.doctorReview?.notes || "");
    setRecommendations(scan.doctorReview?.recommendations || "");
    setSeverity((scan.doctorReview?.severity as "Low" | "Mild" | "Moderate" | "High") || "Low");
    setFormError("");
  }, [scan]);

  const config = {
    low: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle, label: "Low Risk" },
    medium: { color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, label: "Medium Risk" },
    high: { color: "text-red-600", bg: "bg-red-50", icon: AlertOctagon, label: "High Risk" },
  }[scan.riskLevel];

  const Icon = config.icon;

  return (
    <div className="space-y-6 h-full overflow-y-auto p-3">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h2 className="font-bold text-lg">{scan.patientName}</h2>
          <p className="text-xs text-gray-500">{scan.date}</p>
        </div>

        <Badge>{scan.id?.slice(0, 8)}</Badge>
      </div>

      {/* AI RESULT */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${config.bg}`}>
            <Icon className={config.color} />
          </div>

          <div>
            <div className={`font-bold ${config.color}`}>
              {config.label}
            </div>
            <div className="text-sm">
              Confidence: {scan.confidence}%
            </div>
          </div>
        </div>

        <ul className="mt-3 list-disc pl-5 text-sm">
          {scan.findings?.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900">AI Analysis</h3>
          <p className="mt-1 text-sm text-slate-600">
            {scan.diagnosis || scan.findings?.[0] || "No diagnosis returned."}
          </p>
        </div>

        {typeof scan.riskScore === "number" && (
          <div>
            <h3 className="font-semibold text-slate-900">Risk Score</h3>
            <p className="mt-1 text-sm text-slate-600">
              {scan.riskScore}%
            </p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-slate-900">Patient Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
            {scan.patientNotes || scan.notes || "No patient notes available."}
          </p>
        </div>

        {scan.userAnswers && Object.keys(scan.userAnswers).length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900">Patient Answers</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(scan.userAnswers).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{key.replace(/_/g, " ")}: </span>
                  <span className="text-slate-600">{value || "N/A"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* REVIEW */}
      {scan.doctorReview?.reviewedAt && (
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <h3 className="font-semibold text-slate-900">Current Doctor Review</h3>
          <p className="mt-1 text-xs text-slate-500">
            Reviewed {new Date(scan.doctorReview.reviewedAt).toLocaleString()}
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Severity:</span> {scan.doctorReview.severity || "N/A"}</p>
            <p className="whitespace-pre-wrap"><span className="font-semibold">Notes:</span> {scan.doctorReview.notes || "N/A"}</p>
            <p className="whitespace-pre-wrap"><span className="font-semibold">Recommendations:</span> {scan.doctorReview.recommendations || "N/A"}</p>
          </div>
        </Card>
      )}

      <Card className="p-4 space-y-4">
        <div>
          <label htmlFor="severity-select" className="block text-sm font-semibold text-slate-900 mb-2">
            Severity Level
          </label>
          <select
            id="severity-select"
            className="w-full border border-slate-300 p-2 rounded"
            value={severity}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSeverity(e.target.value as "Low" | "Mild" | "Moderate" | "High")
            }
          >
            <option value="Low">Low</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Medical Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write medical notes for this scan..."
            className="min-h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Recommendations
          </label>
          <Textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Add recommendations, follow-up instructions, or referral guidance..."
            className="min-h-20"
          />
        </div>

        {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <Button
        fullWidth
        leftIcon={<Save />}
        onClick={() => {
          if (!notes.trim() || !recommendations.trim()) {
            setFormError("Notes and recommendations are required before submitting the review.");
            return;
          }
          if (!severity) {
            setFormError("Please select a severity level.");
            return;
          }
          setFormError("");
          onSubmit(notes, recommendations, severity);
        }}
        isLoading={submitting}
        disabled={submitting}
      >
        {scan.doctorReview?.reviewedAt ? "Update Review" : "Submit Review"}
      </Button>

      </Card>
    </div>
  );
}

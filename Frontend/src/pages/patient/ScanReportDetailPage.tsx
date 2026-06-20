import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, FileImage, RefreshCw, UserCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { RiskScoreCard } from "../../components/medical/RiskScoreCard";
import API, { IMAGE_BASE_URL } from "../../Api";

interface ScanDetail {
  scanId: string;
  imageUrl?: string | null;
  riskLevel: "low" | "medium" | "high";
  riskScore?: number;
  confidence?: number;
  diagnosis?: string | null;
  lesionType?: string | null;
  userAnswers?: Record<string, string>;
  notes?: string | null;
  createdAt: string;
  doctorReview?: {
    doctorName?: string | null;
    notes?: string;
    recommendations?: string;
    severity?: string | null;
    reviewedAt?: string | null;
  } | null;
}

export function ScanReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightReview, setHighlightReview] = useState(false);

  useEffect(() => {
    const fetchScan = async () => {
      if (!id) {
        setError("Scan ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await API.get(`/api/v1/scans/${id}`);
        setScan(res.data?.data || null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Content no longer available.");
        } else {
          setError(err.response?.data?.message || "Content no longer available.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [id]);

  useEffect(() => {
    if (!scan) return;

    const searchParams = new URLSearchParams(location.search);
    const locationState = location.state as { highlightReview?: boolean } | null;
    const shouldHighlight = Boolean(locationState?.highlightReview || searchParams.get("highlightReview"));

    if (shouldHighlight) {
      setHighlightReview(true);
      reviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const timer = window.setTimeout(() => setHighlightReview(false), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [scan, location.search, location.state]);

  const image = useMemo(() => {
    const rawImage = scan?.imageUrl || "";
    if (!rawImage) return "";
    return rawImage.startsWith("http")
      ? rawImage
      : `${IMAGE_BASE_URL}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;
  }, [scan?.imageUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="p-12 text-center">
            <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-teal-600" />
            <p className="text-slate-600">Loading scan report...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    const isDeleted = error === "Content no longer available.";
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/patient/reports")} className="mb-4">
            Back to Reports
          </Button>
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="text-xl font-bold text-slate-900">
              {isDeleted ? "Content no longer available." : "Review not found."}
            </h1>
            {!isDeleted && (
              <p className="mt-2 text-slate-600">{error || "The requested review could not be loaded."}</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const answers = scan.userAnswers || {};
  const reviewed = Boolean(scan.doctorReview?.reviewedAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/patient/reports")} className="mb-4">
            Back to Reports
          </Button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Scan Report</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(scan.createdAt).toLocaleString()}
                </span>
                {scan.reviewStatus && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    scan.reviewStatus === "Reviewed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {scan.reviewStatus}
                  </span>
                )}
              </div>
            </div>
            <Badge riskLevel={scan.riskLevel}>{scan.riskLevel.toUpperCase()} RISK</Badge>
          </div>
        </div>

        <div className="mb-8">
          <RiskScoreCard riskLevel={scan.riskLevel} confidence={scan.confidence || 0} date={new Date(scan.createdAt).toLocaleDateString()} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Scan Image</h2>
            {image ? (
              image.toLowerCase().includes(".pdf") ? (
                <a href={image} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
                  Open scan file
                </a>
              ) : (
                <img src={image} alt="Submitted oral scan" className="max-h-80 w-full rounded-lg bg-slate-100 object-contain" />
              )
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                <FileImage className="mx-auto mb-2 h-10 w-10" />
                No scan image attached
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">AI Prediction</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Result:</span> {scan.diagnosis || "No diagnosis returned"}</p>
              <p><span className="font-semibold">Confidence:</span> {scan.confidence || 0}%</p>
              <p><span className="font-semibold">Risk Level:</span> {scan.riskLevel}</p>
              <p><span className="font-semibold">Risk Score:</span> {scan.riskScore ?? 0}%</p>
              {scan.lesionType && <p><span className="font-semibold">Lesion Type:</span> {scan.lesionType}</p>}
              {scan.notes && <p className="whitespace-pre-wrap"><span className="font-semibold">AI Notes:</span> {scan.notes}</p>}
            </div>
          </Card>
        </div>

        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Patient Questionnaire Answers</h2>
          {Object.keys(answers).length === 0 ? (
            <p className="text-sm text-slate-500">No questionnaire answers were saved with this scan.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-semibold capitalize text-slate-800">{key.replace(/_/g, " ")}</p>
                  <p className="mt-1 text-slate-600">{value || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div ref={reviewSectionRef}>
          <Card className={`mb-8 p-6 ${highlightReview ? "border-cyan-500 bg-cyan-50 shadow-lg" : reviewed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${reviewed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {reviewed ? <UserCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Doctor Review</h2>
                {!reviewed ? (
                  <p className="mt-2 text-sm font-semibold text-amber-800">Waiting for doctor review</p>
                ) : (
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p><span className="font-semibold">Doctor:</span> {scan.doctorReview?.doctorName || "Doctor"}</p>
                    <p><span className="font-semibold">Severity Assessment:</span> {scan.doctorReview?.severity || "N/A"}</p>
                    <p className="whitespace-pre-wrap"><span className="font-semibold">Doctor Notes:</span> {scan.doctorReview?.notes || "N/A"}</p>
                    <p className="whitespace-pre-wrap"><span className="font-semibold">Recommendations:</span> {scan.doctorReview?.recommendations || "N/A"}</p>
                    <p className="text-xs text-slate-500">Reviewed {new Date(scan.doctorReview!.reviewedAt!).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button variant="outline" leftIcon={<AlertCircle className="h-4 w-4" />} onClick={() => navigate("/patient/doctors")}>
            Find a Specialist
          </Button>
          <Button variant="outline" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => navigate("/patient/scan-history")}>
            View All Scans
          </Button>
        </div>
      </div>
    </div>
  );
}

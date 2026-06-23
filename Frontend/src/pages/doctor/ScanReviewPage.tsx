import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Layers,
  RefreshCw,
  FileImage,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { DoctorSidebar } from "../../components/doctor/DoctorSidebar";
import { ScanReviewPanel } from "../../components/doctor/ScanReviewPanel";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import API, { IMAGE_BASE_URL } from "../../Api";
import { useTranslation } from "react-i18next"; 

export function ScanReviewPage() {
  const { t } = useTranslation(); 
  const { id, patientId } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const [scan, setScan] = useState<any>(null);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewScans, setReviewScans] = useState<any[]>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const zoomStyle = useMemo(
    () => ({
      transform: `scale(${zoomLevel})`,
      transition: "transform 0.2s ease",
    }),
    [zoomLevel]
  );

  // FETCH
  const fetchScan = async () => {
    try {
      setLoading(true);
      setError("");
      setEmptyMessage("");

      if (!id && !patientId) {
        const endpoint = "/api/v1/doctor/scans";
        const requestUrl = `${API.defaults.baseURL || ""}${endpoint}`;
        console.info("[ScanReviews] requesting", requestUrl);
        const res = await API.get(endpoint);
        console.info("[ScanReviews] response", {
          url: requestUrl,
          status: res.status,
          count: Array.isArray(res?.data?.data) ? res.data.data.length : 0,
        });
        setReviewScans(Array.isArray(res?.data?.data) ? res.data.data : []);
        setScan(null);
        return;
      }

      const endpoint = patientId
        ? `/api/v1/doctor/shared-scans/${patientId}/latest`
        : `/api/v1/doctor/scans/${id}`;

      const requestUrl = `${API.defaults.baseURL || ""}${endpoint}`;
      console.info("[ScanReviewDetails] requesting", requestUrl);
      const res = await API.get(endpoint);
      console.info("[ScanReviewDetails] response", {
        url: requestUrl,
        status: res.status,
        scanId: res?.data?.data?.scanId,
      });
      const data = res?.data?.data;

      if (!data) {
        setEmptyMessage(res?.data?.message || t("scanReviewPage.noShared", "No shared scan found for this patient."));
      }

      setScan(data);
    } catch (err: any) {
      const message = err.response?.status === 404
        ? t("scanReviewPage.errors.noLongerAvailable", "Content no longer available.")
        : (err.response?.data?.message || err?.message || t("scanReviewPage.errors.loadError", "Error loading scan"));
      setError(message);
      console.error("[ScanReviews] fetch error", {
        url: err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, [id, patientId]);

  // SUBMIT
  const handleSubmit = async (
    notes: string,
    recommendations: string,
    severity: string
  ) => {
    try {
      setSubmitting(true);

      const scanId = scan?.scanId || scan?._id || id;

      await API.post(`/api/v1/doctor/scans/${scanId}/review`, {
        notes,
        recommendations,
        severity,
      });

      const res = await API.get(`/api/v1/doctor/scans/${scanId}`);
      setScan(res?.data?.data || null);
    } catch (err: any) {
      console.error("[ScanReviewDetails] submit error", {
        url: err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || err?.message || t("scanReview.errors.severity", "Submit failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <RefreshCw className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!id && !patientId) {
    return (
      <div className="min-h-screen bg-slate-50 lg:flex">
        <DoctorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl text-left">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{t("sidebar.scanReviews", "Scan Reviews")}</h1>
              <p className="text-sm text-slate-600">{t("scanReviewPage.subtitle", "Open a patient-submitted scan to review the AI result and add your response.")}</p>
            </div>

            {error ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                <h2 className="font-semibold text-slate-900">{t("scanReviewPage.errors.unableToLoad", "Unable to load scans")}</h2>
                <p className="mt-1 text-sm text-slate-600">{error}</p>
                <Button className="mt-4" onClick={fetchScan}>{t("paymentError.retryBtn", "Try Again")}</Button>
              </Card>
            ) : reviewScans.length === 0 ? (
              <Card className="p-10 text-center">
                <FileImage className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <h2 className="font-semibold text-slate-900">{t("scanReviewPage.emptyTitle", "No scans waiting for review")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("scanReviewPage.emptyDesc", "Patient-shared scans will appear here.")}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviewScans.map((item) => {
                  const reviewed = Boolean(item.doctorReview?.reviewedAt);
                  return (
                    <Card key={item.scanId || item._id} className="p-5 hover:shadow-md transition">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/scans/${item.scanId || item._id}`)}
                        className="flex w-full items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            item.riskLevel === "high" ? "bg-red-100 text-red-600" :
                            item.riskLevel === "medium" ? "bg-amber-100 text-amber-600" :
                            "bg-emerald-100 text-emerald-600"
                          }`}>
                            {reviewed ? <CheckCircle /> : <FileImage />}
                          </div>
                          <div>
                            <h2 className="font-semibold text-slate-900">
                              {item.patientInfo?.fullName || item.patientName || t("patientCard.unknownPatient", "Unknown Patient")}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                              <span className="capitalize">{t(`riskLevels.${item.riskLevel || "low"}`, item.riskLevel || "low")}</span>
                              <span>{t("scanReview.confidence", "Confidence")}: {item.confidence || 0}%</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {item.createdAt ? new Date(item.createdAt).toLocaleString() : t("timeline.time.recent", "No date")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reviewed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {reviewed ? t("timeline.status.completed", "Reviewed") : t("timeline.status.pending", "Waiting review")}
                        </span>
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (error || !scan) {
    const isAccessDenied = error?.includes("not shared");

    return (
      <div className="min-h-screen bg-slate-50 lg:flex">
        <DoctorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="max-w-lg p-8 text-center">
            <FileImage className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h1 className="text-xl font-bold text-slate-900">
              {isAccessDenied
                ? t("scanReviewPage.deniedTitle", "Access Denied")
                : error === "Content no longer available."
                ? t("scanReviewPage.errors.noLongerAvailable", "Content no longer available.")
                : error
                ? t("scanReviewPage.errors.unableToOpen", "Unable to open scan")
                : t("scanReviewPage.errors.noScan", "No scan available")}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {error === "Content no longer available."
                ? ""
                : (error || emptyMessage || t("scanReviewPage.noScanDesc", "This patient has not uploaded a scan yet."))}
            </p>

            {isAccessDenied && (
              <p className="mt-2 text-xs text-slate-500 bg-amber-50 p-3 rounded">
                {t("scanReviewPage.deniedNotice", "The patient may not have shared their scan with you yet. Please ask the patient to share their scan from their dashboard.")}
              </p>
            )}

            <div className="mt-6 flex gap-3 flex-col sm:flex-row justify-center">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEmptyMessage("");
                  fetchScan();
                }}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
              >
                {t("paymentError.retryBtn", "Try Again")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/doctor/dashboard")}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300"
              >
                {t("paymentModal.buttons.return", "Go to Dashboard")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/doctor/notifications")}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                {t("scanReviewPage.buttons.notifications", "View Notifications")}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // NORMALIZE
  const rawImage = scan?.images?.[0] || scan?.imageUrl || "";
  const image = rawImage && rawImage.startsWith("http")
    ? rawImage
    : rawImage
      ? `${IMAGE_BASE_URL}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`
      : "";
  const isPdf = image.toLowerCase().includes(".pdf");
  const patientName = scan?.patientInfo?.fullName || scan?.patientName;
  const riskLevel = scan?.riskLevel || "low";
  const confidence = scan?.confidence || 0;

  const findings = [
    scan?.diagnosis,
    scan?.lesionType && `${t("patientCard.lesionTypeLabel", "Lesion")}: ${scan.lesionType}`,
    typeof scan?.riskScore === "number" && `${t("scanReview.riskScore", "Risk score")}: ${scan.riskScore}%`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 lg:flex">
      <DoctorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* IMAGE */}
      <div className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-hidden bg-black p-4 lg:min-h-screen">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-full flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={18} />
          {t("onboarding.back", "Back")}
        </button>

        {/* TOOLBAR */}
        {!isPdf && image && (
          <div className="absolute top-4 right-4 z-20 bg-black/70 text-white px-4 py-2 flex gap-3 rounded-full">
            <button
              onClick={() => setZoomLevel(z => Math.max(z - 0.1, 0.5))}
              title={t("preview.tooltips.zoomOut", "Zoom out")}
              aria-label="Zoom out"
            >
              <ZoomOut />
            </button>
            <span>{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(z + 0.1, 3))}
              title={t("preview.tooltips.zoomIn", "Zoom in")}
              aria-label="Zoom in"
            >
              <ZoomIn />
            </button>
            <button
              onClick={() => setShowHeatmap(v => !v)}
              title={t("scanReviewPage.tooltips.heatmap", "Toggle heatmap")}
              aria-label="Toggle heatmap"
            >
              <Layers />
            </button>
          </div>
        )}

        {image ? (
          isPdf ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-xl">
              <FileImage className="mx-auto mb-3 h-10 w-10 text-teal-600" />
              <p className="mb-4 font-semibold text-slate-900">{t("scanReviewPage.pdfAttached", "Scan file attached")}</p>
              <a
                href={image}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                {t("scanReviewPage.openFile", "Open file")}
              </a>
            </div>
          ) : (
            <div style={zoomStyle}>
              <img src={image} alt="Shared scan" className="max-h-[80vh] max-w-full rounded-lg object-contain" />
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-8 text-center text-white">
            <FileImage className="mx-auto mb-3 h-10 w-10 opacity-70" />
            <p className="font-semibold">{t("scanReviewPage.noAttachedImg", "No scan image attached")}</p>
          </div>
        )}

        {showHeatmap && riskLevel === "high" && image && !isPdf && (
          <div className="absolute inset-0 bg-red-500/20" />
        )}
      </div>

      {/* PANEL */}
      <div className="w-full border-l bg-white lg:w-[420px]">
        {reviewSubmitted && (
          <div className="m-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-left">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-900">{t("scanReviewPage.submitSuccessTitle", "Review submitted successfully.")}</p>
                  <p className="text-sm text-emerald-700">{t("scanReviewPage.submitSuccessDesc", "Your feedback has been saved and the patient was notified.")}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{t("onboarding.steps.subscription", "Success")}</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setReviewSubmitted(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t("scanReviewPage.buttons.stay", "Stay on page")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/doctor/scans")}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {t("scanReviewPage.buttons.returnReviews", "Return to Scan Reviews")}
                </button>
              </div>
            </div>
          </div>
        )}

        <ScanReviewPanel
          scan={{
            id: scan?._id || scan?.scanId,
            patientName,
            date: new Date(scan.createdAt).toLocaleString(),
            riskLevel,
            confidence,
            riskScore: scan?.riskScore,
            imageUrl: image,
            findings,
            notes: scan?.notes,
            patientNotes: scan?.patientNotes || scan?.notes,
            userAnswers: scan?.userAnswers,
            diagnosis: scan?.diagnosis,
            doctorReview: scan?.doctorReview,
          }}
          onSubmit={async (notes, recommendations, severity) => {
            await handleSubmit(notes, recommendations, severity);
            setReviewSubmitted(true);
          }}
          submitting={submitting}
        />
      </div>

    </div>
  );
}
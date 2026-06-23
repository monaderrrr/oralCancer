import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, Calendar, Image, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import API from "../../Api";
import { useTranslation } from "react-i18next";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface Scan {
  scanId: string;
  createdAt: string;
  riskScore: number;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
}

interface HistoryResponse {
  summary: {
    totalScans: number;
    avgRiskScore: number;
    lowRiskScans: number;
    avgConfidence: number;
  };
  riskTrend: Array<{ date: string; riskScore: number }>;
  scans: Scan[];
  healthInsights: {
    message: string;
    recommendation: string;
  };
}

export function ScanHistoryPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/v1/scans/history?page=1&limit=10");
        setHistory(res.data?.data || null);
      } catch (err) {
        console.error("Error loading scan history:", err);
        setError("Could not load scan history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const scans = history?.scans || [];
  const latestScan = scans[0];

  const chartData = useMemo(
    () => ({
      labels: (history?.riskTrend || []).map((s) =>
        new Date(s.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: t("scanHistory.riskScore", "Risk Score"),
          data: (history?.riskTrend || []).map((s) => s.riskScore),
          borderColor: "rgb(20, 184, 166)",
          backgroundColor: "rgba(20, 184, 166, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }),
    [history, t]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + "%",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const getRiskBadge = (status: Scan["riskLevel"]) => {
    switch (status) {
      case "low":
        return <Badge variant="success">{t("reports.risk.low", "Low Risk")}</Badge>;
      case "medium":
        return <Badge variant="warning">{t("reports.risk.medium", "Medium Risk")}</Badge>;
      case "high":
        return <Badge variant="danger">{t("reports.risk.high", "High Risk")}</Badge>;
    }
  };

  const getRiskIcon = (status: Scan["riskLevel"]) => {
    switch (status) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <RefreshCw className="w-10 h-10 text-teal-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">{t("scanHistory.loading", "Loading scan history...")}</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || scans.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate("/patient/reports")}
            className="mb-4"
          >
            {t("reports.back", "Back to Reports")}
          </Button>
          <Card className="p-12 text-center">
            <Image className="w-14 h-14 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("scanHistory.noScans", "No scans yet")}</h1>
            <p className="text-slate-600 mb-6">{error || t("scanHistory.noScansDesc", "Your saved scan history will appear here.")}</p>
            <Button onClick={() => navigate("/patient/upload")}>{t("dashboard.scans.startBtn", "Start New Scan")}</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate("/patient/reports")}
            className="mb-4"
          >
            {t("reports.back", "Back to Reports")}
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("scanHistory.title", "Scan History & Trends")}</h1>
              <p className="text-slate-600">{t("scanHistory.subtitle", "Track your oral health over time")}</p>
            </div>
          </div>
        </div>

        {latestScan && (
          <Card className="p-6 mb-8 border-2 border-teal-200 bg-teal-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                  {getRiskIcon(latestScan.riskLevel)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-700 mb-1">{t("scanHistory.latest", "Latest Scan")}</p>
                  <h2 className="text-xl font-bold text-slate-900">
                    {new Date(latestScan.createdAt).toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-700">
                    {getRiskBadge(latestScan.riskLevel)}
                    <span>{t("reports.riskScore", "Risk")}: {latestScan.riskScore}%</span>
                    <span>{t("reports.confidence", "Confidence")}: {latestScan.confidence}%</span>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate(`/patient/reports/${latestScan.scanId}`)}>{t("scanHistory.viewLatest", "View Latest Result")}</Button>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{t("scanHistory.chart.title", "Risk Score Trend")}</h2>
            <p className="text-sm text-slate-600">{t("scanHistory.chart.desc", "Your saved risk scores over time")}</p>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard label={t("reports.stats.total", "Total Scans")} value={history?.summary.totalScans || 0} icon={Image} />
          <SummaryCard label={t("reports.stats.avgRisk", "Avg. Risk Score")} value={`${history?.summary.avgRiskScore || 0}%`} icon={TrendingUp} />
          <SummaryCard label={t("reports.stats.lowRisk", "Low Risk Scans")} value={history?.summary.lowRiskScans || 0} icon={CheckCircle} />
          <SummaryCard label={t("reports.stats.confidence", "Avg. Confidence")} value={`${history?.summary.avgConfidence || 0}%`} icon={AlertCircle} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("scanHistory.timeline", "Scan Timeline")}</h2>
          <div className="space-y-4">
            {scans.map((scan, index) => (
              <Card key={scan.scanId} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${scan.riskLevel === "low" ? "bg-green-100" : scan.riskLevel === "medium" ? "bg-amber-100" : "bg-red-100"}`}>
                      {getRiskIcon(scan.riskLevel)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {index === 0 ? t("scanHistory.latest", "Latest Scan") : `${t("scanHistory.scan", "Scan")} #${scans.length - index}`}
                        </h3>
                        {getRiskBadge(scan.riskLevel)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(scan.createdAt).toLocaleDateString()}</span>
                        <span>{t("reports.riskScore", "Risk")}: {scan.riskScore}%</span>
                        <span>{t("reports.confidence", "Confidence")}: {scan.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/patient/reports/${scan.scanId}`)}>{t("scanHistory.viewDetails", "View Details")}</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {history?.healthInsights && (
          <Card className="p-6 mt-8 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{t("scanHistory.insights", "Health Insights")}</h3>
                <p className="text-sm text-slate-700 mb-3">{history.healthInsights.message}</p>
                <p className="text-sm text-slate-700"><strong>{t("scanHistory.recommendation", "Recommendation")}:</strong> {history.healthInsights.recommendation}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, subtext }: any) {
  return (
    <Card className="p-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </Card>
  );
}
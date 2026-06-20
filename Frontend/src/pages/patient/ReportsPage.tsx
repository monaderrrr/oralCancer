import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, AlertCircle, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import API from '../../Api';

/**
 * ReportsPage (based on Scans API)
 * Backend endpoint used:
 * GET /api/v1/patient/scans/history
 */

interface Report {
  _id?: string;
  id?: string;
  scanId?: string;
  date: string;
  createdAt?: string;
  type?: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  status?: string;
  reviewStatus?: string;
  doctorReview?: {
    doctorName?: string;
  };
  findings: string;
  recommendations?: string;
  riskScore?: number;
}

export function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch all scans (used as reports)
   */
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);

        const response = await API.get('/api/v1/scans/history?page=1&limit=50');

        const data = response.data?.data?.scans || [];
        setReports(
          data.map((scan: any) => ({
            ...scan,
            id: scan.scanId,
            date: scan.createdAt,
            findings: scan.diagnosis || "AI scan report",
          }))
        );
      } catch (error) {
        console.error("Error fetching scans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  /**
   * Risk badge UI
   */
  const getRiskBadge = (risk: Report['riskLevel']) => {
    switch (risk) {
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="danger">High Risk</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  /**
   * Risk icon UI
   */
  const getRiskIcon = (risk: Report['riskLevel']) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  /**
   * Navigate to report detail page
   */
  const handleView = (id: string) => {
    navigate(`/patient/reports/${id}`);
  };

  /**
   * Download report (temporary JSON export since no backend PDF)
   */
  const handleDownload = (reportId: string) => {
    const report = reports.find(r => (r.scanId || r._id || r.id) === reportId);

    if (!report) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${reportId}.json`;
    a.click();
  };

  /**
   * Stats calculations
   */
  const latestRisk = reports.length > 0 ? reports[0].riskLevel : 'N/A';

  const avgConfidence = reports.length > 0
    ? Math.round(reports.reduce((acc, curr) => acc + curr.confidence, 0) / reports.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Medical Reports</h1>
              <p className="text-slate-600">
                View your scan history and results
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            <p className="mt-4 text-slate-500">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-slate-600 mb-4">
              Start your first scan to generate reports
            </p>
            <Button onClick={() => navigate('/patient/upload')}>
              Start New Scan
            </Button>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              <SummaryCard
                label="Total Scans"
                value={reports.length}
                icon={FileText}
              />

              <SummaryCard
                label="Latest Risk"
                value={latestRisk.toUpperCase()}
                icon={CheckCircle}
                subtext="From last scan"
              />

              <SummaryCard
                label="Avg Confidence"
                value={`${avgConfidence}%`}
                icon={TrendingUp}
              />

            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.scanId || report._id || report.id} className="p-6">

                  <div className="flex justify-between">

                    {/* Left */}
                    <div className="flex gap-4">

                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100">
                        {getRiskIcon(report.riskLevel)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            Scan Report
                          </h3>
                          {getRiskBadge(report.riskLevel)}
                        </div>

                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.date || report.createdAt || "").toLocaleDateString()}
                        </p>

                        <p className="text-sm text-slate-600 mt-2">
                          Risk Score: {report.riskScore || 'N/A'}%
                        </p>
                        {report.reviewStatus && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            <span>{report.reviewStatus}</span>
                            {report.reviewStatus === "Reviewed" && report.doctorReview?.doctorName ? (
                              <span className="text-slate-500">by Dr. {report.doctorReview.doctorName}</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(report.scanId || report._id || report.id!)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(report.scanId || report._id || report.id!)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                  </div>

                </Card>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

/**
 * Summary card component
 */
function SummaryCard({ label, value, icon: Icon, subtext }: any) {
  return (
    <Card className="p-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>

      <p className="text-2xl font-bold">{value}</p>

      {subtext && (
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      )}
    </Card>
  );
}

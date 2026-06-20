import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Calendar, Activity } from "lucide-react";
import { TopNavigation } from "../../components/timeline/TopNavigation";
import { TrendChart } from "../../components/progress/TrendChart";
import { Card } from "../../components/ui/Card";
import API from "../../Api";

export function ProgressPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    riskReduction: 0,
    daysActive: 0,
    goalsCompleted: 0,
  });

  const [milestones, setMilestones] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [goalsCount, setGoalsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ================= FETCH DATA =================
        const [scanRes, goalsRes] = await Promise.all([
          API.get("/api/v1/scans/history?page=1&limit=50"),
          API.get("/api/v1/patient/scans/history?limit=20"),
        ]);

        const scansData = scanRes.data?.data?.scans || [];
        const goalsData = goalsRes.data?.data?.scans || [];

        setGoalsCount(goalsData.length);

        // ================= SORT SCANS =================
        const sorted = [...scansData].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

        setScans(sorted);

        // ================= STATS =================
        const totalScans = sorted.length;

        const uniqueDays = new Set(
          sorted.map((s: any) => new Date(s.createdAt).toDateString())
        ).size;

        const highRisk = sorted.filter(
          (s: any) =>
            s.riskLevel === "high" ||
            s.aiResult?.diagnosis?.includes("Cancer")
        ).length;

        const riskReduction =
          totalScans > 0
            ? Math.round(((totalScans - highRisk) / totalScans) * 100)
            : 0;

        setStats({
          totalScans,
          riskReduction,
          daysActive: uniqueDays,
          goalsCompleted: goalsData.filter((g: any) => g.completed).length,
        });

        // ================= MILESTONES =================
        const mappedMilestones = sorted
          .filter((scan) => scan.createdAt)
          .map((scan) => {
            const risk =
              scan.riskLevel ||
              (scan.aiResult?.diagnosis?.includes("Cancer")
                ? "high"
                : "low");

            return {
              id: scan._id || scan.createdAt,
              title:
                risk === "high"
                  ? "High Risk Scan Detected"
                  : risk === "medium"
                  ? "Moderate Risk Scan"
                  : "Healthy Scan Recorded",

              description:
                scan.aiResult?.diagnosis
                  ? scan.aiResult.diagnosis
                  : `Risk level: ${risk}`,

              date: new Date(scan.createdAt).toLocaleDateString(),
            };
          })
          .reverse();

        setMilestones(mappedMilestones);
      } catch (err) {
        console.error("Progress Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return null;

  // ================= CHART DATA =================
  const chartData = [...scans]
    .filter((s) => s?.createdAt)
    .map((s) => {
      const riskLevel =
        s.riskLevel ||
        (s.aiResult?.diagnosis?.includes("Cancer")
          ? "high"
          : "low");

      const riskScore =
        s.riskScore ??
        (riskLevel === "high"
          ? 80
          : riskLevel === "medium"
          ? 50
          : 20);

      return {
        date: s.createdAt,
        riskScore,
        riskLabel:
          riskLevel === "high"
            ? "High"
            : riskLevel === "medium"
            ? "Medium"
            : "Low",
      };
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <TopNavigation />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Your Health Journey
          </h1>
          <p className="text-slate-600">
            Track your progress and celebrate your milestones.
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <Card className="p-4 text-center">
            <Activity className="mx-auto mb-2 text-teal-600" />
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <div className="text-xs text-slate-500">Total Scans</div>
          </Card>

          <Card className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 text-emerald-600" />
            <div className="text-2xl font-bold">{stats.riskReduction}%</div>
            <div className="text-xs text-slate-500">Risk Reduced</div>
          </Card>

          <Card className="p-4 text-center">
            <Calendar className="mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.daysActive}</div>
            <div className="text-xs text-slate-500">Days Active</div>
          </Card>

          {/* ✅ HERE IS YOUR FIX */}
          <Card className="p-4 text-center">
            <Award className="mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{goalsCount}</div>
            <div className="text-xs text-slate-500">Goals</div>
          </Card>

        </div>

        {/* ================= CHART ================= */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">
            Risk Score Trend
          </h2>

          <TrendChart data={chartData} />
        </Card>

        {/* ================= MILESTONES ================= */}
        <h2 className="text-xl font-bold mb-4">
          Milestones & Achievements
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestones.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 border-l-4 border-teal-500">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{m.title}</span>
                  <span className="text-xs text-slate-400">
                    {m.date}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {m.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
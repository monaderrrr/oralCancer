import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  FileText,
  AlertTriangle,
  Menu,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DoctorSidebar } from "../../components/doctor/DoctorSidebar";
import { ActivityFeedItem } from "../../components/doctor/ActivityFeedItem";
import { useDoctor } from "../../contexts/DoctorContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next"; 

export function DashboardPage() {
  const { t } = useTranslation(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useAuth();
  const { dashboard, activity, loading, refreshDashboard } = useDoctor();

  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};

  const weeklyScans = charts.weeklyScans || [];
  const patientGrowth = charts.patientGrowth || [];
  const risk = charts.riskDistribution || { low: 0, medium: 0, high: 0 };

  const activityList = useMemo(() => {
    if (Array.isArray(activity)) return activity;
    return activity?.recentActivity || [];
  }, [activity]);

  const RISK_COLORS = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
  };

  const riskDistributionData = useMemo(() => {
    return [
      { name: t('riskLevels.low', 'Low'), value: risk.low, color: RISK_COLORS.low },
      { name: t('riskLevels.medium', 'Medium'), value: risk.medium, color: RISK_COLORS.medium },
      { name: t('riskLevels.high', 'High'), value: risk.high, color: RISK_COLORS.high },
    ].filter((i) => i.value > 0);
  }, [risk, t]);

  useEffect(() => {
    refreshDashboard();
  }, []);

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">{t('preview.loading', 'Loading Dashboard...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DoctorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center text-left">
          <button
            className="lg:hidden p-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <h1 className="text-xl lg:text-2xl font-bold">
              {t('dashboard.welcome', 'Welcome')}, {t('sidebar.doctorPrefix', 'Dr.')} {user?.fullName?.split(" ")[0] || "Doctor"}
            </h1>
            <p className="text-sm text-slate-500">
              {t('dashboard.overview', 'Clinic Overview Dashboard')}
            </p>
          </div>

          <Button
            onClick={refreshDashboard}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t('dashboard.refreshBtn', 'Refresh')}
          </Button>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8 text-left">
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-5 border-l-4 border-teal-500 flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">{t('sidebar.patients', 'Patients')}</p>
                  <h2 className="text-3xl font-bold">
                    {stats.totalPatients ?? 0}
                  </h2>
                </div>
                <Users className="text-teal-500" />
              </Card>

              <Card className="p-5 border-l-4 border-blue-500 flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">{t('dashboard.stats.todayScans', "Today's Scans")}</p>
                  <h2 className="text-3xl font-bold">
                    {stats.newScansToday ?? 0}
                  </h2>
                </div>
                <FileText className="text-blue-500" />
              </Card>

              <Card className="p-5 border-l-4 border-red-500 flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">{t('dashboard.stats.highRisk', 'High Risk')}</p>
                  <h2 className="text-3xl font-bold text-red-600">
                    {stats.highRiskCases ?? 0}
                  </h2>
                </div>
                <AlertTriangle className="text-red-500" />
              </Card>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-teal-600" /> {t('dashboard.charts.weeklyTitle', 'Weekly Scans')}
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyScans}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="scans" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold mb-4">{t('dashboard.charts.growthTitle', 'Patient Growth')}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={patientGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* RISK + ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">{t('dashboard.charts.riskDistribution', 'Risk Distribution')}</h3>
                {riskDistributionData.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={80}
                      >
                        {riskDistributionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-400 py-12">
                    {t('chart.noData', 'No data available')}
                  </p>
                )}
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h3 className="font-bold mb-4">{t('dashboard.recentActivity', 'Recent Activity')}</h3>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {activityList.length ? (
                    activityList.map((item) => (
                      <ActivityFeedItem key={item.id} {...item} />
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-12">
                      {t('activity.noDetails', 'No activity found')}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
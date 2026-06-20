import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Flame,
  Activity,
  AlertTriangle,
  Shield,
} from "lucide-react";

import { TopNavigation } from "../../components/timeline/TopNavigation";
import { Card } from "../../components/ui/Card";
import API from "../../Api";

/* ================= TYPES ================= */

type Scan = {
  scanId: string;
  riskLevel: "high" | "medium" | "low";
  confidence?: number;
  riskScore?: number;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  progress: number;
  streak: number;
  completed: boolean;
  icon: any;
  color: string;
};

type Activity = {
  id: string;
  title?: string;
  description?: string;
  timestamp?: string;
};

/* ================= COMPONENT ================= */

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);

        const [activityRes, scanRes] = await Promise.all([
          API.get("/api/v1/patient/activity"),
          API.get("/api/v1/patient/scans/history?limit=20"),
        ]);

        const activities: Activity[] =
          activityRes.data?.data?.activities || [];

        const scans: Scan[] = scanRes.data?.data?.scans || [];

        /* ================= REMINDERS ================= */
        setReminders(activities.slice(0, 5));

        /* ================= GROUP SCANS ================= */
        const grouped: Record<"high" | "medium" | "low", Scan[]> = {
          high: [],
          medium: [],
          low: [],
        };

        scans.forEach((scan) => {
          const risk = scan.riskLevel || "low";
          grouped[risk].push(scan);
        });

        /* ================= BUILD GOALS ================= */

        const goalsData: Goal[] = [];

        const calcAvg = (arr: Scan[]) => {
          if (!arr.length) return 0;
          return (
            arr.reduce(
              (sum, s) => sum + (s.confidence ?? s.riskScore ?? 0),
              0
            ) / arr.length
          );
        };

        /* 🔴 HIGH RISK */
        if (grouped.high.length > 0) {
          goalsData.push({
            id: "high-risk",
            title: "Urgent medical follow-up required",
            description:
              "High risk detected in multiple scans. Please consult a specialist immediately.",
            progress: Math.round(calcAvg(grouped.high)),
            streak: grouped.high.length,
            completed: false,
            icon: AlertTriangle,
            color: "text-red-500",
          });
        }

        /* 🟡 MEDIUM RISK */
        if (grouped.medium.length > 0) {
          goalsData.push({
            id: "medium-risk",
            title: "Monitor your oral health closely",
            description:
              "Regular scans are recommended to track changes in your condition.",
            progress: Math.round(calcAvg(grouped.medium)),
            streak: grouped.medium.length,
            completed: false,
            icon: Flame,
            color: "text-orange-500",
          });
        }

        /* 🟢 LOW RISK */
        if (grouped.low.length > 0) {
          goalsData.push({
            id: "low-risk",
            title: "Healthy status maintained",
            description:
              "Your condition is stable. Keep maintaining your routine.",
            progress: Math.round(calcAvg(grouped.low)),
            streak: grouped.low.length,
            completed: true,
            icon: Shield,
            color: "text-emerald-600",
          });
        }

        setGoals(goalsData);
      } catch (err) {
        console.error("Goals error:", err);
        setGoals([]);
        setReminders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <TopNavigation />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Health Goals</h1>
          <p className="text-slate-600">
            AI-powered goals derived from your scan history
          </p>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ================= GOALS ================= */}
            <div className="lg:col-span-2 space-y-6">

              <h2 className="text-xl font-bold">Your Active Goals</h2>

              {goals.length === 0 ? (
                <p className="text-slate-500">No goals available</p>
              ) : (
                goals.map((goal) => {
                  const Icon = goal.icon;

                  return (
                    <motion.div key={goal.id} whileHover={{ scale: 1.02 }}>
                      <Card className="p-6">

                        <div className="flex gap-3">

                          <Icon className={`${goal.color} w-5 h-5 mt-1`} />

                          <div className="flex-1">

                            <h3 className="font-bold text-lg">
                              {goal.title}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {goal.description}
                            </p>

                            {/* progress */}
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-sm mt-3">

                              <span className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                {goal.streak} scan streak
                              </span>

                              {goal.completed && (
                                <span className="text-emerald-600 flex items-center gap-1 font-medium">
                                  <Check className="w-4 h-4" />
                                  Stable
                                </span>
                              )}

                            </div>

                          </div>
                        </div>

                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ================= REMINDERS ================= */}
            <div>

              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

              <Card className="p-4">

                {reminders.length === 0 ? (
                  <p className="text-slate-500">No activity</p>
                ) : (
                  reminders.map((r) => (
                    <div key={r.id} className="flex gap-3 py-3 border-b">

                      <Activity className="text-teal-600 w-4 h-4 mt-1" />

                      <div>
                        <p className="font-medium">
                          {r.title || r.description}
                        </p>

                        <p className="text-xs text-slate-500">
                          {r.timestamp
                            ? new Date(r.timestamp).toLocaleString()
                            : ""}
                        </p>
                      </div>

                    </div>
                  ))
                )}

              </Card>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
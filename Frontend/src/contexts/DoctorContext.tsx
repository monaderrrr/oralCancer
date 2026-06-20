import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { getDoctorDashboard, getDoctorActivity } from "../services/DoctorService";
import { useAuth } from "./AuthContext";

interface DoctorContextType {
  dashboard: any;
  activity: any[];
  loading: boolean;
  refreshDashboard: () => Promise<void>;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

const INITIAL_DASHBOARD = {
  stats: {
    totalPatients: 0,
    newScansToday: 0,
    highRiskCases: 0,
  },
  charts: {
    weeklyScans: [],
    patientGrowth: [],
    riskDistribution: { low: 0, medium: 0, high: 0 },
  },
};

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(INITIAL_DASHBOARD);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchedRef = useRef(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [dashRes, actRes] = await Promise.all([
        getDoctorDashboard(),
        getDoctorActivity(),
      ]);
        console.log("DASH:", dashRes);
    console.log("ACTIVITY:", actRes);

      // DASHBOARD SAFE PARSING
      setDashboard({
        stats: dashRes?.stats ?? INITIAL_DASHBOARD.stats,
        charts: {
          weeklyScans: dashRes?.charts?.weeklyScans ?? [],
          patientGrowth: dashRes?.charts?.patientGrowth ?? [],
          riskDistribution: dashRes?.charts?.riskDistribution ?? {
            low: 0,
            medium: 0,
            high: 0,
          },
        },
      });

      // ACTIVITY SAFE PARSING
      setActivity(
        actRes?.activities ??
        actRes?.recentActivity ??
        actRes ??
        []
      );

    } catch (err) {
      console.error("Doctor Context Error:", err);
      setDashboard(INITIAL_DASHBOARD);
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    await fetchData();
  };

  useEffect(() => {
    if (!user || user.role !== "doctor") return;
    if (fetchedRef.current) return;

    fetchedRef.current = true;
    fetchData();
  }, [user]);

  return (
    <DoctorContext.Provider value={{ dashboard, activity, loading, refreshDashboard }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const context = useContext(DoctorContext);
  if (!context) throw new Error("useDoctor must be used inside DoctorProvider");
  return context;
}
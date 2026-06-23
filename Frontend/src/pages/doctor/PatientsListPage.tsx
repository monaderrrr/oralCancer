import React, { useState, useEffect } from "react";
import { Search, Menu, Users, RefreshCw } from "lucide-react";
import { DoctorSidebar } from "../../components/doctor/DoctorSidebar";
import { PatientCard } from "../../components/doctor/PatientCard";
import API from "../../Api";
import socket from "../../socket/Socket";
import { useTranslation } from "react-i18next"; 

interface Patient {
  patientId: string;
  name?: string;
  fullName?: string;

  lastScanDate: string | null;
  currentRiskLevel: "high" | "medium" | "low" | "unknown";

  lesionType: string | null;
  diagnosis: string | null;
}

export function PatientsListPage() {
  const { t } = useTranslation(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [riskFilter, setRiskFilter] = useState("all");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // ================= DEBOUNCE =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ================= FETCH =================
  const fetchPatients = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/v1/doctor/patients", {
        params: {
          searchQuery: debouncedSearch,
          page: pagination.page,
          limit: 12,
          filterType: riskFilter,
        },
      });

      const data = res?.data?.data;

      let mapped: Patient[] = (data?.patients || []).map((p: any) => ({
        patientId: p.patientId,
        name: p.name,
        fullName: p.fullName,

        lastScanDate: p.lastScanDate || null,
        currentRiskLevel: p.currentRiskLevel || "unknown",

        lesionType: p.lesionType || null,
        diagnosis: p.diagnosis || null,
      }));

      // 🔥 FILTER FRONT
      if (riskFilter !== "all") {
        mapped = mapped.filter(
          (p) => p.currentRiskLevel === riskFilter
        );
      }

      // 🔥 SEARCH FRONT
      if (debouncedSearch) {
        mapped = mapped.filter((p) =>
          (p.fullName || p.name || "")
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        );
      }

      setPatients(mapped);

      setPagination((prev) => ({
        ...prev,
        total: data?.pagination?.total || 0,
        pages: data?.pagination?.pages || 1,
      }));
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    fetchPatients();
  }, [debouncedSearch, pagination.page, riskFilter]);

  // ================= REALTIME =================
  useEffect(() => {
    socket.on("scan_created", fetchPatients);
    socket.on("patient_updated", fetchPatients);

    return () => {
      socket.off("scan_created", fetchPatients);
      socket.off("patient_updated", fetchPatients);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">

      <DoctorSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="bg-white border-b lg:hidden">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="font-bold text-teal-700">Oral Scan</span>
            <button onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 text-left">
          <div className="max-w-7xl mx-auto space-y-6">

            <div>
              <h1 className="text-2xl font-bold">{t("patients.sharedTitle", "Shared Patients")}</h1>
              <p className="text-slate-500">
                {t("patients.sharedDesc", "Patients who shared scans with you")}
              </p>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  placeholder={t("payments.searchPlaceholder", "Search patients...")}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                />
              </div>

              {/* FILTER */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {["all", "high", "medium", "low"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setRiskFilter(type);
                      setPagination((p) => ({ ...p, page: 1 }));
                    }}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium uppercase tracking-wide transition ${
                      riskFilter === type
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {type === "all" ? t("notifications.tabs.all", "all") : t(`riskLevels.${type}`, type)}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="animate-spin w-8 h-8 text-teal-600" />
              </div>
            ) : patients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((p) => (
                  <PatientCard key={p.patientId} patient={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <Users className="mx-auto w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-medium">{t("patients.empty", "No Patients Found")}</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
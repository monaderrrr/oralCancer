import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Building2,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  RefreshCw,
  Stethoscope,
  Target,
  TrendingUp,
  Upload,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { TopNavigation } from "../../components/timeline/TopNavigation";
import { TodaysActions } from "../../components/timeline/TodaysActions";
import { TimelineEvent, TimelineEventData, EventType } from "../../components/timeline/TimelineEvent";
import API from "../../Api";

interface LatestScan {
  scanId: string;
  riskLevel: "low" | "medium" | "high";
  riskScore?: number;
  confidence?: number;
  diagnosis?: string;
  lesionType?: string | null;
  createdAt: string;
}

interface DashboardData {
  summary?: {
    totalScans?: number;
    pendingRecommendations?: number;
    latestScan?: LatestScan | null;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    status?: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

interface Place {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  type?: string;
}

const mapActivityType = (type: string): EventType => {
  const t = type.toUpperCase();
  if (t.includes("SCAN") || t.includes("REVIEWED")) return "scan";
  if (t.includes("RECOMMENDATION")) return "recommendation";
  if (t.includes("MESSAGE") || t.includes("CHAT")) return "message";
  if (t.includes("APPOINTMENT")) return "appointment";
  return "symptom";
};

const distanceInKm = (fromLat: number, fromLng: number, toLat?: number, toLng?: number) => {
  if (typeof toLat !== "number" || typeof toLng !== "number") return Number.POSITIVE_INFINITY;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) *
    Math.cos(toRad(toLat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const findNearest = <T extends Place>(places: T[], latitude: number, longitude: number) => {
  return places.reduce<T | null>((nearest, place) => {
    if (!nearest) return place;
    return distanceInKm(latitude, longitude, place.lat, place.lng) <
      distanceInKm(latitude, longitude, nearest.lat, nearest.lng)
      ? place
      : nearest;
  }, null);
};

const formatLastScan = (date?: string) => {
  if (!date) return "No saved scans yet";
  const scanDate = new Date(date);
  const diffMs = Date.now() - scanDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return `Today at ${scanDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [doctors, setDoctors] = useState<Place[]>([]);
  const [hospitals, setHospitals] = useState<Place[]>([]);
  const [nearestDoctor, setNearestDoctor] = useState<Place | null>(null);
  const [nearestHospital, setNearestHospital] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  // ✅ FIX HERE (only change)
  const startChat = async (doctorId: string) => {
    try {
      const res = await API.post("/api/v1/chat/conversations", {
        doctorId,
      });

      const conversationId = res.data?.data?._id;

      if (conversationId) {
        navigate(`/patient/chat/${conversationId}`);
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await API.get("/api/v1/patient/dashboard");
        setDashboard(res.data?.data || null);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // باقي الكود زي ما هو 100% بدون أي تغيير

  useEffect(() => {
    const loadPlaces = async (coords?: GeolocationCoordinates) => {
      setLoadingPlaces(true);
      try {
        const [doctorsRes, hospitalsRes] = await Promise.all([
          API.get("/api/v1/patient/doctors"),
          fetch(`${import.meta.env.VITE_AI_URL}/api/hospitals`).then(res => res.json()).catch(() => [])
        ]);

        const nextDoctors = (doctorsRes.data?.data || []).map((doc: any) => ({
          id: doc._id,
          name: doc.fullName,
          address: doc.clinicAddress || doc.address || "Mansoura, Egypt",
          type: doc.specialization || "Oral Health Specialist",
          lat: doc.lat,
          lng: doc.lng,
          rating: doc.rating || 4.5
        }));

        const nextHospitals = Array.isArray(hospitalsRes) ? hospitalsRes : [];

        setDoctors(nextDoctors);
        setHospitals(nextHospitals);

        if (coords) {
          setNearestDoctor(findNearest(nextDoctors, coords.latitude, coords.longitude));
          setNearestHospital(findNearest(nextHospitals, coords.latitude, coords.longitude));
        } else {
          setNearestDoctor(nextDoctors[0] || null);
          setNearestHospital(nextHospitals[0] || null);
        }
      } catch (error) {
        console.error("Error loading doctors/hospitals:", error);
      } finally {
        setLoadingPlaces(false);
      }
    };

    if (!navigator.geolocation) {
      loadPlaces();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => loadPlaces(position.coords),
      () => loadPlaces()
    );
  }, []);

  const latestScan = dashboard?.summary?.latestScan || null;

  const recentEvents: TimelineEventData[] = useMemo(
    () =>
      (dashboard?.recentActivity || []).slice(0, 5).map((activity) => ({
        id: activity.id,
        type: mapActivityType(activity.type),
        title: activity.title,
        description: activity.description,
        date: new Date(activity.timestamp),
        status: activity.status,
        urgency:
          activity.metadata?.riskLevel === "high"
            ? "high"
            : activity.metadata?.riskLevel === "medium"
              ? "medium"
              : undefined,
        metadata: activity.metadata,
      })),
    [dashboard]
  );

  const todayTasks = useMemo(
    () => [
      {
        id: "latest-scan",
        type: "task" as const,
        title: latestScan ? `Last scan: ${formatLastScan(latestScan.createdAt)}` : "Start your first oral scan",
        time: latestScan
          ? `${latestScan.riskLevel.toUpperCase()} risk${latestScan.riskScore ? ` • ${latestScan.riskScore}% score` : ""}`
          : "No scan has been saved for this account yet",
        urgent: latestScan?.riskLevel === "high",
      },
      ...(dashboard?.summary?.pendingRecommendations
        ? [
          {
            id: "recommendations",
            type: "task" as const,
            title: `${dashboard.summary.pendingRecommendations} recommendation(s) pending`,
            time: "Review your doctor follow-up guidance",
            urgent: true,
          },
        ]
        : []),
    ],
    [dashboard, latestScan]
  );

  const handleActionClick = (action: { id: string }) => {
    if (action.id === "latest-scan") {
      navigate(latestScan ? "/results" : "/patient/upload");
      return;
    }
    navigate("/patient/recommendations");
  };

  const recommendedPlaces = [
    nearestDoctor
      ? {
        kind: "doctor" as const,
        label: "Nearest Doctor",
        place: nearestDoctor,
        icon: Stethoscope,
        path: `/doctor-details/${nearestDoctor.id}`,
        accent: "teal",
      }
      : null,
    nearestHospital
      ? {
        kind: "hospital" as const,
        label: "Nearest Hospital",
        place: nearestHospital,
        icon: Building2,
        path: `/hospital-details/${nearestHospital.id}`,
        accent: "blue",
      }
      : null,
  ].filter(Boolean) as Array<{
    kind: "doctor" | "hospital";
    label: string;
    place: Place;
    icon: React.ElementType;
    path: string;
    accent: "teal" | "blue";
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <TopNavigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.fullName || user?.email || "Patient"}
          </h1>
          <p className="text-slate-600">Your latest scan, care actions, and nearby care options.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TodaysActions tasks={todayTasks} onActionClick={handleActionClick} />
          </div>

          <Card className="p-6 border-2 border-teal-100 bg-teal-50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                {loading ? (
                  <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                ) : (
                  <Activity className="w-6 h-6 text-teal-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-700 mb-1">Latest Scan</p>
                <h2 className="text-xl font-bold text-slate-900">{formatLastScan(latestScan?.createdAt)}</h2>
                <p className="text-sm text-slate-700 mt-2">
                  {latestScan
                    ? `${latestScan.diagnosis || latestScan.riskLevel} • Confidence ${latestScan.confidence ?? 0}%`
                    : "Run a scan to start tracking your oral health history."}
                </p>
                <Button className="mt-4" onClick={() => navigate(latestScan ? "/results" : "/patient/upload")}>
                  {latestScan ? "View Result" : "New Scan"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended Nearby Care</h2>
              <p className="text-sm text-slate-600">
                Showing all available doctors and hospitals, with the nearest options highlighted.
              </p>
            </div>
            {loadingPlaces && <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {recommendedPlaces.map((item) => {
              const Icon = item.icon;
              const isDoctor = item.kind === "doctor";
              return (
                <Card
                  key={item.kind}
                  className={`p-5 border-2 ${isDoctor ? "border-teal-300 bg-teal-50" : "border-blue-300 bg-blue-50"
                    } shadow-md`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDoctor ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isDoctor ? "info" : "default"}>Recommended</Badge>
                        <span className="text-xs text-slate-500">{item.label}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 truncate">{item.place.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.place.address || item.place.type}</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" onClick={() => navigate(item.path)}>
                          View Location
                        </Button>
                        {isDoctor && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startChat(item.place.id)}
                            leftIcon={<MessageCircle className="w-4 h-4" />}
                          >
                            Message
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Doctors</h3>
                  <p className="text-sm text-slate-600">{doctors.length} available across all locations</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/patient/doctors")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {doctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{doctor.name}</p>
                      <p className="text-xs text-slate-500 truncate">{doctor.address || doctor.type}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => startChat(doctor.id)}>
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Hospitals</h3>
                  <p className="text-sm text-slate-600">{hospitals.length} available across all locations</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/patient/hospitals")}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {hospitals.slice(0, 3).map((hospital) => (
                  <button
                    key={hospital.id}
                    onClick={() => navigate(`/hospital-details/${hospital.id}`)}
                    className="w-full text-left flex items-center justify-between gap-3 border-t border-slate-100 pt-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{hospital.name}</p>
                      <p className="text-xs text-slate-500 truncate">{hospital.address}</p>
                    </div>
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { title: "New Scan", icon: Upload, path: "/patient/upload", color: "teal" },
            { title: "Education", icon: BookOpen, path: "/patient/education", color: "blue" },
            { title: "Risk Quiz", icon: ClipboardCheck, path: "/patient/risk-assessment", color: "emerald" },
            { title: "My Goals", icon: Target, path: "/patient/goals", color: "amber" },
            { title: "Progress", icon: TrendingUp, path: "/patient/progress", color: "cyan" },
            { title: "Family Hub", icon: Users, path: "/patient/family", color: "indigo" },
            { title: "Community", icon: Users, path: "/patient/community", color: "rose" },
            { title: "Billing & Invoices", icon: CreditCard, path: "/patient/invoices", color: "purple" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.path} className="p-4 border-2 border-slate-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group">
                <button onClick={() => navigate(item.path)} className="w-full text-left">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                </button>
              </Card>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
                <p className="text-sm text-slate-600">Your latest saved health events</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => navigate("/patient/doctors")}>
              View All
            </Button>
          </div>

          {recentEvents.length > 0 ? (
            <div className="space-y-0">
              {recentEvents.map((event, index) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  index={index}
                  isLast={index === recentEvents.length - 1}
                  onClick={() => navigate(event.type === "scan" ? "/results" : "/patient/medical-history")}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">No recent activity yet</h3>
              <p className="text-sm text-slate-600 mb-4">Your scans and care updates will appear here.</p>
              <Button onClick={() => navigate("/patient/upload")}>Start New Scan</Button>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Filter, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TopNavigation } from "../../components/timeline/TopNavigation";
import { TimelineEvent, EventType, TimelineEventData } from "../../components/timeline/TimelineEvent";
import { TimelineFilters } from "../../components/timeline/TimelineFilters";
import API from "../../Api";

interface Activity {
  id: string;
  type: string;
  title?: string; 
  message?: string; 
  description?: string;
  status?: string;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

const mapActivityType = (type: string): EventType => {
  const t = type.toLowerCase(); 
  if (t.includes("scan")) return "scan";
  if (t.includes("recommendation")) return "recommendation";
  if (t.includes("message")) return "message";
  if (t.includes("symptom") || t.includes("alert")) return "symptom"; 
  return "symptom"; // Default fallback
};

const buildCounts = (events: TimelineEventData[]) => {
  const counts: Record<EventType | "all", number> = {
    all: events.length,
    scan: 0,
    symptom: 0,
    appointment: 0,
    recommendation: 0,
    message: 0,
  };

  events.forEach((event) => {
    if (counts[event.type] !== undefined) {
      counts[event.type]++;
    }
  });

  return counts;
};

export function MedicalHistoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EventType | "all">("all");
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/v1/patient/activity?limit=20");
        
        console.log("Activity API Response:", res.data);

        const activities: Activity[] = res.data?.data?.activities || [];
        
        const mappedEvents = activities.map((activity) => ({
          id: activity.id,
          type: mapActivityType(activity.type),
          title: activity.title || (activity.type === 'symptom' ? "Symptom Reported" : "Activity Log"),
          description: activity.message || activity.description || "No details available",
          date: new Date(activity.timestamp || activity.createdAt || Date.now()),
          status: activity.status,
          urgency: activity.metadata?.riskLevel === "high" ? "high" : 
                   activity.metadata?.riskLevel === "medium" ? "medium" : undefined,
          metadata: activity.metadata,
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error loading medical history:", err);
        setError("Could not load your medical history.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return events;
    return events.filter((event) => event.type === activeFilter);
  }, [activeFilter, events]);

  const eventCounts = useMemo(() => buildCounts(events), [events]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <TopNavigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical History</h1>
              <p className="text-slate-600">Complete timeline of your oral health journey</p>
            </div>

            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export History
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filter Events</h2>
          </div>
          <TimelineFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={eventCounts} />
        </motion.div>

        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-10 h-10 text-teal-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading medical history...</p>
          </Card>
        ) : error || filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {error ? "History unavailable" : "No Events Found"}
            </h3>
            <p className="text-slate-600 mb-6">
              {error || "No events match your current filter. Try selecting a different category."}
            </p>
            {activeFilter !== "all" ? (
              <Button onClick={() => setActiveFilter("all")}>Show All Events</Button>
            ) : (
              <Button onClick={() => navigate("/patient/upload")}>Start New Scan</Button>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="space-y-0">
                {filteredEvents.map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    index={index}
                    isLast={index === filteredEvents.length - 1}
                    onClick={() => {
                      if (event.type === "scan") navigate("/results");
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200"
            >
              <h3 className="font-semibold text-slate-900 mb-3">Timeline Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-teal-600">{eventCounts.scan}</p>
                  <p className="text-sm text-slate-600">Total Scans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{eventCounts.symptom}</p>
                  <p className="text-sm text-slate-600">Symptoms Tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{eventCounts.recommendation}</p>
                  <p className="text-sm text-slate-600">Recommendations</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
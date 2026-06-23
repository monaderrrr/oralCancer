import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Info, RefreshCw, Activity, ChevronLeft, MapPin } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { RiskScoreCard } from "../components/medical/RiskScoreCard";
import API from "../Api";
import { useTranslation } from "react-i18next"; 

interface AiResult {
  scanId?: string;
  status?: string;
  diagnosis?: string | null;
  lesion_type?: string | null;
  lesionType?: string | null;
  confidence?: number;
  riskScore?: number;
  riskLevel?: "low" | "medium" | "high";
  explanation?: string;
  date?: string;
  createdAt?: string;
}

interface Place {
  id: string | number;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

const distanceInKm = (fromLat: number, fromLng: number, toLat?: number, toLng?: number) => {
  if (typeof toLat !== "number" || typeof toLng !== "number") {
    return Number.POSITIVE_INFINITY;
  }
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

export function ResultsPage() {
  const { t } = useTranslation(); 
  const location = useLocation();
  const navigate = useNavigate();
  const [aiResult, setAiResult] = useState<AiResult | null>(location.state?.aiResult || null);
  const [nearestDoctor, setNearestDoctor] = useState<Place | null>(null);
  const [nearestHospital, setNearestHospital] = useState<Place | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingLatestScan, setLoadingLatestScan] = useState(!location.state?.aiResult);

  useEffect(() => {
    if (aiResult) return;

    const fetchLatestScan = async () => {
      setLoadingLatestScan(true);
      try {
        const res = await API.get("/api/v1/scans/history?page=1&limit=1");
        const latest = res.data?.data?.scans?.[0];

        if (latest) {
          setAiResult({
            scanId: latest.scanId,
            status: "SUCCESS",
            diagnosis: latest.diagnosis,
            lesion_type: latest.lesionType,
            confidence: latest.confidence || latest.riskScore || 0,
            riskScore: latest.riskScore,
            riskLevel: latest.riskLevel,
            date: latest.createdAt,
          });
        }
      } catch (error) {
        console.error("Error loading latest scan:", error);
      } finally {
        setLoadingLatestScan(false);
      }
    };

    fetchLatestScan();
  }, [aiResult]);

  useEffect(() => {
    const loadPlaces = async (coords?: GeolocationCoordinates) => {
      try {
        const [doctorsRes, hospitalsRes] = await Promise.all([
          API.get("/api/v1/patient/doctors").catch(() => ({ data: { data: [] } })),
          fetch("http://127.0.0.1:8000/api/hospitals"),
        ]);
        const doctors = (doctorsRes.data?.data || []).map((doctor: any) => ({
          id: doctor._id,
          name: doctor.fullName,
          address: doctor.clinicAddress || doctor.hospital,
          lat: doctor.lat,
          lng: doctor.lng,
        }));
        const hospitals = await hospitalsRes.json();

        if (coords) {
          setNearestDoctor(Array.isArray(doctors) ? findNearest(doctors, coords.latitude, coords.longitude) : null);
          setNearestHospital(Array.isArray(hospitals) ? findNearest(hospitals, coords.latitude, coords.longitude) : null);
        } else {
          setNearestDoctor(Array.isArray(doctors) ? doctors[0] || null : null);
          setNearestHospital(Array.isArray(hospitals) ? hospitals[0] || null : null);
        }
      } catch (error) {
        console.error("Error loading nearby places:", error);
      } finally {
        setLoadingLocation(false);
      }
    };

    if (!navigator.geolocation) {
      loadPlaces();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => loadPlaces(position.coords),
      (error) => {
        console.error("Location error:", error);
        loadPlaces();
      }
    );
  }, []);

  if (loadingLatestScan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="p-8 text-center max-w-md shadow-lg">
          <RefreshCw className="w-10 h-10 text-teal-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-slate-900">{t("results.loading", "Loading latest scan...")}</h2>
        </Card>
      </div>
    );
  }

  if (!aiResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="p-8 text-center max-w-md shadow-lg">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("results.noResults", "No Results to Display")}</h2>
          <p className="text-slate-600 mb-6">{t("results.noResultsDesc", "We could not find any saved analysis data. Please try scanning again.")}</p>
          <Button onClick={() => navigate("/upload")} className="w-full">{t("results.backToScan", "Return to Scan")}</Button>
        </Card>
      </div>
    );
  }

  const getRiskLevel = () => {
    if (aiResult.riskLevel) return aiResult.riskLevel;
    const diag = aiResult.diagnosis?.toLowerCase();
    if (diag === "cancer") return "high";
    if (diag === "pre-cancer") return "medium";
    return "low";
  };

  const confidenceValue = typeof aiResult.confidence === "number" ? aiResult.confidence : typeof aiResult.riskScore === "number" ? aiResult.riskScore : 0;
  const resultDate = aiResult.date || aiResult.createdAt;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate("/upload")} className="flex items-center gap-2 text-slate-500 hover:text-teal-600">
          <ChevronLeft className="w-4 h-4" /> {t("results.back", "Back")}
        </button>

        <RiskScoreCard
          riskLevel={getRiskLevel()}
          confidence={Math.min(100, confidenceValue)}
          date={resultDate ? new Date(resultDate).toLocaleDateString() : new Date().toLocaleDateString()}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-teal-600" /> {t("results.reportDetails", "AI Report Details")}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">{t("results.diagnosis", "Main Diagnosis:")}</span>
                <span className="font-bold text-slate-900">{aiResult.diagnosis || t("results.normal", "Normal")}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">{t("results.lesionType", "Lesion Type:")}</span>
                <span className="font-semibold text-slate-700">{aiResult.lesion_type || aiResult.lesionType || t("results.noLesion", "No lesions detected")}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">{t("results.status", "Analysis Status:")}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${aiResult.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {aiResult.status || "SUCCESS"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 text-white shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-teal-400">
              <Activity className="w-5 h-5" /> {t("results.recommendation", "Recommendation")}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {aiResult.explanation || t("results.defaultExplanation", "Our AI analysis is based on the provided image and medical history. Please consult a specialist to confirm these findings.")}
            </p>
            <Button onClick={() => navigate("/upload")} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" /> {t("results.newScan", "New Scan")}
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 cursor-pointer border rounded-xl bg-white hover:shadow-xl transition-all duration-300 flex items-center gap-4" onClick={() => navigate(nearestDoctor?.id ? `/doctor-details/${nearestDoctor.id}` : "/patient/doctors")}>
            <div className="bg-teal-100 p-3 rounded-full text-teal-700"><MapPin className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-900">{t("results.nearestDoctor", "Nearest Doctor")}</h4>
              <p className="text-sm text-gray-500">{loadingLocation ? t("results.detecting", "Detecting location...") : nearestDoctor?.name || t("results.viewDoctors", "Click to view doctors")}</p>
            </div>
          </div>
          <div className="p-5 cursor-pointer border rounded-xl bg-white hover:shadow-xl transition-all duration-300 flex items-center gap-4" onClick={() => navigate(nearestHospital?.id ? `/hospital-details/${nearestHospital.id}` : "/patient/hospitals")}>
            <div className="bg-blue-100 p-3 rounded-full text-blue-700"><MapPin className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-slate-900">{t("results.nearestHospital", "Nearest Hospital")}</h4>
              <p className="text-sm text-gray-500">{loadingLocation ? t("results.detecting", "Detecting location...") : nearestHospital?.name || t("results.viewHospitals", "Click to view hospitals")}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border rounded">
          <p className="text-xs text-amber-800">{t("results.disclaimer", "This is not a medical diagnosis. Please consult a doctor.")}</p>
        </div>
      </div>
    </div>
  );
}
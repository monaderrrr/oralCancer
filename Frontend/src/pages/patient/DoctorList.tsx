import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Api";
import { DoctorCard } from "../../components/doctor/DoctorCard";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next"; 

interface Doctor {
  _id: string;
  fullName: string;
  specialization?: string; 
  clinicAddress?: string;
  hospital?: string;        
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  profileImage?: string;
  rating?: number;
  createdAt?: string;
}

export function DoctorsListPage() {
  const { t } = useTranslation(); 
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get("/api/v1/patient/doctors");

        const data = res.data?.data;

        if (!Array.isArray(data)) {
          console.error("Invalid response:", res.data);
          throw new Error("Invalid doctors data from server");
        }

        setDoctors(data);

      } catch (err: any) {
        console.error("Fetch doctors error:", err);

        setError(
          err?.response?.data?.message ||
          t("auth.errors.fetchFailed", "Failed to load doctors. Please try again.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [t]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // ================= ERROR =================
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-500 font-medium">{error}</p>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
        >
          {t("paymentError.retryBtn", "Retry")}
        </button>
      </div>
    );
  }

  // ================= EMPTY =================
  if (!doctors.length) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        {t("admin.sections.noDoctors", "No doctors available")}
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        {t("sidebar.doctors", "All Doctors")}
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

        {doctors.map((doc) => (
          <DoctorCard
            key={doc._id}
            doctor={doc}
            onSelect={(id) => navigate(`/doctor-details/${id}`)}
          />
        ))}

      </div>

    </div>
  );
}
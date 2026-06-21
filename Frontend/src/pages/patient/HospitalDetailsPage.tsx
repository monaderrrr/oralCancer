import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Star } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

interface Hospital {
  id: number;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
}

export function HospitalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_AI_URL}/api/hospitals/${id}`);
        const data = await res.json();
        setHospital(data?.error ? null : data);
      } catch (error) {
        console.error("Error loading hospital:", error);
        setHospital(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <Button onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Hospital not found</h1>
            <p className="text-slate-600 mb-6">We could not find details for this hospital.</p>
            <Button onClick={() => navigate("/patient/hospitals")}>View Hospitals</Button>
          </Card>
        </div>
      </div>
    );
  }

  const mapsUrl =
    hospital.lat && hospital.lng
      ? `https://www.google.com/maps?q=${hospital.lat},${hospital.lng}`
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <Button onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
              {hospital.name?.charAt(0) || "H"}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{hospital.name}</h1>
              <p className="text-gray-500">Hospital / Clinic</p>

              <div className="flex items-center gap-4 mt-2">
                {hospital.rating && (
                  <span className="text-yellow-500 text-lg flex items-center gap-1">
                    <Star className="w-5 h-5 fill-current" /> {hospital.rating}
                  </span>
                )}
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Available
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6 space-y-4 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold">Hospital Information</h2>

            {hospital.address && (
              <div className="flex items-center gap-2">
                <MapPin className="text-red-500 w-5 h-5" />
                <span>{hospital.address}</span>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold">Location</h2>

            {mapsUrl ? (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </a>
            ) : (
              <p className="text-sm text-slate-600">No map location is available.</p>
            )}
          </Card>
        </div>

        {hospital.lat && hospital.lng && (
          <div className="mt-6 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              title={`${hospital.name} location`}
              width="100%"
              height="320"
              loading="lazy"
              src={`https://www.google.com/maps?q=${hospital.lat},${hospital.lng}&output=embed`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import API from "../../Api";

interface Doctor {
  id: number;
  name: string;
  type: string;
  rating?: number;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  facebook?: string;
  working_days?: string;
}

export function BookDoctorPage() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [city, setCity] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [debouncedCity, setDebouncedCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city);
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  useEffect(() => {
    const fetchDoctors = async () => {
  setLoading(true);

  try {
    const res = await API.get("/api/v1/patient/doctors", {
      params: debouncedCity ? { city: debouncedCity } : {}
    });

    setDoctors(res.data?.data || res.data || []);
  } catch (err) {
    console.error("ERROR:", err);
    setDoctors([]);
  }

  setLoading(false);
};
    fetchDoctors();
  }, [debouncedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/patient/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Doctors Near You
          </h1>

          <p className="text-slate-600">
            Search doctors by city, view details, or send a message
          </p>
        </motion.div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search city (e.g. Mansoura)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-4">

            {loading && (
              <div className="text-center text-gray-500">
                ⏳ Loading doctors...
              </div>
            )}

            {!loading && doctors.length === 0 && (
              <p className="text-gray-500">No doctors found</p>
            )}

            {!loading && doctors.slice(0, visibleCount).map((doctor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  onClick={() => navigate(`/doctor-details/${doctor.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="p-6 hover:shadow-lg transition">

                    <div className="flex gap-4">

                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-xl font-bold text-teal-700">
                        {doctor.name?.charAt(0) || "D"}
                      </div>

                      <div className="flex-1">

                        <h3 className="font-bold text-lg">
                          {doctor.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {doctor.type}
                        </p>

                        {doctor.lat && doctor.lng && (
                          <a
                            href={`https://www.google.com/maps?q=${doctor.lat},${doctor.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // 🔥 مهم
                            className="text-xs text-gray-500 mt-1 hover:underline block"
                          >
                            📍 {doctor.address}
                          </a>
                        )}

                        {doctor.rating && (
                          <p className="text-sm mt-1 text-yellow-500">
                            ⭐ {doctor.rating}
                          </p>
                        )}

                        <Badge className="mt-2">
                          Available
                        </Badge>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patient/chat/${doctor.id}`);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>

                      </div>
                    </div>

                  </Card>
                </div>
              </motion.div>
            ))}

            {visibleCount < doctors.length && (
              <div className="flex justify-center mt-6">
                <Button onClick={() => setVisibleCount(prev => prev + 4)}>
                  See More Doctors ↓
                </Button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

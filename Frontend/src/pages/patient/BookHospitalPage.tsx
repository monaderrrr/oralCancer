import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Hospital {
  id?: number;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
}

export function BookHospitalPage() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  // Cities list
  const cities = [
    "Cairo",
    "Mansoura",
    "Alexandria",
    "Tanta",
    "Zagazig",
    "Assiut"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCity(city);
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  useEffect(() => {
    setVisibleCount(5);
  }, [debouncedCity]);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);

      try {
        const url = debouncedCity
          ? `http://127.0.0.1:8000/api/hospitals?city=${debouncedCity}`
          : `http://127.0.0.1:8000/api/hospitals`;

        const res = await fetch(url);
        const data = await res.json();

        setHospitals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ERROR:", err);
        setHospitals([]);
      }

      setLoading(false);
    };

    fetchHospitals();
  }, [debouncedCity]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button onClick={() => navigate('/patient/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <h1 className="text-3xl font-bold mb-2">
            Hospitals Near You
          </h1>
        </motion.div>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2 rounded w-full mb-6"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {loading && <p>⏳ Loading hospitals...</p>}

        {!loading && hospitals.length === 0 && (
          <p>No hospitals found</p>
        )}

        <div className="space-y-4">
          {hospitals.slice(0, visibleCount).map((hospital, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className="p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => hospital.id && navigate(`/hospital-details/${hospital.id}`)}
              >
                <h3 className="font-bold text-lg">
                  {hospital.name}
                </h3>

                {hospital.address && (
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {hospital.address}
                  </p>
                )}

                {hospital.lat && hospital.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${hospital.lat},${hospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 text-sm mt-2 block"
                  >
                    Open in Maps
                  </a>
                )}

                {hospital.rating && (
                  <p className="mt-1">⭐ {hospital.rating}</p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {visibleCount < hospitals.length && (
          <div className="text-center mt-6">
            <Button onClick={() => setVisibleCount(prev => prev + 5)}>
              See More
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}


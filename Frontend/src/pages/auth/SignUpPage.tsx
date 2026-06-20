import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Mail, User, AlertCircle, MapPin, Building2, ExternalLink, LocateFixed, ShieldCheck, Stethoscope } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PasswordInput } from "../../components/ui/PasswordInput";
import logo from "../../assets/logo.png";
import API from "../../Api";

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const isPasswordStrong = passwordRegex.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // ✅ Validations
      if (!name.trim() || !email.trim() || !password || !confirmPassword)
        throw new Error("Please fill in all fields");
      if (!phone || !isValidPhoneNumber(phone))
        throw new Error("Please enter a valid phone number");
      
      // التحقق من حقول الطبيب إذا كان الدور دكتور
      if (role === "doctor") {
        if (!specialization.trim() || !hospital.trim() || !clinicAddress.trim()) {
          throw new Error("Please fill in your professional details (Specialization, Hospital, and Address)");
        }
        if (!googleMapsUrl.trim() && (lat === null || lng === null)) {
          throw new Error("Please add your clinic location from Google Maps or use current location.");
        }
      }

      if (!isPasswordStrong)
        throw new Error("Password is too weak");
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");

      const formData = {
        email: email.trim(),
        password,
        confirmPassword,
        role,
        fullName: name.trim(),
        phone,
        ...(role === "doctor" && { 
          specialization: specialization.trim(), 
          hospital: hospital.trim(),
          clinicAddress: clinicAddress.trim(),
          googleMapsUrl: googleMapsUrl.trim(),
          lat,
          lng
        })
      };

      await API.post("/auth/signUp", formData);

      // Navigate to verify code page
      navigate("/verify-code", { state: { email: email.trim(), flow: "signup", role } });

    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMapsUrlChange = (value: string) => {
    setGoogleMapsUrl(value);
    const coords = extractCoordinates(value);

    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      setLocationStatus("Location detected from Google Maps link.");
    } else if (value.trim()) {
      setLocationStatus("Google Maps link saved. Use current location too if you want nearest-doctor sorting.");
    } else {
      setLocationStatus("");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Your browser does not support location detection.");
      return;
    }

    setLocationStatus("Detecting your current location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGoogleMapsUrl(`https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`);
        setLocationStatus("Current location added.");
      },
      () => setLocationStatus("Could not detect location. Paste a Google Maps link instead.")
    );
  };

  const mapPreviewQuery =
    lat !== null && lng !== null
      ? `${lat},${lng}`
      : `${clinicAddress} ${hospital}`.trim();

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-teal-100 bg-white">
            <img src={logo} alt="OralScan AI Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-2xl text-slate-900">OralScan AI</span>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Card className="py-8 px-4 shadow-xl shadow-slate-200/70 sm:rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-teal-700 shadow-sm">
              {role === "doctor" ? <Stethoscope className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {role === "doctor" ? "Doctor verification starts here" : "Start your oral health journey"}
              </p>
              <p className="text-xs text-slate-600">A clean profile helps the platform guide you better.</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`py-2 text-sm font-medium rounded-md transition-all ${role === "patient" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                I'm a Patient
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`py-2 text-sm font-medium rounded-md transition-all ${role === "doctor" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                I'm a Doctor
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <InputField icon={<User className="h-5 w-5 text-slate-400" />} label="Full Name" value={name} onChange={setName} placeholder="Enter your full name" />
            <InputField icon={<Mail className="h-5 w-5 text-slate-400" />} label="Email" type="email" value={email} onChange={setEmail} placeholder="Enter your email" />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-600">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="EG"
                value={phone}
                onChange={setPhone}
                placeholder="Enter your phone number"
                className="w-full h-10 rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            {role === "doctor" && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-slate-700 text-sm">Professional Information</h3>
                <InputField 
                  icon={<User className="h-5 w-5 text-slate-400" />} 
                  label="Specialization" 
                  value={specialization} 
                  onChange={setSpecialization} 
                  placeholder="e.g. Oral Surgeon" 
                />
                <InputField 
                  icon={<Building2 className="h-5 w-5 text-slate-400" />} 
                  label="Hospital / Clinic Name" 
                  value={hospital} 
                  onChange={setHospital} 
                  placeholder="Enter hospital or clinic name" 
                />
                <InputField 
                  icon={<MapPin className="h-5 w-5 text-slate-400" />} 
                  label="Clinic Detailed Address" 
                  value={clinicAddress} 
                  onChange={setClinicAddress} 
                  placeholder="e.g. 15 El-Geish St, Mansoura" 
                />
                <div className="space-y-2">
                  <InputField
                    icon={<MapPin className="h-5 w-5 text-slate-400" />}
                    label="Google Maps Location"
                    value={googleMapsUrl}
                    onChange={handleGoogleMapsUrlChange}
                    placeholder="Paste Google Maps link or coordinates"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation}>
                      <LocateFixed className="w-4 h-4 mr-2" />
                      Use current location
                    </Button>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                      >
                        Open map <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {locationStatus && <p className="text-xs text-slate-500">{locationStatus}</p>}
                  {lat !== null && lng !== null && (
                    <p className="text-xs text-teal-700">
                      Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  )}
                  {mapPreviewQuery && (
                    <div className="h-40 overflow-hidden rounded-lg border border-slate-200">
                      <iframe
                        title="clinic-map-preview"
                        className="h-full w-full border-0"
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapPreviewQuery)}&output=embed`}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <PasswordInputField label="Password" value={password} onChange={setPassword} isStrong={isPasswordStrong} />
            <PasswordInputField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} match={password === confirmPassword && confirmPassword !== ""} />

            <Button type="submit" className="w-full flex justify-center py-2 px-4" isLoading={isLoading}>Create Account</Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

function InputField({ icon, label, value, onChange, type = "text", placeholder, className }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
        <Input type={type} className={`pl-10 ${className || ""}`} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />
      </div>
    </div>
  );
}

function PasswordInputField({ label, value, onChange, isStrong, match }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <PasswordInput value={value} onChange={e => onChange(e.target.value)} required />
      {value && isStrong !== undefined && <p className={`mt-1 text-[11px] ${isStrong ? "text-green-600" : "text-red-500"}`}>{isStrong ? "✓ Strong password" : "✗ Must be 8+ chars, 1 uppercase, 1 number"}</p>}
      {value && match !== undefined && <p className={`mt-1 text-[11px] ${match ? "text-green-600" : "text-red-500"}`}>{match ? "✓ Passwords match" : "✗ Passwords do not match"}</p>}
    </div>
  );
}

function extractCoordinates(value: string): { lat: number; lng: number } | null {
  const trimmed = value.trim();
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;

    const nextLat = Number(match[1]);
    const nextLng = Number(match[2]);

    if (
      Number.isFinite(nextLat) &&
      Number.isFinite(nextLng) &&
      nextLat >= -90 &&
      nextLat <= 90 &&
      nextLng >= -180 &&
      nextLng <= 180
    ) {
      return { lat: nextLat, lng: nextLng };
    }
  }

  return null;
}

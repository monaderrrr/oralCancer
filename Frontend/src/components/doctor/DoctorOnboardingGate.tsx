import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Check, Clock, CreditCard, Loader2, MapPin, Phone, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../Api";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { useAuth } from "../../contexts/AuthContext";

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const DURATIONS = [15, 30, 45, 60];

export function DoctorOnboardingGate() {
  const { user } = useAuth();
  const [showApproval, setShowApproval] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    workingDays: [1, 2, 3, 4],
    startTime: "09:00",
    endTime: "17:00",
    appointmentDuration: 30,
    clinicName: "",
    clinicPhone: "",
    clinicAddress: "",
    googleMapsUrl: "",
    lat: "",
    lng: "",
    consultationFee: "500",
  });

  useEffect(() => {
    if (user?.role !== "doctor" || user.status !== "approved") return;
    if (user.firstApprovalLoginPending) setShowApproval(true);
    else if (!user.doctorSetupCompleted || user.subscriptionStatus !== "active") setShowWizard(true);
  }, [user]);

  const toggleDay = (value: number) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(value)
        ? prev.workingDays.filter((day) => day !== value)
        : [...prev.workingDays, value].sort(),
    }));
  };

  const continueAfterApproval = async () => {
    try {
      await API.post("/api/v1/doctor/approval-welcome/complete");
      const stored = localStorage.getItem("oral_scan_user");
      if (stored) {
        localStorage.setItem("oral_scan_user", JSON.stringify({ ...JSON.parse(stored), firstApprovalLoginPending: false }));
      }
      setShowApproval(false);
      setShowWizard(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not continue");
    }
  };

  const saveSetup = async () => {
    try {
      setLoading(true);
      await API.post("/api/v1/doctor/setup", {
        ...form,
        appointmentDuration: Number(form.appointmentDuration),
        consultationFee: Number(form.consultationFee || 0),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      });
      toast.success("Clinic setup saved");
      setStep(3);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save setup");
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    try {
      setLoading(true);
      const res = await API.post("/api/v1/subscription/doctor/checkout");
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start Stripe Checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showApproval && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}>
              <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50">
                <motion.div className="absolute inset-0 rounded-full border-4 border-emerald-300" animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.15, 0.8] }} transition={{ repeat: Infinity, duration: 1.8 }} />
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring" }} className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                  <Check className="h-11 w-11" strokeWidth={3} />
                </motion.div>
              </div>
              <div className="mb-2 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-600">
                <Sparkles className="h-4 w-4" /> Approved
              </div>
              <h2 className="text-2xl font-bold text-slate-950">Your account has been approved successfully</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Set up your clinic schedule, location, and subscription to activate patient bookings.</p>
              <Button className="mt-7 w-full rounded-2xl py-3" onClick={continueAfterApproval}>Continue</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWizard && (
          <motion.div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/60 px-4 py-8 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mx-auto max-w-3xl">
              <Card className="overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <div className="border-b border-slate-100 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-teal-700">Doctor setup</p>
                  <h2 className="text-2xl font-bold text-slate-950">Activate your booking profile</h2>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["Schedule", "Clinic", "Subscription"].map((label, index) => (
                      <div key={label} className={`h-2 rounded-full ${step >= index + 1 ? "bg-teal-600" : "bg-slate-200"}`} />
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-lg font-bold text-slate-900"><CalendarDays className="h-5 w-5 text-teal-600" /> Clinic Schedule</div>
                      <div className="grid grid-cols-7 gap-2">
                        {DAYS.map((day) => (
                          <button key={day.value} onClick={() => toggleDay(day.value)} className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${form.workingDays.includes(day.value) ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                            {day.label}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Start time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                        <Input label="End time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">Appointment duration</p>
                        <div className="grid grid-cols-4 gap-2">
                          {DURATIONS.map((duration) => (
                            <button key={duration} onClick={() => setForm({ ...form, appointmentDuration: duration })} className={`rounded-2xl border py-3 text-sm font-bold ${form.appointmentDuration === duration ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 text-slate-600"}`}>
                              {duration} min
                            </button>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full rounded-2xl py-3" onClick={() => setStep(2)}>Next</Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2 text-lg font-bold text-slate-900"><MapPin className="h-5 w-5 text-teal-600" /> Clinic Information</div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input label="Clinic name" value={form.clinicName} onChange={(e) => setForm({ ...form, clinicName: e.target.value })} />
                        <Input label="Clinic phone" value={form.clinicPhone} onChange={(e) => setForm({ ...form, clinicPhone: e.target.value })} leftIcon={<Phone className="h-4 w-4" />} />
                      </div>
                      <Input label="Manual address" value={form.clinicAddress} onChange={(e) => setForm({ ...form, clinicAddress: e.target.value })} />
                      <Input label="Google Maps URL" value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input label="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                        <Input label="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                        <Input label="Visit fee (EGP)" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1 rounded-2xl py-3" onClick={() => setStep(1)}>Back</Button>
                        <Button className="flex-1 rounded-2xl py-3" onClick={saveSetup} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save setup"}</Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="py-8 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-950">Subscribe to activate bookings</h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Stripe Checkout will securely activate your profile after payment. Patients will see your available slots only after the subscription is active.</p>
                      <Button className="mt-6 rounded-2xl px-8 py-3" onClick={subscribe} disabled={loading}>{loading ? "Opening Stripe..." : "Continue to Stripe"}</Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

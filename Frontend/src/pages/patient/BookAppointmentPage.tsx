import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Phone,
  Smartphone,
  CheckCircle2,
  FileText,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  User,
  Heart,
  BadgeAlert,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";
import { Badge } from "../../components/ui/Badge";
import API, { IMAGE_BASE_URL } from "../../Api";

interface Slot {
  startTime: string;
  endTime: string;
  timeSlot: string;
  isAvailable: boolean;
  status: string;
}

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  hospital?: string;
  clinicAddress?: string;
  profileImage?: string;
  consultationFee?: number;
  rating?: number;
}

interface Scan {
  _id: string;
  scanId?: string;
  riskLevel: "low" | "medium" | "high";
  riskScore?: number;
  confidence?: number;
  diagnosis?: string;
  createdAt: string;
}

export function BookAppointmentPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Step 1 states: Date & Time Slot
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Step 2 states: Scan Selection & Notes
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Step 3 states: Payment Checkout
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "vodafone_cash" | "instapay">("credit_card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instapayAddress, setInstapayAddress] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Final confirmation
  const [createdBookingId, setCreatedBookingId] = useState("");
  const [createdInvoiceId, setCreatedInvoiceId] = useState("");

  // Dates list generator: next 10 days
  const dateOptions = React.useMemo(() => {
    const list = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 1; i <= 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      list.push({
        dateStr,
        dayName: days[d.getDay()],
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return list;
  }, []);

  // Fetch Doctor
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoadingDoctor(true);
        const res = await API.get(`/api/v1/doctor/doctor/${doctorId}`);
        setDoctor(res.data.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoadingDoctor(false);
      }
    };
    if (doctorId) {
      fetchDoc();
    }
  }, [doctorId]);

  // Fetch Slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !doctorId) return;
      try {
        setLoadingSlots(true);
        setSelectedSlot("");
        const res = await API.get(`/api/v1/booking/patient/doctor-availability/${doctorId}`, {
          params: { date: selectedDate },
        });
        setAvailableSlots(res.data.data.slots || []);
      } catch (err) {
        console.error("Error loading slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, doctorId]);

  // Fetch Scans for attachment
  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoadingScans(true);
        const res = await API.get("/api/v1/patient/scans/history");
        setScans(res.data?.data?.scans || []);
      } catch (err) {
        console.error("Error loading scans:", err);
      } finally {
        setLoadingScans(false);
      }
    };
    fetchScans();
  }, []);

  // Pre-select first date
  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].dateStr);
    }
  }, [dateOptions, selectedDate]);

  const handleNextStep = () => {
    if (step === 1 && !selectedSlot) {
      alert("Please select a time slot to continue.");
      return;
    }
    setErrorMsg("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep((prev) => prev - 1);
  };

  const handleSubmitBooking = async () => {
    if (!doctorId || !selectedDate || !selectedSlot) {
      setErrorMsg("Missing booking parameters.");
      return;
    }

    try {
      setSubmittingBooking(true);
      setErrorMsg("");

      // 1. Create pending booking
      const createRes = await API.post("/api/v1/booking/patient/bookings/create", {
        doctorId,
        date: selectedDate,
        timeSlot: selectedSlot,
        scanId: selectedScanId || undefined,
        notes: notes.trim(),
      });

      const booking = createRes.data.data;
      const bookingId = booking._id;

      // 2. Submit payment
      const paymentPayload: any = { paymentMethod };
      if (paymentMethod === "credit_card") {
        paymentPayload.cardInfo = {
          cardHolderName: cardHolder,
          cardNumber: cardNumber,
          expiryDate: expiry,
          cvv: cvv,
        };
      } else if (paymentMethod === "vodafone_cash") {
        paymentPayload.phoneNumber = phoneNumber;
      } else if (paymentMethod === "instapay") {
        paymentPayload.instapayAddress = instapayAddress;
      }

      const payRes = await API.post(`/api/v1/booking/patient/bookings/${bookingId}/pay`, paymentPayload);

      const { invoice } = payRes.data.data;

      setCreatedBookingId(bookingId);
      setCreatedInvoiceId(invoice._id || invoice.invoiceNumber);
      setStep(4);
    } catch (err: any) {
      console.error("Booking failed:", err);
      setErrorMsg(err.response?.data?.message || "Booking or Payment processing failed. Please check inputs.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <BadgeAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Doctor not found</h2>
        <Button className="mt-4" onClick={() => navigate("/patient/doctors")}>
          Return to Doctor List
        </Button>
      </div>
    );
  }

  const doctorPhoto = doctor.profileImage ? `${IMAGE_BASE_URL}${doctor.profileImage}` : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back and Title */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Consultation System</span>
            <h1 className="text-2xl font-bold text-slate-900">Book Premium Consultation</h1>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[
              { label: "Date & Time", stepNum: 1 },
              { label: "Scan & Notes", stepNum: 2 },
              { label: "Secure Payment", stepNum: 3 },
              { label: "Receipt", stepNum: 4 },
            ].map((item) => (
              <div key={item.stepNum} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition duration-300 ${
                    step >= item.stepNum
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {step > item.stepNum ? <CheckCircle2 className="w-5 h-5" /> : item.stepNum}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    step >= item.stepNum ? "text-teal-700 font-bold" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Booking Flow Panel */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Date & Time */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-teal-600" />
                        Select Date
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Choose a date for your digital or in-clinic consultation.
                      </p>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                      {dateOptions.map((opt) => (
                        <button
                          key={opt.dateStr}
                          onClick={() => setSelectedDate(opt.dateStr)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl border-2 w-24 transition duration-200 ${
                            selectedDate === opt.dateStr
                              ? "bg-teal-50 border-teal-500 text-teal-900 shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                            {opt.dayName.slice(0, 3)}
                          </span>
                          <span className="text-lg font-extrabold mt-1">{opt.label.split(" ")[1]}</span>
                          <span className="text-xs font-semibold text-slate-500 mt-0.5">
                            {opt.label.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-teal-600" />
                        Available Slots
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Select one of the doctor's available slots.</p>
                    </div>

                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                        <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-sm">No available slots for this date.</p>
                        <p className="text-xs mt-1">Please select another date above.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.timeSlot}
                            disabled={!slot.isAvailable}
                            onClick={() => setSelectedSlot(slot.timeSlot)}
                            className={`p-3.5 rounded-2xl border-2 text-center transition font-semibold text-sm ${
                              !slot.isAvailable
                                ? "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                                : selectedSlot === slot.timeSlot
                                ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-100 scale-[1.02]"
                                : "bg-white border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700"
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>

                  <div className="flex justify-end">
                    <Button size="lg" className="rounded-2xl px-8" onClick={handleNextStep}>
                      Continue <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Scan Attachment & Notes */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Attach Recent Scan (Optional)
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Linking a scan allows the doctor to review your AI analysis and lesion image prior to the session.
                      </p>
                    </div>

                    {loadingScans ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
                      </div>
                    ) : scans.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                        <p className="text-sm">No recent scans found.</p>
                        <p className="text-xs mt-1">You can skip scan attachment and upload one later.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {scans.map((scan) => (
                          <div
                            key={scan._id}
                            onClick={() => setSelectedScanId(selectedScanId === scan._id ? "" : scan._id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                              selectedScanId === scan._id
                                ? "bg-teal-50 border-teal-500 text-teal-900"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  scan.riskLevel === "high"
                                    ? "bg-red-500"
                                    : scan.riskLevel === "medium"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              <div>
                                <p className="font-semibold text-sm">
                                  {scan.diagnosis || `${scan.riskLevel.toUpperCase()} Risk Assessment`}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(scan.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(scan.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                            <Badge className="capitalize">
                              {scan.riskLevel}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-teal-600" />
                        Symptoms & Notes
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Describe any symptoms you've experienced (ulcers, swelling, patches) to help the specialist.
                      </p>
                    </div>

                    <Textarea
                      placeholder="Explain your symptoms or medical concern here..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[140px] rounded-2xl border-slate-200 focus:border-teal-500"
                    />
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="ghost" size="lg" className="rounded-2xl" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button size="lg" className="rounded-2xl px-8" onClick={handleNextStep}>
                      Continue <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment Checkout */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6"
                >
                  <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Secure Checkout</h2>
                      <p className="text-sm text-slate-500 mt-1">Select a secure payment gateway below.</p>
                    </div>

                    {/* Method Tabs */}
                    <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-4">
                      {[
                        { id: "credit_card", label: "Credit Card", icon: CreditCard },
                        { id: "vodafone_cash", label: "Vodafone Cash", icon: Phone },
                        { id: "instapay", label: "InstaPay", icon: Smartphone },
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition duration-200 ${
                              paymentMethod === m.id
                                ? "bg-teal-50 border-teal-500 text-teal-900 shadow-sm"
                                : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                            }`}
                          >
                            <Icon className="w-5 h-5 mb-1.5" />
                            <span className="text-xs font-bold">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Card Form */}
                    {paymentMethod === "credit_card" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 1234 5678"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase">CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Vodafone Cash */}
                    {paymentMethod === "vodafone_cash" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">Mobile Wallet Number</label>
                          <input
                            type="text"
                            placeholder="01012345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Enter the Vodafone Cash wallet number that will authorize this payment.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* InstaPay */}
                    {paymentMethod === "instapay" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase">InstaPay Address</label>
                          <input
                            type="text"
                            placeholder="username@instapay"
                            value={instapayAddress}
                            onChange={(e) => setInstapayAddress(e.target.value)}
                            className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-teal-500 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            A secure payment request will be sent to your InstaPay application.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </Card>

                  {errorMsg && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl text-red-700 text-sm">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="ghost" size="lg" className="rounded-2xl" onClick={handlePrevStep}>
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-2xl px-8 shadow-md"
                      onClick={handleSubmitBooking}
                      disabled={submittingBooking}
                    >
                      {submittingBooking ? "Authorizing..." : `Pay $${doctor.consultationFee ?? 0} & Confirm`}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Receipt / Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center"
                >
                  <Card className="p-8 rounded-3xl border-none shadow-sm flex flex-col items-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 scale-110">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Your consultation payment has been successfully authorized and recorded.
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Booking Reference:</span>
                        <span className="font-semibold text-slate-800">{createdBookingId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-semibold text-slate-800">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Time slot:</span>
                        <span className="font-semibold text-slate-800">{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Consultant:</span>
                        <span className="font-semibold text-teal-700">Dr. {doctor.fullName}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-slate-200 pt-3 font-bold text-slate-800">
                        <span>Total Paid:</span>
                        <span>${doctor.consultationFee ?? 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        className="flex-1 rounded-2xl py-3.5"
                        onClick={() => navigate(`/patient/invoice/${createdInvoiceId}`)}
                      >
                        View Official Invoice
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1 rounded-2xl py-3.5 border-slate-200 text-slate-700"
                        onClick={() => navigate("/patient/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Doctor Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6 sticky top-10">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Consultation Summary</h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-teal-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {doctorPhoto ? (
                    <img src={doctorPhoto} alt={doctor.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-teal-200" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Dr. {doctor.fullName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{doctor.specialization || "Specialist"}</p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-300" /> {doctor.hospital || "Oral Clinic"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-semibold text-slate-800">{selectedDate}</span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Time</span>
                    <span className="font-semibold text-slate-800">{selectedSlot}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Type</span>
                  <span className="font-semibold text-slate-800">Premium Consultation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Secure Access</span>
                  <span className="font-semibold text-teal-600 flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Encrypted
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                    Session Fee
                  </span>
                  <span className="text-2xl font-extrabold text-teal-600">${doctor.consultationFee ?? 0}</span>
                </div>
                <Badge variant="info">Paid Once</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

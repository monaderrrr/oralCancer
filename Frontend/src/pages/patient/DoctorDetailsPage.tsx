import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  FileText,
  User,
  Star,
  PhoneCall,
  MessageCircle,
  Send,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";
import API, { IMAGE_BASE_URL } from "../../Api";
import { useTranslation } from "react-i18next"; 

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization?: string;
  hospital?: string;
  clinicAddress?: string;
  googleMapsUrl?: string;
  lat?: number | null;
  lng?: number | null;
  bio?: string;
  profileImage?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  createdAt?: string;
  rating?: number;
}

interface DoctorReview {
  _id: string;
  stars: number;
  comment?: string;
  createdAt: string;
  verifiedPatient?: boolean;
  patient?: { fullName?: string };
  patientId?: { fullName?: string };
}

export function DoctorDetailsPage() {
  const { t } = useTranslation(); 
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showPhoneOptions, setShowPhoneOptions] = useState(false);

  const [scanId, setScanId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/v1/doctor/doctor/${id}`);
      setDoctor(res.data.data);
    } catch (err) {
      console.error("Error fetching doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/api/v1/doctor/reviews/${id}`);
      setReviews(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchLatestScan = async () => {
    try {
      const res = await API.get("/api/v1/patient/scans/history?limit=1");
      const latest = res.data?.data?.scans?.[0];
      
      if (latest?.scanId || latest?._id) {
        setScanId(latest.scanId || latest._id);
      }
    } catch (err) {
      console.error("Error fetching latest scan:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDoctor();
      fetchLatestScan();
      fetchReviews();
    }
  }, [id]);

  const submitReview = async () => {
    if (!rating) {
      setReviewError(t("doctorDetails.errors.chooseRating", "Please choose a rating."));
      return;
    }

    try {
      const res = await API.post(`/api/v1/doctor/review/${id}`, {
        stars: Number(rating),
        comment: reviewComment.trim(),
      });
      const nextRating = res.data?.data?.rating;
      const newReview = res.data?.data?.review;

      if (typeof nextRating === "number") {
        setDoctor((prev) => (prev ? { ...prev, rating: nextRating } : prev));
      }

      if (newReview) {
        setReviews((prev) => [newReview, ...prev]);
      } else {
        fetchReviews();
      }

      setRating(0);
      setReviewComment("");
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      setReviewError(err.response?.data?.message || t("doctorDetails.errors.reviewFailed", "Failed to submit review."));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const shareLatestScan = async () => {
    if (!doctor?._id || !scanId) {
      alert(t("doctorDetails.alerts.noScan", "No recent scan found to share."));
      return;
    }

    try {
      setSharing(true);
      await API.post("/api/v1/patient/scans/share", {
        doctorId: doctor._id,
      });
      alert(`${t("doctorDetails.alerts.shareSuccess", "Scan shared successfully with Dr.")} ${doctor.fullName} ✅`);
    } catch (err: any) {
      console.error("Share error:", err);
      alert(err.response?.data?.message || t("doctorDetails.errors.shareFailed", "Failed to share scan"));
    } finally {
      setSharing(false);
    }
  };

  const startChat = async () => {
    if (!doctor?._id) return;
    try {
      const res = await API.post("/api/v1/chat/conversations", {
        doctorId: doctor._id,
      });
      const conversationId = res.data?.data?._id;
      if (conversationId) {
        navigate(`/patient/chat/${conversationId}`);
      }
    } catch (err: any) {
      console.error("Start chat error:", err);
      alert(t("chat.alerts.startFailed", "Failed to start chat."));
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      const value = i + 1;
      return (
        <Star
          key={i}
          onClick={() => setRating(value)}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
          className={`w-5 h-5 cursor-pointer transition ${
            value <= (hover || rating || doctor?.rating || 0)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!doctor) {
    return <div className="text-center mt-20">{t("doctorCard.unknown", "Doctor not found")}</div>;
  }

  const image = doctor.profileImage ? `${IMAGE_BASE_URL}${doctor.profileImage}` : null;
  const hasCoordinates = typeof doctor.lat === "number" && typeof doctor.lng === "number";
  const locationText = hasCoordinates
    ? `${doctor.lat},${doctor.lng}`
    : `${doctor.clinicAddress || ""} ${doctor.hospital || ""}`.trim();
  const mapsUrl = doctor.googleMapsUrl || (hasCoordinates ? `https://www.google.com/maps?q=${doctor.lat},${doctor.lng}` : "");
  const phoneNumber = doctor.phone?.trim() || "";
  const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "");
  const whatsappNumber = normalizedPhone.replace(/^\+/, "");
  const isNewDoctor = doctor.createdAt
    ? Date.now() - new Date(doctor.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : true;

  return (
    <div className="min-h-screen bg-slate-50 py-10 text-left">
      <div className="max-w-6xl mx-auto px-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-slate-600 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("onboarding.back", "Back")}
        </button>

        {/* PROFILE HEADER (Same Design) */}
        <Card className="p-8 rounded-3xl mb-8 border-none shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-36 h-36 rounded-3xl overflow-hidden bg-teal-50 flex items-center justify-center shadow-inner shrink-0">
              {image ? (
                <img src={image} alt={doctor.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-teal-200" />
              )}
            </div>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">{doctor.fullName}</h1>
              <p className="text-slate-500 font-medium">{doctor.specialization || t("doctorCard.specialist", "Specialist")}</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <BadgeCheck className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-medium text-slate-600">{t("doctorDetails.verifiedLabel", "Verified Specialist")}</span>
                {isNewDoctor && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {t("doctorDetails.newDoctorTag", "New Doctor")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1">
                {renderStars()}
                <span className="ml-2 text-yellow-600 font-bold">
                  {(doctor.rating ?? 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 rounded-3xl border-none shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                <FileText className="w-5 h-5 text-teal-600" />
                {t("settings.labels.bio", "Biography")}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {doctor.bio || t("doctorDetails.noBio", "No biography details provided.")}
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border-none shadow-sm">
              <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                <MapPin className="w-5 h-5 text-red-500" />
                {t("hospitals.labels.distance", "Location")}
              </h2>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600">🏥 {t("onboarding.inputs.manualAddress", "Clinic Detailed Address")}: <span className="font-medium">{doctor.clinicAddress || "N/A"}</span></p>
                <p className="text-slate-600">🏥 {t("onboarding.inputs.clinicName", "Hospital")}: <span className="font-medium">{doctor.hospital || "N/A"}</span></p>
                {hasCoordinates && (
                  <p className="text-slate-600">
                    📍 {t("auth.signup.coordinatesLabel", "Coordinates")}: <span className="font-medium">{doctor.lat?.toFixed(5)}, {doctor.lng?.toFixed(5)}</span>
                  </p>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800 mt-1"
                  >
                    {t("doctorCard.openMaps", "Open in Google Maps")}
                  </a>
                )}
              </div>
            </Card>

            {/* MAP SECTION */}
            <div className="h-72 rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white">
              <iframe
                title="clinic-location"
                className="w-full h-full border-none"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&output=embed`}
              />
            </div>

            <Card className="p-6 rounded-3xl border-none shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-slate-800">
                    <Star className="w-5 h-5 text-yellow-500" />
                    {t("community.labels.comments", "Patient Reviews")}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {t("doctorDetails.reviewNotice", "Reviews are shared with other patients after submission.")}
                  </p>
                </div>
                <span className="text-sm font-semibold text-yellow-600">
                  {(doctor.rating ?? 0).toFixed(1)} / 5
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-5">
                <div className="flex items-center gap-1 mb-3">{renderStars()}</div>
                <Textarea
                  label={t("doctorDetails.labels.yourReview", "Your review")}
                  placeholder={t("settings.placeholders.bio", "Write your experience with this doctor...")}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-[120px] bg-white text-sm"
                />
                {reviewError && <p className="mt-2 text-sm text-red-600 font-medium">{reviewError}</p>}
                <Button
                  className="mt-4"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? t("community.buttons.posting", "Submitting...") : t("community.buttons.postComment", "Submit Review")}
                </Button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 font-medium py-4 text-center">{t("community.create.noComments", "No patient reviews yet.")}</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {review.patient?.fullName || review.patientId?.fullName || t("roles.patient", "Patient")}
                          </p>
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                            <ShieldCheck className="w-3 h-3" />
                            {t("doctorDetails.verifiedPatientLabel", "Verified patient")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${
                                index < review.stars
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 pl-1">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-slate-400 pl-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* SIDE COLUMN */}
          <div className="space-y-4">
            <Card className="p-5 rounded-3xl border-none shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">{t("doctorDetails.contactHeader", "Contact Information")}</h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm text-slate-600 break-all">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  {doctor.email}
                </p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => phoneNumber && setShowPhoneOptions((prev) => !prev)}
                    className="flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-default outline-none"
                    disabled={!phoneNumber}
                  >
                    <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{phoneNumber || "N/A"}</span>
                  </button>

                  {showPhoneOptions && phoneNumber && (
                    <div className="absolute left-0 right-0 top-9 z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${normalizedPhone}`}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <PhoneCall className="w-4 h-4" />
                        {t("doctorDetails.phoneCallOption", "Phone Call")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              <Button
                className="w-full py-6 rounded-2xl shadow-md font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-none"
                onClick={() => navigate(`/patient/book-appointment/${doctor._id}`)}
              >
                {t("bookingFlow.buttons.viewLoc", "Book Consultation")} (${doctor.consultationFee ?? 0})
              </Button>

              <Button className="w-full py-6 rounded-2xl shadow-md font-bold text-slate-700" variant="outline" onClick={startChat}>
                {t("doctorDetails.buttons.chat", "Chat with Doctor")}
              </Button>

              <Button
                className={`w-full py-6 rounded-2xl font-bold transition border-none ${
                  !scanId 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                }`}
                onClick={shareLatestScan}
                disabled={sharing || !scanId}
              >
                {sharing ? t("verification.submittingBtn", "Sharing...") : t("doctorDetails.buttons.shareScan", "Share Latest Scan")}
              </Button>
              {!scanId && (
                <p className="text-[10px] text-center text-red-500 font-medium">
                  {t("doctorDetails.noScansNotice", "* No scans available to share.")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
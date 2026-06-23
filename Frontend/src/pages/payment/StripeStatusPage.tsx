import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import API from "../../Api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "react-i18next"; 

type StripeStatusPageProps = {
  type: "doctor-subscription" | "booking";
  canceled?: boolean;
};
export function StripeStatusPage({ type, canceled = false }: StripeStatusPageProps) {
  const { t } = useTranslation(); 
  const [params] =useSearchParams();
  const [status, setStatus] = useState(canceled ? "canceled" : "checking");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (canceled || !sessionId) return;

    API.get(`/api/v1/subscription/session-status?session_id=${sessionId}`)
      .then((res) => setStatus(res.data?.status === "paid" ? "paid" : res.data?.status || "pending"))
      .catch(() => setStatus("failed"));
  }, [canceled, sessionId]);

  const isDoctor = type === "doctor-subscription";
  
  // النصوص المترجمة
  const successTitle = isDoctor ? t("stripe.doctorSuccess", "Subscription active") : t("stripe.bookingSuccess", "Booking confirmed");
  const successText = isDoctor
    ? t("stripe.doctorSuccessText", "Your doctor profile is now active and patients can book your available slots.")
    : t("stripe.bookingSuccessText", "Your appointment is confirmed. The selected slot has been removed from live availability.");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-right" dir="rtl">
      <Card className="mx-auto max-w-lg rounded-[2rem] border-none p-8 text-center shadow-sm">
        {status === "checking" ? (
          <>
            <Loader2 className="mx-auto mb-5 h-14 w-14 animate-spin text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-950">{t("stripe.checking", "Confirming payment")}</h1>
            <p className="mt-2 text-slate-500">{t("stripe.checkingText", "This usually takes a moment.")}</p>
          </>
        ) : status === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-950">{successTitle}</h1>
            <p className="mt-2 text-slate-500">{successText}</p>
            <Link to={isDoctor ? "/doctor/dashboard" : "/patient/doctors"}>
              <Button className="mt-6 rounded-2xl px-8 py-3">{isDoctor ? t("stripe.openDashboard", "Open Dashboard") : t("stripe.findDoctors", "Find Doctors")}</Button>
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-5 h-16 w-16 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-950">{canceled ? t("stripe.canceled", "Payment canceled") : t("stripe.failed", "Payment not completed")}</h1>
            <p className="mt-2 text-slate-500">{t("stripe.retry", "No changes were made. You can safely try again.")}</p>
            <Link to={isDoctor ? "/doctor/dashboard" : "/patient/doctors"}>
              <Button variant="secondary" className="mt-6 rounded-2xl px-8 py-3">{t("stripe.goBack", "Go back")}</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
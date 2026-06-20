import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import API from "../../Api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

type StripeStatusPageProps = {
  type: "doctor-subscription" | "booking";
  canceled?: boolean;
};

export function StripeStatusPage({ type, canceled = false }: StripeStatusPageProps) {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(canceled ? "canceled" : "checking");
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (canceled || !sessionId) return;

    API.get(`/api/v1/subscription/session-status?session_id=${sessionId}`)
      .then((res) => setStatus(res.data?.status === "paid" ? "paid" : res.data?.status || "pending"))
      .catch(() => setStatus("failed"));
  }, [canceled, sessionId]);

  const isDoctor = type === "doctor-subscription";
  const successTitle = isDoctor ? "Subscription active" : "Booking confirmed";
  const successText = isDoctor
    ? "Your doctor profile is now active and patients can book your available slots."
    : "Your appointment is confirmed. The selected slot has been removed from live availability.";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <Card className="mx-auto max-w-lg rounded-[2rem] border-none p-8 text-center shadow-sm">
        {status === "checking" ? (
          <>
            <Loader2 className="mx-auto mb-5 h-14 w-14 animate-spin text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-950">Confirming payment</h1>
            <p className="mt-2 text-slate-500">This usually takes a moment.</p>
          </>
        ) : status === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-950">{successTitle}</h1>
            <p className="mt-2 text-slate-500">{successText}</p>
            <Link to={isDoctor ? "/doctor/dashboard" : "/patient/doctors"}>
              <Button className="mt-6 rounded-2xl px-8 py-3">{isDoctor ? "Open Dashboard" : "Find Doctors"}</Button>
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-5 h-16 w-16 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-950">{canceled ? "Payment canceled" : "Payment not completed"}</h1>
            <p className="mt-2 text-slate-500">No changes were made. You can safely try again.</p>
            <Link to={isDoctor ? "/doctor/dashboard" : "/patient/doctors"}>
              <Button variant="secondary" className="mt-6 rounded-2xl px-8 py-3">Go back</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

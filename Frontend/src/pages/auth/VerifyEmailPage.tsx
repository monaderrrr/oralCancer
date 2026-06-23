import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import API from "../../Api";
import { useTranslation } from "react-i18next";

export function VerifyEmailPage() {
  const { t } = useTranslation(); 
  const { emailToken } = useParams<{ emailToken: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!emailToken) {
        setError(t("auth.errors.invalidLink", "Invalid verification link"));
        setIsLoading(false);
        return;
      }
      try {
        const decodedToken = decodeURIComponent(emailToken);
        const response = await API.get(`/auth/verify/${decodedToken}`);
        
        if (response.data.user) {
          const { user, accessToken } = response.data;
          setSuccess(true);

          localStorage.setItem("oral_scan_user", JSON.stringify(user));
          localStorage.setItem("oral_scan_token", accessToken);

          setTimeout(() => {
            if (user.role === "doctor") navigate("/doctor/dashboard");
            else if (user.role === "patient") navigate("/patient/dashboard");
            else navigate("/"); 
          }, 2000); 
        }
      } catch (err: any) {
        console.error("Verification Error:", err);
        setError(err.response?.data?.message || t("auth.errors.linkExpired", "Verification failed or link expired"));
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [emailToken, navigate, t]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center shadow-lg">
        {isLoading && (
          <div className="animate-pulse">
            <div className="mx-auto w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{t("auth.verifyEmail.loadingTitle", "Verifying your email...")}</h2>
            <p className="text-slate-500 mt-2">{t("auth.verifyEmail.loadingDesc", "Please wait while we activate your account.")}</p>
          </div>
        )}

        {!isLoading && success && (
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-700">{t("auth.verifyEmail.successTitle", "Email verified successfully 🎉")}</h3>
              <p className="text-sm text-green-600 mt-1">
                {t("auth.verifyEmail.successDesc", "Welcome back! Redirecting you to your dashboard...")}
              </p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-700">{t("auth.verifyEmail.failedTitle", "Verification Failed")}</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => navigate("/login")}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              {t("auth.backToLogin", "Back to Login")}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
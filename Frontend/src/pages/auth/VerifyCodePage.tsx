import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import API from "../../Api";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function VerifyCodePage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const location = useLocation();

  const { setAuthData } = useAuth();
  const searchParams = new URLSearchParams(location.search);

  const email =
    location.state?.email || searchParams.get("email") || "";
  const flow =
    (location.state?.flow as "signup" | "forgot" | "login") ||
    (searchParams.get("flow") as "signup" | "forgot" | "login") ||
    "signup";
  const role =
    (location.state?.role as "patient" | "doctor") ||
    (searchParams.get("role") as "patient" | "doctor") ||
    "patient";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  
  useEffect(() => {
    inputsRef.current[0]?.focus();
    if (!email) {
        setError(t("auth.errors.emailMissing", "Email is missing. Please go back to the previous step."));
    }
  }, [email, t]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (index === code.length - 1 && value) {
      handleSubmitAuto(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitAuto(code.join(""));
  };

  const handleSubmitAuto = async (fullCode: string) => {
    if (!email) {
      setError(t("auth.errors.emailMissing", "Email is missing. Go back and try again."));
      return;
    }

    if (fullCode.length !== 6) {
      setError(t("auth.errors.completeCode", "Please enter the complete 6-digit code"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: fullCode, 
        purpose: flow, 
      });

      if (res.status === 200) {
        const hasToken = Boolean(res.data?.accessToken);
        const isPatientSignup = flow === "signup" && role === "patient";
        const isLoginFlow = flow === "login";

        if (hasToken || isPatientSignup || isLoginFlow) {
          if (res.data.user && res.data.accessToken) {
            setAuthData(res.data.user, res.data.accessToken, res.data.refreshToken);
          }
        }

        if (flow === "forgot") {
          navigate("/reset-password", {
            state: {
              email: email,
              otp: fullCode,
            },
          });
          return;
        }

        if (flow === "signup" && role === "doctor") {
          localStorage.setItem("signupEmail", email);
          navigate("/doctor/verification-upload", { state: { email } });
          return;
        }

        if (role === "doctor") {
          navigate("/doctor/dashboard");
          return;
        }

        navigate("/patient/dashboard");
      }
    } catch (err: any) {
      console.error("Verification Error:", err);
      setError(err.response?.data?.message || t("auth.errors.invalidOtp", "Invalid or expired OTP code."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setError("");

    try {
      if (flow === "signup") {
        await API.post("/auth/resend-otp", { email: email.trim(), purpose: "signup" });
      } else {
        await API.patch("/auth/forgetPassword", { email: email.trim() });
      }
      
      setResendTimer(60);
      setCanResend(false);
      alert(t("auth.alerts.codeResendSuccess", "Verification code sent successfully!"));
    } catch (err: any) {
      console.error("Resend Error:", err);
      setError(err.response?.data?.message || t("auth.errors.resendFailed", "Failed to resend code."));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">{t("auth.verifyOtp.title", "Verify Your Identity")}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("auth.verifyOtp.subtitle", "We've sent a code to")} <span className="font-semibold text-teal-700">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow-xl border-t-4 border-teal-600 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`OTP digit ${index + 1}`}
                  placeholder="•"
                  className="w-12 h-14 text-center text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-white"
                />
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={code.join("").length !== 6 || loading}
              isLoading={loading}
              className="py-3 text-lg font-semibold"
            >
              {t("auth.buttons.verifyBtn", "Verify & Continue")}
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              {t("auth.verifyOtp.noCode", "Didn't receive the code?")}{" "}
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-teal-600 hover:text-teal-500 font-medium ml-1 disabled:opacity-50"
                >
                  {resendLoading ? t("auth.buttons.sending", "Sending...") : t("auth.buttons.resendLink", "Resend code")}
                </button>
              ) : (
                <span className="text-gray-400 ml-1">
                  {t("auth.verifyOtp.resendIn", "Resend in")} {resendTimer}s
                </span>
              )}
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
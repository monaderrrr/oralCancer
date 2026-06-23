import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import API from "../../Api";
import { useTranslation } from "react-i18next"; 

export function ResetPasswordPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      console.error("Missing reset data:", { email, otp });
      navigate("/forgot-password");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldError("");

    if (!password || !confirmPassword) {
      setFieldError(t("auth.errors.requiredFields", "All fields are required"));
      return;
    }

    if (password.trim().length < 8) {
      setFieldError(t("auth.errors.passwordLength", "Password must be at least 8 characters long"));
      return;
    }

    if (password !== confirmPassword) {
      setFieldError(t("auth.errors.passwordMismatch", "Passwords do not match"));
      return;
    }

    try {
      setIsLoading(true);
      await API.put("/auth/resetPassword", {
        email: email.trim().toLowerCase(),
        otp: otp.toString().trim(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset API error:", err?.response?.data);
      setError(
        err?.response?.data?.message ||
          t("auth.errors.resetFailed", "Reset failed. Your OTP may have expired. Please request a new one.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-xl shadow-xl border-t-4 border-teal-500">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.reset.successTitle", "Password Reset Successful!")}
          </h2>

          <p className="text-gray-600 mb-6">
            {t("auth.reset.successDesc", "Your password has been reset successfully. You can now login using your new password.")}
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            {t("auth.reset.goToLogin", "Go to Login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-teal-600" />
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900">
          {t("auth.reset.title", "Set a New Password")}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {t("auth.reset.subtitle", "Resetting password for:")}
          <span className="font-semibold text-teal-600 ml-1">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border-t-4 border-teal-600">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.inputs.newPassword", "New Password")}
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {fieldError && (
                  <p className="mt-1 text-xs text-red-600">{fieldError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("auth.inputs.confirmPassword", "Confirm Password")}
                </label>

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors`}
            >
              {isLoading ? t("auth.buttons.updating", "Updating...") : t("auth.buttons.resetBtn", "Reset Password")}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
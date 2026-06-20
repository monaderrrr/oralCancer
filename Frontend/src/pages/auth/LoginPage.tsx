import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Mail, AlertCircle, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { PasswordInput } from "../../components/ui/PasswordInput";
import logo from "../../assets/logo.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor">("patient");

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const loggedUser = await login(email, password);

      const role = loggedUser.role || "patient";
      localStorage.setItem("oral_scan_userRole", role);

      if (role === "doctor") navigate("/doctor/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/patient/dashboard");
    } catch (err: unknown) {
      if ((err as any)?.response?.data?.message) {
        setError((err as any).response.data.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
      }
      console.error("LOGIN ERROR:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-teal-100 bg-white">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-2xl text-slate-900">OralScan AI</span>
        </Link>

        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-500">
            create a new account
          </Link>
        </p>
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
              {selectedRole === "doctor" ? <Stethoscope className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {selectedRole === "doctor" ? "Doctor access" : "Patient access"}
              </p>
              <p className="text-xs text-slate-600">Secure sign in for your care workspace.</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-teal-600 ml-auto" />
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Role Selection */}
            <div className="flex gap-3 mb-4">
              {(["patient", "doctor"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${selectedRole === role
                      ? "bg-teal-600 text-white border-teal-600 shadow"
                      : "bg-white text-slate-600 border-slate-300 hover:border-teal-400"
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {role === "doctor" ? <Stethoscope className="w-4 h-4" /> : <UserRound className="w-4 h-4" />}
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </button>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <Input
                type="email"
                required
                disabled={isLoading}
                leftIcon={<Mail className="h-5 w-5" />}
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="mt-2 text-right text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

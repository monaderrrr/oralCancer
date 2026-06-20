import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import API from "../../Api";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

   try {
    const response = await API.patch("/auth/forgetPassword", { email }); 
    alert(response.data.message);
    navigate("/verify-code", { state: { email, flow: "forgot" } });
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to send OTP");
   } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password?</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your email to receive a verification code.</p>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <Button type="submit" fullWidth disabled={isLoading} isLoading={isLoading}>
              {isLoading ? "Sending OTP..." : "Send Verification Code"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
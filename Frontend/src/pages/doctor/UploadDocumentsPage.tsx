import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Upload, FileText, IdCard, RefreshCw } from "lucide-react";
import API from "../../Api";
import { toast } from "react-hot-toast";

export function UploadDocumentsPage() {
  const navigate = useNavigate();

  const [specialty, setSpecialty] = useState("");
  const [clinic, setClinic] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!specialty || !clinic || !licenseNumber || !nationalId || !licenseFile || !idFile) {
      setError("Please fill all required fields and upload mandatory documents.");
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();

      // text fields
      formData.append("specialization", specialty);
      formData.append("hospital", clinic);
      formData.append("licenseNumber", licenseNumber);
      formData.append("nationalId", nationalId);

      // files
      formData.append("licenseImage", licenseFile);
      formData.append("nationalIdImage", idFile);

      if (cvFile) {
        formData.append("cvFile", cvFile);
      }

      /**
       * 🔥 IMPORTANT:
       * لازم يكون عندك endpoint في الباك مسؤول عن verification
       * مثال: /doctor/verify أو /users/doctor/verify
       */
      const res = await API.post("/doctor/verify", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Documents submitted successfully");
        navigate("/doctor/pending-verification");
      }

    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Upload failed. Try again later.";

      setError(msg);
      toast.error(msg);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <Upload className="w-12 h-12 text-teal-600 mx-auto" />
          <h2 className="text-3xl font-bold">Doctor Verification</h2>
          <p className="text-slate-600">
            Submit your documents for account verification
          </p>
        </div>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full border p-2 rounded-md"
            >
              <option value="">Select</option>
              <option value="Dentist">Dentist</option>
              <option value="Oncologist">Oncologist</option>
              <option value="Oral Surgeon">Oral Surgeon</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">License Number</label>
            <input
              className="w-full border p-2 rounded-md"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Clinic</label>
            <input
              className="w-full border p-2 rounded-md"
              value={clinic}
              onChange={(e) => setClinic(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">National ID</label>
            <input
              className="w-full border p-2 rounded-md"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
        </div>

        {/* Uploads */}
        <div className="grid md:grid-cols-3 gap-4">

          <label className="border p-4 text-center cursor-pointer rounded-md">
            <FileText className="mx-auto" />
            <p className="text-xs mt-2">
              {licenseFile ? licenseFile.name : "License"}
            </p>
            <input
              type="file"
              hidden
              onChange={(e) =>
                setLicenseFile(e.target.files?.[0] || null)
              }
            />
          </label>

          <label className="border p-4 text-center cursor-pointer rounded-md">
            <IdCard className="mx-auto" />
            <p className="text-xs mt-2">
              {idFile ? idFile.name : "ID Card"}
            </p>
            <input
              type="file"
              hidden
              onChange={(e) =>
                setIdFile(e.target.files?.[0] || null)
              }
            />
          </label>

          <label className="border p-4 text-center cursor-pointer rounded-md">
            <Upload className="mx-auto" />
            <p className="text-xs mt-2">
              {cvFile ? cvFile.name : "CV (optional)"}
            </p>
            <input
              type="file"
              hidden
              onChange={(e) =>
                setCvFile(e.target.files?.[0] || null)
              }
            />
          </label>

        </div>

        {/* Error */}
        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {isLoading ? "Submitting..." : "Submit for Verification"}
        </Button>

      </Card>
    </div>
  );
}
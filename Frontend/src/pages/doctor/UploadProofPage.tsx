import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import API from '../../Api';

export function UploadProofPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("signupEmail") || "";

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const invalidFiles = selectedFiles.filter(file => !validTypes.includes(file.type));
      
      if (invalidFiles.length > 0) {
        setError("Please upload only JPG, PNG, or PDF files.");
        return;
      }
      
      if (selectedFiles.length > 5) {
        setError("You can upload a maximum of 5 files.");
        return;
      }
      
      setFiles(selectedFiles);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("proof", file));
      formData.append("email", email);

      await API.post("/api/v1/doctor/upload-proof", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/doctor/pending-verification');
      }, 2000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Card className="p-8 md:p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your proof documents have been uploaded successfully. You will be redirected shortly.
          </p>
          <div className="text-2xl font-bold text-teal-600">
            دي بقا
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl w-full px-4">
        <Card className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-10 w-10 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Proof Documents
            </h1>
            <p className="text-gray-600">
              Please upload your medical license or other proof documents to verify your doctor credentials.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Files (JPG, PNG, PDF - Max 5 files)
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, PDF up to 10MB each
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                type="submit"
                disabled={files.length === 0 || isLoading}
                isLoading={isLoading}
                className="flex-1"
              >
                {isLoading ? "Uploading..." : "Upload Documents"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/doctor/dashboard')}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </form>

          <div className="mt-8 bg-blue-50 rounded-xl p-6 text-left border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-4">
              What documents can I upload?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Medical license or certification</li>
              <li>• University degree certificate</li>
              <li>• Professional registration documents</li>
              <li>• Any other relevant proof of medical qualification</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
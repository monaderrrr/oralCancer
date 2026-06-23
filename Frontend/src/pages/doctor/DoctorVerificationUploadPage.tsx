import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import API from '../../Api';
import { useTranslation } from 'react-i18next'; 

export function DoctorVerificationUploadPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('signupEmail');

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [medicalProof, setMedicalProof] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setError(t('verification.errors.profileSize', 'Profile image must be less than 5MB'));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t('verification.errors.invalidImage', 'Please select a valid image file'));
        return;
      }
      setProfileImage(file);
      setError('');
    }
  };

  const handleMedicalProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { 
        setError(t('verification.errors.documentSize', 'Medical proof must be less than 10MB'));
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError(t('verification.errors.invalidDoc', 'Please select a PDF or image file'));
        return;
      }
      setMedicalProof(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileImage && !medicalProof) {
      setError(t('verification.errors.noDocs', 'Please upload at least one document'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      if (profileImage) formData.append('files', profileImage);
      if (medicalProof) formData.append('files', medicalProof);

      const response = await API.post('/api/v1/doctor/upload-verification-docs', formData);

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/doctor/pending-approval');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || t('auth.errors.resendFailed', 'Failed to upload documents'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verification.successTitle', 'Documents Uploaded!')}</h2>
          <p className="text-gray-600 mb-6">
            {t('verification.successDesc', 'Your verification documents have been submitted successfully. Please wait for admin approval.')}
          </p>
          <p className="text-sm text-gray-500">{t('verification.redirecting', 'Redirecting to status page...')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.signup.doctorSubtitle', 'Doctor Verification')}</h2>
          <p className="mt-2 text-gray-600">
            {t('verification.subtitle', 'Please upload your verification documents to complete registration')}
          </p>
        </div>

        <Card className="p-6 text-left">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.documents.profileImage', 'Profile Image')} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profileImage"
                />
                <label htmlFor="profileImage" className="cursor-pointer">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {profileImage ? profileImage.name : t('verification.placeholders.profile', 'Click to upload profile image')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </label>
              </div>
            </div>

            {/* Medical Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.documents.medicalProof', 'Medical Document')} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleMedicalProofChange}
                  className="hidden"
                  id="medicalDocument"
                />
                <label htmlFor="medicalDocument" className="cursor-pointer">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {medicalProof ? medicalProof.name : t('verification.placeholders.document', 'Click to upload medical document')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF or image up to 10MB</p>
                </label>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || (!profileImage && !medicalProof)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  {t('paymentError.processingBtn', 'Uploading...')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('verification.submitBtn', 'Submit Documents')}
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
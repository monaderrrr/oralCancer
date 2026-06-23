import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; 

type VerificationStatus = 'pending' | 'approved' | 'verified' | 'rejected' | string;

export function PendingVerificationPage() {
  const { t } = useTranslation(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<VerificationStatus>('pending');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        loadingControllerState = true;
        setLoading(true);

        const response = await axios.get('/api/v1/doctor/dashboard');

        const backendStatus =
          response.data?.data?.stats?.verificationStatus ?? 'pending';

        setStatus(backendStatus);

        // normalize approved states from backend
        if (backendStatus === 'approved' || backendStatus === 'verified') {
          navigate('/doctor/dashboard');
          return;
        }

      } catch (error) {
        console.error('Error fetching verification status:', error);
        setStatus('pending');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  const isRejected = status === 'rejected';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl w-full px-4">

        <Card className="p-8 md:p-12 text-center shadow-lg border border-slate-100 rounded-2xl">

          {isRejected ? (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("verification.status.rejectedTitle", "Verification Rejected")}
              </h1>

              <div className="flex justify-center mb-6">
                <Badge variant="danger">
                  {t("appointment.status.cancelled", "Rejected")}
                </Badge>
              </div>

              <p className="text-gray-600 mb-8 text-sm">
                {t("verification.status.rejectedDesc", "Your credentials could not be verified. Please contact support.")}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-yellow-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("onboarding.approvalTitle", "Registration completed successfully.")}
              </h1>

              <div className="flex justify-center mb-6">
                <Badge variant="warning">
                  {t("appointment.status.pending", "Pending Approval")}
                </Badge>
              </div>

              <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                {t("verification.status.pendingDesc", "Your account is pending admin approval. You will be able to log in after an administrator reviews and approves your account.")}
              </p>
            </>
          )}

          {/* Info Section (no booking-related content) */}
          <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 max-w-lg mx-auto border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              {t("verification.status.nextHeader", "What happens next?")}
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  {t("verification.status.step1", "We verify your medical credentials.")}
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  {t("verification.status.step2", "You will receive an email after review.")}
                </span>
              </li>

              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 shrink-0" />
                <span className="text-gray-600">
                  {t("verification.status.step3", "Typical review time: 2–3 business days.")}
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {t("dashboard.refreshBtn", "Check Status")}
            </Button>

            <Button
              onClick={() => navigate('/contact')}
              variant="outline"
            >
              {t("auth.paymentError.callBtn", "Contact Support")}
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}
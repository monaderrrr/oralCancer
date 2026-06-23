import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CreditCard } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PaymentOptionsCard, PaymentOption, PaymentMethodType } from '../../components/payment/PaymentOptionsCard';
import { PaymentConfirmationModal } from '../../components/payment/PaymentConfirmationModal';
import { PaymentErrorState } from '../../components/payment/PaymentErrorState';
import { PaymentTooltip } from '../../components/payment/PaymentTooltip';
import { OnboardingTooltip } from '../../components/payment/OnboardingTooltip';
import { useTranslation } from "react-i18next"; 

export function BookingConfirmationPage() {
  const { t } = useTranslation(); 
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const paymentOptions: PaymentOption[] = [{
    id: 'credit_card',
    name: t("paymentOptions.labels.card", 'Credit / Debit Card'),
    description: t("paymentOptions.descs.card", 'Pay securely with Visa, Mastercard, or Amex'),
    icon: 'card',
    pros: [t("paymentOptions.pros.card.1", 'Instant confirmation'), t("paymentOptions.pros.card.2", 'Secure encryption'), t("paymentOptions.pros.card.3", 'Points/Rewards eligible')],
    cons: [t("paymentOptions.cons.card.1", 'Requires card details')],
    processingTime: t("paymentOptions.time.instant", 'Instant'),
    isRecommended: true
  }, {
    id: 'insurance',
    name: t("paymentOptions.labels.insurance", 'Health Insurance'),
    description: t("paymentOptions.descs.insurance", 'Direct billing to your insurance provider'),
    icon: 'building',
    pros: [t("paymentOptions.pros.ins.1", 'No upfront cost'), t("paymentOptions.pros.ins.2", 'Direct claim processing')],
    cons: [t("paymentOptions.cons.ins.1", 'Verification takes 24-48h'), t("paymentOptions.cons.ins.2", 'May require co-pay')],
    processingTime: t("paymentOptions.time.days", '1-2 Days')
  }, {
    id: 'cash',
    name: t("paymentOptions.labels.cash", 'Pay at Clinic'),
    description: t("paymentOptions.descs.cash", 'Pay when you arrive for your appointment'),
    icon: 'cash',
    pros: [t("paymentOptions.pros.cash.1", 'No online transaction'), t("paymentOptions.pros.cash.2", 'Flexible payment methods')],
    cons: [t("paymentOptions.cons.cash.1", 'Appointment not guaranteed until arrival'), t("paymentOptions.cons.cash.2", 'Wait time at desk')],
    processingTime: t("paymentOptions.time.arrival", 'On Arrival')
  }];

  useEffect(() => {
    // Check if first time user
    const hasSeenOnboarding = localStorage.getItem('payment_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      setOnboardingStep(1);
    }
  }, []);

  const handleNextStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('payment_onboarding_completed', 'true');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      // Randomly simulate error for demonstration (10% chance)
      if (Math.random() > 0.9) {
        setError(t("paymentError.declinedNotice", 'Transaction declined by bank'));
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowConfirmation(true);
      }
    }, 2000);
  };

  return <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("bookingFlow.confirmationHeader", "Complete Your Booking")}
          </h1>
          <p className="text-gray-600">
            {t("bookingFlow.confirmationDesc", "Review details and select a payment method to confirm your appointment.")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Column */}
          <div className="lg:col-span-2 space-y-6">
            {error ? <PaymentErrorState message={error} onRetry={handlePayment} isRetrying={isProcessing} /> : <>
                <div id="payment-methods-section" className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {t("payments.table.status", "Payment Method")}
                    <PaymentTooltip content={t("paymentOptions.tooltipDesc", "Choose how you would like to pay. We support all major cards and insurance providers.")} />
                  </h2>

                  {paymentOptions.map(option => <PaymentOptionsCard key={option.id} option={option} isSelected={selectedMethod === option.id} onSelect={setSelectedMethod} />)}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
                  <Lock className="w-4 h-4" />
                  <span>
                    {t("paymentOptions.encryptedNotice", "Payments are processed securely with 256-bit encryption")}
                  </span>
                </div>

                <Button size="lg" className="w-full text-lg h-14" onClick={handlePayment} disabled={isProcessing} id="confirm-payment-btn">
                  {isProcessing ? t("paymentError.processingBtn", 'Processing...') : `${t("paymentError.retryBtn", "Pay")} $150.00 & ${t("appointment.status.confirmed", "Confirm")}`}
                </Button>
              </>}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">{t("bookingFlow.summaryHeader", "Booking Summary")}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t("paymentModal.labels.doctor", "Doctor")}
                  </p>
                  <p className="font-medium text-gray-900">Dr. Emily Chen</p>
                  <p className="text-sm text-gray-500">{t("doctorCard.specialist", "Cardiologist")}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {t("paymentModal.labels.dateTime", "Date & Time")}
                  </p>
                  <p className="font-medium text-gray-900">Oct 24, 2023</p>
                  <p className="text-sm text-gray-500">10:00 AM</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    {t("hospitals.labels.distance", "Location")}
                    <PaymentTooltip content={t("bookingFlow.locationTooltip", "The physical address of the clinic where your appointment will take place.")} position="left" />
                  </p>
                  <p className="font-medium text-gray-900">Heart Care Center</p>
                  <p className="text-sm text-gray-500">
                    Suite 404, Medical Plaza
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("bookingFlow.sessionFee", "Consultation Fee")}</span>
                  <span className="font-medium">$150.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("bookingFlow.bookingFee", "Booking Fee")}</span>
                  <span className="font-medium">$5.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>{t("bookingFlow.totalPrice", "Total")}</span>
                  <span className="text-teal-600">$155.00</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modals & Tooltips */}
        <PaymentConfirmationModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} transactionId="TRX-89234" amount="$155.00" date="Oct 24, 2023" appointmentTime="10:00 AM" doctorName="Dr. Emily Chen" />

        <OnboardingTooltip isVisible={showOnboarding && onboardingStep === 1} step={1} totalSteps={3} title={t("onboarding.tooltips.t1.title", "Select Payment Method")} content={t("onboarding.tooltips.t1.desc", "Choose your preferred way to pay. We recommend Credit Card for instant confirmation.")} targetId="payment-methods-section" onNext={handleNextStep} onSkip={finishOnboarding} />

        <OnboardingTooltip isVisible={showOnboarding && onboardingStep === 2} step={2} totalSteps={3} title={t("onboarding.tooltips.t2.title", "Review Summary")} content={t("onboarding.tooltips.t2.desc", "Double check your appointment details, doctor, and total cost before proceeding.")} targetId="booking-summary-card" onNext={handleNextStep} onSkip={finishOnboarding} />

        <OnboardingTooltip isVisible={showOnboarding && onboardingStep === 3} step={3} totalSteps={3} title={t("onboarding.tooltips.t3.title", "Secure Checkout")} content={t("onboarding.tooltips.t3.desc", "Click here to finalize your booking. Your payment is encrypted and secure.")} targetId="confirm-payment-btn" onNext={finishOnboarding} onSkip={finishOnboarding} />
      </div>
    </Layout>;
}
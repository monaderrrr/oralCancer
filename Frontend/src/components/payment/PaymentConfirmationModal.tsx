import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Download, ArrowRight, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; 

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  amount: string;
  date: string;
  doctorName: string;
  appointmentTime: string;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  transactionId,
  amount,
  date,
  doctorName,
  appointmentTime
}: PaymentConfirmationModalProps) {
  const { t } = useTranslation(); 
  const [stage, setStage] = useState<'success' | 'details'>('success');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setStage('success');
      const timer = setTimeout(() => {
        setStage('details');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <AnimatePresence mode="wait">
        {stage === 'success' ? <motion.div key="success" initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 1.1,
        opacity: 0
      }} className="relative z-10 bg-white rounded-full p-8 shadow-2xl flex flex-col items-center justify-center w-64 h-64">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{
          type: 'spring',
          stiffness: 200,
          damping: 10,
          delay: 0.2
        }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 text-center">
              {t("paymentModal.successHeader", "Payment Successful!")}
            </h3>
          </motion.div> : <motion.div key="details" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-teal-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold mb-1">{t("paymentModal.confirmedTitle", "Booking Confirmed")}</h2>
              <p className="text-teal-100">{t("paymentModal.confirmedSubtitle", "Your appointment is set")}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl text-left">
                  <User className="w-10 h-10 text-teal-600 bg-teal-100 p-2 rounded-lg mr-4 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">{t("paymentModal.labels.doctor", "Doctor")}</p>
                    <p className="font-semibold text-gray-900">{doctorName}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-xl text-left">
                  <Calendar className="w-10 h-10 text-teal-600 bg-teal-100 p-2 rounded-lg mr-4 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">{t("paymentModal.labels.dateTime", "Date & Time")}</p>
                    <p className="font-semibold text-gray-900">
                      {date} {t("paymentModal.labels.at", "at")} {appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-100">
                  <span className="text-gray-600">{t("paymentModal.labels.amount", "Amount Paid")}</span>
                  <span className="text-xl font-bold text-gray-900">
                    {amount}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-500">{t("paymentModal.labels.txId", "Transaction ID")}</span>
                  <span className="text-sm font-mono text-gray-700">
                    {transactionId}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full justify-center" size="lg" onClick={() => navigate(`/patient/payment-receipt/${transactionId}`)}>
                  {t("paymentModal.buttons.receipt", "View Receipt & Details")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button variant="outline" className="w-full justify-center" onClick={onClose}>
                  {t("paymentModal.buttons.return", "Return to Dashboard")}
                </Button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
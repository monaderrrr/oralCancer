import React from 'react';
import { AlertCircle, RefreshCw, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
interface PaymentErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}
export function PaymentErrorState({
  title = "Payment Couldn't Be Processed",
  message,
  onRetry,
  isRetrying = false
}: PaymentErrorStateProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="w-full max-w-md mx-auto">
      <Card className="p-6 border-red-100 bg-red-50/50">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{
          rotate: -10,
          scale: 0.9
        }} animate={{
          rotate: 0,
          scale: 1
        }} className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </motion.div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="w-full bg-white rounded-lg p-4 mb-6 text-left border border-red-100">
            <h4 className="font-medium text-gray-900 mb-2">Try these steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Check your card details and try again</li>
              <li>Ensure you have sufficient funds</li>
              <li>Contact your bank if the issue persists</li>
            </ol>
          </div>

          <Button onClick={onRetry} className="w-full mb-6" disabled={isRetrying}>
            {isRetrying ? <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </> : 'Try Again'}
          </Button>

          <div className="border-t border-red-200 w-full pt-4">
            <p className="text-sm text-gray-500 mb-3">
              Need help? Contact support
            </p>
            <div className="flex justify-center gap-4">
              <a href="tel:+1234567890" className="flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium">
                <Phone className="w-4 h-4 mr-1.5" />
                Call Support
              </a>
              <a href="mailto:support@medicalapp.com" className="flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium">
                <Mail className="w-4 h-4 mr-1.5" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>;
}
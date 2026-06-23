import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, ShieldCheck, CreditCard, Banknote, Building } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTranslation } from 'react-i18next'; 

export type PaymentMethodType = 'credit_card' | 'insurance' | 'cash';

export interface PaymentOption {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: 'card' | 'building' | 'cash';
  pros: string[];
  cons: string[];
  processingTime: string;
  isRecommended?: boolean;
}

interface PaymentOptionsCardProps {
  option: PaymentOption;
  isSelected: boolean;
  onSelect: (id: PaymentMethodType) => void;
}

const icons = {
  card: CreditCard,
  building: Building,
  cash: Banknote
};

export function PaymentOptionsCard({
  option,
  isSelected,
  onSelect
}: PaymentOptionsCardProps) {
  const { t } = useTranslation(); 
  const Icon = icons[option.icon];

  return <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 ring-teal-500 shadow-lg bg-teal-50/10' : 'hover:shadow-md hover:border-teal-200'}`} onClick={() => onSelect(option.id)}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 text-left">
              <div className={`p-3 rounded-xl ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {option.name}
                </h3>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>
            {option.isRecommended && <Badge variant="success" className="bg-teal-100 text-teal-800 border-teal-200">
                {t("paymentOptions.recommended", "Recommended")}
              </Badge>}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>

          <AnimatePresence>
            {isSelected && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="pt-4 border-t border-gray-100 mt-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-left">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {t("paymentOptions.labels.pros", "Pros")}
                      </h4>
                      <ul className="space-y-2">
                        {option.pros.map((pro, idx) => <li key={idx} className="flex items-start text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>)}
                      </ul>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {t("paymentOptions.labels.cons", "Cons")}
                      </h4>
                      <ul className="space-y-2">
                        {option.cons.map((con, idx) => <li key={idx} className="flex items-start text-sm text-gray-700">
                            <X className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">
                        {t("paymentOptions.labels.time", "Time")}: {option.processingTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{t("paymentOptions.labels.secure", "Secure Transaction")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>;
}
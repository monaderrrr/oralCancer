import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, HelpCircle, MoreVertical, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useTranslation } from "react-i18next"; 

interface PaymentRecord {
  id: string;
  patientName: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
  method: string;
}

const mockPayments: PaymentRecord[] = [{
  id: 'TRX-8923',
  patientName: 'Sarah Johnson',
  amount: '$150.00',
  date: 'Oct 24, 2023',
  status: 'completed',
  method: 'Credit Card'
}, {
  id: 'TRX-8924',
  patientName: 'Michael Chen',
  amount: '$200.00',
  date: 'Oct 24, 2023',
  status: 'pending',
  method: 'Insurance'
}, {
  id: 'TRX-8925',
  patientName: 'Emma Davis',
  amount: '$150.00',
  date: 'Oct 23, 2023',
  status: 'refunded',
  method: 'Credit Card'
}];

export function DoctorPaymentView() {
  const { t } = useTranslation(); 
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  
  const toggleHelp = (id: string) => {
    setActiveHelp(activeHelp === id ? null : id);
  };

  return <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("payments.title", "Payments & Transactions")}
          </h2>
          <p className="text-gray-500">
            {t("payments.subtitle", "Manage patient payments and view transaction history")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t("payments.exportBtn", "Export Report")}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder={t("payments.searchPlaceholder", "Search by patient or transaction ID...")} className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {t("payments.filterBtn", "Filter")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 font-semibold text-gray-600 pl-4">
                  {t("payments.table.txId", "Transaction ID")}
                </th>
                <th className="pb-3 font-semibold text-gray-600">{t("payments.table.patient", "Patient")}</th>
                <th className="pb-3 font-semibold text-gray-600">{t("payments.table.date", "Date")}</th>
                <th className="pb-3 font-semibold text-gray-600">{t("payments.table.amount", "Amount")}</th>
                <th className="pb-3 font-semibold text-gray-600">{t("payments.table.status", "Status")}</th>
                <th className="pb-3 font-semibold text-gray-600">{t("payments.table.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockPayments.map(payment => <tr key={payment.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 pl-4 font-mono text-sm text-gray-500">
                    {payment.id}
                  </td>
                  <td className="py-4 font-medium text-gray-900">
                    {payment.patientName}
                  </td>
                  <td className="py-4 text-gray-600">{payment.date}</td>
                  <td className="py-4 font-medium text-gray-900">
                    {payment.amount}
                  </td>
                  <td className="py-4">
                    <Badge variant={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'destructive'}>
                      {t(`payments.statusOptions.${payment.status}`, payment.status)}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 relative">
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button onClick={() => toggleHelp(payment.id)} className="p-1 hover:bg-teal-50 rounded text-teal-600 transition-colors" aria-label="Help actions">
                          <HelpCircle className="w-4 h-4" />
                        </button>

                        {activeHelp === payment.id && <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-20 p-3">
                            <h4 className="font-semibold text-sm text-gray-900 mb-2">
                              {t("payments.help.title", "Available Actions")}
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-xs text-gray-600 p-2 hover:bg-gray-50 rounded text-left">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {t("payments.help.confirm.title", "Confirm Receipt")}
                                  </span>
                                  <p>{t("payments.help.confirm.desc", "Mark manually if paid in cash/transfer.")}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-gray-600 p-2 hover:bg-gray-50 rounded text-left">
                                <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {t("payments.help.refund.title", "Issue Refund")}
                                  </span>
                                  <p>{t("payments.help.refund.desc", "Initiate refund process for this transaction.")}</p>
                                </div>
                              </div>
                            </div>
                          </div>}
                      </div>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>;
}
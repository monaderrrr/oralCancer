import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar, CreditCard, ChevronRight, BadgePercent } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import API from "../../Api";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  doctorName: string;
  consultationFee: number;
  date: string;
  time: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export function InvoicesListPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/v1/booking/patient/invoices");
        setInvoices(res.data.data || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/patient/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Billing & Invoices</h1>
          <p className="text-slate-600">View and print all your consultation receipts.</p>
        </motion.div>

        {/* Invoice List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
          </div>
        ) : invoices.length === 0 ? (
          <Card className="p-12 text-center border-none shadow-sm space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">No Invoices</h3>
              <p className="text-sm text-slate-500 mt-1">You don't have any paid consultations yet.</p>
            </div>
            <Button onClick={() => navigate("/patient/doctors")}>
              Book a Consultation
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice, idx) => (
              <motion.div
                key={invoice._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => navigate(`/patient/invoice/${invoice._id}`)}
                  className="p-5 cursor-pointer hover:shadow-md transition bg-white border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                          Dr. {invoice.doctorName}
                        </h3>
                        <Badge variant="success" className="text-[10px] py-0.5 px-2">
                          {invoice.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{invoice.invoiceNumber}</p>
                      <div className="flex gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(invoice.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5" />
                          {invoice.paymentMethod.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-lg sm:text-xl font-extrabold text-teal-600">
                      ${invoice.consultationFee}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

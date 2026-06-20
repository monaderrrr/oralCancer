import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Printer, FileText, CheckCircle2, ShieldCheck, Download } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import API from "../../Api";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: string;
  paymentId: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  consultationFee: number;
  date: string;
  time: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  createdAt: string;
}

export function InvoiceDetailsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/v1/booking/patient/invoices/${invoiceId}`);
        setInvoice(res.data.data);
      } catch (err: any) {
        console.error("Error loading invoice:", err);
        setError(err.response?.data?.message || "Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <FileText className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Invoice not found</h2>
          <p className="text-sm text-slate-500">{error || "Could not retrieve invoice details."}</p>
          <Button onClick={() => navigate("/patient/dashboard")} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back navigation and Print buttons */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Print Receipt
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 sm:p-12 rounded-3xl border-none shadow-sm space-y-8 bg-white border border-slate-100 print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 border-b border-slate-100 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-extrabold text-sm">
                    O
                  </div>
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">OralScan AI</span>
                </div>
                <p className="text-xs text-slate-400">Oral Oncology Digital Consultations</p>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <span className="text-xs text-teal-600 uppercase tracking-widest font-extrabold">Official Invoice</span>
                <h2 className="text-xl font-mono font-bold text-slate-800">{invoice.invoiceNumber}</h2>
                <p className="text-xs text-slate-500">Issued: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To / Bill From */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Details</p>
                <p className="font-bold text-slate-800">{invoice.patientName}</p>
                <p className="text-xs text-slate-500">Care Recipient</p>
              </div>
              <div className="space-y-1 text-left sm:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Professional</p>
                <p className="font-bold text-slate-800">Dr. {invoice.doctorName}</p>
                <p className="text-xs text-slate-500">Certified Oral Specialist</p>
              </div>
            </div>

            {/* Appointment specifics */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Consultation Date</span>
                <span className="font-bold text-slate-800">{new Date(invoice.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Time Slot</span>
                <span className="font-bold text-slate-800">{invoice.time}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Method</span>
                <span className="font-bold text-slate-800 uppercase">{invoice.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Transaction ID</span>
                <span className="font-mono font-bold text-slate-800 truncate block">{invoice.transactionId}</span>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Breakdown</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">Premium Specialist Consultation Session</span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          Clinical assessment, scan review, and personalized care recommendations.
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-800">${invoice.consultationFee}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 pt-6 flex flex-col items-end space-y-2">
              <div className="w-64 text-sm space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${invoice.consultationFee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes / Fees:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold text-slate-800">
                  <span>Total Paid:</span>
                  <span className="text-teal-600">${invoice.consultationFee}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400 space-y-1">
              <p className="flex items-center justify-center gap-1 font-semibold text-teal-600">
                <ShieldCheck className="w-4 h-4" /> Securely Verified Consultation Invoice
              </p>
              <p>Thank you for choosing OralScan AI. For clinical help, please visit the dashboard.</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

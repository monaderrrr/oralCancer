import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Calendar, Clock, User, CheckCircle, XCircle, Edit } from 'lucide-react';
import { DoctorSidebar } from '../../components/doctor/DoctorSidebar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useTranslation } from "react-i18next"; 

interface Booking {
  id: string;
  patientName: string;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed';
  notes?: string;
}

const mockTodayBookings: Booking[] = [{
  id: '1',
  patientName: 'John Smith',
  time: '09:00 AM',
  reason: 'Initial Consultation',
  status: 'confirmed',
  notes: 'First-time patient, high-risk scan result'
}, {
  id: '2',
  patientName: 'Sarah Williams',
  time: '10:30 AM',
  reason: 'Follow-up Review',
  status: 'confirmed'
}, {
  id: '3',
  patientName: 'Michael Brown',
  time: '02:00 PM',
  reason: 'Scan Results Discussion',
  status: 'pending',
  notes: 'Awaiting confirmation'
}, {
  id: '4',
  patientName: 'Emily Davis',
  time: '03:30 PM',
  reason: 'Post-Treatment Check',
  status: 'confirmed'
}];

export function BookingsManagementPage() {
  const { t } = useTranslation(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState(mockTodayBookings);

  const handleConfirm = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? {
      ...b,
      status: 'confirmed' as const
    } : b));
  };

  const handleComplete = (bookingId: string) => {
    setBookings(bookings.map(b => b.id === bookingId ? {
      ...b,
      status: 'completed' as const
    } : b));
  };

  const handleCancel = (bookingId: string) => {
    if (confirm(t('bookings.confirmCancel', 'Are you sure you want to cancel this appointment?'))) {
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{t('appointment.status.pending', 'Pending')}</Badge>;
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-700">{t('appointment.status.confirmed', 'Confirmed')}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{t('appointment.status.completed', 'Completed')}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DoctorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold text-lg text-slate-900">{t('sidebar.bookings', 'Bookings')}</span>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8 text-left">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {t('bookings.todayTitle', "Today's Appointments")}
              </h1>
              <p className="text-slate-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('bookings.summary.total', 'Total Today')}</span>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {bookings.length}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('bookings.summary.confirmed', 'Confirmed')}</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t('bookings.summary.pending', 'Pending')}</span>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </Card>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {bookings.map((booking, index) => <motion.div key={booking.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }}>
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                          {booking.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {booking.patientName}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {booking.reason}
                          </p>
                          {booking.notes && <p className="text-sm text-slate-500 italic">
                              {t('bookings.notePrefix', 'Note')}: {booking.notes}
                            </p>}
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{booking.time}</span>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      {booking.status === 'pending' && <Button size="sm" leftIcon={<CheckCircle className="w-4 h-4" />} onClick={() => handleConfirm(booking.id)}>
                          {t('appointment.actions.approve', 'Confirm')}
                        </Button>}

                      {booking.status === 'confirmed' && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" leftIcon={<CheckCircle className="w-4 h-4" />} onClick={() => handleComplete(booking.id)}>
                          {t('actions.markComplete', 'Mark Complete')}
                        </Button>}

                      <Button size="sm" variant="outline" leftIcon={<Edit className="w-4 h-4" />} onClick={() => alert('Reschedule feature (UI only)')}>
                        {t('appointment.actions.reschedule', 'Reschedule')}
                      </Button>

                      <Button size="sm" variant="ghost" leftIcon={<XCircle className="w-4 h-4" />} onClick={() => handleCancel(booking.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        {t('appointment.actions.cancel', 'Cancel')}
                      </Button>
                    </div>
                  </Card>
                </motion.div>)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
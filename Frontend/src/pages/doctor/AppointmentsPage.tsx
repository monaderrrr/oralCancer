import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Menu, Plus } from 'lucide-react';
import { DoctorSidebar } from '../../components/doctor/DoctorSidebar';
import { Button } from '../../components/ui/Button';
import { AppointmentCard } from '../../components/doctor/AppointmentCard';
import { useTranslation } from "react-i18next"; 

const TODAY_APPOINTMENTS = [{
  id: '1',
  patientName: 'Sarah Johnson',
  time: '09:00 AM',
  date: 'Today',
  reason: 'Initial Consultation - High Risk Scan',
  status: 'confirmed' as const,
  type: 'video' as const
}, {
  id: '2',
  patientName: 'Michael Chen',
  time: '10:30 AM',
  date: 'Today',
  reason: 'Follow-up Review',
  status: 'confirmed' as const,
  type: 'in-person' as const
}, {
  id: '3',
  patientName: 'Emily Davis',
  time: '02:00 PM',
  date: 'Today',
  reason: 'Scan Results Discussion',
  status: 'pending' as const,
  type: 'video' as const
}];

const UPCOMING_APPOINTMENTS = [{
  id: '4',
  patientName: 'Robert Wilson',
  time: '11:00 AM',
  date: 'Tomorrow',
  reason: 'Routine Check-up',
  status: 'confirmed' as const,
  type: 'in-person' as const
}, {
  id: '5',
  patientName: 'Jessica Taylor',
  time: '03:30 PM',
  date: 'Tomorrow',
  reason: 'Symptom Consultation',
  status: 'pending' as const,
  type: 'video' as const
}, {
  id: '6',
  patientName: 'David Miller',
  time: '09:00 AM',
  date: 'Mar 24',
  reason: 'Follow-up',
  status: 'confirmed' as const,
  type: 'in-person' as const
}];

export function AppointmentsPage() {
  const { t } = useTranslation(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DoctorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-bold text-lg text-slate-900">
              {t('sidebar.appointments', 'Appointments')}
            </span>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t('sidebar.appointments', 'Appointments')}
                </h1>
                <p className="text-slate-600">
                  {t('appointments.subtitle', 'Manage your schedule and patient consultations')}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white rounded-lg border border-slate-200 p-1 flex">
                  <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                    {t('appointments.view.list', 'List View')}
                  </button>
                  <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
                    {t('appointments.view.calendar', 'Calendar')}
                  </button>
                </div>
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  {t('appointments.newBtn', 'New Appointment')}
                </Button>
              </div>
            </div>

            {/* Today's Schedule */}
            <section className="text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-teal-600" />
                  {t('appointments.todaySchedule', "Today's Schedule")}
                </h2>
                <span className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TODAY_APPOINTMENTS.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
              </div>
            </section>

            {/* Upcoming */}
            <section className="text-left">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {t('appointments.upcoming', 'Upcoming')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {UPCOMING_APPOINTMENTS.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );   
}
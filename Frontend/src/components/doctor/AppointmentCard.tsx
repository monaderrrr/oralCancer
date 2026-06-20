import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Calendar, CheckCircle, XCircle, Video, Users } from 'lucide-react';
interface Appointment {
  id: string;
  patientName: string;
  time: string;
  date: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'video' | 'in-person';
}
interface AppointmentCardProps {
  appointment: Appointment;
  onApprove?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
}
export function AppointmentCard({
  appointment,
  onApprove,
  onReschedule,
  onCancel
}: AppointmentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };
  return <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {appointment.patientName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {appointment.patientName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  {appointment.type === 'video' ? <Video className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {appointment.type === 'video' ? 'Video Consult' : 'In-Person'}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            {appointment.time}
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            {appointment.date}
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg mb-4">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
            Reason for Visit
          </p>
          <p className="text-sm text-slate-700">{appointment.reason}</p>
        </div>

        <div className="flex gap-2">
          {appointment.status === 'pending' ? <>
              <Button size="sm" fullWidth onClick={() => onApprove?.(appointment.id)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" fullWidth onClick={() => onReschedule?.(appointment.id)}>
                Reschedule
              </Button>
            </> : appointment.status === 'confirmed' ? <>
              <Button size="sm" fullWidth leftIcon={<Video className="w-4 h-4" />}>
                Start Call
              </Button>
              <Button size="sm" variant="outline" fullWidth onClick={() => onCancel?.(appointment.id)}>
                Cancel
              </Button>
            </> : <Button size="sm" variant="outline" fullWidth>
              View Details
            </Button>}
        </div>
      </div>
    </Card>;
}
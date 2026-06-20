import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react';
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  nextAvailable: string;
  image?: string;
  location: string;
}
interface DoctorBookingProps {
  doctors: Doctor[];
  onBookAppointment: (doctorId: string) => void;
  isLoading?: boolean;
}
export function DoctorBooking({
  doctors,
  onBookAppointment,
  isLoading = false
}: DoctorBookingProps) {
  if (isLoading) {
    return <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading available doctors...</p>
      </div>;
  }
  if (doctors.length === 0) {
    return <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No doctors available at this time.</p>
      </div>;
  }
  return <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Available Doctors
        </h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {doctors.length} Specialists Found
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(doctor => <Card key={doctor.id} className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex gap-4">
              {/* Avatar Placeholder */}
              <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-xl font-bold">
                {doctor.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 truncate flex items-center gap-1">
                      {doctor.name}
                      {doctor.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium">
                      {doctor.specialty}
                    </p>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-xs font-medium text-yellow-700 border border-yellow-100">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {doctor.rating}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center text-sm text-green-700 bg-green-50 w-fit px-2 py-0.5 rounded">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Next: {doctor.nextAvailable}
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="primary" className="w-full text-sm py-2" onClick={() => onBookAppointment(doctor.id)}>
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          </Card>)}
      </div>
    </div>;
}
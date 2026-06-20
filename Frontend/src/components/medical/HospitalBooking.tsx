import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Navigation, Star, Clock, Building2 } from 'lucide-react';
export interface Hospital {
  id: string;
  name: string;
  distance: number; // in km
  address: string;
  rating: number;
  nextAvailable: string;
  image?: string;
}
interface HospitalBookingProps {
  hospitals: Hospital[];
  onBookHospital: (hospitalId: string) => void;
  isLoading?: boolean;
}
type FilterType = 'nearest' | 'earliest' | 'rated';
export function HospitalBooking({
  hospitals,
  onBookHospital,
  isLoading = false
}: HospitalBookingProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('nearest');
  const getSortedHospitals = () => {
    const sorted = [...hospitals];
    switch (activeFilter) {
      case 'nearest':
        return sorted.sort((a, b) => a.distance - b.distance);
      case 'rated':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'earliest':
        // Mock sorting for dates since they are strings in this example
        return sorted;
      default:
        return sorted;
    }
  };
  if (isLoading) {
    return <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Finding nearby hospitals...</p>
      </div>;
  }
  const displayedHospitals = getSortedHospitals();
  return <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Nearby Hospitals & Clinics
        </h3>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button variant={activeFilter === 'nearest' ? 'primary' : 'outline'} onClick={() => setActiveFilter('nearest')} className="text-xs px-3 py-1.5 h-auto whitespace-nowrap">
            Nearest
          </Button>
          <Button variant={activeFilter === 'earliest' ? 'primary' : 'outline'} onClick={() => setActiveFilter('earliest')} className="text-xs px-3 py-1.5 h-auto whitespace-nowrap">
            Earliest Appointment
          </Button>
          <Button variant={activeFilter === 'rated' ? 'primary' : 'outline'} onClick={() => setActiveFilter('rated')} className="text-xs px-3 py-1.5 h-auto whitespace-nowrap">
            Highest Rated
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedHospitals.map(hospital => <Card key={hospital.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{hospital.name}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" />
                      {hospital.address}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 bg-white">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {hospital.rating}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3" /> Distance
                  </div>
                  <div className="font-semibold text-gray-900">
                    {hospital.distance} km
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="text-xs text-green-700 mb-1 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Next Slot
                  </div>
                  <div className="font-semibold text-green-800">
                    {hospital.nextAvailable}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => onBookHospital(hospital.id)}>
                View Details & Book
              </Button>
            </div>
          </Card>)}
      </div>

      {displayedHospitals.length === 0 && <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
          No hospitals found matching your criteria.
        </div>}
    </div>;
}
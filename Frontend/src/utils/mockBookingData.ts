// src/mocks/aiBookingMocks.ts
export interface Provider {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviewCount: number;
  experience: number;
  availability: 'available' | 'limited' | 'unavailable';
  nextAvailable?: Date;
  imageUrl?: string;
  location: {
    address: string;
    city: string;
    distance: number;
  };
  consultationFee: number;
  suitableRiskLevel?: 'low' | 'medium' | 'high'; // مناسب للمستخدم حسب نتيجة AI
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  date: Date;
  time: string;
  duration: number;
  type: 'video' | 'in-person';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
  location?: string;
  meetingLink?: string;
  cancelledBy?: 'patient' | 'doctor';
  cancelReason?: string;
  outcome?: string;
  relatedScanId?: string; // مرتبط بنتيجة AI
  riskLevel?: 'low' | 'medium' | 'high'; // نتيجة الفحص
  aiConfidenceScore?: number; // نسبة AI
}

// ----------- Providers Mock ----------
export const mockProviders: Provider[] = [
  {
    id: 'p1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Oral Oncology',
    hospital: 'City General Hospital',
    rating: 4.9,
    reviewCount: 127,
    experience: 15,
    availability: 'available',
    nextAvailable: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: { address: '123 Medical Plaza', city: 'San Francisco, CA', distance: 2.3 },
    consultationFee: 150,
    suitableRiskLevel: 'high',
  },
  {
    id: 'p2',
    name: 'Dr. Michael Chen',
    specialty: 'Oral Surgery',
    hospital: 'University Medical Center',
    rating: 4.8,
    reviewCount: 93,
    experience: 12,
    availability: 'limited',
    nextAvailable: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: { address: '456 Healthcare Ave', city: 'San Francisco, CA', distance: 4.1 },
    consultationFee: 175,
    suitableRiskLevel: 'medium',
  },
  {
    id: 'p3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Oral Pathology',
    hospital: 'Bay Area Medical',
    rating: 4.9,
    reviewCount: 156,
    experience: 18,
    availability: 'available',
    nextAvailable: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    location: { address: '789 Wellness Blvd', city: 'Oakland, CA', distance: 6.8 },
    consultationFee: 200,
    suitableRiskLevel: 'medium',
  },
  {
    id: 'p4',
    name: 'Dr. James Wilson',
    specialty: 'General Dentistry',
    hospital: 'Community Health Clinic',
    rating: 4.7,
    reviewCount: 84,
    experience: 10,
    availability: 'available',
    nextAvailable: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    location: { address: '321 Care Street', city: 'Berkeley, CA', distance: 8.2 },
    consultationFee: 125,
    suitableRiskLevel: 'low',
  },
  {
    id: 'p5',
    name: 'Dr. Lisa Patel',
    specialty: 'Oral Medicine',
    hospital: 'Advanced Dental Institute',
    rating: 4.8,
    reviewCount: 102,
    experience: 14,
    availability: 'unavailable',
    location: { address: '555 Innovation Way', city: 'Palo Alto, CA', distance: 12.5 },
    consultationFee: 180,
    suitableRiskLevel: 'high',
  },
];

// ----------- Bookings Mock ----------
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    providerId: 'p1',
    providerName: 'Dr. Sarah Johnson',
    providerSpecialty: 'Oral Oncology',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '10:00 AM',
    duration: 30,
    type: 'video',
    status: 'confirmed',
    reason: 'Follow-up consultation',
    notes: 'Discuss recent AI scan results',
    meetingLink: 'https://meet.example.com/abc123',
    relatedScanId: 'scan123',
    riskLevel: 'high',
    aiConfidenceScore: 92,
  },
  {
    id: 'b2',
    providerId: 'p2',
    providerName: 'Dr. Michael Chen',
    providerSpecialty: 'Oral Surgery',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '2:30 PM',
    duration: 45,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Initial consultation',
    location: '456 Healthcare Ave, San Francisco, CA',
    relatedScanId: 'scan124',
    riskLevel: 'medium',
    aiConfidenceScore: 78,
  },
  {
    id: 'b3',
    providerId: 'p3',
    providerName: 'Dr. Emily Rodriguez',
    providerSpecialty: 'Oral Pathology',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: '11:00 AM',
    duration: 30,
    type: 'video',
    status: 'pending',
    reason: 'Second opinion',
    notes: 'Review AI scan images',
    relatedScanId: 'scan125',
    riskLevel: 'medium',
    aiConfidenceScore: 81,
  },
];
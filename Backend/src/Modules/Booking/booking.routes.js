import { Router } from 'express';
import { authenticationMiddleware } from '../../Middleware/authentication.middleware.js';
import { checkRole } from '../../Middleware/rbac.middleware.js';
import { 
  createSlotController,
  getAvailableSlotsController,
  getDoctorSlotsController,
  bookSlotController,
  cancelBookingController,
  getPatientBookingsController 
} from './booking.controller.js';
import { errorHandler } from '../../Middleware/error-handler.middleware.js';

const router = Router();

// Doctor: Create Slot
router.post('/slots', 
  authenticationMiddleware(), 
  checkRole(['doctor']), 
  errorHandler(createSlotController)
);

// Doctor: View All Their Slots
router.get('/my-slots', 
  authenticationMiddleware(), 
  checkRole(['doctor']), 
  errorHandler(getDoctorSlotsController)
);

// Public: Get Available Slots for Specific Doctor
router.get('/slots/available/:doctorId', 
  errorHandler(getAvailableSlotsController)
);

// Patient: Book Slot (FIRST-COME-FIRST-SERVED)
router.post('/book', 
  authenticationMiddleware(), 
  checkRole(['patient']), 
  errorHandler(bookSlotController)
);

// Patient: Cancel Booking
router.delete('/cancel/:slotId', 
  authenticationMiddleware(), 
  checkRole(['patient']), 
  errorHandler(cancelBookingController)
);

// Patient: Get My Bookings
router.get('/my-bookings', 
  authenticationMiddleware(), 
  checkRole(['patient']), 
  errorHandler(getPatientBookingsController)
);

// ==========================================
// MONETIZATION & PREMIUM CONSULTATION ROUTES
// ==========================================
import {
  getDoctorAvailability,
  updateDoctorAvailability,
  getDoctorAvailabilityForPatient,
  createBooking,
  processPayment,
  getPatientInvoices,
  getInvoiceDetails,
  getDoctorDashboard,
  getPatientDashboard,
  getAdminDashboard,
  triggerReminders,
} from "./booking-monetization.controller.js";

// Doctor Availability Settings
router.get('/doctor/availability-settings',
  authenticationMiddleware(),
  checkRole(['doctor']),
  errorHandler(getDoctorAvailability)
);

router.put('/doctor/availability-settings',
  authenticationMiddleware(),
  checkRole(['doctor']),
  errorHandler(updateDoctorAvailability)
);

// Patient Get Doctor Availability Slots
router.get('/patient/doctor-availability/:doctorId',
  authenticationMiddleware(),
  checkRole(['patient']),
  errorHandler(getDoctorAvailabilityForPatient)
);

// Patient Bookings
router.post('/patient/bookings/create',
  authenticationMiddleware(),
  checkRole(['patient']),
  errorHandler(createBooking)
);

router.post('/patient/bookings/:bookingId/pay',
  authenticationMiddleware(),
  checkRole(['patient']),
  errorHandler(processPayment)
);

// Invoices
router.get('/patient/invoices',
  authenticationMiddleware(),
  checkRole(['patient']),
  errorHandler(getPatientInvoices)
);

router.get('/patient/invoices/:id',
  authenticationMiddleware(),
  checkRole(['patient', 'doctor']),
  errorHandler(getInvoiceDetails)
);

// Dashboards
router.get('/doctor/dashboard/monetization',
  authenticationMiddleware(),
  checkRole(['doctor']),
  errorHandler(getDoctorDashboard)
);

router.get('/patient/dashboard/monetization',
  authenticationMiddleware(),
  checkRole(['patient']),
  errorHandler(getPatientDashboard)
);

router.get('/admin/dashboard/monetization',
  authenticationMiddleware(),
  checkRole(['admin']),
  errorHandler(getAdminDashboard)
);

// Reminders
router.post('/patient/bookings/reminders/trigger',
  authenticationMiddleware(),
  errorHandler(triggerReminders)
);

export default router;

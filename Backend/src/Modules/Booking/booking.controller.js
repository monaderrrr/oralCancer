import {
  createSlotService,
  getAvailableSlotsService,
  getDoctorSlotsService,
  bookSlotService,
  cancelBookingService,
  getPatientBookingsService,
} from './services/booking.service.js';
import { checkRole } from '../../Middleware/rbac.middleware.js';

/**
 * Controller: Doctor creates available slots
 * Body: { date, startTime, endTime }
 * Example: { "date": "2025-12-15", "startTime": "17:00", "endTime": "18:00" }
 */
export const createSlotController = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const doctorId = req.authUser._id;

    // Validate inputs
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'date, startTime, and endTime are required',
      });
    }

    // Validate date is future
    const slotDate = new Date(date);
    if (slotDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create slots in the past',
      });
    }

    const slot = await createSlotService(doctorId, date, startTime, endTime);

    return res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: slot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating slot',
    });
  }
};

/**
 * Controller: List available slots for a specific doctor
 * Params: { doctorId }
 */
export const getAvailableSlotsController = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required',
      });
    }

    const slots = await getAvailableSlotsService(doctorId);

    return res.status(200).json({
      success: true,
      message: 'Available slots retrieved',
      data: slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving slots',
    });
  }
};

/**
 * Controller: Get all slots for logged-in doctor
 */
export const getDoctorSlotsController = async (req, res) => {
  try {
    const doctorId = req.authUser._id;

    const slots = await getDoctorSlotsService(doctorId);

    return res.status(200).json({
      success: true,
      message: 'Doctor slots retrieved',
      data: slots,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving doctor slots',
    });
  }
};

/**
 * Controller: Patient books a slot (FIRST-COME-FIRST-SERVED)
 * Body: { slotId }
 * 
 * CRITICAL: This uses atomic MongoDB operations.
 * If multiple patients try to book the same slot simultaneously,
 * only the FIRST ONE to reach the database will succeed.
 */
export const bookSlotController = async (req, res) => {
  try {
    const { slotId } = req.body;
    const patientId = req.authUser._id;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'slotId is required',
      });
    }

    const bookedSlot = await bookSlotService(slotId, patientId);

    return res.status(200).json({
      success: true,
      message: 'Slot booked successfully (first-come-first-served)',
      data: bookedSlot,
    });
  } catch (error) {
    const statusCode = error.message.includes('already booked') ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error booking slot',
    });
  }
};

/**
 * Controller: Patient cancels their booking
 * Params: { slotId }
 */
export const cancelBookingController = async (req, res) => {
  try {
    const { slotId } = req.params;
    const patientId = req.authUser._id;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'slotId is required',
      });
    }

    const releasedSlot = await cancelBookingService(slotId, patientId);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: releasedSlot,
    });
  } catch (error) {
    const statusCode = error.message.includes('Forbidden') ? 403 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error cancelling booking',
    });
  }
};

/**
 * Controller: Get patient's bookings
 */
export const getPatientBookingsController = async (req, res) => {
  try {
    const patientId = req.authUser._id;

    const bookings = await getPatientBookingsService(patientId);

    return res.status(200).json({
      success: true,
      message: 'Patient bookings retrieved',
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving bookings',
    });
  }
};

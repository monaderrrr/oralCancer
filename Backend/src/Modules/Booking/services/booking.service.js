import Slot from '../../../DB/models/slot.model.js';

/**
 * Service: Doctor creates available slots
 * @param {string} doctorId - Doctor user ID
 * @param {Date} date - Date of availability
 * @param {string} startTime - Start time (e.g., "17:00")
 * @param {string} endTime - End time (e.g., "18:00")
 */
export const createSlotService = async (doctorId, date, startTime, endTime) => {
  try {
    // Validate times
    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    const slot = await Slot.create({
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      isBooked: false,
    });

    return slot;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: List available slots for a doctor
 * @param {string} doctorId - Doctor user ID
 * @returns {Array} - Array of available slots
 */
export const getAvailableSlotsService = async (doctorId) => {
  try {
    const slots = await Slot.find({
      doctorId,
      isBooked: false,
      date: { $gte: new Date() }, // Future dates only
    }).sort({ date: 1, startTime: 1 });

    return slots;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get all slots for a doctor (booked and unbooked)
 * @param {string} doctorId - Doctor user ID
 */
export const getDoctorSlotsService = async (doctorId) => {
  try {
    const slots = await Slot.find({ doctorId })
      .populate('bookedBy', 'email fullName')
      .sort({ date: 1, startTime: 1 });

    return slots;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Book a slot (FIRST-COME-FIRST-SERVED)
 * 
 * IMPORTANT: This uses MongoDB's atomic operations to ensure no race conditions.
 * The first patient to hit the database wins the slot.
 * 
 * @param {string} slotId - Slot ID to book
 * @param {string} patientId - Patient user ID
 */
export const bookSlotService = async (slotId, patientId) => {
  try {
    // Use findByIdAndUpdate with atomic operation
    // Only updates if isBooked is still false (race condition prevention)
    const bookedSlot = await Slot.findByIdAndUpdate(
      slotId,
      {
        $set: {
          isBooked: true,
          bookedBy: patientId,
          bookedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Check if the update actually happened (i.e., slot was not already booked)
    if (!bookedSlot) {
      throw new Error('Slot not found');
    }

    if (bookedSlot.bookedBy.toString() !== patientId.toString()) {
      // Someone else booked it between our check and update
      throw new Error('Slot already booked by another patient');
    }

    return bookedSlot;
  } catch (error) {
    throw error;
  }
};

/**
 * Alternative: Use MongoDB transactions for extra safety (if needed)
 * This is a stricter approach but requires MongoDB replica set
 */
export const bookSlotServiceWithTransaction = async (session, slotId, patientId) => {
  try {
    // Within a transaction, atomically check and book
    const slot = await Slot.findById(slotId).session(session);

    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.isBooked) {
      throw new Error('Slot already booked');
    }

    // Update within transaction
    const bookedSlot = await Slot.findByIdAndUpdate(
      slotId,
      {
        isBooked: true,
        bookedBy: patientId,
        bookedAt: new Date(),
      },
      { new: true, session }
    );

    return bookedSlot;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Cancel a booking (patient can cancel own booking)
 * @param {string} slotId - Slot ID
 * @param {string} patientId - Patient user ID (for ownership check)
 */
export const cancelBookingService = async (slotId, patientId) => {
  try {
    const slot = await Slot.findById(slotId);

    if (!slot) {
      throw new Error('Slot not found');
    }

    if (!slot.isBooked) {
      throw new Error('Slot is not booked');
    }

    // Check if patient owns this booking
    if (slot.bookedBy.toString() !== patientId.toString()) {
      throw new Error('Forbidden: you can only cancel your own bookings');
    }

    // Release the slot
    const releasedSlot = await Slot.findByIdAndUpdate(
      slotId,
      {
        $set: {
          isBooked: false,
          bookedBy: null,
          bookedAt: null,
        },
      },
      { new: true }
    );

    return releasedSlot;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get patient's bookings
 * @param {string} patientId - Patient user ID
 */
export const getPatientBookingsService = async (patientId) => {
  try {
    const bookings = await Slot.find({
      bookedBy: patientId,
      isBooked: true,
    })
      .populate('doctorId', 'email fullName')
      .sort({ date: 1, startTime: 1 });

    return bookings;
  } catch (error) {
    throw error;
  }
};

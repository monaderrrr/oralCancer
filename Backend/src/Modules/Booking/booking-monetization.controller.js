import {
  getDoctorAvailabilityService,
  updateDoctorAvailabilityService,
  calculateAvailableSlotsService,
  createBookingService,
  processPaymentService,
  getPatientInvoicesService,
  getInvoiceDetailsService,
  getDoctorMonetizationDashboardService,
  getPatientMonetizationDashboardService,
  getAdminMonetizationDashboardService,
  triggerRemindersService,
} from "./services/booking-monetization.service.js";

// 1. Doctor Availability Settings
export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.authUser._id;
    const config = await getDoctorAvailabilityService(doctorId);
    return res.status(200).json({
      success: true,
      message: "Availability settings retrieved successfully",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve availability settings",
    });
  }
};

export const updateDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.authUser._id;
    const config = await updateDoctorAvailabilityService(doctorId, req.body);
    return res.status(200).json({
      success: true,
      message: "Availability settings updated successfully",
      data: config,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update availability settings",
    });
  }
};

// 2. Doctor Availability for Patient
export const getDoctorAvailabilityForPatient = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // date in YYYY-MM-DD format

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'date' (YYYY-MM-DD) is required",
      });
    }

    const slots = await calculateAvailableSlotsService(doctorId, date);
    const config = await getDoctorAvailabilityService(doctorId);

    return res.status(200).json({
      success: true,
      message: "Slots retrieved successfully",
      data: {
        slots,
        config: {
          consultationFee: config.consultationFee,
          consultationDuration: config.consultationDuration,
          availableDays: config.availableDays,
          acceptFreeReviews: config.acceptFreeReviews,
          acceptFreeChats: config.acceptFreeChats,
          acceptPaidConsultations: config.acceptPaidConsultations,
          isOnline: config.isOnline,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor availability",
    });
  }
};

// 3. Create Booking
export const createBooking = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const { doctorId, date, timeSlot, scanId, notes } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "doctorId, date, and timeSlot are required fields",
      });
    }

    const booking = await createBookingService(patientId, doctorId, date, timeSlot, scanId, notes);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

// 4. Process Payment
export const processPayment = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const { bookingId } = req.params;
    const paymentData = req.body;

    const result = await processPaymentService(bookingId, patientId, paymentData, req);

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Payment processing failed",
    });
  }
};

// 5. Invoices
export const getPatientInvoices = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const invoices = await getPatientInvoicesService(patientId);
    return res.status(200).json({
      success: true,
      message: "Invoices retrieved successfully",
      data: invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve invoices",
    });
  }
};

export const getInvoiceDetails = async (req, res) => {
  try {
    const userId = req.authUser._id;
    const { id } = req.params;
    const invoice = await getInvoiceDetailsService(id, userId);
    return res.status(200).json({
      success: true,
      message: "Invoice details retrieved successfully",
      data: invoice,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve invoice details",
    });
  }
};

// 6. Dashboards
export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.authUser._id;
    if (req.authUser.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized dashboard access" });
    }
    const data = await getDoctorMonetizationDashboardService(doctorId);
    return res.status(200).json({
      success: true,
      message: "Doctor dashboard monetization data retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve doctor dashboard data",
    });
  }
};

export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.authUser._id;
    const data = await getPatientMonetizationDashboardService(patientId);
    return res.status(200).json({
      success: true,
      message: "Patient dashboard monetization data retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve patient dashboard data",
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (req.authUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized dashboard access" });
    }
    const data = await getAdminMonetizationDashboardService();
    return res.status(200).json({
      success: true,
      message: "Admin dashboard monetization data retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve admin dashboard data",
    });
  }
};

// 7. Reminders
export const triggerReminders = async (req, res) => {
  try {
    const result = await triggerRemindersService(req);
    return res.status(200).json({
      success: true,
      message: "Reminders triggered successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to trigger reminders",
    });
  }
};

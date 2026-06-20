import DoctorAvailability from "../../../DB/models/doctor-availability.model.js";
import Booking from "../../../DB/models/booking.model.js";
import Payment from "../../../DB/models/payment.model.js";
import Invoice from "../../../DB/models/invoice.model.js";
import User from "../../../DB/models/users.model.js";
import { createNotification } from "../../Notifications/services/notification.service.js";

// ==========================================
// 1. DOCTOR CONFIGURATION & AVAILABILITY
// ==========================================

export const getDoctorAvailabilityService = async (doctorId) => {
  let config = await DoctorAvailability.findOne({ doctorId });
  if (!config) {
    // Create default settings if not exists
    config = await DoctorAvailability.create({ doctorId });
  }
  return config;
};

export const updateDoctorAvailabilityService = async (doctorId, data) => {
  const {
    consultationFee,
    consultationDuration,
    availableDays,
    availableTimeSlots,
    isOnline,
    acceptFreeReviews,
    acceptFreeChats,
    acceptPaidConsultations,
  } = data;

  const config = await DoctorAvailability.findOneAndUpdate(
    { doctorId },
    {
      $set: {
        consultationFee,
        consultationDuration,
        availableDays,
        availableTimeSlots,
        isOnline,
        acceptFreeReviews,
        acceptFreeChats,
        acceptPaidConsultations,
      },
    },
    { new: true, upsert: true }
  );

  // Update mirrored fee/workingDays fields in doctor profile User document for discovery
  await User.findByIdAndUpdate(doctorId, {
    $set: {
      consultationFee: consultationFee || 0,
      workingDays: availableDays ? availableDays.join(", ") : "Monday, Tuesday, Wednesday, Thursday, Friday",
    },
  });

  return config;
};

export const calculateAvailableSlotsService = async (doctorId, dateString) => {
  const config = await getDoctorAvailabilityService(doctorId);
  if (!config || !config.isOnline) {
    return [];
  }

  const queryDate = new Date(dateString);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[queryDate.getDay()];

  // Check if doctor works on this day
  if (!config.availableDays.includes(dayName)) {
    return [];
  }

  // Get already booked appointments on this day
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  const activeBookings = await Booking.find({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["confirmed", "pending", "in_progress"] },
  }).select("timeSlot");

  const bookedSlots = activeBookings.map((b) => b.timeSlot);

  // Map slots
  const duration = config.consultationDuration;
  const slots = config.availableTimeSlots.map((startTime) => {
    // Calculate endTime based on duration
    const [hours, minutes] = startTime.split(":").map(Number);
    const startMins = hours * 60 + minutes;
    const endMins = startMins + duration;
    
    const endHours = Math.floor(endMins / 60).toString().padStart(2, "0");
    const endMinutes = (endMins % 60).toString().padStart(2, "0");
    const endTime = `${endHours}:${endMinutes}`;
    const timeSlotString = `${startTime} - ${endTime}`;

    const isBooked = bookedSlots.includes(timeSlotString);

    return {
      startTime,
      endTime,
      timeSlot: timeSlotString,
      isAvailable: !isBooked,
      status: isBooked ? "Unavailable" : "Available",
    };
  });

  return slots;
};

// ==========================================
// 2. APPOINTMENT BOOKING SYSTEM
// ==========================================

export const createBookingService = async (patientId, doctorId, dateStr, timeSlot, scanId = null, notes = "") => {
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== "doctor") {
    throw new Error("Doctor not found.");
  }

  const config = await getDoctorAvailabilityService(doctorId);
  if (!config.acceptPaidConsultations) {
    throw new Error("Doctor does not accept premium consultations.");
  }

  // Verify slot availability
  const slots = await calculateAvailableSlotsService(doctorId, dateStr);
  const targetSlot = slots.find((s) => s.timeSlot === timeSlot);
  
  if (!targetSlot) {
    throw new Error("Invalid time slot.");
  }
  if (!targetSlot.isAvailable) {
    throw new Error("This slot is already booked.");
  }

  // Generate Booking ID
  const dateFormatted = dateStr.replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
  const bookingId = `BK-${dateFormatted}-${randomSuffix}`;

  const booking = await Booking.create({
    bookingId,
    patientId,
    doctorId,
    scanId: scanId || null,
    date: new Date(dateStr),
    timeSlot,
    duration: config.consultationDuration,
    consultationFee: config.consultationFee,
    status: "pending",
    paymentStatus: "pending",
    notes,
  });

  return booking;
};

// ==========================================
// 3. PAYMENT PROCESSING & INVOICES
// ==========================================

export const processPaymentService = async (bookingId, patientId, paymentData, req = null) => {
  const booking = await Booking.findById(bookingId).populate("doctorId patientId");
  if (!booking) {
    throw new Error("Booking record not found.");
  }
  if (booking.patientId._id.toString() !== patientId.toString()) {
    throw new Error("Unauthorized checkout.");
  }
  if (booking.status === "confirmed") {
    throw new Error("This consultation has already been confirmed & paid.");
  }

  const { paymentMethod, cardInfo, phoneNumber, instapayAddress } = paymentData;

  // Fake Processing Gateways Validation
  if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
    if (!cardInfo || !cardInfo.cardHolderName || !cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv) {
      throw new Error("Cardholder details are incomplete.");
    }
    const cleanNum = cardInfo.cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 15 || cleanNum.length > 19) {
      throw new Error("Invalid card number format.");
    }
    if (cardInfo.cvv.length < 3 || cardInfo.cvv.length > 4) {
      throw new Error("Invalid CVV format.");
    }
    const expiryPattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!expiryPattern.test(cardInfo.expiryDate)) {
      throw new Error("Expiry date format must be MM/YY.");
    }
  } else if (paymentMethod === "vodafone_cash") {
    if (!phoneNumber) {
      throw new Error("Vodafone Cash mobile number is required.");
    }
    const phonePattern = /^01[0125][0-9]{8}$/;
    if (!phonePattern.test(phoneNumber)) {
      throw new Error("Invalid mobile number format.");
    }
  } else if (paymentMethod === "instapay") {
    if (!instapayAddress || !instapayAddress.includes("@")) {
      throw new Error("Invalid InstaPay address format.");
    }
  } else {
    throw new Error("Unsupported payment gateway method.");
  }

  // Create payment record
  const transactionId = `TXN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const maskedCardNum = cardInfo?.cardNumber
    ? `•••• •••• •••• ${cardInfo.cardNumber.replace(/\s+/g, "").slice(-4)}`
    : null;

  const payment = await Payment.create({
    transactionId,
    bookingId: booking._id,
    patientId: booking.patientId._id,
    amount: booking.consultationFee,
    paymentMethod,
    status: "paid",
    cardInfo: cardInfo ? {
      cardHolderName: cardInfo.cardHolderName,
      cardNumberMasked: maskedCardNum,
    } : undefined,
    paymentIdentifier: phoneNumber || instapayAddress || null,
  });

  // Create Invoice
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const invoice = await Invoice.create({
    invoiceNumber,
    bookingId: booking._id,
    paymentId: payment._id,
    patientId: booking.patientId._id,
    doctorId: booking.doctorId._id,
    patientName: booking.patientId.fullName || "Patient",
    doctorName: booking.doctorId.fullName || "Doctor",
    consultationFee: booking.consultationFee,
    date: booking.date,
    time: booking.timeSlot,
    paymentMethod: paymentMethod.replace(/_/g, " ").toUpperCase(),
    paymentStatus: "PAID",
    transactionId,
  });

  // Update Booking Statuses
  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  await booking.save();

  // Create Notifications (Patient notifications)
  await createNotification({
    userId: booking.patientId._id,
    type: "appointment",
    title: "Appointment Confirmed",
    message: `Your booking with Dr. ${booking.doctorId.fullName} on ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot} is confirmed.`,
    targetId: booking._id.toString(),
    targetRoute: "/patient/dashboard",
    req,
  });

  await createNotification({
    userId: booking.patientId._id,
    type: "appointment",
    title: "Payment Successful",
    message: `Payment of $${booking.consultationFee} received for booking ${booking.bookingId}. Transaction ID: ${transactionId}.`,
    targetId: invoice._id.toString(),
    targetRoute: "/patient/dashboard", // redirects to invoice
    req,
  });

  // Create Notifications (Doctor notifications)
  await createNotification({
    userId: booking.doctorId._id,
    type: "appointment",
    title: "New Appointment Booked",
    message: `Patient ${booking.patientId.fullName} booked a consultation on ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}.`,
    targetId: booking._id.toString(),
    targetRoute: "/doctor/dashboard",
    req,
  });

  await createNotification({
    userId: booking.doctorId._id,
    type: "appointment",
    title: "Payment Received",
    message: `Consultation fee of $${booking.consultationFee} has been successfully paid by ${booking.patientId.fullName}.`,
    targetId: booking._id.toString(),
    targetRoute: "/doctor/dashboard",
    req,
  });

  return { payment, invoice, booking };
};

export const getPatientInvoicesService = async (patientId) => {
  return Invoice.find({ patientId }).sort({ createdAt: -1 }).lean();
};

export const getInvoiceDetailsService = async (invoiceId, userId) => {
  const invoice = await Invoice.findById(invoiceId).lean();
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.patientId.toString() !== userId.toString() && invoice.doctorId.toString() !== userId.toString()) {
    throw new Error("Unauthorized invoice view.");
  }
  return invoice;
};

// ==========================================
// 4. ANALYTICS & DASHBOARD METRICS
// ==========================================

export const getDoctorMonetizationDashboardService = async (doctorId) => {
  const bookings = await Booking.find({ doctorId }).populate("patientId", "fullName email phone").lean();
  
  const upcoming = bookings.filter((b) => b.status === "confirmed" && new Date(b.date) >= new Date());
  const completed = bookings.filter((b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.date) < new Date()));
  const pending = bookings.filter((b) => b.status === "pending" || b.paymentStatus === "pending");

  const totalEarnings = completed.reduce((sum, b) => sum + b.consultationFee, 0);

  // Group earnings by month for Recharts line chart (last 6 months)
  const monthlyEarnings = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleString("default", { month: "short" }),
      earnings: 0,
      count: 0,
      timestamp: d,
    };
  }).reverse();

  completed.forEach((b) => {
    const bDate = new Date(b.date);
    const item = monthlyEarnings.find(
      (m) => m.month === bDate.toLocaleString("default", { month: "short" }) && bDate.getFullYear() === m.timestamp.getFullYear()
    );
    if (item) {
      item.earnings += b.consultationFee;
      item.count += 1;
    }
  });

  const cleanMonthlyData = monthlyEarnings.map(({ month, earnings, count }) => ({ month, earnings, count }));

  // Upcoming paid bookings mapped cleanly
  const upcomingAppointmentsMapped = upcoming.map((u) => ({
    id: u._id,
    bookingId: u.bookingId,
    patientName: u.patientId?.fullName || "Patient",
    date: u.date,
    timeSlot: u.timeSlot,
    fee: u.consultationFee,
    status: u.status,
  }));

  // Completed history
  const completedAppointmentsMapped = completed.map((c) => ({
    id: c._id,
    bookingId: c.bookingId,
    patientName: c.patientId?.fullName || "Patient",
    date: c.date,
    timeSlot: c.timeSlot,
    fee: c.consultationFee,
  }));

  return {
    stats: {
      totalEarnings,
      completedConsultations: completed.length,
      upcomingAppointments: upcoming.length,
      pendingConsultations: pending.length,
    },
    charts: {
      revenueTrend: cleanMonthlyData,
    },
    upcomingAppointments: upcomingAppointmentsMapped,
    completedAppointments: completedAppointmentsMapped,
  };
};

export const getPatientMonetizationDashboardService = async (patientId) => {
  const bookings = await Booking.find({ patientId }).populate("doctorId", "fullName specialization profileImage").sort({ date: -1 }).lean();
  const invoices = await Invoice.find({ patientId }).sort({ createdAt: -1 }).lean();
  const payments = await Payment.find({ patientId }).populate("bookingId").sort({ createdAt: -1 }).lean();

  const activeAppointments = bookings.filter((b) => b.status === "confirmed" && new Date(b.date) >= new Date()).map((b) => ({
    id: b._id,
    bookingId: b.bookingId,
    doctorName: b.doctorId?.fullName || "Doctor",
    specialization: b.doctorId?.specialization || "Oral Health Specialist",
    profileImage: b.doctorId?.profileImage || null,
    date: b.date,
    timeSlot: b.timeSlot,
    fee: b.consultationFee,
    status: b.status,
    paymentStatus: b.paymentStatus,
  }));

  const history = bookings.filter((b) => b.status === "completed" || (b.status === "confirmed" && new Date(b.date) < new Date())).map((b) => ({
    id: b._id,
    bookingId: b.bookingId,
    doctorName: b.doctorId?.fullName || "Doctor",
    specialization: b.doctorId?.specialization || "Oral Health Specialist",
    date: b.date,
    timeSlot: b.timeSlot,
    fee: b.consultationFee,
  }));

  return {
    appointments: activeAppointments,
    history,
    invoices,
    payments: payments.map((p) => ({
      id: p._id,
      transactionId: p.transactionId,
      bookingId: p.bookingId?.bookingId,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      date: p.createdAt,
    })),
  };
};

export const getAdminMonetizationDashboardService = async () => {
  const bookings = await Booking.find().populate("patientId doctorId").lean();
  const payments = await Payment.find().populate("patientId bookingId").sort({ createdAt: -1 }).lean();
  
  const totalRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((sum, b) => sum + b.consultationFee, 0);

  // Revenue by doctor
  const doctorRevenueMap = {};
  bookings.filter((b) => b.paymentStatus === "paid").forEach((b) => {
    const docId = b.doctorId?._id?.toString();
    const docName = b.doctorId?.fullName || "Unknown Doctor";
    if (!docId) return;

    if (!doctorRevenueMap[docId]) {
      doctorRevenueMap[docId] = {
        name: docName,
        revenue: 0,
        count: 0,
      };
    }
    doctorRevenueMap[docId].revenue += b.consultationFee;
    doctorRevenueMap[docId].count += 1;
  });

  const doctorRevenueList = Object.values(doctorRevenueMap);

  return {
    stats: {
      totalRevenue,
      totalBookings: bookings.length,
      totalPayments: payments.length,
      totalActiveDoctors: doctorRevenueList.length,
    },
    doctorRevenue: doctorRevenueList,
    payments: payments.map((p) => ({
      id: p._id,
      transactionId: p.transactionId,
      bookingId: p.bookingId?.bookingId,
      patientName: p.patientId?.fullName || "Patient",
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      status: p.status,
      date: p.createdAt,
    })),
  };
};

// ==========================================
// 5. REMINDERS ENGINE
// ==========================================

export const triggerRemindersService = async (req = null) => {
  const now = new Date();
  
  // Find all confirmed upcoming bookings
  const confirmedBookings = await Booking.find({
    status: "confirmed",
    date: { $gte: now },
  }).populate("patientId doctorId");

  let sentReminders = 0;

  for (const booking of confirmedBookings) {
    // Parse the start time of the slot. Slot format: "13:00 - 13:30"
    const slotStartStr = booking.timeSlot.split(" - ")[0];
    const [hours, minutes] = slotStartStr.split(":").map(Number);
    
    const appointmentTime = new Date(booking.date);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const diffMs = appointmentTime.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    // Reminders intervals:
    // 24 Hours = 1440 mins (check between 1430 and 1450)
    // 1 Hour = 60 mins (check between 50 and 70)
    // 15 Minutes = 15 mins (check between 10 and 20)
    
    let reminderText = "";
    if (diffMins >= 1430 && diffMins <= 1450) {
      reminderText = "tomorrow (in 24 hours)";
    } else if (diffMins >= 50 && diffMins <= 70) {
      reminderText = "in 1 hour";
    } else if (diffMins >= 10 && diffMins <= 20) {
      reminderText = "in 15 minutes";
    }

    if (reminderText) {
      // Send reminder notifications
      // Patient notification
      await createNotification({
        userId: booking.patientId._id,
        type: "appointment",
        title: "Consultation Reminder",
        message: `Reminder: You have an upcoming consultation with Dr. ${booking.doctorId.fullName} ${reminderText} at ${booking.timeSlot}.`,
        targetId: booking._id.toString(),
        targetRoute: "/patient/dashboard",
        req,
      });

      // Doctor notification
      await createNotification({
        userId: booking.doctorId._id,
        type: "appointment",
        title: "Consultation Reminder",
        message: `Reminder: You have a scheduled consultation with ${booking.patientId.fullName} ${reminderText} at ${booking.timeSlot}.`,
        targetId: booking._id.toString(),
        targetRoute: "/doctor/dashboard",
        req,
      });

      sentReminders += 2;
    }
  }

  return { success: true, sentReminders };
};

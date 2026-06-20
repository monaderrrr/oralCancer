import 'dotenv/config';
import mongoose from "mongoose";
import { database_connection } from "../src/DB/connection.js";
import User from "../src/DB/models/users.model.js";
import Booking from "../src/DB/models/booking.model.js";
import Payment from "../src/DB/models/payment.model.js";
import Invoice from "../src/DB/models/invoice.model.js";
import Notification from "../src/DB/models/notification.model.js";
import DoctorAvailability from "../src/DB/models/doctor-availability.model.js";
import {
  createBookingService,
  processPaymentService
} from "../src/Modules/Booking/services/booking-monetization.service.js";

async function runTest() {
  console.log("🚀 Starting Booking → Payment → Invoice → Notification Integration Test...");

  // 1. Connect to Database
  const connected = await database_connection();
  if (!connected) {
    console.error("❌ Failed to connect to database");
    process.exit(1);
  }

  try {
    // 2. Setup Test Data
    console.log("\n👥 Setting up test patient and doctor...");
    const testPatient = await User.create({
      fullName: "Test Patient",
      email: `patient-${Date.now()}@test.com`,
      password: "HashedPassword123",
      role: "patient",
      isEmailVerified: true,
    });

    const testDoctor = await User.create({
      fullName: "Test Doctor",
      email: `doctor-${Date.now()}@test.com`,
      password: "HashedPassword123",
      role: "doctor",
      isEmailVerified: true,
      consultationFee: 150,
      workingDays: "Monday, Tuesday, Wednesday, Thursday, Friday",
    });

    // Create doctor availability settings
    console.log("📅 Initializing doctor availability slots...");
    const availability = await DoctorAvailability.create({
      doctorId: testDoctor._id,
      consultationFee: 150,
      consultationDuration: 30,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableTimeSlots: ["09:00", "09:30", "10:00"],
      isOnline: true,
      acceptPaidConsultations: true
    });

    // 3. Create Booking
    const dateStr = "2026-06-22"; // A future Monday
    const timeSlot = "09:00 - 09:30";
    console.log(`\n📅 Step 1: Creating pending booking for slot ${timeSlot} on ${dateStr}...`);
    const booking = await createBookingService(
      testPatient._id,
      testDoctor._id,
      dateStr,
      timeSlot,
      null,
      "Checking recurring ulcers"
    );

    console.log(`✅ Booking Created successfully. Booking ID: ${booking.bookingId}`);
    if (booking.status !== "pending") throw new Error("Booking status should be pending initially");

    // 4. Process Payment
    console.log("\n💳 Step 2: Processing Payment secure authorization...");
    const paymentData = {
      paymentMethod: "credit_card",
      cardInfo: {
        cardHolderName: "Test Patient",
        cardNumber: "1234 5678 1234 5678",
        expiryDate: "12/28",
        cvv: "123"
      }
    };

    const paymentResult = await processPaymentService(
      booking._id,
      testPatient._id,
      paymentData,
      null // mock req
    );

    console.log("✅ Payment Processed successfully!");
    
    // 5. Verification
    console.log("\n🔍 Step 3: Verifying database records...");
    
    // Verify booking state
    const updatedBooking = await Booking.findById(booking._id);
    console.log(`- Booking Status: ${updatedBooking.status} (Expected: confirmed)`);
    console.log(`- Payment Status: ${updatedBooking.paymentStatus} (Expected: paid)`);
    if (updatedBooking.status !== "confirmed" || updatedBooking.paymentStatus !== "paid") {
      throw new Error("Booking was not confirmed/paid correctly.");
    }

    // Verify Payment document
    const paymentRecord = await Payment.findOne({ bookingId: booking._id });
    console.log(`- Payment Document Found: ${paymentRecord ? "Yes" : "No"}`);
    console.log(`- Amount Paid: $${paymentRecord?.amount} (Expected: $150)`);
    if (!paymentRecord || paymentRecord.amount !== 150) {
      throw new Error("Payment record error.");
    }

    // Verify Invoice document
    const invoiceRecord = await Invoice.findOne({ bookingId: booking._id });
    console.log(`- Invoice Document Found: ${invoiceRecord ? "Yes" : "No"}`);
    console.log(`- Invoice Number: ${invoiceRecord?.invoiceNumber}`);
    if (!invoiceRecord || invoiceRecord.consultationFee !== 150) {
      throw new Error("Invoice record error.");
    }

    // Verify Notifications sent
    const notifications = await Notification.find({ 
      userId: { $in: [testPatient._id, testDoctor._id] } 
    });
    console.log(`- Notifications Created: ${notifications.length} (Expected: 4)`);
    notifications.forEach((n) => {
      console.log(`  * [${n.type}] User: ${n.userId} -> Title: "${n.title}"`);
    });
    if (notifications.length < 4) {
      throw new Error("Some notifications were not generated.");
    }

    console.log("\n🎉 ALL TESTS PASSED! Booking → Payment → Invoice → Notification integration runs perfectly.");

    // Clean up
    console.log("\n🧹 Cleaning up test records...");
    await User.deleteOne({ _id: testPatient._id });
    await User.deleteOne({ _id: testDoctor._id });
    await DoctorAvailability.deleteOne({ _id: availability._id });
    await Booking.deleteOne({ _id: booking._id });
    await Payment.deleteOne({ _id: paymentRecord._id });
    await Invoice.deleteOne({ _id: invoiceRecord._id });
    await Notification.deleteMany({ userId: { $in: [testPatient._id, testDoctor._id] } });
    console.log("🧹 Cleanup complete.");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database Disconnected.");
  }
}

runTest();

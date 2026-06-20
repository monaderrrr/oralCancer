import mongoose from "mongoose";

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    consultationDuration: {
      type: Number,
      default: 30, // in minutes
      min: 10,
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], // days of week
    },
    availableTimeSlots: {
      type: [String],
      default: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    },
    isOnline: {
      type: Boolean,
      default: true,
    },
    acceptFreeReviews: {
      type: Boolean,
      default: true,
    },
    acceptFreeChats: {
      type: Boolean,
      default: true,
    },
    acceptPaidConsultations: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DoctorAvailability =
  mongoose.models.DoctorAvailability ||
  mongoose.model("DoctorAvailability", doctorAvailabilitySchema);

export default DoctorAvailability;

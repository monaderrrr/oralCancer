import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: null,
    },

    // ================= ROLE =================
    role: {
      type: String,
      enum: ["patient", "doctor"],
      default: "patient",
      index: true,
    },

    // ================= DOCTOR ONLY =================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    specialization: {
      type: String,
      default: null,
    },

    medicalLicenseNumber: {
      type: String,
      default: null,
      immutable: true,
    },

    hospital: {
      type: String,
      default: null,
    },

    clinicAddress: {
      type: String,
      default: null,
    },

    googleMapsUrl: {
      type: String,
      default: null,
    },

    lat: {
      type: Number,
      default: null,
    },

    lng: {
      type: Number,
      default: null,
    },

    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },

    consultationFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    licenseUploads: [String],

    profileImage: {
      type: String,
      default: null,
    },

    medicalProof: {
      type: String,
      default: null,
    },

    // ================= REVIEWS =================
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // ================= FLAGS =================
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ================= OTP =================
    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },

    otpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

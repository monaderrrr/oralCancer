import mongoose from "mongoose";

const sharedScanAccessSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

sharedScanAccessSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

const SharedScanAccess =
  mongoose.models.SharedScanAccess ||
  mongoose.model("SharedScanAccess", sharedScanAccessSchema);

export default SharedScanAccess;

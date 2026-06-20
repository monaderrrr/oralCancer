import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    message: {
      type: String,
      required: [true, "Recommendation message is required"],
      trim: true,
    },
    recommendationType: {
      type: String,
      enum: ["follow-up-scan", "specialist-visit", "treatment", "monitoring"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
recommendationSchema.index({ patientId: 1, createdAt: -1 });
recommendationSchema.index({ scanId: 1 });
recommendationSchema.index({ status: 1 });

const Recommendation =
  mongoose.models.Recommendation || mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;

import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    scanType: {
      type: String,
      enum: ["routine", "follow-up"],
      default: "routine",
    },
    imageUrl: {
      type: String,
      required: false,
    },
    aiResult: {
      diagnosis: {
        type: String,
        enum: ["Non-Cancer", "Pre-Cancer", "Cancer (OSCC)", "Uncertain", "OOD"],
        required: true,
      },
      cancerProbability: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
      nonCancerProbability: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
      },
    },
    lesionType: {
      type: String,
      required: false,
    },
    aiRawResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },
    userAnswers: {
      type: Map,
      of: String,
      default: {},
    },
    sharedWithDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sharedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      required: false,
    },
    reviewStatus: {
      type: String,
      enum: ["Pending Review", "Reviewed"],
      default: "Pending Review",
      index: true,
    },
    doctorReview: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      doctorName: {
        type: String,
        required: false,
      },
      notes: {
        type: String,
        required: false,
      },
      recommendations: {
        type: String,
        required: false,
      },
      severity: {
        type: String,
        enum: ["Low", "Mild", "Moderate", "High"],
        required: false,
      },
      clinicalNotes: {
        type: String,
        required: false,
      },
      decision: {
        type: String,
        enum: ["follow-up", "biopsy", "specialist"],
        required: false,
      },
      messageToPatient: {
        type: String,
        required: false,
      },
      prescription: {
        type: String,
        required: false,
      },
      treatmentPlan: {
        type: String,
        required: false,
      },
      reviewedAt: {
        type: Date,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
scanSchema.index({ patientId: 1, createdAt: -1 });
scanSchema.index({ riskLevel: 1 });
scanSchema.index({ doctorId: 1, createdAt: -1 });
scanSchema.index({ sharedWithDoctor: 1, createdAt: -1 });

const Scan =
  mongoose.models.Scan || mongoose.model("Scan", scanSchema);

export default Scan;

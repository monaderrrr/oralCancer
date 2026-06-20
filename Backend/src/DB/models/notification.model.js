import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["welcome", "message", "doctor_approved", "doctor-review", "doctor_review", "scan_review", "appointment", "system"],
      default: "system",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    targetId: {
      type: String,
      default: null,
    },
    targetRoute: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.virtual("notificationId").get(function () {
  return this._id.toHexString();
});

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.notificationId = ret._id ? ret._id.toString() : null;
    return ret;
  },
});

notificationSchema.set("toObject", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.notificationId = ret._id ? ret._id.toString() : null;
    return ret;
  },
});

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;

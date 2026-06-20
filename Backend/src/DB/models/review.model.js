import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stars: { type: Number, min: 1, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
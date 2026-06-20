import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // Date of the slot
  startTime: { type: String, required: true }, // e.g., "17:00" (5 PM)
  endTime: { type: String, required: true },   // e.g., "18:00" (6 PM)
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookedAt: { type: Date, default: null }, // Timestamp of booking (for FCFS ordering)
}, { timestamps: true });

// Compound index to ensure no duplicate slots for same doctor on same date/time
slotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

const Slot = mongoose.models.Slot || mongoose.model('Slot', slotSchema);
export default Slot;

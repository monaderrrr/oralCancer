import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ['offline', 'online'],
      required: true,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false, // Becomes true after successful payment
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    // For offline appointments, link to slot
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
consultationSchema.index({ patientId: 1, isActive: 1 });
consultationSchema.index({ doctorId: 1, isActive: 1 });
consultationSchema.index({ stripeSessionId: 1 });

const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);

export default Consultation;


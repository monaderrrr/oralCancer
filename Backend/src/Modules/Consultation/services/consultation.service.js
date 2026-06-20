import Stripe from 'stripe';
import User from '../../../DB/models/users.model.js';
import Consultation from '../../../DB/models/consultation.model.js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe will not be initialized.');
}
const stripe = stripeKey ? new Stripe(stripeKey) : null;

/**
 * Service: Doctor sets/updates consultation fee
 * @param {string} doctorId - Doctor user ID
 * @param {number} fee - Consultation fee in EGP
 */
export const setConsultationFeeService = async (doctorId, fee) => {
  try {
    if (fee < 0) {
      throw new Error('Consultation fee cannot be negative');
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (doctor.role !== 'doctor') {
      throw new Error('Only doctors can set consultation fees');
    }

    doctor.consultationFee = fee;
    await doctor.save();

    return {
      success: true,
      message: 'Consultation fee updated successfully',
      consultationFee: doctor.consultationFee,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Patient initiates paid chat consultation
 * Creates Stripe Checkout Session for payment
 * @param {string} patientId - Patient user ID
 * @param {string} doctorId - Doctor user ID
 */
export const initiateConsultationService = async (patientId, doctorId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.');
    }

    // Validate doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (doctor.role !== 'doctor') {
      throw new Error('Invalid doctor ID');
    }

    if (doctor.consultationFee <= 0) {
      throw new Error('Doctor has not set a consultation fee');
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Convert EGP to cents (Stripe uses smallest currency unit)
    // 1 EGP = 100 piasters, but Stripe might not support EGP directly
    // For now, we'll use USD and convert: 1 EGP ≈ 0.032 USD (approximate)
    // Better approach: Use EGP if Stripe supports it, otherwise convert
    const feeInEGP = doctor.consultationFee;
    // Convert to USD cents (assuming 1 EGP = 0.032 USD, adjust as needed)
    // Or use EGP directly if Stripe supports it
    const amountInCents = Math.round(feeInEGP * 100); // Assuming EGP is supported, or convert appropriately

    // Create consultation record with pending status
    const consultation = await Consultation.create({
      patientId,
      doctorId,
      appointmentType: 'online',
      consultationFee: feeInEGP,
      paymentStatus: 'pending',
      isActive: false,
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: patient.email,
      line_items: [
        {
          price_data: {
            currency: 'egp', // Use EGP if supported, otherwise use 'usd'
            product_data: {
              name: `Online Consultation with Dr. ${doctor.fullName || doctor.username}`,
              description: 'Online chat consultation appointment',
            },
            unit_amount: amountInCents, // Amount in smallest currency unit
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/consultation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/consultation/cancel?consultation_id=${consultation._id}`,
      metadata: {
        consultationId: consultation._id.toString(),
        patientId: patientId.toString(),
        doctorId: doctorId.toString(),
        appointmentType: 'online',
      },
    });

    // Update consultation with Stripe session ID
    consultation.stripeSessionId = session.id;
    await consultation.save();

    return {
      success: true,
      consultationId: consultation._id,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Handle successful payment via webhook
 * @param {string} sessionId - Stripe Checkout Session ID
 */
export const handlePaymentSuccessService = async (sessionId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const consultation = await Consultation.findOne({ stripeSessionId: sessionId });

    if (!consultation) {
      throw new Error('Consultation not found for this session');
    }

    if (consultation.paymentStatus === 'paid') {
      // Already processed
      return {
        success: true,
        message: 'Payment already processed',
        consultation,
      };
    }

    // Retrieve session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update consultation
      consultation.paymentStatus = 'paid';
      consultation.isActive = true;
      consultation.startedAt = new Date();
      consultation.stripePaymentIntentId = session.payment_intent;

      await consultation.save();

      return {
        success: true,
        message: 'Consultation activated successfully',
        consultation,
      };
    } else {
      consultation.paymentStatus = 'failed';
      await consultation.save();

      throw new Error('Payment not completed');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get patient's consultations
 * @param {string} patientId - Patient user ID
 */
export const getPatientConsultationsService = async (patientId) => {
  try {
    const consultations = await Consultation.find({ patientId })
      .populate('doctorId', 'fullName email username consultationFee')
      .populate('slotId')
      .sort({ createdAt: -1 });

    return consultations;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get doctor's consultations
 * @param {string} doctorId - Doctor user ID
 */
export const getDoctorConsultationsService = async (doctorId) => {
  try {
    const consultations = await Consultation.find({ doctorId })
      .populate('patientId', 'fullName email username')
      .populate('slotId')
      .sort({ createdAt: -1 });

    return consultations;
  } catch (error) {
    throw error;
  }
};

/**
 * Service: Get active consultation between patient and doctor
 * @param {string} patientId - Patient user ID
 * @param {string} doctorId - Doctor user ID
 */
export const getActiveConsultationService = async (patientId, doctorId) => {
  try {
    const consultation = await Consultation.findOne({
      patientId,
      doctorId,
      isActive: true,
      appointmentType: 'online',
    })
      .populate('patientId', 'fullName email username')
      .populate('doctorId', 'fullName email username consultationFee');

    return consultation;
  } catch (error) {
    throw error;
  }
};


import Stripe from 'stripe';
import User from '../../DB/models/users.model.js';
// Note: Appointment and Chat models will be created when needed
// import Appointment from '../../DB/models/appointment.model.js';
// import Chat from '../../DB/models/chat.model.js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe will not be initialized.');
}
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Create a Stripe Checkout session for a one-off online-chat payment
export const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.' 
      });
    }

    const { doctorId } = req.body;
    const patientId = req.authUser && req.authUser._id;

    if (!doctorId) return res.status(400).json({ message: 'doctorId is required' });
    if (!patientId) return res.status(401).json({ message: 'Unauthorized' });

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });

    const fee = Number(doctor.consultationFee || 0);
    if (fee <= 0) return res.status(400).json({ message: 'Doctor has no consultation fee set' });

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancel`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: { name: `Online chat consultation with Dr. ${doctor.fullName || doctor.username}` },
            unit_amount: Math.round(fee * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        doctorId: String(doctorId),
        patientId: String(patientId),
        appointmentType: 'online-chat',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Error creating checkout session' });
  }
};

// Check a session status and create appointment + chat when payment completed
export const checkSessionStatus = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.' 
      });
    }

    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'session_id is required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const paymentStatus = session.payment_status || session.status;

    if (paymentStatus === 'paid') {
      const { doctorId, patientId } = session.metadata || {};
      if (!doctorId || !patientId) return res.status(400).json({ message: 'Missing metadata in session' });

      // TODO: Use Consultation model instead of Appointment/Chat when ready
      // For now, just return payment status
      // let appointment = await Appointment.findOne({ stripeSessionId: session_id });
      // if (!appointment) {
      //   appointment = await Appointment.create({
      //     doctor: doctorId,
      //     patient: patientId,
      //     type: 'online-chat',
      //     status: 'confirmed',
      //     paid: true,
      //     amount: session.amount_total ? session.amount_total / 100 : 0,
      //     currency: session.currency || 'egp',
      //     stripeSessionId: session_id,
      //   });
      //   await Chat.create({ participants: [doctorId, patientId], appointment: appointment._id });
      // }

      return res.status(200).json({ status: 'paid', message: 'Payment successful. Consultation will be activated via webhook.' });
    }

    return res.status(200).json({ status: paymentStatus });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Error checking session status' });
  }
};


// Cancel a Stripe subscription by subscriptionId
export const cancelSubscription = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.' 
      });
    }

    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ message: 'subscriptionId is required' });

    const result = await stripe.subscriptions.del(subscriptionId);
    return res.status(200).json({ message: 'Subscription cancelled', result });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Error cancelling subscription' });
  }
};

export default {
  createCheckoutSession,
  checkSessionStatus,
  cancelSubscription,
};

import Stripe from 'stripe';
import { handlePaymentSuccessService } from './services/consultation.service.js';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Stripe webhook will not work.');
}
const stripe = stripeKey ? new Stripe(stripeKey) : null;

/**
 * Webhook handler for Stripe events
 * Handles checkout.session.completed event for consultation payments
 * POST /api/v1/consultation/webhook
 */
export const consultationWebhookController = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Check if this is a consultation payment
    if (session.metadata && session.metadata.appointmentType === 'online') {
      try {
        if (session.payment_status === 'paid') {
          await handlePaymentSuccessService(session.id);
          console.log(`Consultation payment successful for session ${session.id}`);
        } else {
          console.log(`Payment not completed for session ${session.id}`);
        }
      } catch (error) {
        console.error('Error processing consultation payment:', error);
        // Don't return error to Stripe, log it instead
      }
    }
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};


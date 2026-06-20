/*
  Payment backend (Express + Stripe)
  - Endpoint: POST /create-payment-intent
  - Receives: { amount: 167.40, currency: 'usd' } (amount can be number or string)
  - Converts amount to cents before sending to Stripe
  - Returns: { clientSecret }
  - Notes: Never receive/process raw card data on this server. Use Stripe Elements on frontend.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import Stripe from 'stripe';

// Load environment variables from .env
config();

// Validate required env var
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY in environment. Please set it in .env');
  // Do not throw here - throw on server start to make the failure obvious
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

const app = express();
const PORT = process.env.PORT || 4242;

// Security middleware
app.use(helmet());
// Body parser for JSON
app.use(express.json());
// CORS - allow origin from env or all in dev
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin }));

// Basic health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Helper: convert decimal amount to cents
const toCents = (amount) => {
  // Accept numbers or numeric strings
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(n) || n <= 0) return null;
  // Round to 2 decimals then convert
  return Math.round((Math.round(n * 100) / 100) * 100);
};

// POST /create-payment-intent
// Body: { amount: 167.40, currency?: 'usd', metadata?: { ... } }
app.post('/create-payment-intent', async (req, res, next) => {
  try {
    const { amount, currency = 'usd', metadata } = req.body || {};

    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required (e.g. 167.40)' });
    }

    const amountInCents = toCents(amount);
    if (!amountInCents) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number' });
    }

    // Create a PaymentIntent on the server with the amount in cents.
    // We set automatic payment methods to allow multiple payment methods (card, etc.)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      // metadata is optional and useful for linking to your internal orders
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    // Only send client_secret to the client. Do NOT send any secret API keys.
    return res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (err) {
    // Pass to error handler
    next(err);
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err && err.stack ? err.stack : err);

  // Stripe error handling
  if (err && err.type === 'StripeCardError') {
    return res.status(402).json({ error: err.message });
  }

  // Generic error
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Warning: STRIPE_SECRET_KEY is not set. Set it in .env before using Stripe.');
  }
  console.log(`Payment server listening on port ${PORT}`);
});

export default app;

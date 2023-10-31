const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentID: {
    type: String,
    unique: true,
    required: true,
  },
  payment_type: {
    type: String,
    required: true,
    enum: ['DEBIT_CARD', 'CREDIT_CARD', 'BANK_ACCOUNT'],
  },
  payment_for: {
    type: String,
    enum: [
      'subscription_weekly',
      'subscription_monthly',
      'subscription_quarterly',
      'hourly',
      'daily',
    ],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_time: {
    type: Date,
    required: true,
  },
  payment_status: {
    type: String,
    enum: ['successful', 'failed', 'pending'],
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  stripeId: {
    type: String,
    required: true,
  },
});

const membershipSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  membershipPeriod: {
    type: String,
    required: true,
    enum: ['WEEKLY', 'MONTHLY', 'QUATERLY'],
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['GOLD', 'SILVER', 'PLATINUM'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  membershipPrice: {
    type: Number,
    required: true,
  },
  regionId: {
    type: String,
    required: true,
  },
});

/**
 * {
  id: 'pm_1O71HJIML3jMLAce6iugWQSr',
  object: 'payment_method',
  billing_details: {
    address: {
      city: 'New Brunswick',
      country: 'US',
      line1: '41 Phelps Ave',
      line2: 'Apt B',
      postal_code: '08904',
      state: 'New Jersey'
    },
    email: 'balusairam26@gmail.com',
    name: 'sairam',
    phone: '3530358556'
  },
  card: {
    brand: 'visa',
    checks: {
      address_line1_check: null,
      address_postal_code_check: null,
      cvc_check: 'unchecked'
    },
    country: 'US',
    exp_month: 10,
    exp_year: 2024,
    fingerprint: 'BSDHN7uXkVdKsjfq',
    funding: 'debit',
    generated_from: null,
    last4: '5556',
    networks: { available: [Array], preferred: null },
    three_d_secure_usage: { supported: true },
    wallet: null
  },
  created: 1698694657,
  customer: null,
  livemode: false,
  metadata: { user_id: '12345678' },
  type: 'card'
}
 */

const Payment = mongoose.model('Payment', paymentSchema);

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = {Payment, Membership};

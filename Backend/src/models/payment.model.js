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
    enum: ['successful', 'failed'],
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
  membershipType: {
    type: String,
    required: true,
    enum: ['WEEKLY', 'MONTHLY', 'QUATERLY'],
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

const Payment = mongoose.model('Payment', paymentSchema);

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = {Payment, Membership};

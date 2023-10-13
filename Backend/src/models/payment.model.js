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

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

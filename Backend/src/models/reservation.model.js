const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
    validate: {
      validator: function(endTime) {
        // Validate that end_time is greater than the current time
        return endTime > new Date();
      },
      message: 'End time must be greater than the current time.',
    },
  },
  reservation_id: {
    type: String,
    unique: true,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  parking_lot_id: {
    type: String,
    required: true,
  },
  parking_spot: {
    type: String,
  },
  reservation_created_time: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  },
  clock_in_time: {
    type: Date,
  },
  clock_out_time: {
    type: Date,
  },
  permit: {
    type: String,
    default: 'None',
  },
  reservation_status: {
    type: String,
    enum: ['inactive', 'active', 'cancelled', 'completed'],
    default: 'active',
  },
  paymentIds: {
    type: [String],
  },
  payment: {
    type: String,
    enum: ['completed', 'incomplete'],
    default: 'incomplete',
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;

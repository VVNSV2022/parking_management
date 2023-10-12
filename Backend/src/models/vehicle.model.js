const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: String, // Reference to the user associated with the vehicle
    required: true,
  },
  vehicleID: {
    type: String,
    unique: true,
    required: true,
  },
  vehicleActive: {
    type: Boolean,
    default: true,
  },
  licensePlateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  vehicleMake: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  vehicleModel: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  vehicleColor: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  vehicleYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
  VIN: {
    type: String,
    required: true,
    unique: true,
  },
  ownersName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 150,
  },
  isVehicleInsured: {
    type: Boolean,
    default: false,
  },
  isRental: {
    type: Boolean,
    default: false,
  },
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;

const {addressSchema} = require('./user.model.js');

const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  parkingLotID: {
    type: String,
    unique: true,
    required: true,
  },
  parkingLotName: {
    type: String,
    required: true,
  },
  regionID: {
    type: String,
    required: true,
  },
  address: addressSchema, // Embedding the address schema
  geoLocation: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number], // Store latitude and longitude as an array
  },
  numberOfParkingSpots: {
    type: Number,
    required: true,
  },
  disabledParkingSpots: {
    type: Number,
  },
  description: {
    smallDescription: String,
    accessibilityDescription: String,
    securityDescription: String,
  },
  operatingHours: {
    type: String,
    required: true,
  },
  contactInformation: {
    manager_name: String,
    manager_email: String,
    manager_phone: String,
  },
<<<<<<< HEAD
=======
});

const parkingLotPricingSchema = new mongoose.Schema({
  parking_lot_id: {
    type: String,
    required: true,
    unique: true,
  },
>>>>>>> 9e7eb84 (Customer subgroup commit)
  hourly_rate: {
    type: Number,
    required: true,
  },
  daily_rate: {
    type: Number,
    required: true,
  },
  subscription_type: {
    type: String,
    enum: ['platinum', 'gold', 'silver'],
    required: true,
  },
});

const regionSchema = new mongoose.Schema({
  regionId: {
    type: String,
    unique: true,
    required: true,
  },
  regionName: {
    type: String,
    required: true,
  },
  platinumPrice: {
    type: Number,
  },
  goldPrice: {
    type: Number,
  },
  bronzePrice: {
    type: Number,
  },
});

const ParkingLotPricing = mongoose.model(
    'ParkingLotPricing',
    parkingLotPricingSchema,
);

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);

const Region = mongoose.model('Region', regionSchema);

module.exports = {ParkingLot, ParkingLotPricing, Region};

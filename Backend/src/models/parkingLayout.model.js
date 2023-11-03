const mongoose = require('mongoose');

const parkingLayoutSchema = new mongoose.Schema({
  layout_id: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  contact: {
    type: String,
  },
  operatingHours: {
    type: String,
  },
  layoutType: {
    type: String,
    required: true,
    enum: ['Garage', 'Lot', 'Elevator'],
  },
  layoutInfo: {
    garage: {
      floors: Number,
      rowsPerFloor: Number,
      slotsPerRow: Number,
    },
    lot: {
      rows: Number,
      slotsPerRow: Number,
    },
    elevator: {
      levels: Number,
      slotsPerLevel: Number,
    },
  },
  perks: {
    type: String,
  },
});

const ParkingLayout = mongoose.model('ParkingLayout', parkingLayoutSchema);

module.exports = ParkingLayout;

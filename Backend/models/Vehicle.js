const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    fuelEfficiency: { type: Number, required: true },
    tankCapacity: { type: Number, required: true },
    fuelType: { type: String, default: 'Petrol' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
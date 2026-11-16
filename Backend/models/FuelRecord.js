const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);
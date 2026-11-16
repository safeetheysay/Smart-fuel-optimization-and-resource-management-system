const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    start: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number, default: 0 },
    estimatedFuel: { type: Number, default: 0 },
    estimatedTime: { type: Number, default: 0 },
    crisisMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
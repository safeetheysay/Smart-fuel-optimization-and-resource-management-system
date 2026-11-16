const router = require('express').Router();
const auth = require('../middleware/auth');
const FuelRecord = require('../models/FuelRecord');
const Trip = require('../models/Trip');

router.use(auth);

router.get('/summary', async (req, res) => {
  const { from, to, vehicle } = req.query;

  const fuelFilter = { user: req.user.id };
  const tripFilter = { user: req.user.id };

  if (from || to) {
    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      range.$lte = end;
    }
    fuelFilter.date = range;
    tripFilter.createdAt = range;
  }

  if (vehicle) {
    fuelFilter.vehicle = vehicle;
    tripFilter.vehicle = vehicle;
  }

  const fuel = await FuelRecord.find(fuelFilter).populate('vehicle');
  const trips = await Trip.find(tripFilter);

  const totalCost = fuel.reduce((s, r) => s + r.cost, 0);
  const totalLiters = fuel.reduce((s, r) => s + r.quantity, 0);
  const totalDistance = trips.reduce((s, t) => s + t.distance, 0);

  const byVehicle = {};
  fuel.forEach((r) => {
    const key = r.vehicle ? r.vehicle.name : 'Unknown';
    if (!byVehicle[key]) byVehicle[key] = { liters: 0, cost: 0 };
    byVehicle[key].liters += r.quantity;
    byVehicle[key].cost += r.cost;
  });

  const byMonth = {};
  fuel.forEach((r) => {
    const key = new Date(r.date).toISOString().slice(0, 7);
    byMonth[key] = (byMonth[key] || 0) + r.cost;
  });

  res.json({ totalCost, totalLiters, totalDistance, byVehicle, byMonth });
});

module.exports = router;
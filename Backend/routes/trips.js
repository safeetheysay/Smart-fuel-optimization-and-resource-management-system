const router = require('express').Router();
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

router.use(auth);

function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

router.get('/', async (req, res) => {
  const list = await Trip.find({ user: req.user.id }).populate('vehicle');
  res.json(list);
});

router.post('/', async (req, res) => {
  const {
    vehicle,
    start,
    destination,
    startCoord,
    endCoord,
    distance,
    duration,
    crisisMode,
  } = req.body;
  const v = await Vehicle.findById(vehicle);
  if (!v) return res.status(400).json({ msg: 'Vehicle not found' });

  let dist = distance || 0;
  if (!dist && startCoord && endCoord) dist = haversine(startCoord, endCoord);

  const eff = crisisMode ? v.fuelEfficiency * 1.15 : v.fuelEfficiency;
  const fuel = eff > 0 ? dist / eff : 0;
  const time = duration ? Number(duration) : (dist / 50) * 60;

  const trip = await Trip.create({
    user: req.user.id,
    vehicle,
    start,
    destination,
    distance: dist,
    estimatedFuel: fuel,
    estimatedTime: time,
    crisisMode: !!crisisMode,
  });

  if (crisisMode) {
    await Notification.create({
      user: req.user.id,
      message: `Crisis Mode active. Combine trips and avoid non-essential travel. Estimated fuel: ${fuel.toFixed(2)} L`,
      type: 'crisis',
    });
  }

  res.json(trip);
});

router.delete('/:id', async (req, res) => {
  await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;
  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ msg: 'Missing coordinates' });
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=true`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (!data.routes || data.routes.length === 0) {
      return res.status(404).json({ msg: 'No route found' });
    }

    const routes = data.routes.map((route) => ({
      distance: route.distance / 1000,
      duration: route.duration / 60,
      geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    }));

    routes.sort((a, b) => a.distance - b.distance);

    res.json({
      best: routes[0],
      alternatives: routes.slice(1),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
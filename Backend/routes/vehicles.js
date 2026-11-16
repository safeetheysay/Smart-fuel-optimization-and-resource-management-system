const router = require('express').Router();
const auth = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');

router.use(auth);

router.get('/', async (req, res) => {
  const list = await Vehicle.find({ user: req.user.id });
  res.json(list);
});

router.post('/', async (req, res) => {
  const v = await Vehicle.create({ ...req.body, user: req.user.id });
  res.json(v);
});

router.put('/:id', async (req, res) => {
  const v = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  res.json(v);
});

router.delete('/:id', async (req, res) => {
  await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth');
const FuelRecord = require('../models/FuelRecord');
const Notification = require('../models/Notification');
const User = require('../models/User');

router.use(auth);

router.get('/', async (req, res) => {
  const list = await FuelRecord.find({ user: req.user.id }).populate('vehicle');
  res.json(list);
});

router.post('/', async (req, res) => {
  const rec = await FuelRecord.create({ ...req.body, user: req.user.id });
  const user = await User.findById(req.user.id);
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const monthRecords = await FuelRecord.find({
    user: req.user.id,
    date: { $gte: start },
  });
  const total = monthRecords.reduce((s, r) => s + r.cost, 0);
  if (user.monthlyBudget && total > user.monthlyBudget) {
    await Notification.create({
      user: user._id,
      message: `Budget exceeded. Spent Rs ${total} of Rs ${user.monthlyBudget}`,
      type: 'budget',
    });
  }
  res.json(rec);
});

router.put('/:id', async (req, res) => {
  const rec = await FuelRecord.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  res.json(rec);
});

router.delete('/:id', async (req, res) => {
  await FuelRecord.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
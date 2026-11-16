const router = require('express').Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(auth);

router.get('/', async (req, res) => {
  const list = await Notification.find({ user: req.user.id }).sort('-createdAt');
  res.json(list);
});

router.put('/:id/read', async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );
  res.json(n);
});

router.delete('/:id', async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
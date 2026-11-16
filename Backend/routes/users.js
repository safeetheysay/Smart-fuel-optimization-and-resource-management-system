const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.use(auth);

router.get('/me', async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.put('/me', async (req, res) => {
  const { name, monthlyBudget } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, monthlyBudget },
    { new: true }
  ).select('-password');
  res.json(user);
});

module.exports = router;
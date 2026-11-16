const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.header('Authorization');
  const token = header && header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
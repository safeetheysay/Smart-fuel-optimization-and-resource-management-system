require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/route', require('./routes/route'));

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
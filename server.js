const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = require('./db');

const stockRoutes = require('./routes/stock');
const billRoutes = require('./routes/bills');
const reportRoutes = require('./routes/reports');
const customerRoutes = require('./routes/customers');

app.use('/api/stock', stockRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customers', customerRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
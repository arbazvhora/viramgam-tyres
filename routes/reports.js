const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/daily/:date', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bills WHERE date=$1', [req.params.date]);
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    res.json({ bills: result.rows, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills WHERE EXTRACT(YEAR FROM date)=$1 AND EXTRACT(MONTH FROM date)=$2',
      [req.params.year, req.params.month]);
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    res.json({ bills: result.rows, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/yearly/:year', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills WHERE EXTRACT(YEAR FROM date)=$1',
      [req.params.year]);
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    res.json({ bills: result.rows, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
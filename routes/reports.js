const express = require('express');
const router = express.Router();
const db = require('../db');

const attachItems = async (bills) => {
  return Promise.all(
    bills.map(async (bill) => {
      const items = await db.query(
        'SELECT * FROM bill_items WHERE bill_id=$1', [bill.id]
      );
      return { ...bill, items: items.rows };
    })
  );
};

// ← date::date casts timestamp to date for comparison
router.get('/daily/:date', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills WHERE date::date=$1 ORDER BY date DESC',
      [req.params.date]
    );
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    const bills = await attachItems(result.rows);
    res.json({ bills, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills WHERE EXTRACT(YEAR FROM date::date)=$1 AND EXTRACT(MONTH FROM date::date)=$2 ORDER BY date DESC',
      [req.params.year, req.params.month]
    );
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    const bills = await attachItems(result.rows);
    res.json({ bills, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/yearly/:year', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM bills WHERE EXTRACT(YEAR FROM date::date)=$1 ORDER BY date DESC',
      [req.params.year]
    );
    const revenue = result.rows.reduce((sum, b) => sum + parseFloat(b.final_amount || 0), 0);
    const bills = await attachItems(result.rows);
    res.json({ bills, total_revenue: revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
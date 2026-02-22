const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bills ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const bill = await db.query('SELECT * FROM bills WHERE id=$1', [req.params.id]);
    const items = await db.query('SELECT * FROM bill_items WHERE bill_id=$1', [req.params.id]);
    res.json({ ...bill.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { date, party_name, address, mobile, discount, gst_applicable,
    gst_percent, gst_amount, total_amount, final_amount, amount_in_words, items } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO bills (date, party_name, address, mobile, discount, gst_applicable,
       gst_percent, gst_amount, total_amount, final_amount, amount_in_words)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [date, party_name, address, mobile, discount, gst_applicable,
       gst_percent, gst_amount, total_amount, final_amount, amount_in_words]);
    const bill_id = result.rows[0].id;
    for (const i of items) {
      await db.query(
        'INSERT INTO bill_items (bill_id, company, tyre_size, quantity, rate, amount) VALUES ($1,$2,$3,$4,$5,$6)',
        [bill_id, i.company, i.tyre_size, i.quantity, i.rate, i.amount]);
    }
    res.json({ message: 'Bill created ✅', bill_id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bill_items WHERE bill_id=$1', [req.params.id]);
    await db.query('DELETE FROM bills WHERE id=$1', [req.params.id]);
    res.json({ message: 'Bill deleted ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
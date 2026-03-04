const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bills ORDER BY created_at DESC');
    const bills = result.rows;

    // Attach items to each bill
    const billsWithItems = await Promise.all(
      bills.map(async (bill) => {
        const items = await db.query(
          'SELECT * FROM bill_items WHERE bill_id=$1', [bill.id]
        );
        return { ...bill, items: items.rows };
      })
    );

    res.json(billsWithItems);
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
    // 1. Create the bill
    const result = await db.query(
      `INSERT INTO bills (date, party_name, address, mobile, discount, gst_applicable,
       gst_percent, gst_amount, total_amount, final_amount, amount_in_words)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [date, party_name, address, mobile, discount, gst_applicable,
       gst_percent, gst_amount, total_amount, final_amount, amount_in_words]);
    const bill_id = result.rows[0].id;

    // 2. Insert bill items
    for (const i of items) {
      await db.query(
        'INSERT INTO bill_items (bill_id, company, tyre_size, quantity, rate, amount) VALUES ($1,$2,$3,$4,$5,$6)',
        [bill_id, i.company, i.tyre_size, i.quantity, i.rate, i.amount]);
    }

    // 3. Deduct stock for each item
    for (const i of items) {
      const stock = await db.query(
        'SELECT * FROM stocks WHERE LOWER(company)=LOWER($1) AND LOWER(tyre_size)=LOWER($2)',
        [i.company, i.tyre_size]
      );
      if (stock.rows.length > 0) {
        const newQty = Math.max(0, parseInt(stock.rows[0].quantity) - parseInt(i.quantity));
        await db.query('UPDATE stocks SET quantity=$1 WHERE id=$2', [newQty, stock.rows[0].id]);
      }
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
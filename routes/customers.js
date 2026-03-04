const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get single customer with full bill history
router.get('/:id', async (req, res) => {
  try {
    const customer = await db.query('SELECT * FROM customers WHERE id=$1', [req.params.id]);
    if (!customer.rows.length) return res.status(404).json({ error: 'Customer not found' });

    const bills = await db.query(
      'SELECT * FROM bills WHERE mobile=$1 ORDER BY date DESC',
      [customer.rows[0].mobile]
    );

    const billsWithItems = await Promise.all(
      bills.rows.map(async (bill) => {
        const items = await db.query('SELECT * FROM bill_items WHERE bill_id=$1', [bill.id]);
        return { ...bill, items: items.rows };
      })
    );

    res.json({ ...customer.rows[0], bills: billsWithItems });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Search customer by mobile (for bill autofill)
router.get('/search/:mobile', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM customers WHERE mobile=$1',
      [req.params.mobile]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add customer
router.post('/', async (req, res) => {
  const { name, mobile, address } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO customers (name, mobile, address) VALUES ($1,$2,$3) RETURNING *',
      [name, mobile, address || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') res.status(400).json({ error: 'Mobile number already exists' });
    else res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  const { name, mobile, address } = req.body;
  try {
    const result = await db.query(
      'UPDATE customers SET name=$1, mobile=$2, address=$3 WHERE id=$4 RETURNING *',
      [name, mobile, address || '', req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE id=$1', [req.params.id]);
    res.json({ message: 'Customer deleted ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stocks ORDER BY company');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { company, tyre_size, quantity } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO stocks (company, tyre_size, quantity) VALUES ($1,$2,$3) RETURNING id',
      [company, tyre_size, quantity]);
    res.json({ message: 'Stock added ✅', id: result.rows[0].id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { company, tyre_size, quantity } = req.body;
  try {
    await db.query(
      'UPDATE stocks SET company=$1, tyre_size=$2, quantity=$3 WHERE id=$4',
      [company, tyre_size, quantity, req.params.id]);
    res.json({ message: 'Stock updated ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM stocks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Stock deleted ✅' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
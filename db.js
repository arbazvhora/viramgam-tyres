const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => console.log('PostgreSQL Connected ✅'))
  .catch(err => console.error('DB Connection Failed:', err));

module.exports = db;
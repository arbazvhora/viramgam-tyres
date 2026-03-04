const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5
});

const connectWithRetry = (retries = 5) => {
  db.connect()
    .then(() => console.log('PostgreSQL Connected ✅'))
    .catch(err => {
      console.error(`DB Connection Failed (retries left: ${retries}):`, err.message);
      if (retries > 0) {
        setTimeout(() => connectWithRetry(retries - 1), 5000);
      }
    });
};

connectWithRetry();
module.exports = db;
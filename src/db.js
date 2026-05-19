const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contas (
      id SERIAL PRIMARY KEY,
      titular VARCHAR(120) NOT NULL,
      saldo NUMERIC(12, 2) NOT NULL DEFAULT 0,
      criado_em TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDb };

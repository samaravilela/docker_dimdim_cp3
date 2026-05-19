const express = require('express');
const { pool, initDb } = require('./db');

const app = express();
const port = Number(process.env.APP_PORT || 3000);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: process.env.APP_NAME || 'dimdimapp' });
});

app.get('/contas', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM contas ORDER BY id');
  res.json(rows);
});

app.get('/contas/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM contas WHERE id = $1', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Conta não encontrada' });
  }
  res.json(rows[0]);
});

app.post('/contas', async (req, res) => {
  const { titular, saldo } = req.body;
  if (!titular) {
    return res.status(400).json({ erro: 'Campo titular é obrigatório' });
  }
  const { rows } = await pool.query(
    'INSERT INTO contas (titular, saldo) VALUES ($1, $2) RETURNING *',
    [titular, saldo ?? 0]
  );
  res.status(201).json(rows[0]);
});

app.put('/contas/:id', async (req, res) => {
  const { titular, saldo } = req.body;
  const { rows } = await pool.query(
    `UPDATE contas
     SET titular = COALESCE($1, titular),
         saldo = COALESCE($2, saldo)
     WHERE id = $3
     RETURNING *`,
    [titular ?? null, saldo ?? null, req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Conta não encontrada' });
  }
  res.json(rows[0]);
});

app.delete('/contas/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM contas WHERE id = $1', [req.params.id]);
  if (rowCount === 0) {
    return res.status(404).json({ erro: 'Conta não encontrada' });
  }
  res.status(204).send();
});

async function start() {
  await initDb();
  app.listen(port, '0.0.0.0', () => {
    console.log(`DimDimApp ouvindo na porta ${port}`);
  });
}

start().catch((err) => {
  console.error('Falha ao iniciar aplicação:', err);
  process.exit(1);
});

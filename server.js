require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
let dbInitialized = false;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();
  });
}

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

async function initDatabase() {
  if (dbInitialized) {
    return;
  }

  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS password_hash TEXT
  `);
  await pool.query(`
    ALTER TABLE public.users
    ALTER COLUMN email SET NOT NULL
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  dbInitialized = true;
}

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json({ ok: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO public.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
      [ name, normalizedEmail, passwordHash]
    );

    const token = signToken({ id: result.rows[0].id, email: result.rows[0].email, name: result.rows[0].name });

    res.status(201).json({ success: true, token, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.password_hash,
        s.score_total
    FROM public.users u
    LEFT JOIN public.scores s
        ON s.user_id = u.id
    WHERE u.email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            score: {
                total: user.score_total ?? 0
            }
        }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.name,
                u.email,
                COALESCE(s.score_total, 0) AS score_total
            FROM public.users u
            LEFT JOIN public.scores s
                ON s.user_id = u.id
            WHERE u.id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                score: {
                    total: user.score_total
                }
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.put('/api/score', authenticateToken, async (req, res) => {
    const { score_total } = req.body;

    if (score_total === undefined || isNaN(score_total)) {
        return res.status(400).json({
            success: false,
            error: "score_total is required"
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO public.scores(user_id, score_total)
            VALUES($1, $2)
            ON CONFLICT(user_id)
            DO UPDATE
            SET score_total = EXCLUDED.score_total
            RETURNING *
        `, [req.user.id, score_total]);

        res.json({
            success: true,
            score: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.get('/api/scores', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email as user_email
      FROM public.scores s
      JOIN public.users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
    `);

    res.json({ success: true, scores: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDatabase();

    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);

    if (require.main === module) {
      process.exit(1);
    }
  }
}

startServer();

module.exports = app;

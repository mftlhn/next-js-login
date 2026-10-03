require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete('sslmode');

const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: {
    rejectUnauthorized: false,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
let dbInitialization;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET);
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
  if (!dbInitialization) {
    dbInitialization = (async () => {
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
          user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
          score_total BIGINT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await pool.query(`
        ALTER TABLE public.scores
        ADD COLUMN IF NOT EXISTS score_total BIGINT NOT NULL DEFAULT 0
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS scores_user_id_unique
        ON public.scores(user_id)
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.vouchers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          value_amount BIGINT NOT NULL CHECK (value_amount > 0),
          points_cost BIGINT NOT NULL CHECK (points_cost > 0),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.voucher_redemptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
          voucher_id UUID NOT NULL REFERENCES public.vouchers(id),
          points_spent BIGINT NOT NULL CHECK (points_spent > 0),
          redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        INSERT INTO public.vouchers (code, title, description, value_amount, points_cost)
        VALUES
          ('BELANJA-100K', 'Voucher Belanja IDR 100.000', 'Voucher belanja senilai IDR 100.000', 100000, 100),
          ('BELANJA-50K', 'Voucher Belanja IDR 50.000', 'Voucher belanja senilai IDR 50.000', 50000, 55),
          ('BELANJA-25K', 'Voucher Belanja IDR 25.000', 'Voucher belanja senilai IDR 25.000', 25000, 30),
          ('BELANJA-10K', 'Voucher Belanja IDR 10.000', 'Voucher belanja senilai IDR 10.000', 10000, 15),
          ('BELANJA-200K', 'Voucher Belanja IDR 200.000', 'Voucher belanja senilai IDR 200.000', 200000, 190),
          ('GROCERY-50K', 'Voucher Groceries IDR 50.000', 'Voucher kebutuhan harian senilai IDR 50.000', 50000, 60),
          ('KOPI-25K', 'Voucher Kopi IDR 25.000', 'Voucher minuman senilai IDR 25.000', 25000, 25)
        ON CONFLICT (code) DO NOTHING
      `);
    })();
  }

  try {
    await dbInitialization;
  } catch (error) {
    dbInitialization = undefined;
    throw error;
  }
}

app.use(async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    console.error('Database initialization failed:', error);
    res.status(500).json({ success: false, error: 'Database unavailable' });
  }
});

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
                score_total: user.score_total ?? 0
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
        `, [req.user.sub]);

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
                    score_total: user.score_total
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

app.post('/api/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Logout successful"
    });
});

app.post('/api/score', authenticateToken, async (req, res) => {
    const { score_total } = req.body;

    if (score_total === undefined || isNaN(score_total)) {
        return res.status(400).json({
            success: false,
            error: "score_total is required"
        });
    }

    try {
        // Insert / Update score
        await pool.query(`
            INSERT INTO public.scores(user_id, score_total)
            VALUES($1, $2)
            ON CONFLICT(user_id)
            DO UPDATE
            SET score_total = EXCLUDED.score_total
        `, [req.user.sub, score_total]);

        // Ambil data user beserta score terbaru
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
        `, [req.user.sub]);

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                score: {
                    score_total: user.score_total
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

app.get('/api/vouchers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, code, title, description, value_amount, points_cost
      FROM public.vouchers
      WHERE is_active = TRUE
      ORDER BY points_cost ASC
    `);

    res.json({ success: true, vouchers: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load vouchers' });
  }
});

app.post('/api/vouchers/:voucherId/redeem', authenticateToken, async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.voucherId)) {
    return res.status(400).json({ success: false, error: 'Invalid voucher ID' });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const voucherResult = await client.query(`
      SELECT id, code, title, value_amount, points_cost
      FROM public.vouchers
      WHERE id = $1 AND is_active = TRUE
      FOR SHARE
    `, [req.params.voucherId]);

    if (voucherResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Voucher not found' });
    }

    const voucher = voucherResult.rows[0];
    const balanceResult = await client.query(`
      UPDATE public.scores
      SET score_total = COALESCE(score_total, 0) - $2
      WHERE user_id = $1 AND COALESCE(score_total, 0) >= $2
      RETURNING score_total
    `, [req.user.sub, voucher.points_cost]);

    if (balanceResult.rows.length === 0) {
      const currentBalance = await client.query(
        'SELECT COALESCE(score_total, 0) AS score_total FROM public.scores WHERE user_id = $1',
        [req.user.sub]
      );
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient points',
        required_points: voucher.points_cost,
        current_points: currentBalance.rows[0]?.score_total ?? 0,
      });
    }

    const redemptionResult = await client.query(`
      INSERT INTO public.voucher_redemptions (user_id, voucher_id, points_spent)
      VALUES ($1, $2, $3)
      RETURNING id, redeemed_at
    `, [req.user.sub, voucher.id, voucher.points_cost]);

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      redemption: {
        id: redemptionResult.rows[0].id,
        voucher,
        points_spent: voucher.points_cost,
        remaining_points: balanceResult.rows[0].score_total,
        redeemed_at: redemptionResult.rows[0].redeemed_at,
      },
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('Voucher redemption failed:', error);
    res.status(500).json({ success: false, error: 'Unable to redeem voucher' });
  } finally {
    client?.release();
  }
});

app.get('/api/vouchers/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.points_spent,
        r.redeemed_at,
        v.id AS voucher_id,
        v.code,
        v.title,
        v.value_amount
      FROM public.voucher_redemptions r
      JOIN public.vouchers v ON v.id = r.voucher_id
      WHERE r.user_id = $1
      ORDER BY r.redeemed_at DESC
    `, [req.user.sub]);

    res.json({ success: true, history: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load redemption history' });
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

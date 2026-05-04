const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, address, pincode } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const exists = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, name, email, mobile',
      [name, email.toLowerCase(), hashed]
    );
    const user = result.rows[0];

    // Save address if provided
    if (address && pincode) {
      await db.query('INSERT INTO addresses (user_id, address, pincode) VALUES ($1,$2,$3)', [user.id, address, pincode]);
    }

    res.status(201).json({ success: true, message: 'Account created!', token: signToken(user.id), user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const result = await db.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: `Welcome back, ${user.name}!`, token: signToken(user.id), user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, mobile FROM users WHERE id=$1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/forgot-password  (simplified — just confirms email exists)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const result = await db.query('SELECT id FROM users WHERE email=$1', [email?.toLowerCase()]);
  // Always return success to prevent email enumeration
  res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
});

module.exports = router;

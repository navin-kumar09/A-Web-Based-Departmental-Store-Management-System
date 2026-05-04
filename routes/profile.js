const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/profile
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, mobile FROM users WHERE id=$1', [req.userId]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile  { name, mobile }
router.put('/', auth, async (req, res) => {
  try {
    const { name, mobile } = req.body;
    await db.query('UPDATE users SET name=$1, mobile=$2 WHERE id=$3', [name, mobile, req.userId]);
    res.json({ success: true, message: 'Profile updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile/change-password  { oldPassword, newPassword }
router.put('/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await db.query('SELECT password FROM users WHERE id=$1', [req.userId]);
    const user = result.rows[0];
    if (!(await bcrypt.compare(oldPassword, user.password)))
      return res.status(401).json({ success: false, message: 'Old password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.userId]);
    res.json({ success: true, message: 'Password changed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

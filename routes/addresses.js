const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/addresses
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM addresses WHERE user_id=$1', [req.userId]);
    res.json({ success: true, addresses: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/addresses  { address, pincode }
router.post('/', auth, async (req, res) => {
  try {
    const { address, pincode } = req.body;
    if (!address || !pincode)
      return res.status(400).json({ success: false, message: 'Address and pincode are required.' });
    const result = await db.query(
      'INSERT INTO addresses (user_id, address, pincode) VALUES ($1,$2,$3) RETURNING *',
      [req.userId, address, pincode]
    );
    res.status(201).json({ success: true, message: 'Address saved!', address: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/addresses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ success: true, message: 'Address removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/addresses/mobile  { mobile }
router.put('/mobile', auth, async (req, res) => {
  try {
    const { mobile } = req.body;
    await db.query('UPDATE users SET mobile=$1 WHERE id=$2', [mobile, req.userId]);
    res.json({ success: true, message: 'Mobile updated!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

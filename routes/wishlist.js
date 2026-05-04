const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/wishlist
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.* FROM wishlist w JOIN products p ON p.id = w.product_id WHERE w.user_id=$1`,
      [req.userId]
    );
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wishlist/toggle  { productId }
router.post('/toggle', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const exists = await db.query(
      'SELECT id FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.userId, productId]
    );
    if (exists.rows.length > 0) {
      await db.query('DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.userId, productId]);
      res.json({ success: true, action: 'removed', message: 'Removed from wishlist' });
    } else {
      await db.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1,$2)', [req.userId, productId]);
      res.json({ success: true, action: 'added', message: 'Added to wishlist ❤️' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

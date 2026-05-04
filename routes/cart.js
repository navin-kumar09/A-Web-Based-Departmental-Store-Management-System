const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/cart
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.product_id, c.qty, p.name, p.emoji, p.price, p.weight
       FROM cart c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`, [req.userId]
    );
    const items = result.rows.map(r => ({ ...r, subtotal: r.price * r.qty }));
    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    res.json({ success: true, items, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cart/add  { productId, qty }
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    await db.query(
      `INSERT INTO cart (user_id, product_id, qty) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET qty = cart.qty + $3`,
      [req.userId, productId, qty]
    );
    res.json({ success: true, message: 'Added to cart!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cart/update  { productId, qty }  — set qty=0 to remove
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    if (Number(qty) <= 0) {
      await db.query('DELETE FROM cart WHERE user_id=$1 AND product_id=$2', [req.userId, productId]);
    } else {
      await db.query('UPDATE cart SET qty=$3 WHERE user_id=$1 AND product_id=$2', [req.userId, productId, qty]);
    }
    res.json({ success: true, message: 'Cart updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id=$1', [req.userId]);
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

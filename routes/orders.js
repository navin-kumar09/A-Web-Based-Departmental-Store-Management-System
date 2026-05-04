const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// GET /api/orders
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/orders/checkout
router.post('/checkout', auth, async (req, res) => {
  try {
    // Get cart items
    const cartResult = await db.query(
      `SELECT c.qty, p.id as product_id, p.name, p.emoji, p.price
       FROM cart c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`, [req.userId]
    );
    if (cartResult.rows.length === 0)
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });

    const items = cartResult.rows;
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    // Get default address
    const addrResult = await db.query(
      'SELECT address, pincode FROM addresses WHERE user_id=$1 LIMIT 1', [req.userId]
    );
    const addr = addrResult.rows[0] || {};

    const orderCode = 'ORD' + Date.now();
    const result = await db.query(
      `INSERT INTO orders (user_id, order_code, items, total, address, pincode)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.userId, orderCode, JSON.stringify(items), total, addr.address || '', addr.pincode || '']
    );

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id=$1', [req.userId]);

    res.status(201).json({ success: true, message: `Order placed! Total: ₹${total}`, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status  { status }
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status.' });

    await db.query(
      'UPDATE orders SET status=$1 WHERE id=$2 AND user_id=$3',
      [status, req.params.id, req.userId]
    );
    res.json({ success: true, message: `Order marked as ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

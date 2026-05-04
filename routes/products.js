const router = require('express').Router();
const db = require('../db');

// GET /api/products?cat=fruits&q=apple
router.get('/', async (req, res) => {
  try {
    const { cat, q } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (cat) { params.push(cat); query += ` AND category=$${params.length}`; }
    if (q)   { params.push(`%${q}%`); query += ` AND name ILIKE $${params.length}`; }

    query += ' ORDER BY id';
    const result = await db.query(query, params);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

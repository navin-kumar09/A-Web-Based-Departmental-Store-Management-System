require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/cart',      require('./routes/cart'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/wishlist',  require('./routes/wishlist'));
app.use('/api/profile',   require('./routes/profile'));
app.use('/api/addresses', require('./routes/addresses'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🐘 Ganpati Store API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

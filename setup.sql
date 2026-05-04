-- =============================================
-- Ganpati Store — Database Setup
-- Run this ONCE in Render PostgreSQL dashboard
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🛒',
  weight VARCHAR(50) DEFAULT '',
  price INTEGER NOT NULL,
  old_price INTEGER DEFAULT NULL,
  badge VARCHAR(30) DEFAULT NULL
);

-- CART
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_code VARCHAR(30) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'Processing',
  address TEXT DEFAULT '',
  pincode VARCHAR(10) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(user_id, product_id)
);

-- =============================================
-- SEED PRODUCTS (run once)
-- =============================================
INSERT INTO products (name, category, emoji, weight, price, old_price, badge) VALUES
('Banana',            'fruits',   '🍌', '1 dozen',    49,  65,  'FRESH'),
('Apple (Shimla)',    'fruits',   '🍎', '1 kg',       149, 180, 'SALE'),
('Mango (Alphonso)', 'fruits',   '🥭', '1 kg',       299, 350, 'SEASON'),
('Watermelon',        'fruits',   '🍉', '1 pc (~3kg)', 79,  NULL, NULL),
('Grapes (Green)',    'fruits',   '🍇', '500g',        89,  110, NULL),
('Potato',            'veg',      '🥔', '1 kg',        25,  NULL, NULL),
('Onion',             'veg',      '🧅', '1 kg',        30,  NULL, NULL),
('Tomato',            'veg',      '🍅', '500g',        22,  NULL, NULL),
('Spinach',           'veg',      '🥬', '250g bunch',  15,  NULL, 'FRESH'),
('Capsicum',          'veg',      '🫑', '250g',        35,  45,  NULL),
('Amul Milk',         'dairy',    '🥛', '1 Litre',     62,  NULL, NULL),
('Amul Butter',       'dairy',    '🧈', '100g',        55,  60,  NULL),
('Paneer (Fresh)',    'dairy',    '🧀', '200g',        79,  90,  'FRESH'),
('Eggs (White)',      'dairy',    '🥚', '12 pcs',      75,  80,  NULL),
('Dahi',              'dairy',    '🫙', '500g',        45,  NULL, NULL),
('Bread (White)',     'dairy',    '🍞', '400g',        40,  45,  NULL),
('Aashirvaad Atta',  'staples',  '🌾', '5 kg',       245, 280, 'BEST SELLER'),
('Basmati Rice',      'staples',  '🍚', '5 kg',       399, 450, NULL),
('Toor Dal',          'staples',  '🫘', '1 kg',       135, 150, NULL),
('Chana Dal',         'staples',  '🫛', '1 kg',        95,  NULL, NULL),
('Saffola Gold Oil', 'oil',      '🫙', '1 Litre',    185, 210, 'SALE'),
('Amul Ghee',         'oil',      '✨', '500 ml',     299, 330, NULL),
('Mustard Oil',       'oil',      '🫧', '1 Litre',    145, 160, NULL),
('Maggi Noodles',     'packaged', '🍜', '70g x 4',    56,  60,  NULL),
('Biscuits (Good Day)','packaged','🍪', '200g',        30,  NULL, NULL),
('Cornflakes',        'packaged', '🥣', '500g',       175, 199, NULL),
('MDH Chana Masala', 'masala',   '🌶️','100g',        60,  70,  NULL),
('Haldi Powder',      'masala',   '🟡', '200g',        55,  NULL, NULL),
('Garam Masala',      'masala',   '🫙', '50g',         45,  55,  NULL),
('Red Chilli Powder', 'masala',   '🌶️','200g',        65,  NULL, NULL),
('Cashews',           'dryfruits','🥜', '250g',       349, 399, NULL),
('Almonds',           'dryfruits','🌰', '250g',       299, 350, 'SALE'),
('Raisins',           'dryfruits','🍇', '200g',        99,  120, NULL),
('Gulab Jamun',       'sweets',   '🍮', '500g',       120, NULL, NULL),
('Rasgulla',          'sweets',   '🍡', '500g',       110, NULL, 'FRESH'),
('Lays Classic',      'chips',    '🍟', '90g',         30,  NULL, NULL),
('Kurkure Masala',    'chips',    '🌽', '70g',         25,  NULL, NULL),
('Haldirams Bhujia', 'chips',    '🥨', '400g',       120, 140, NULL),
('Coca-Cola',         'drinks',   '🥤', '1.25 Litre',  65,  NULL, NULL),
('Real Mango Juice', 'drinks',   '🧃', '1 Litre',     99,  115, NULL),
('Bisleri Water',     'drinks',   '💧', '1 Litre',     20,  NULL, NULL),
('Dove Shampoo',      'personal', '🧴', '340 ml',     299, 349, 'SALE'),
('Colgate Paste',     'personal', '🪥', '200g',        89,  99,  NULL),
('Dettol Soap',       'personal', '🧼', '75g x 4',    119, 140, NULL)
ON CONFLICT DO NOTHING;

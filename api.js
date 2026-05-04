// =====================================================
// api.js — paste this inside your HTML <script> tag
// OR add <script src="api.js"></script> in <head>
// =====================================================

// 🔧 After deploying on Render, replace this with your live URL
// Example: const API_BASE = 'https://ganpati-backend.onrender.com/api';
const API_BASE = 'https://YOUR-APP-NAME.onrender.com/api';

// ── Token helpers ─────────────────────────────────────
function getToken()    { return localStorage.getItem('ganpati_token'); }
function setToken(t)   { localStorage.setItem('ganpati_token', t); }
function clearToken()  { localStorage.removeItem('ganpati_token'); }

// ── Core fetch ────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Something went wrong');
  return data;
}

// ── Auth ──────────────────────────────────────────────
async function apiRegister(name, email, password, address, pincode) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, address, pincode }),
  });
  setToken(data.token);
  return data.user;
}

async function apiLogin(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

async function apiGetMe() {
  const data = await apiFetch('/auth/me');
  return data.user;
}

async function apiForgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST', body: JSON.stringify({ email }),
  });
}

// ── Products ──────────────────────────────────────────
async function apiGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const data = await apiFetch('/products' + (qs ? '?' + qs : ''));
  return data.products;
}

// ── Cart ──────────────────────────────────────────────
async function apiGetCart()                       { return apiFetch('/cart'); }
async function apiAddToCart(productId, qty = 1)   {
  return apiFetch('/cart/add', { method: 'POST', body: JSON.stringify({ productId, qty }) });
}
async function apiUpdateCart(productId, qty)      {
  return apiFetch('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, qty }) });
}
async function apiClearCart()                     { return apiFetch('/cart/clear', { method: 'DELETE' }); }

// ── Orders ────────────────────────────────────────────
async function apiGetOrders()                     { return apiFetch('/orders'); }
async function apiCheckout()                      { return apiFetch('/orders/checkout', { method: 'POST' }); }
async function apiUpdateOrderStatus(id, status)   {
  return apiFetch('/orders/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) });
}

// ── Wishlist ──────────────────────────────────────────
async function apiGetWishlist()                   { return apiFetch('/wishlist'); }
async function apiToggleWishlist(productId)       {
  return apiFetch('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) });
}

// ── Profile ───────────────────────────────────────────
async function apiUpdateProfile(name, mobile)     {
  return apiFetch('/profile', { method: 'PUT', body: JSON.stringify({ name, mobile }) });
}

// ── Addresses ─────────────────────────────────────────
async function apiGetAddresses()                  { return apiFetch('/addresses'); }
async function apiAddAddress(address, pincode)    {
  return apiFetch('/addresses', { method: 'POST', body: JSON.stringify({ address, pincode }) });
}
async function apiDeleteAddress(id)               { return apiFetch('/addresses/' + id, { method: 'DELETE' }); }
async function apiUpdateMobile(mobile)            {
  return apiFetch('/addresses/mobile', { method: 'PUT', body: JSON.stringify({ mobile }) });
}

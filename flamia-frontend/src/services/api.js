import api from '../lib/api';

// ── Products ──────────────────────────────────

export const getProducts = (params = {}) =>
  api.get('/products', { params });

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`);

// ── Categories ────────────────────────────────

export const getCategories = () =>
  api.get('/categories');

// ── Auth ──────────────────────────────────────

export const syncUser = (data) =>
  api.post('/auth/sync', data);

// ── Profile ───────────────────────────────────

export const getProfile = () =>
  api.get('/profile');

export const updateProfile = (data) =>
  api.put('/profile', data);

// ── Addresses ─────────────────────────────────

export const getAddresses = () =>
  api.get('/addresses');

export const createAddress = (data) =>
  api.post('/addresses', data);

export const updateAddress = (id, data) =>
  api.put(`/addresses/${id}`, data);

export const deleteAddress = (id) =>
  api.delete(`/addresses/${id}`);

export const setDefaultAddress = (id) =>
  api.put(`/addresses/${id}/default`);

// ── Orders ────────────────────────────────────

export const createOrder = (data) =>
  api.post('/orders', data);

export const getOrders = (params = {}) =>
  api.get('/orders', { params });

export const getOrderDetail = (id) =>
  api.get(`/orders/${id}`);

// ── Payments ──────────────────────────────────

export const createRazorpayOrder = (orderId) =>
  api.post(`/payments/razorpay/create/${orderId}`);

export const verifyRazorpayPayment = (data) =>
  api.post('/payments/razorpay/verify', data);

export const submitUpiPayment = (data) =>
  api.post('/payments/upi/submit', data);

export const validateCoupon = (data) =>
  api.post('/payments/coupon/validate', data);

// ── Reviews ───────────────────────────────────

export const getProductReviews = (productId, params = {}) =>
  api.get(`/reviews/product/${productId}`, { params });

export const createReview = (data) =>
  api.post('/reviews', data);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`);

// ── Upload ────────────────────────────────────

export const uploadFile = (type, id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/upload/${type}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadProductImage = (productId, file) =>
  uploadFile('product', productId, file);

// ── Admin: Dashboard ─────────────────────────

export const getAdminDashboard = () =>
  api.get('/admin/dashboard');

export const getAdminRecentOrders = (params = {}) =>
  api.get('/admin/orders/recent', { params });

// ── Admin: Products ──────────────────────────

export const getAdminProducts = (params = {}) =>
  api.get('/admin/products', { params });

export const getProductById = (id) =>
  api.get(`/admin/products/${id}`);

export const createProduct = (data) =>
  api.post('/admin/products', data);

export const updateProduct = (id, data) =>
  api.put(`/admin/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/admin/products/${id}`);

// ── Admin: Orders ────────────────────────────

export const getAdminOrders = (params = {}) =>
  api.get('/admin/orders', { params });

export const getAdminOrderDetail = (id) =>
  api.get(`/admin/orders/${id}`);

export const updateOrderStatus = (id, data) =>
  api.put(`/admin/orders/${id}/status`, data);

export const updateOrderTracking = (id, data) =>
  api.put(`/admin/orders/${id}/tracking`, data);

// ── Admin: Coupons ───────────────────────────

export const getAdminCoupons = (params = {}) =>
  api.get('/admin/coupons', { params });

export const createCoupon = (data) =>
  api.post('/admin/coupons', data);

export const deleteCoupon = (id) =>
  api.delete(`/admin/coupons/${id}`);


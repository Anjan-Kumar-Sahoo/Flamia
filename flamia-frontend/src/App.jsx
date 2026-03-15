import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthGuard from './guards/AuthGuard';
import useAuthStore from './store/authStore';

// Pages
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AccountPage from './pages/AccountPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFound';

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // Initialize auth on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      {/* Toast Notifications — Per Design Doc §6.3 pattern 7 */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1A1A1A',
            color: '#FEFCF8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '2px',
            padding: '14px 20px',
          },
          success: {
            iconTheme: { primary: '#C8944A', secondary: '#FEFCF8' },
          },
          error: {
            iconTheme: { primary: '#A35D5D', secondary: '#FEFCF8' },
          },
        }}
      />

      <Routes>
        {/* Public routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authenticated customer routes */}
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrdersPage /></AuthGuard>} />
          <Route path="/orders/:orderId" element={<AuthGuard><OrderDetailPage /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><AccountPage /></AuthGuard>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Login (no main layout — uses split layout) */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;

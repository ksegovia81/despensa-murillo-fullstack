import React, { useState, useEffect, useCallback } from 'react';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Navigation from './components/Navigation';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/admin/AdminPanel';

import { apiRequest } from './services/api';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('home');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailyDiscount, setDailyDiscount] = useState(null);
  const [adminStats, setAdminStats] = useState({});
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminProducts = useCallback(async () => {
    try {
      const data = await apiRequest('/admin/products');
      setProducts(data);
    } catch (error) {
      console.error('Error cargando productos admin:', error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiRequest('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  }, []);

  const loadAdminStats = useCallback(async () => {
    try {
      const stats = await apiRequest('/admin/stats');
      setAdminStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  const loadDiscounts = useCallback(async () => {
    try {
      const data = await apiRequest('/admin/discounts');
      setDiscounts(data);
    } catch (error) {
      console.error('Error cargando descuentos admin:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadProducts();
    apiRequest('/discounts/today')
      .then(setDailyDiscount)
      .catch(() => setDailyDiscount(null));
  }, [loadProducts]);

  // Load user-specific data when auth changes
  useEffect(() => {
    if (user) {
      loadOrders();
      if (user.isAdmin) loadAdminStats();
    } else {
      setOrders([]);
      setAdminStats({});
    }
  }, [user, loadOrders, loadAdminStats]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header onCartClick={() => setCurrentView('cart')} />
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)' }}>
      <Header onCartClick={() => setCurrentView('cart')} />

      <div className="container mx-auto px-4">
        {currentView === 'home' && (
          <HomePage products={products} dailyDiscount={dailyDiscount} setCurrentView={setCurrentView} />
        )}
        {currentView === 'products' && (
          <ProductsPage products={products} loading={loading} />
        )}
        {currentView === 'food' && (
          <ProductsPage products={products} category="comida" loading={loading} />
        )}
        {currentView === 'cart' && (
          <CartPage
            dailyDiscount={dailyDiscount}
            setCurrentView={setCurrentView}
            onOrderPlaced={() => { loadOrders(); loadProducts(); }}
          />
        )}
        {currentView === 'orders' && (
          <OrdersPage orders={orders} setCurrentView={setCurrentView} />
        )}
        {currentView === 'profile' && (
          <ProfilePage setCurrentView={setCurrentView} />
        )}
        {currentView === 'admin' && user.isAdmin && (
          <AdminPanel
            adminStats={adminStats}
            products={products}
            loadAdminProducts={loadAdminProducts}
            discounts={discounts}
            loadDiscounts={loadDiscounts}
          />
        )}
      </div>

      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

const App = () => (
  <ToastProvider>
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  </ToastProvider>
);

export default App;

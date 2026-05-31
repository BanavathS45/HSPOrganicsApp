import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import CSS frameworks & plugins
import 'bootstrap/dist/css/bootstrap.min.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import './index.css';

// Context Wrapper
import { AppProvider } from './context/AppContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import Categories from './pages/customer/Categories';
import Cart from './pages/customer/Cart';
import Wishlist from './pages/customer/Wishlist';
import Orders from './pages/customer/Orders';
import Profile from './pages/customer/Profile';
import Login from './pages/customer/Login';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import Overview from './pages/admin/Overview';
import Products from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import Coupons from './pages/admin/Coupons';
import Notifications from './pages/admin/Notifications';

// Global Components
import GlassmorphicToast from './components/GlassmorphicToast';
import { Sparkles } from 'lucide-react';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Splash Screen timer (simulating native PWA loading experience)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds splash display
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      {/* PWA Splash Screen Overlay */}
      {showSplash && (
        <div className="splash-overlay">
          <div className="text-center animate-fade-in-up">
            <div
              className="bg-white text-success p-3.5 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-lg"
              style={{ width: '80px', height: '80px' }}
            >
              <img src="logo.png" className="m-0 font-heading fw-extrabold" style={{ fontSize: '32px' }} width={"100%"} />
            </div>
            <h1 className="font-heading fw-extrabold text-white m-0" style={{ fontSize: '28px', letterSpacing: '-0.5px' }}>
              HSP Organics
            </h1>
            <p className="font-body text-white-50 text-xs mt-1" style={{ letterSpacing: '2px', textTransform: 'uppercase' }}>
              “From Farm To Home”
            </p>

            <div className="mt-4 d-flex align-items-center justify-content-center gap-1 text-xs text-white-50">
              <Sparkles size={14} className="pulse-animation" />
              <span>Certified Organic Produce</span>
            </div>
          </div>
        </div>
      )}

      {/* Global simulated push notification toast */}
      <GlassmorphicToast />

      {/* Router mapping */}
      <Router>
        <Routes>
          {/* Customer Storefront Auth Page */}
          <Route path="/login" element={<Login />} />

          {/* Customer Storefront Pages Layout */}
          <Route path="/" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Dedicated Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Control Center Layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Route Failover Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;

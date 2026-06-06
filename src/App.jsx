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
import DeliveryBoys from './pages/admin/DeliveryBoys';
import AdminVideos from './pages/admin/Videos';
import AdminRatings from './pages/admin/Ratings';

// Delivery Agent Pages
import DeliveryDashboard from './pages/delivery/Dashboard';

// Global Components
import GlassmorphicToast from './components/GlassmorphicToast';
import { ToastProvider } from './components/Toast';

function App() {
  const [splashPhase, setSplashPhase] = useState('visible'); // 'visible' | 'fading' | 'gone'

  useEffect(() => {
    // Start fade-out after 2.8s
    const fadeTimer = setTimeout(() => setSplashPhase('fading'), 2800);
    // Fully remove splash after fade transition completes
    const goneTimer = setTimeout(() => setSplashPhase('gone'), 3400);
    return () => { clearTimeout(fadeTimer); clearTimeout(goneTimer); };
  }, []);

  return (
    <AppProvider>
      <ToastProvider>
      {/* PWA Splash Screen Overlay */}
      {splashPhase !== 'gone' && (
        <div className={`splash-overlay ${splashPhase === 'fading' ? 'splash-fading' : ''}`}>
          {/* Ambient glow ring */}
          <div className="splash-glow-ring" />

          <div className="text-center" style={{ position: 'relative', zIndex: 2 }}>
            {/* Pulsing logo circle */}
            <div className="splash-logo-wrap">
              <div className="splash-logo-ring" />
              <div className="splash-logo-inner">
                <img src="/logo.png" alt="HSP Organics" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Brand name */}
            <h1 className="font-heading fw-extrabold text-white mt-4 mb-1" style={{ fontSize: '30px', letterSpacing: '-0.5px' }}>
              HSP Organics
            </h1>
            <p className="font-body text-white-50 m-0" style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              From Farm To Home
            </p>

            {/* Shimmer progress bar */}
            <div className="splash-progress-track mt-5">
              <div className="splash-progress-bar" />
            </div>
            <p className="text-white-50 mt-2" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
              Loading fresh produce...
            </p>
          </div>

          {/* Floating organic dots */}
          <div className="splash-dot splash-dot-1" />
          <div className="splash-dot splash-dot-2" />
          <div className="splash-dot splash-dot-3" />
          <div className="splash-dot splash-dot-4" />
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
            <Route path="delivery" element={<DeliveryBoys />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="ratings" element={<AdminRatings />} />
          </Route>

          {/* Dedicated Delivery Agent Portal */}
          <Route path="/delivery" element={<DeliveryDashboard />} />

          {/* Route Failover Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CustomerBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useApp();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/categories', label: 'Shop', icon: <Grid size={20} /> },
    { path: '/cart', label: 'Cart', icon: <ShoppingBag size={20} />, badge: cartCount },
    { path: '/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
    { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  ];

  // Do not show bottom navigation bar if the user is on the login page or within an admin layout
  if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="bottom-nav d-flex d-md-none">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item position-relative flex-grow-1 text-center py-2 ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon d-flex justify-content-center">
              {item.icon}
            </div>
            <span>{item.label}</span>
            
            {item.badge > 0 && (
              <span 
                className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  top: '4px',
                  right: 'calc(50% - 18px)',
                  width: '16px',
                  height: '16px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {item.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomerBottomNav;

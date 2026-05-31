import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Sun, Moon, ShoppingCart, LogOut, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isMock } from '../firebase/config';

const CustomerHeader = ({ onOpenAddressModal }) => {
  const {
    user, logout, cart, theme, toggleTheme, selectedAddress, currentLocation
  } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDisplayAddress = () => {
    if (selectedAddress) {
      return `${selectedAddress.name}: ${selectedAddress.addressLine}`;
    }
    if (currentLocation) {
      return currentLocation.addressLine;
    }
    return 'Choose a delivery location...';
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      className="sticky-top w-100 px-3 py-2 border-bottom"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        zIndex: 1020,
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        {/* Branding & Logo */}
        <Link to="/" className="d-flex align-items-center text-decoration-none">
          <div className="bg-success text-white p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <img className="fw-bold font-heading" src="/logo.png" alt="logo" style={{ width: '100%' }} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-1">
              <h5 className="m-0 font-heading fw-bold text-success" style={{ letterSpacing: '-0.5px', fontSize: '18px' }}>
                HSP Organics
              </h5>
              <span 
                className={`badge px-1.5 py-0.5 rounded-pill font-heading ${isMock ? 'bg-warning text-dark' : 'bg-success text-white'}`}
                style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}
              >
                {isMock ? 'Sandbox' : 'Live'}
              </span>
            </div>
            <span className="text-muted font-body" style={{ fontSize: '10px', display: 'block', marginTop: '-3px' }}>
              From Farm To Home
            </span>
          </div>
        </Link>

        {/* Global Toolbar */}
        <div className="d-flex align-items-center gap-2">
          {/* Wishlist Shortcut */}
          {user && (
            <Link to="/wishlist" className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center position-relative" style={{ width: '36px', height: '36px' }}>
              <Heart size={18} className="text-danger" />
            </Link>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} className="text-success" /> : <Sun size={18} className="text-warning" />}
          </button>

          {/* Cart Icon (Visible on desktop/tablet header, redundant on mobile bottom-nav) */}
          <Link to="/cart" className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center position-relative d-md-flex" style={{ width: '36px', height: '36px' }}>
            <ShoppingCart size={18} className="text-success" />
            {cartCount > 0 && (
              <span
                className="position-absolute translate-middle badge rounded-pill bg-danger border border-white"
                style={{
                  top: '4px',
                  right: '-8px',
                  fontSize: '9px',
                  padding: '4px 6px'
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
              title="Logout"
            >
              <LogOut size={16} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Geolocation & Delivery location display banner */}
      <div
        className="mt-2 py-1 px-2 rounded-3 d-flex align-items-center justify-content-between cursor-pointer"
        style={{
          backgroundColor: 'var(--accent-green-bg)',
          fontSize: '12px'
        }}
        onClick={onOpenAddressModal}
      >
        <div className="d-flex align-items-center text-truncate flex-grow-1">
          <MapPin size={14} className="text-success me-2 flex-shrink-0" />
          <span className="text-success fw-600 me-1 flex-shrink-0">Deliver to:</span>
          <span className="text-truncate text-secondary" style={{ maxWidth: '280px' }}>
            {getDisplayAddress()}
          </span>
        </div>
        <span className="text-success fw-bold text-xs ms-2 flex-shrink-0" style={{ textDecoration: 'underline' }}>
          Change
        </span>
      </div>
    </header>
  );
};

export default CustomerHeader;

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin, Sun, Moon, ShoppingCart, LogOut,
  Heart, Bell, X, User, ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isMock } from '../firebase/config';
import { useToast } from './Toast';

const CustomerHeader = ({ onOpenAddressModal }) => {
  const {
    user, logout, cart, theme, toggleTheme,
    selectedAddress, currentLocation,
    notifications, markNotificationsRead
  } = useApp();
  const { confirm } = useToast();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const handleLogout = async () => {
    const ok = await confirm('You will be signed out of HSP Organics.', {
      title: 'Log Out?',
      confirmLabel: 'Log Out',
      cancelLabel: 'Stay',
      danger: true,
    });
    if (ok) { await logout(); navigate('/login'); }
  };
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        profileRef.current && !profileRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  // Close notification panel on outside click
  // useEffect(() => {
  //   const handler = (e) => {
  //     if (panelRef.current && !panelRef.current.contains(e.target)) {
  //       setShowNotifications(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handler);
  //   return () => document.removeEventListener('mousedown', handler);
  // }, []);

  const getDisplayAddress = () => {
    if (selectedAddress) return `${selectedAddress.name}: ${selectedAddress.addressLine}`;
    if (currentLocation) return currentLocation.addressLine;
    return 'Choose a delivery location...';
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Filter notifications relevant to current user
  const userNotifications = notifications
    .filter(n => n.userId === 'all' || n.userId === user?.uid)
    .slice(0, 25);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening && unreadCount > 0) {
      markNotificationsRead();
    }
  };

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
          <div className="bg-white p-2 rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <img src="/logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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

        {/* Global Toolbar: always-visible icons + profile dropdown */}
        <div className="d-flex align-items-center gap-2">

          {/* Notification Bell — only for logged-in users */}
          {user && (
            <div className="position-relative" ref={panelRef}>
              <button
                id="notif-bell-btn"
                onClick={handleBellClick}
                className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center position-relative border"
                style={{ width: '36px', height: '36px', borderColor: '#eaeaea', backgroundColor: '#ffffff' }}
                title="Notifications"
              >
                <Bell size={17} className={unreadCount > 0 ? 'text-success' : 'text-muted'} />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute badge rounded-pill bg-danger border border-white"
                    style={{ top: '0px', right: '0px', fontSize: '8px', padding: '2px 5px', lineHeight: '1.2' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '320px',
                    maxHeight: '420px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    zIndex: 1060
                  }}
                  className="animate-fade-in-up"
                >
                  <div
                    className="d-flex align-items-center justify-content-between border-bottom"
                    style={{ position: 'sticky', top: 0, background: '#f8faf8', zIndex: 1, padding: '10px 16px' }}
                  >
                    <span className="font-heading fw-bold text-success" style={{ fontSize: '13px' }}>
                      🔔 Notifications
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="btn btn-light btn-xs border-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{ width: '22px', height: '22px' }}
                    >
                      <X size={12} className="text-muted" />
                    </button>
                  </div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {userNotifications.length === 0 ? (
                      <div className="text-center py-5 px-3">
                        <Bell size={32} className="text-muted mb-2 d-block mx-auto" style={{ opacity: 0.25 }} />
                        <p className="text-muted m-0 font-body" style={{ fontSize: '12.5px' }}>No notifications yet</p>
                      </div>
                    ) : (
                      userNotifications.map(n => (
                        <div
                          key={n.id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                            background: !n.read ? 'rgba(46,125,50,0.03)' : 'transparent',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div
                            className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <Bell size={14} className="text-success" />
                          </div>
                          <div style={{ minWidth: 0, flexGrow: 1 }}>
                            <div className="font-heading fw-bold text-dark" style={{ fontSize: '12.5px', lineHeight: '1.3' }}>
                              {n.title}
                            </div>
                            <div className="text-muted font-body" style={{ fontSize: '11px', lineHeight: '1.4', marginTop: '3px' }}>
                              {n.body}
                            </div>
                            <div className="text-muted fw-medium" style={{ fontSize: '9.5px', marginTop: '4px' }}>
                              {new Date(n.createdAt).toLocaleString([], {
                                month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </div>
                          </div>
                          {!n.read && (
                            <div
                              className="rounded-circle bg-success flex-shrink-0"
                              style={{ width: '7px', height: '7px', marginTop: '5px' }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart — always visible for all users */}
          <Link
            to="/cart"
            className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center position-relative border"
            style={{ width: '36px', height: '36px', borderColor: '#eaeaea', backgroundColor: '#ffffff' }}
            title="Cart"
          >
            <ShoppingCart size={17} className="text-success" />
            {cartCount > 0 && (
              <span
                className="position-absolute badge rounded-pill bg-danger border border-white"
                style={{ top: '0px', right: '0px', fontSize: '8px', padding: '2px 5px', lineHeight: '1.2' }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login button for guest users */}
          {!user && (
            <Link
              to="/login"
              className="btn btn-success rounded-pill px-3 py-1 font-heading fw-bold d-flex align-items-center justify-content-center"
              style={{ fontSize: '11px', height: '36px' }}
            >
              Login
            </Link>
          )}

          {/* User Profile Dropdown */}
          {user && (
            <div className="position-relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="btn btn-light rounded-pill px-2 py-1 d-flex align-items-center gap-2 border"
                style={{ height: '36px', backgroundColor: '#ffffff', borderColor: '#eaeaea' }}
              >
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{ width: '26px', height: '26px', fontSize: '11px', fontWeight: '700' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-muted font-heading fw-bold d-none d-sm-inline" style={{ fontSize: '11px' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={13} className="text-muted" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border overflow-hidden animate-fade-in-up"
                  style={{ width: '210px', zIndex: 1060, borderColor: 'rgba(0,0,0,0.07)', padding: '5px' }}
                >
                  {/* User Info */}
                  <div className="px-3 py-2 border-bottom">
                    <div className="fw-extrabold text-success font-heading" style={{ fontSize: '13px' }}>
                      {user?.name || 'User'}
                    </div>
                    <div className="text-muted font-body" style={{ fontSize: '10px', marginTop: '1px' }}>
                      {user?.email}
                    </div>
                  </div>

                  {/* Wishlist */}
                  <Link
                    to="/wishlist"
                    className="dropdown-item d-flex align-items-center gap-2 py-2 rounded-3"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <Heart size={15} className="text-danger" />
                    <span className="font-heading fw-bold text-xs">Wishlist</span>
                  </Link>

                  {/* Theme Switch */}
                  <button
                    onClick={toggleTheme}
                    className="dropdown-item d-flex align-items-center gap-2 py-2 border-0 bg-transparent w-100 rounded-3 text-start"
                  >
                    {theme === 'light' ? (
                      <>
                        <Moon size={15} className="text-success" />
                        <span className="font-heading fw-bold text-xs">Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun size={15} className="text-warning" />
                        <span className="font-heading fw-bold text-xs">Light Mode</span>
                      </>
                    )}
                  </button>

                  {/* Logout */}
                  <div className="border-top mt-1 pt-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger border-0 bg-transparent w-100 rounded-3 text-start font-heading fw-bold"
                      style={{ fontSize: '12px' }}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Location Banner */}
      <div
        className="mt-2 py-1 px-2 rounded-3 d-flex align-items-center justify-content-between cursor-pointer"
        style={{ backgroundColor: 'var(--accent-green-bg)', fontSize: '12px' }}
        onClick={onOpenAddressModal}
      >
        <div className="d-flex align-items-center text-truncate flex-grow-1">
          <MapPin size={14} className="text-success me-2 flex-shrink-0" />
          <span className="text-success fw-600 me-1 flex-shrink-0">Deliver to:</span>
          <span className="text-truncate text-secondary" style={{ maxWidth: '240px' }}>
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

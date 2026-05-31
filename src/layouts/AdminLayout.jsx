import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { isMock } from '../firebase/config';
import { 
  LayoutDashboard, ShoppingCart, Users, Ticket, 
  Bell, Settings, LogOut, ShieldAlert, ArrowLeft 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  // Route guarding: only allow users with 'admin' role
  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (user.role !== 'admin') {
      alert("Unauthorized! Restricting access to administrators.");
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/products', label: 'Products', icon: <ShoppingCart size={18} /> },
    { to: '/admin/orders', label: 'Orders', icon: <Users size={18} /> },
    { to: '/admin/coupons', label: 'Coupons', icon: <Ticket size={18} /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <div className="d-flex min-vh-100 text-start" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Sidebar */}
      <aside 
        className="d-none d-md-flex flex-column flex-shrink-0 p-3 text-white sticky-top"
        style={{
          width: '260px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1B5E20 0%, #113c14 100%)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Sidebar Brand Header */}
        <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="bg-success text-white p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: '#388E3C !important' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-1.5">
              <h5 className="m-0 font-heading fw-extrabold" style={{ letterSpacing: '-0.5px' }}>
                HSP Admin
              </h5>
              <span 
                className={`badge px-1.5 py-0.5 rounded-pill font-heading ${isMock ? 'bg-warning text-dark' : 'bg-success text-white'}`}
                style={{ fontSize: '7.5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}
              >
                {isMock ? 'Sandbox' : 'Live'}
              </span>
            </div>
            <span className="text-white-50 font-body" style={{ fontSize: '10px' }}>
              From Farm To Home
            </span>
          </div>
        </div>

        {/* Sidebar Links */}
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          {navLinks.map((link) => (
            <li key={link.to} className="nav-item">
              <NavLink 
                to={link.to} 
                end={link.end}
                className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-3 text-white transition-normal ${isActive ? 'bg-success fw-bold' : 'hover-expand'}`}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'var(--primary-leaf-light)' : 'transparent',
                })}
              >
                {link.icon}
                <span className="font-heading" style={{ fontSize: '14px' }}>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer User Details */}
        <div className="pt-3 border-top mt-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="d-flex align-items-center gap-2.5 mb-3">
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="rounded-circle border border-success" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
            <div className="text-truncate">
              <h6 className="m-0 font-heading fw-bold text-white text-truncate" style={{ fontSize: '13px' }}>
                {user.displayName}
              </h6>
              <span className="text-white-50 font-body" style={{ fontSize: '10px' }}>
                Store Administrator
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-light w-100 py-1.5 rounded-3 font-heading fw-semibold d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: '13px' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Body Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100" style={{ overflowX: 'hidden' }}>
        {/* Top Navbar */}
        <header 
          className="navbar navbar-expand navbar-light bg-white sticky-top px-4 py-2.5 border-bottom"
          style={{
            zIndex: 1010,
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
            <h4 className="m-0 font-heading fw-extrabold text-success d-md-block d-none">
              Console Overview
            </h4>
            
            {/* Mobile Header Brand */}
            <div className="d-md-none d-flex align-items-center gap-2">
              <div className="bg-success text-white p-1.5 rounded-circle">
                <ShieldAlert size={16} />
              </div>
              <h5 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '16px' }}>HSP Console</h5>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Back to Client Storefront button */}
              <NavLink 
                to="/" 
                className="btn btn-outline-success btn-sm rounded-pill font-heading fw-bold d-flex align-items-center gap-1.5 px-3"
                style={{ fontSize: '12px' }}
              >
                <ArrowLeft size={14} /> View Storefront
              </NavLink>

              {/* Theme toggle */}
              <button 
                onClick={toggleTheme} 
                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* Admin Avatar */}
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="rounded-circle d-md-block d-none" 
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </header>

        {/* Mobile Sub navigation (pills visible on mobile layout header) */}
        <div className="d-md-none bg-white py-2 px-3 border-bottom">
          <div className="d-flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                end={link.end}
                className={({ isActive }) => `btn btn-xs rounded-pill px-3 py-1 font-heading fw-bold text-nowrap ${isActive ? 'btn-success text-white shadow-sm' : 'btn-light border text-secondary'}`}
                style={{ fontSize: '11px' }}
              >
                {link.label}
              </NavLink>
            ))}
            <button 
              onClick={handleLogout} 
              className="btn btn-xs btn-outline-danger rounded-pill px-3 py-1 font-heading fw-bold text-nowrap"
              style={{ fontSize: '11px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* View Content Port */}
        <main className="flex-grow-1 p-4" style={{ paddingBottom: '40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, MapPin, ClipboardList, ShieldAlert, Navigation } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AddressSelectionModal from '../../components/AddressSelectionModal';

const Profile = () => {
  const { user, logout, addresses } = useApp();
  const navigate = useNavigate();
  
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="container-fluid pb-5 pt-5 px-3 text-center" style={{ paddingBottom: '90px' }}>
        <div className="py-5 bg-white rounded-4 border max-w-400 mx-auto px-4 shadow-sm">
          <User className="text-success mb-2 mx-auto" size={32} />
          <h4 className="font-heading fw-bold text-success mb-2">Access Denied</h4>
          <p className="text-muted font-body mb-4" style={{ fontSize: '14px' }}>
            Please log in to manage your user profile and address details.
          </p>
          <Link to="/login" className="btn btn-organic w-100 py-2">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5 pt-2 px-3 text-start animate-fade-in-up" style={{ paddingBottom: '90px' }}>
      
      {/* Header */}
      <div className="mb-4">
        <h4 className="font-heading fw-bold text-success m-0">My Account</h4>
        <p className="text-muted text-xs font-body m-0">Manage your profile, delivery addresses, and settings</p>
      </div>

      <div className="row g-3">
        {/* User Card */}
        <div className="col-12">
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm text-center">
            <div className="d-inline-flex mx-auto mb-3 position-relative">
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                className="rounded-circle border border-2 border-success" 
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <span 
                className="position-absolute bottom-0 end-0 badge rounded-pill bg-success text-xxs font-heading"
                style={{ fontSize: '9px', padding: '4px 6px' }}
              >
                {user.role === 'admin' ? 'Admin' : 'Customer'}
              </span>
            </div>

            <h5 className="font-heading fw-bold text-success m-0">{user.displayName}</h5>
            <p className="text-muted text-xs font-body mb-3">{user.email}</p>

            <div className="d-flex gap-2">
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger btn-sm rounded-pill flex-grow-1 font-heading"
              >
                Sign Out
              </button>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-success btn-sm rounded-pill flex-grow-1 font-heading d-flex align-items-center justify-content-center gap-1">
                  <ShieldAlert size={14} /> Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Addresses Box */}
        <div className="col-12">
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="font-heading fw-bold text-success m-0">Stored Addresses</h6>
              <button 
                onClick={() => setShowAddressModal(true)} 
                className="btn btn-xs btn-outline-success rounded-pill px-3 py-1 font-heading fw-bold"
                style={{ fontSize: '11px' }}
              >
                Manage
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-4 bg-light rounded-4">
                <MapPin className="text-muted mb-2 mx-auto" size={24} />
                <p className="text-muted text-xs m-0">No stored addresses. Save your home address for quick checkouts.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {addresses.map(addr => (
                  <div key={addr.id} className="p-3 border rounded-4 bg-white d-flex align-items-start gap-2.5" style={{ borderColor: 'var(--border-color)' }}>
                    <MapPin size={16} className="text-success mt-0.5" />
                    <div>
                      <h6 className="m-0 font-heading fw-bold text-success text-xs">
                        {addr.name} Address {addr.isDefault && <span className="badge bg-success-subtle text-success ms-1">Default</span>}
                      </h6>
                      <p className="m-0 text-muted font-body text-xs mt-1" style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                        {addr.addressLine}, {addr.city} - {addr.postalCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand details and assistance */}
        <div className="col-12">
          <div className="card border-0 glass-card p-3 rounded-4 shadow-sm text-center">
            <span className="text-success fw-bold font-heading text-xs">HSP Organics — From Farm To Home</span>
            <p className="text-muted text-xxs font-body mt-1" style={{ fontSize: '11px' }}>
              Version 1.0.0 (PWA Standalone) • Offline Enabled
            </p>
          </div>
        </div>

      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal 
        show={showAddressModal} 
        onClose={() => setShowAddressModal(false)} 
      />
    </div>
  );
};

export default Profile;

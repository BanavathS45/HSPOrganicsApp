import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import CustomerBottomNav from '../components/CustomerBottomNav';
import AddressSelectionModal from '../components/AddressSelectionModal';
import { useApp } from '../context/AppContext';

const CustomerLayout = () => {
  const { user, loading } = useApp();
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Authentication gate: redirect to login if user is not authenticated
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-success text-white">
        <div className="text-center font-heading">
          <h3 className="fw-bold mb-2">HSP Organics</h3>
          <p className="pulse-animation text-xs">Preparing organic harvest...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="w-100" style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh' }}>
      {/* Constraints for mobile preview viewport on desktop */}
      <div className="pwa-mobile-viewport bg-white">
        {/* Top Navbar */}
        <CustomerHeader onOpenAddressModal={() => setShowAddressModal(true)} />
        
        {/* Main Content Area */}
        <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
          <Outlet />
        </div>

        {/* Bottom Persistent Bar */}
        <CustomerBottomNav />

        {/* Global Address Selection modal */}
        <AddressSelectionModal 
          show={showAddressModal} 
          onClose={() => setShowAddressModal(false)} 
        />
      </div>
    </div>
  );
};

export default CustomerLayout;

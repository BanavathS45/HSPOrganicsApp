import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, ShoppingBag, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';

const GlassmorphicToast = () => {
  const { activeToast, setActiveToast } = useApp();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'new_order':
        return <ShoppingBag className="text-warning" size={20} />;
      case 'order_status':
        return <CheckCircle className="text-success" size={20} />;
      case 'inventory_alert':
        return <AlertTriangle className="text-danger" size={20} />;
      case 'new_product':
        return <Sparkles className="text-info" size={20} />;
      default:
        return <Bell className="text-primary" size={20} />;
    }
  };

  return (
    <div 
      className="position-fixed start-50 translate-middle-x z-5 shadow-lg border animate-fade-in-up"
      style={{
        top: '20px',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        borderColor: 'rgba(46, 125, 50, 0.2)',
        padding: '16px',
        zIndex: 9999
      }}
    >
      <div className="d-flex align-items-start">
        <div className="bg-light p-2 rounded-circle me-3 d-flex align-items-center justify-content-center">
          {getIcon()}
        </div>
        
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '14px' }}>
              {activeToast.title}
            </h6>
            <button 
              onClick={() => setActiveToast(null)} 
              className="btn btn-sm p-0 border-0 text-muted"
            >
              <X size={16} />
            </button>
          </div>
          <p className="m-0 mt-1 text-muted font-body" style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {activeToast.body}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphicToast;

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────
// Toast Context
// ─────────────────────────────────────────────
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ─────────────────────────────────────────────
// Individual Toast Item
// ─────────────────────────────────────────────
const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

const COLORS = {
  success: { bg: '#0d2e10', border: '#2E7D32', icon: '#4CAF50', bar: '#4CAF50' },
  error:   { bg: '#2e0d0d', border: '#b71c1c', icon: '#ef5350', bar: '#ef5350' },
  warning: { bg: '#2e250d', border: '#e65100', icon: '#FFA726', bar: '#FFA726' },
  info:    { bg: '#0d1e2e', border: '#1565c0', icon: '#42A5F5', bar: '#42A5F5' },
};

const ToastItem = ({ toast, onRemove }) => {
  const c = COLORS[toast.type] || COLORS.info;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: '12px',
        padding: '14px 16px',
        minWidth: '300px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Icon */}
      <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
        {ICONS[toast.type] || ICONS.info}
      </span>

      {/* Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '13.5px', lineHeight: 1.3, marginBottom: '2px' }}>
            {toast.title}
          </div>
        )}
        <div style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', fontSize: '12.5px', lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>

      {/* Close */}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.4)', padding: '2px', display: 'flex',
          flexShrink: 0, marginTop: '-1px'
        }}
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0,
          height: '3px', background: c.bar, borderRadius: '0 0 0 12px',
          animation: `toastProgress ${toast.duration || 4000}ms linear forwards`,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// Confirm Dialog
// ─────────────────────────────────────────────
const ConfirmDialog = ({ config, onResolve }) => {
  if (!config) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      backdropFilter: 'blur(4px)',
      animation: 'toastSlideIn 0.2s ease forwards',
    }}>
      <div style={{
        background: '#0f1f0f',
        border: '1px solid rgba(46,125,50,0.4)',
        borderRadius: '18px',
        padding: '28px 24px',
        maxWidth: '340px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        textAlign: 'center',
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '54px', height: '54px', borderRadius: '50%',
          background: 'rgba(255,152,0,0.15)', border: '1.5px solid rgba(255,152,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <AlertCircle size={26} color="#FFA726" />
        </div>

        <h5 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
          {config.title || 'Are you sure?'}
        </h5>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', fontSize: '13px', marginBottom: '22px', lineHeight: 1.5 }}>
          {config.message}
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onResolve(false)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: '99px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
            }}
          >
            {config.cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={() => onResolve(true)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: '99px',
              background: config.danger ? '#b71c1c' : '#2E7D32',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '13px',
              boxShadow: config.danger
                ? '0 4px 14px rgba(183,28,28,0.4)'
                : '0 4px 14px rgba(46,125,50,0.4)',
            }}
          >
            {config.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [confirmResolve, setConfirmResolve] = useState(null);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((type, message, title, duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message, title, duration }]);
    setTimeout(() => remove(id), duration + 400);
  }, [remove]);

  const toast = {
    success: (msg, title) => show('success', msg, title),
    error:   (msg, title) => show('error',   msg, title || 'Error'),
    warning: (msg, title) => show('warning', msg, title),
    info:    (msg, title) => show('info',    msg, title),
  };

  // Promise-based confirm (replaces window.confirm)
  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmConfig({ message, ...options });
      setConfirmResolve(() => (result) => {
        setConfirmConfig(null);
        setConfirmResolve(null);
        resolve(result);
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast Stack */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '16px',
        zIndex: 99998,
        display: 'flex', flexDirection: 'column', gap: '10px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmConfig && confirmResolve && (
        <ConfirmDialog config={confirmConfig} onResolve={confirmResolve} />
      )}
    </ToastContext.Provider>
  );
};

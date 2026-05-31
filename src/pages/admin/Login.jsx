import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
  const { loginWithEmailAndPassword, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already logged in as Admin
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const loggedUser = await loginWithEmailAndPassword(email, password);
      if (loggedUser.role !== 'admin') {
        setError('Unauthorized! This portal is restricted to store administrators.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@hsporganics.com');
    setPassword('admin123');
  };

  return (
    <div 
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{
        background: 'linear-gradient(135deg, #5D4037 0%, #2E7D32 100%)',
        color: 'var(--text-primary)'
      }}
    >
      <div 
        className="card border-0 glass-card p-4 w-100 text-start animate-fade-in-up"
        style={{ 
          maxWidth: '420px', 
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          background: 'rgba(25, 33, 27, 0.95)',
          color: '#E2EAE3'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="bg-danger text-white p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
            style={{ width: '60px', height: '60px' }}
          >
            <ShieldAlert size={28} />
          </div>
          <h3 className="font-heading fw-bold text-success m-0">Admin Console</h3>
          <p className="text-muted font-body" style={{ fontSize: '13px' }}>
            HSP Organics Administrative Portal
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger border-0 rounded-4 py-2 px-3 text-xs mb-3 font-body" style={{ fontSize: '12.5px', backgroundColor: 'rgba(220, 53, 69, 0.15)', color: '#FF8A80' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin}>
          <div className="mb-3">
            <label className="form-label text-secondary fw-semibold text-xs" style={{ color: '#A3B5A7' }}>Admin Email</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-0 rounded-start-pill text-muted px-3" style={{ borderRight: 'none' }}>
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                placeholder="admin@hsporganics.com" 
                className="form-control bg-dark border-0 text-white rounded-end-pill py-2 font-body" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ colorScheme: 'dark' }}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary fw-semibold text-xs" style={{ color: '#A3B5A7' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-0 rounded-start-pill text-muted px-3" style={{ borderRight: 'none' }}>
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="form-control bg-dark border-0 text-white rounded-end-pill py-2 font-body" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ colorScheme: 'dark' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-organic w-100 py-2 rounded-pill font-heading fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
            style={{ backgroundColor: 'var(--primary-leaf-light)' }}
          >
            <LogIn size={18} />
            {loading ? 'Authorizing...' : 'Enter Console'}
          </button>
        </form>

        {/* Quick Fill Button */}
        <div className="text-center mt-3">
          <button 
            onClick={fillAdminCredentials}
            className="btn btn-link btn-sm text-success text-decoration-none fw-semibold"
            style={{ fontSize: '13px' }}
          >
            🔑 Fill Demo Admin Credentials
          </button>
        </div>

        {/* Back link */}
        <div className="text-center mt-4 border-top pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Link 
            to="/login" 
            className="text-muted text-decoration-none font-heading d-flex align-items-center justify-content-center gap-1 text-xs"
            style={{ fontSize: '12.5px' }}
          >
            <ArrowLeft size={14} /> Back to Customer Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;

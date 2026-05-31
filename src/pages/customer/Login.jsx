import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, loginWithEmailAndPassword, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const logged = await loginWithEmailAndPassword(email, password);
      if (logged.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (type) => {
    if (type === 'customer') {
      setEmail('customer@gmail.com');
      setPassword('customer123'); // Custom password default
    } else if (type === 'admin') {
      setEmail('admin@hsporganics.com');
      setPassword('admin123');
    }
  };

  return (
    <div 
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
        color: 'var(--text-primary)'
      }}
    >
      <div 
        className="card border-0 glass-card p-4 w-100 text-start animate-fade-in-up"
        style={{ 
          maxWidth: '440px', 
          borderRadius: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          background: 'rgba(255, 255, 255, 0.92)'
        }}
      >
        {/* Branding header */}
        <div className="text-center mb-4">
          <div 
            className="bg-success text-white p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow"
            style={{ width: '64px', height: '64px' }}
          >
            <span className="h2 m-0 font-heading fw-bold">H</span>
          </div>
          <h2 className="font-heading fw-bold text-success m-0">HSP Organics</h2>
          <p className="text-muted font-body" style={{ fontSize: '14px', fontStyle: 'italic' }}>
            “From Farm To Home”
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger rounded-4 py-2 px-3 text-xs mb-3 font-body" style={{ fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Google Authentication Trigger */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-light border w-100 py-2 rounded-pill font-heading fw-bold d-flex align-items-center justify-content-center gap-2 mb-4 shadow-sm"
          style={{ transition: 'all 0.2s' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" className="me-1">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Separator */}
        <div className="d-flex align-items-center mb-4">
          <hr className="flex-grow-1 text-muted" />
          <span className="px-2 text-muted text-xs font-body">or email password</span>
          <hr className="flex-grow-1 text-muted" />
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleEmailLogin}>
          <div className="mb-3">
            <label className="form-label text-secondary fw-semibold text-xs">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted px-3">
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                placeholder="customer@gmail.com" 
                className="form-control border-start-0 rounded-end-pill py-2 text-dark font-body" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary fw-semibold text-xs">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill text-muted px-3">
                <Lock size={16} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter password" 
                className="form-control border-start-0 py-2 text-dark font-body" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-group-text bg-white rounded-end-pill text-muted px-3 border-start-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-organic w-100 py-2 rounded-pill font-heading fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Credentials guide panel */}
        <div className="mt-4 p-3 rounded-4 bg-success-subtle border border-success-subtle text-xs" style={{ background: 'rgba(46, 125, 50, 0.05)', fontSize: '12px' }}>
          <strong className="text-success font-heading">💡 Demo Credentials Quick-Fill:</strong>
          <div className="d-flex gap-2 mt-2">
            <button 
              type="button" 
              onClick={() => quickFill('customer')}
              className="btn btn-outline-success btn-xs py-1 px-2 rounded-pill font-body text-xs"
              style={{ fontSize: '11px' }}
            >
              Fill Customer
            </button>
            <button 
              type="button" 
              onClick={() => quickFill('admin')}
              className="btn btn-outline-success btn-xs py-1 px-2 rounded-pill font-body text-xs"
              style={{ fontSize: '11px' }}
            >
              Fill Admin
            </button>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="text-center mt-4">
          <Link 
            to="/admin/login" 
            className="text-success fw-bold text-decoration-none font-heading d-flex align-items-center justify-content-center gap-1"
            style={{ fontSize: '13.5px' }}
          >
            Admin Dashboard Portal <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;

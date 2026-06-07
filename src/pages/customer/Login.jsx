import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Fingerprint, X, Shield } from 'lucide-react';
import { biometricService } from '../../firebase/db';

const Login = () => {
  const { loginWithGoogle, loginWithEmailAndPassword, user } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Biometric enrollment prompt state
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [promptUser, setPromptUser] = useState(null);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/');
    }
  }, [user, navigate]);

  // Show biometric enrollment prompt after first login
  const checkAndShowBiometricPrompt = (loggedUser) => {
    if (!biometricService.isAvailable()) return;
    const promptKey = `hsp_biometric_prompt_${loggedUser.uid}`;
    const alreadyShown = localStorage.getItem(promptKey);
    const alreadyRegistered = biometricService.hasRegistered(loggedUser.uid);
    if (!alreadyShown && !alreadyRegistered) {
      setPromptUser(loggedUser);
      setShowBiometricPrompt(true);
    }
  };

  const handleEnrollBiometric = async () => {
    if (!promptUser) return;
    try {
      await biometricService.register(promptUser.uid);
      localStorage.setItem(`hsp_biometric_prompt_${promptUser.uid}`, 'shown');
      setShowBiometricPrompt(false);
      // Navigate based on role
      if (promptUser.role === 'admin') navigate('/admin');
      else if (promptUser.role === 'delivery') navigate('/delivery');
      else navigate('/');
    } catch (e) {
      setShowBiometricPrompt(false);
      navigate('/');
    }
  };

  const handleSkipBiometric = () => {
    if (promptUser) localStorage.setItem(`hsp_biometric_prompt_${promptUser.uid}`, 'shown');
    setShowBiometricPrompt(false);
    if (promptUser?.role === 'admin') navigate('/admin');
    else if (promptUser?.role === 'delivery') navigate('/delivery');
    else navigate('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError('');
    try {
      const logged = await loginWithGoogle();
      checkAndShowBiometricPrompt(logged);
      if (!biometricService.isAvailable() || biometricService.hasRegistered(logged?.uid)) {
        if (logged?.role === 'admin') navigate('/admin');
        else if (logged?.role === 'delivery') navigate('/delivery');
        else navigate('/');
      }
    }
    catch (err) { setError(err.message || 'Google login failed.'); }
    finally { setLoading(false); }
  };

  const handleBiometricLogin = async () => {
    setLoading(true); setError('');
    try {
      const userId = await biometricService.authenticate();
      const users = JSON.parse(localStorage.getItem('hsp_users') || '[]');
      const userObj = users.find(u => u.uid === userId);
      if (userObj) {
        sessionStorage.setItem('hsp_session', JSON.stringify(userObj));
        window.location.href = userObj.role === 'admin' ? '/admin' : userObj.role === 'delivery' ? '/delivery' : '/';
      } else {
        throw new Error('Registered user not found. Please login with email.');
      }
    } catch (err) {
      setError(err.message || 'Biometric authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    setLoading(true); setError('');
    try {
      const logged = await loginWithEmailAndPassword(email, password);
      checkAndShowBiometricPrompt(logged);
      if (!biometricService.isAvailable() || biometricService.hasRegistered(logged?.uid)) {
        if (logged.role === 'admin') navigate('/admin');
        else if (logged.role === 'delivery') navigate('/delivery');
        else navigate('/');
      }
    }
    catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  const quickFill = (type) => {
    if (type === 'customer') { setEmail('customer@gmail.com'); setPassword('customer123'); }
    else if (type === 'admin') { setEmail('admin@hsporganics.com'); setPassword('admin123'); }
    else if (type === 'delivery') { setEmail('delivery@hsporganics.com'); setPassword('delivery123'); }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #f5f5f2;
        }

        /* ── Left panel ── */
        .login-left {
          width: 45%;
          background: linear-gradient(160deg, #2D6A0F 0%, #52A820 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .login-left-inner {
          max-width: 300px;
          color: #fff;
        }
        .brand-icon {
          width: 72px; height: 72px;
          background: rgba(255,255,255,0.15);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .brand-name {
          font-size: 26px; font-weight: 700;
          color: #fff; margin: 0 0 4px;
        }
        .brand-tagline {
          font-size: 13px; color: rgba(255,255,255,0.75);
          font-style: italic; margin: 0 0 36px;
        }
        .features { display: flex; flex-direction: column; gap: 20px; }
        .feature-row { display: flex; align-items: flex-start; gap: 13px; }
        .feature-emoji { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .feature-title { font-size: 13px; font-weight: 600; color: #fff; margin: 0 0 2px; }
        .feature-desc  { font-size: 11px; color: rgba(255,255,255,0.7); margin: 0; }

        /* ── Right panel ── */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
        }
        .login-card {
          background: #fff;
          border-radius: 20px;
          padding: 36px 32px;
          width: 100%;
          max-width: 400px;
          border: 0.5px solid #e8e8e8;
        }

        /* Mobile brand — hidden on desktop */
        .mobile-brand {
          display: none;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .mobile-brand-name { font-size: 16px; font-weight: 700; color: #2D6A0F; margin: 0 0 2px; }
        .mobile-brand-sub  { font-size: 11px; color: #aaa; font-style: italic; margin: 0; }

        .form-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
        .form-sub   { font-size: 13px; color: #888; margin: 0 0 24px; }

        .error-box {
          display: flex; align-items: center; gap: 8px;
          background: #FCEBEB; color: #A32D2D;
          font-size: 12px; border-radius: 10px;
          padding: 9px 12px; margin-bottom: 16px;
          border: 0.5px solid #f5c1c1;
        }

        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px;
          border-radius: 12px;
          border: 0.5px solid #ddd;
          background: #fff;
          color: #333;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .google-btn:hover { background: #fafafa; }

        .divider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .divider-line { flex: 1; height: 0.5px; background: #ebebeb; }
        .divider-text { font-size: 11px; color: #bbb; white-space: nowrap; }

        .field-group { margin-bottom: 14px; }
        .field-label {
          display: block; font-size: 10px; font-weight: 500;
          color: #888; text-transform: uppercase; letter-spacing: 0.4px;
          margin-bottom: 5px;
        }
        .field-label-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 5px;
        }
        .forgot-link { font-size: 11px; color: #3B8A1A; text-decoration: none; font-weight: 500; }

        .input-wrap { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 12px; pointer-events: none; }
        .field-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border-radius: 10px;
          border: 0.5px solid #e0e0e0;
          font-size: 13px; color: #1a1a1a;
          background: #fafafa;
          outline: none;
        }
        .field-input:focus { border-color: #3B8A1A; background: #fff; }
        .eye-btn {
          position: absolute; right: 10px;
          background: none; border: none;
          cursor: pointer; padding: 4px;
          display: flex; align-items: center;
        }

        .submit-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #2D6A0F 0%, #3B8A1A 100%);
          color: #fff;
          font-size: 14px; font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
        }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .signup-row { text-align: center; font-size: 13px; color: #888; margin: 20px 0 0; }
        .signup-link { color: #3B8A1A; font-weight: 500; text-decoration: none; }

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          .login-left  { display: none; }
          .login-right {
            padding: 0;
            align-items: stretch;
            background: linear-gradient(160deg, #fff 0%, #fff 100%);
          }
       .login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  
  min-height: 100vh;
  width: 100%;
 background-color:"white"
}

.login-card {
  border-radius: 0;
  padding: 28px 20px 36px;
  max-width: 400px;
  width: 100%;
  border: none;
  
}
          .mobile-brand { display: flex;  justify-content: center;}
          .form-title   { font-size: 19px; }
        }

        @media (max-width: 380px) {
          .login-card { padding: 24px 16px 32px; }
          .form-title { font-size: 17px; }
          .google-btn { font-size: 12px; padding: 10px; }
          .submit-btn { font-size: 13px; padding: 11px; }
        }
      `}</style>

      <div className="login-page">

        {/* ── Left panel (desktop only) ── */}
        <div className="login-left ">
          <div className="login-left-inner">
            <div className="brand-icon">
              <img src="logo.png" alt="HSP Organics" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
            </div>
            <h1 className="brand-name">HSP Organics</h1>
            <p className="brand-tagline">"From Farm to Home"</p>
            <div className="features">
              {[
                ['🌱', 'Certified Organic', 'Sourced directly from trusted farms'],
                ['🚚', 'Same-day Delivery', 'Fresh to your doorstep daily'],
                ['✅', 'Quality Assured', 'Rigorously tested before dispatch'],
              ].map(([icon, title, desc]) => (
                <div className="feature-row" key={title}>
                  <span className="feature-emoji">{icon}</span>
                  <div>
                    <p className="feature-title">{title}</p>
                    <p className="feature-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right login-container">
          <div className="login-card ">

            {/* Mobile brand header */}
            <div className="mobile-brand ">
              <img src="logo.png" alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }} />
              <div>
                <p className="mobile-brand-name">HSP Organics</p>
                <p className="mobile-brand-sub "  >From Farm to Home</p>
              </div>
            </div>

            <h2 className="form-title text-center">Welcome back</h2>
            <p className="form-sub text-center">Sign in to continue shopping</p>

            {/* Error */}
            {error && (
              <div className="error-box">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Google */}
            <button onClick={handleGoogleLogin} disabled={loading} className="google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {biometricService.isAvailable() && biometricService.hasAnyRegistered() && (
              <button
                onClick={handleBiometricLogin}
                disabled={loading}
                className="google-btn"
                style={{ marginTop: '-10px', border: '1.5px solid #2D6A0F', color: '#2D6A0F', background: '#f0fdf4' }}
              >
                <Fingerprint size={20} color="#2D6A0F" />
                Login with Fingerprint / Face ID
              </button>
            )}

            {/* Divider */}
            <div className="divider-row">
              <div className="divider-line" />
              <span className="divider-text">or sign in with email</span>
              <div className="divider-line" />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailLogin} noValidate>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="input-wrap">
                  <Mail size={15} color="#aaa" className="input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>
              </div>

              <div className="field-group">
                {/* <div className="field-label-row">
                  <span className="field-label" style={{ marginBottom: 0 }}>Password</span>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div> */}
                <div className="input-wrap">
                  <Lock size={15} color="#aaa" className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="field-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="eye-btn">
                    {showPassword ? <EyeOff size={15} color="#aaa" /> : <Eye size={15} color="#aaa" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                <LogIn size={16} />
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* <p className="signup-row">
              Don't have an account?{' '}
              <Link to="/register" className="signup-link">Create one</Link>
            </p> */}
            {/* Quick Demo Access */}
            <div className="mt-4 border-top pt-3 text-center">
              <span className="text-muted d-block mb-2.5 font-body" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⚡ Quick Demo Sign In
              </span>
              <div className="d-flex justify-content-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => quickFill('customer')}
                  className="btn btn-xs btn-outline-success rounded-pill px-2.5 py-1 font-body text-xs"
                  style={{ fontSize: '11px' }}
                >
                  🌱 Customer
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('admin')}
                  className="btn btn-xs btn-outline-success rounded-pill px-2.5 py-1 font-body text-xs"
                  style={{ fontSize: '11px' }}
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => quickFill('delivery')}
                  className="btn btn-xs btn-outline-success rounded-pill px-2.5 py-1 font-body text-xs"
                  style={{ fontSize: '11px' }}
                >
                  🚴 Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Biometric Enrollment Prompt Modal */}
      {showBiometricPrompt && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '24px',
            padding: '36px 28px', maxWidth: '360px', width: '100%',
            textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            {/* Icon */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', border: '3px solid #a5d6a7'
            }}>
              <Fingerprint size={40} color="#2D6A0F" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px' }}>
              Enable Quick Login
            </h3>
            <p style={{ fontSize: '13.5px', color: '#666', margin: '0 0 8px', lineHeight: '1.6' }}>
              Use your <strong>Fingerprint</strong> or <strong>Face ID</strong> to sign in instantly next time — no password needed.
            </p>
            <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 28px' }}>
              Supported on Android & iOS devices with biometric sensors.
            </p>

            <button
              onClick={handleEnrollBiometric}
              style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #2D6A0F 0%, #3B8A1A 100%)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                marginBottom: '10px'
              }}
            >
              <Fingerprint size={18} />
              Enable Fingerprint / Face ID
            </button>

            <button
              onClick={handleSkipBiometric}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', color: '#888',
                border: '0.5px solid #e0e0e0', borderRadius: '12px',
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Not Now
            </button>

            <p style={{ fontSize: '10px', color: '#bbb', margin: '14px 0 0' }}>
              You can enable this anytime from your profile settings.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
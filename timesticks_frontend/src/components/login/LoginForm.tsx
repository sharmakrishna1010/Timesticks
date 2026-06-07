import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

type Mode = 'login' | 'forgot_email' | 'forgot_otp';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser, setPendingVerify } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await authApi.login(formData);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || '';
      if (err?.response?.status === 403 || msg.toLowerCase().includes('verify')) {
        setPendingVerify({ userId: '', email: formData.email });
        navigate('/verify-otp');
        return;
      }
      setServerError(msg || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await authApi.resetPassword({ email: resetEmail });
      setResetUserId(res.data.userId);
      setSuccessMsg(res.data.message || 'OTP sent to your email');
      setMode('forgot_otp');
    } catch (err: any) {
      setServerError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !newPassword) return;
    
    // Password strength check
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,20}$/.test(newPassword)) {
      setServerError('Password must be 6-20 chars with uppercase, lowercase, digit & special char');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      await authApi.resetPasswordVerification({ userId: resetUserId, otp: resetOtp, newPassword });
      setMode('login');
      setSuccessMsg('Password reset successfully! Please log in.');
      setFormData({ email: resetEmail, password: '' });
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
    } catch (err: any) {
      setServerError(err?.response?.data?.error || err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {mode === 'login' && (
        <>
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to your Timesticks account</p>

          {successMsg && (
            <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: '0.85rem', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <input
                type="email"
                name="email"
                id="login-email"
                value={formData.email}
                onChange={handleLoginChange}
                placeholder="Email"
                className="ts-input"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="login-password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  className="ts-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '14px' }}>
              <button 
                type="button" 
                onClick={() => { setMode('forgot_email'); setServerError(''); setSuccessMsg(''); }} 
                className="auth-link" 
                style={{ background: 'none', border: 'none', fontSize: '0.8rem' }}
              >
                Forgot password?
              </button>
            </div>

            {serverError && (
              <div style={{ marginBottom: '12px' }}>
                <span className="field-error" style={{ fontSize: '0.8rem' }}>⚠ {serverError}</span>
              </div>
            )}

            <button
              type="submit"
              id="login-submit"
              className="ts-btn ts-btn-primary"
              style={{ width: '100%' }}
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">— or —</div>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Sign up free</Link>
          </p>
        </>
      )}

      {mode === 'forgot_email' && (
        <>
          <h1>Reset Password</h1>
          <p className="auth-sub">Enter your email to receive a reset code</p>

          <form onSubmit={handleForgotEmailSubmit} noValidate>
            <div className="form-group">
              <input
                type="email"
                value={resetEmail}
                onChange={e => { setResetEmail(e.target.value); setServerError(''); }}
                placeholder="Email address"
                className="ts-input"
                required
                autoFocus
              />
            </div>

            {serverError && (
              <div style={{ marginBottom: '12px' }}>
                <span className="field-error" style={{ fontSize: '0.8rem' }}>⚠ {serverError}</span>
              </div>
            )}

            <button
              type="submit"
              className="ts-btn ts-btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
              disabled={loading || !resetEmail}
            >
              {loading ? <span className="spinner" /> : 'Send Code'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '20px' }}>
            <button onClick={() => { setMode('login'); setServerError(''); }} className="auth-link" style={{ background: 'none', border: 'none' }}>
              ← Back to Sign In
            </button>
          </p>
        </>
      )}

      {mode === 'forgot_otp' && (
        <>
          <h1>Check your email</h1>
          <p className="auth-sub">Enter the 6-digit code sent to {resetEmail}</p>

          {successMsg && (
            <div style={{ marginBottom: '12px', padding: '10px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: 'var(--radius)', fontSize: '0.85rem', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleForgotOtpSubmit} noValidate>
            <div className="form-group">
              <input
                type="text"
                value={resetOtp}
                onChange={e => { setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setServerError(''); }}
                placeholder="6-digit OTP code"
                className="ts-input"
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem' }}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setServerError(''); }}
                placeholder="New Password"
                className="ts-input"
                required
              />
            </div>

            {serverError && (
              <div style={{ marginBottom: '12px' }}>
                <span className="field-error" style={{ fontSize: '0.8rem' }}>⚠ {serverError}</span>
              </div>
            )}

            <button
              type="submit"
              className="ts-btn ts-btn-primary"
              style={{ width: '100%', marginTop: '4px' }}
              disabled={loading || resetOtp.length < 6 || !newPassword}
            >
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '20px' }}>
            <button onClick={() => { setMode('login'); setServerError(''); setSuccessMsg(''); }} className="auth-link" style={{ background: 'none', border: 'none' }}>
              ← Back to Sign In
            </button>
          </p>
        </>
      )}
    </div>
  );
}

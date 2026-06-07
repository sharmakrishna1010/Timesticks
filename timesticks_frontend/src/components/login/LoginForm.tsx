import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser, setPendingVerify } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const isValid = formData.email.length > 0 && formData.password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setServerError('');
    try {
      await authApi.login(formData);
      setUser({ userId: '', email: formData.email });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      // If email not verified, redirect to OTP page
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

  return (
    <div className="auth-card">
      <h1>Welcome back</h1>
      <p className="auth-sub">Sign in to your Timesticks account</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            id="login-email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="ts-input"
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="login-password"
              value={formData.password}
              onChange={handleChange}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
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
          style={{ width: '100%', marginTop: '4px' }}
          disabled={loading || !isValid}
        >
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider">— or —</div>

      <p className="auth-footer">
        Don't have an account?{' '}
        <Link to="/signup" className="auth-link">Sign up free</Link>
      </p>
    </div>
  );
}

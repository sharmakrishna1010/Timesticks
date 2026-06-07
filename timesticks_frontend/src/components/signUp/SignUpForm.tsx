import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

// Password must: 6-20 chars, lowercase, uppercase, digit, special char
const isPasswordStrong = (pw: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,20}$/.test(pw);

const isEmailValid = (email: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const isFullNameValid = (name: string) =>
  /^[a-zA-Z ]{5,20}$/.test(name);

export default function SignUpForm() {
  const navigate = useNavigate();
  const { setPendingVerify } = useAuth();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const nameError = touched.fullName && !isFullNameValid(formData.fullName) && formData.fullName.length > 0
    ? 'Must be 5–20 letters only' : '';
  const emailError = touched.email && !isEmailValid(formData.email) && formData.email.length > 0
    ? 'Enter a valid email address' : '';
  const passwordError = touched.password && !isPasswordStrong(formData.password) && formData.password.length > 0
    ? 'Must be 6–20 chars with uppercase, lowercase, digit & special char' : '';

  const isFormValid =
    isFullNameValid(formData.fullName) &&
    isEmailValid(formData.email) &&
    isPasswordStrong(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setServerError('');
    try {
      const res = await authApi.signup(formData);
      const { userId } = res.data;
      setPendingVerify({ userId, email: formData.email });
      navigate('/verify-otp');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Create Account</h1>
      <p className="auth-sub">Sign up to manage your tasks and habits</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <input
            type="text"
            name="fullName"
            id="signup-fullname"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Full Name"
            className={`ts-input${nameError ? ' error' : ''}`}
            required
            autoComplete="name"
          />
          {nameError && <span className="field-error">{nameError}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <input
            type="email"
            name="email"
            id="signup-email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email"
            className={`ts-input${emailError ? ' error' : ''}`}
            required
            autoComplete="email"
          />
          {emailError && <span className="field-error">{emailError}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="signup-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              className={`ts-input${passwordError ? ' error' : ''}`}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {passwordError && <span className="field-error">{passwordError}</span>}
        </div>

        {serverError && (
          <div style={{ marginBottom: '12px' }}>
            <span className="field-error" style={{ fontSize: '0.8rem' }}>⚠ {serverError}</span>
          </div>
        )}

        <button
          type="submit"
          id="signup-submit"
          className="ts-btn ts-btn-primary"
          style={{ width: '100%', marginTop: '4px' }}
          disabled={loading || !isFormValid}
        >
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer" style={{ marginTop: '16px' }}>
        Already have an account?{' '}
        <Link to="/login" className="auth-link">Sign in</Link>
      </p>

      <p className="auth-footer">
        By signing up, you agree to our{' '}
        <a href="#" className="auth-link">Terms</a>
        {' '}and{' '}
        <a href="#" className="auth-link">Privacy Policy</a>.
      </p>
    </div>
  );
}
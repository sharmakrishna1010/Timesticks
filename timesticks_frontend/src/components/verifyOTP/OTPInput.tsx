import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';

const OTP_LENGTH = 6;

export default function OTPInput() {
  const navigate = useNavigate();
  const { pendingVerify, setUser } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && digits.every(d => d !== '');

  const focusBox = (idx: number) => inputRefs.current[idx]?.focus();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[idx] !== '') {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      } else if (idx > 0) {
        const next = [...digits];
        next[idx - 1] = '';
        setDigits(next);
        focusBox(idx - 1);
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusBox(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      focusBox(idx + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    if (!val) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (idx < OTP_LENGTH - 1) focusBox(idx + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerify = async () => {
    if (!isComplete || !pendingVerify) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOTP({ userId: pendingVerify.userId, otp });
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingVerify || cooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendOTP({ userId: pendingVerify.userId, email: pendingVerify.email });
      setCooldown(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 420 }}>
      <h1>Verify your email</h1>
      <p className="auth-sub">
        We sent a 6-digit code to{' '}
        <strong style={{ color: 'var(--text-primary)' }}>
          {pendingVerify?.email || 'your email'}
        </strong>
      </p>

      {/* OTP Boxes */}
      <div className="otp-boxes" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            id={`otp-box-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(e, i)}
            onKeyDown={e => handleKeyDown(e, i)}
            className={`otp-box${d ? ' filled' : ''}`}
            aria-label={`OTP digit ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <p style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span className="field-error" style={{ fontSize: '0.8rem' }}>⚠ {error}</span>
        </p>
      )}

      <button
        id="otp-verify-btn"
        className="ts-btn ts-btn-primary"
        style={{ width: '100%' }}
        disabled={!isComplete || loading}
        onClick={handleVerify}
      >
        {loading ? <span className="spinner" /> : 'Verify Email'}
      </button>

      <p className="auth-footer" style={{ marginTop: '18px' }}>
        Didn't receive a code?{' '}
        {cooldown > 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>Resend in {cooldown}s</span>
        ) : (
          <button
            id="otp-resend-btn"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--blue)', fontWeight: 500, fontSize: '0.75rem',
              fontFamily: 'var(--font-body)', padding: 0,
            }}
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
      </p>
    </div>
  );
}

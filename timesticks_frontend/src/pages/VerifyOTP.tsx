import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/signUp/Navbar';
import OTPInput from '../components/verifyOTP/OTPInput';

export default function VerifyOTP() {
  const { pendingVerify } = useAuth();
  const navigate = useNavigate();

  // Guard: if no pending verify context, redirect to signup
  useEffect(() => {
    if (!pendingVerify) navigate('/signup', { replace: true });
  }, [pendingVerify, navigate]);

  if (!pendingVerify) return null;

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-main">
        <OTPInput />
      </main>
    </div>
  );
}

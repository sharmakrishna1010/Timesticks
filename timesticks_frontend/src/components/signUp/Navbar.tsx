import { Link } from 'react-router-dom';
import logo from '../../assets/logo_noBG.png';

interface NavbarProps {
  showLogin?: boolean;
  showSignup?: boolean;
}

export default function Navbar({ showLogin = false, showSignup = false }: NavbarProps) {
  return (
    <nav className="auth-navbar">
      <Link to="/" className="brand">
        <img src={logo} alt="Timesticks Logo" className="brand-logo" />
        <span className="brand-name">T<span>i</span>mesticks</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showLogin && (
          <>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Already have an account?
            </span>
            <Link to="/login">
              <button className="ts-btn ts-btn-primary" style={{ padding: '8px 18px' }}>
                Sign In
              </button>
            </Link>
          </>
        )}
        {showSignup && (
          <>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              New here?
            </span>
            <Link to="/signup">
              <button className="ts-btn ts-btn-primary" style={{ padding: '8px 18px' }}>
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
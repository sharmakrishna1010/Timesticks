import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BackendWakeUp from './components/BackendWakeUp';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';

/**
 * Redirects to /dashboard if the user is already logged in.
 * Used to guard public-only routes (login, signup).
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isVerifying } = useAuth();
  if (isVerifying) return <div className="loading-page"><span className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/**
 * Redirects to /login if no user is in context.
 * Used to guard private routes (dashboard).
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isVerifying } = useAuth();
  if (isVerifying) return <div className="loading-page"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Smart root redirect: logged-in → dashboard, guest → login.
 */
function RootRedirect() {
  const { user, isVerifying } = useAuth();
  if (isVerifying) return <div className="loading-page"><span className="spinner" /></div>;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root: smart redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes — redirect to dashboard if already logged in */}
          <Route path="/signup" element={
            <BackendWakeUp forceLight>
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            </BackendWakeUp>
          } />
          <Route path="/login" element={
            <BackendWakeUp forceLight>
              <PublicRoute>
                <Login />
              </PublicRoute>
            </BackendWakeUp>
          } />
          <Route path="/verify-otp" element={
            <BackendWakeUp forceLight>
              <VerifyOTP />
            </BackendWakeUp>
          } />

          {/* Private route — redirect to login if not logged in */}
          <Route path="/dashboard" element={
            <BackendWakeUp>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </BackendWakeUp>
          } />

          {/* Catch-all: same smart redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
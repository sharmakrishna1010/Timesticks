import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BackendWakeUp from './components/BackendWakeUp';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={
            <BackendWakeUp forceLight>
              <SignUp />
            </BackendWakeUp>
          } />
          <Route path="/login" element={
            <BackendWakeUp forceLight>
              <Login />
            </BackendWakeUp>
          } />
          <Route path="/verify-otp" element={
            <BackendWakeUp forceLight>
              <VerifyOTP />
            </BackendWakeUp>
          } />
          <Route path="/dashboard" element={
            <BackendWakeUp>
              <Dashboard />
            </BackendWakeUp>
          } />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
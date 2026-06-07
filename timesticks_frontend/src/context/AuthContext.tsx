import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  pendingVerify: { userId: string; email: string } | null;
  setPendingVerify: (v: { userId: string; email: string } | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingVerify, setPendingVerify] = useState<{ userId: string; email: string } | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    setPendingVerify(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, pendingVerify, setPendingVerify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

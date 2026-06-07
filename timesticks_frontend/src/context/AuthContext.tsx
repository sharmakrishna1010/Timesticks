import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  pendingVerify: { userId: string; email: string } | null;
  setPendingVerify: (v: { userId: string; email: string } | null) => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('timesticks_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [pendingVerify, setPendingVerify] = useState<{ userId: string; email: string } | null>(null);
  
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('timesticks_theme') as 'light' | 'dark') || 'light';
  });

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem('timesticks_user', JSON.stringify(u));
    else localStorage.removeItem('timesticks_user');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPendingVerify(null);
  }, [setUser]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('timesticks_theme', next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, pendingVerify, setPendingVerify, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

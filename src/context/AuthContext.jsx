import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// ── Mock user directory — stands in for POST /api/auth/login ────────────────
// When the PHP backend is ready, replace the body of login() with:
//   const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
//   const { token, user } = await res.json();
//   localStorage.setItem('token', token);
// Nothing else in this file or the components using useAuth() needs to change.
const MOCK_USERS = [
  { id: 1, name: 'PAWS Admin',       email: 'admin@pawsinrecovery.ca', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Community Member', email: 'user@pawsinrecovery.ca',  password: 'user123',  role: 'user'  },
];

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [error, setError] = useState(null);

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      setError('Invalid email or password.');
      return false;
    }
    setError(null);
    setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
    return true;
  };

  const logout = () => setUser(null);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    error,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

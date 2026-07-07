import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Options shown in the registration form's gender dropdown.
// Kept here (not in Service.js) since it's specific to the user/account model.
export const GENDER_OPTIONS = [
  'Woman',
  'Man',
  'Non-binary',
  'Transgender',
  'Genderqueer / Genderfluid',
  'Prefer to self-describe',
  'Prefer not to say',
];

// ── Mock user directory — stands in for POST /api/auth/login ────────────────
// When the PHP backend is ready, replace the body of login() with:
//   const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
//   const { token, user } = await res.json();
//   localStorage.setItem('token', token);
const INITIAL_USERS = [
  { id: 1, name: 'PAWS Admin',       email: 'admin@pawsinrecovery.ca', password: 'admin123', role: 'admin', gender: 'Prefer not to say' },
  { id: 2, name: 'Community Member', email: 'user@pawsinrecovery.ca',  password: 'user123',  role: 'user',  gender: 'Prefer not to say' },
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [user, setUser]   = useState(null);
  const [error, setError] = useState(null);

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      setError('Invalid email or password.');
      return false;
    }
    setError(null);
    setUser({ id: found.id, name: found.name, email: found.email, role: found.role, gender: found.gender });
    return true;
  };

  // Always creates role: 'user', nobody can self-register as admin.
  // Mirrors the planned PHP endpoint: POST /api/auth/register always inserts role='user'; granting admin access is a separate, privileged action (e.g. an existing admin updating the role in the database)
  const register = (name, email, password, gender) => {
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !gender) {
      setError('Please fill out every field.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      setError('An account with that email already exists.');
      return false;
    }

    const newUser = { id: Date.now(), name: trimmedName, email: trimmedEmail, password, role: 'user', gender };
    setUsers(prev => [...prev, newUser]);
    setError(null);
    // Auto-login right after registering, like most sign-up flows
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, gender: newUser.gender });
    return true;
  };

  const logout = () => setUser(null);

  // Lets a signed-in user update their own gender from the Account modal.
  const updateGender = (gender) => {
    setUser(u => u ? { ...u, gender } : u);
    setUsers(prev => prev.map(u => u.id === user?.id ? { ...u, gender } : u));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    login,
    register,
    logout,
    updateGender,
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

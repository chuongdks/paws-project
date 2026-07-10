import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { TOKEN_STORAGE_KEY, setUnauthorizedHandler } from '../api/axiosConfig.js';

const AuthContext = createContext(null);

// TODO: re-enable once the `users` table has a gender column and
// register.php/me.php actually accept and return it. Left here (rather than
// deleted) so the whole feature — options, form field, account modal row,
// updateGender — can come back with minimal changes once the backend supports it.
// export const GENDER_OPTIONS = [
//   'Woman',
//   'Man',
//   'Non-binary',
//   'Transgender',
//   'Genderqueer / Genderfluid',
//   'Prefer to self-describe',
//   'Prefer not to say',
// ];

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [error, setError]             = useState(null);
  const [authLoading, setAuthLoading] = useState(true);   // True only while checking for an existing session on first load

  // On mount: if a token is already in storage, validate it against /auth/me.php so refreshing the page doesn't silently log the person out.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await api.get('/auth/me.php');
        const json = response.data;
        if (cancelled) return;
        if (!json.success) throw new Error(json.message || 'Session invalid.');
        setUser(json.user);
      } catch (err) {
        if (cancelled) return;
        console.error('Stored session is no longer valid, logging out\n Full Error:', err);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // If any request comes back 401 mid-session (expired/revoked token), clear the local session
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login.php', { email, password });
      const json = response.data;
      if (!json.success) {
        setError(json.message || 'Invalid email or password.');
        return false;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setUser(json.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login failed\n Full Error:', err);
      setError(err.response?.data?.message || 'Could not log in — please try again.');
      return false;
    }
  };

  // Always creates role: 'user' server-side (see register.php). Admin can only be created through SUPA SPECIAL PRIVILAGE
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register.php', { name, email, password });
      const json = response.data;
      if (!json.success) {
        setError(json.message || 'Could not create your account.');
        return false;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setUser(json.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Registration failed\n Full Error:', err);
      setError(err.response?.data?.message || 'Could not create your account — please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout.php');
    } catch (err) {
      // Still clear the local session even if the server call itself fails —
      // no reason to trap someone in a "logged in" UI over a network hiccup.
      console.error('Logout request failed, clearing local session anyway\n Full Error:', err);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  // TODO: wire back up once the backend supports gender.
  // const updateGender = (gender) => { ... };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    authLoading,
    login,
    register,
    logout,
    // updateGender,
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

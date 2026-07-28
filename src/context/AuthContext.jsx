import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { TOKEN_STORAGE_KEY, setUnauthorizedHandler } from '../api/axiosConfig.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const GENDER_OPTIONS = [
  'Woman',
  'Man',
  'Non-binary',
  'Transgender',
  'Genderqueer / Genderfluid',
  'Prefer to self-describe',
  'Prefer not to say',
];

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser]               = useState(null);
  const [error, setError]             = useState(null);
  const [profileError, setProfileError] = useState(null); // separate from login/register error
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
        /* GET /auth/me.php  (auth required — Bearer token)
         * No body.
         * Returns: { success: true, user: { id, name, email, role, gender } }
         * 401s with { success: false, message: "Authentication required." } if the token is missing/expired/revoked
         */
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
      /* POST /auth/login.php
       * Body: { email, password }
       * Returns: { success: true, message: "Login successful.", token: "<random 64-char hex>",
       *            user: { id, name, email, role, gender } }
       * 401s with { success: false, message: "Invalid email or password." } on bad credentials or a deactivated account (is_active = 0).
       * Token is a bearer token stored in auth_tokens, valid for 30 days.
       */
      const response = await api.post('/auth/login.php', { email, password });
      const json = response.data;
      if (!json.success) {
        setError(json.message || 'Invalid email or password.');
        return false;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setUser(json.user);
      setError(null);
      toast.success(`Welcome back, ${json.user.name}!`);
      return true;
    } catch (err) {
      console.error('Login failed\n Full Error:', err);
      setError(err.response?.data?.message || 'Could not log in — please try again.');
      return false;
    }
  };

  // Always creates role: 'user' server-side (see register.php). Admin can only be created through SUPA SPECIAL PRIVILAGE
  const register = async (name, email, password, gender) => {
    try {
      /* POST /auth/register.php
       * Body: { name, email, password, gender }
       * Returns: { success: true, message: "Account created.", token: "<random 64-char hex>",
       *            user: { id, name, email, role: "user", gender } }
       * Validates: email format, password >= 6 chars, email not already registered
       * (409 { success:false, message } if it is). role is always forced to
       * 'user' server-side — there's no way to self-register as admin.
       */
      const response = await api.post('/auth/register.php', { name, email, password, gender });
      const json = response.data;
      if (!json.success) {
        setError(json.message || 'Could not create your account.');
        return false;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setUser(json.user);
      setError(null);
      toast.success(`Welcome, ${json.user.name}. Your account is ready.`);
      return true;
    } catch (err) {
      console.error('Registration failed\n Full Error:', err);
      setError(err.response?.data?.message || 'Could not create your account — please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      /* POST /auth/logout.php  (auth required — Bearer token)
       * No body. Deletes the auth_tokens row matching the current bearer token.
       * Returns: { success: true, message: "Logged out." }
       */
      await api.post('/auth/logout.php');
    } catch (err) {
      // clear the local session even if the server call itself fails, dont trap user in login UI cuz network fucked up
      console.error('Logout request failed, clearing local session anyway\n Full Error:', err);
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      toast.success('Signed out.');
    }
  };

  // Persists the gender change server-side. 
  // WARNING: relies on a PUT/PATCH handler on /auth/me.php that doesn't exist yet
  // me.php rejects anything but GET with a 405. Local only for now
  const updateGender = async (gender) => {
    try {
      /* PUT /auth/me.php  (auth required — Bearer token)
       * Body: { gender }
       * Returns: { success: true, message: "Profile updated.", user: { id, name, email, role, gender } }
       * Rejects with { success: false, message } (400) if gender is longer
       * than 50 characters, or if the "gender" key is missing from the body entirely.
       * NOTE: the comment above this function is stale — me.php DOES have a
       * working PUT/PATCH handler (see updateProfile() in me.php); it isn't
       * still rejecting with a 405.
       */
      const response = await api.put('/auth/me.php', { gender });
      const json = response.data;
      if (!json.success) {
        setProfileError(json.message || 'Could not update your profile.');
        return false;
      }
      setUser(prevUser => prevUser ? { ...prevUser, gender } : null);
      setProfileError(null);
      toast.success('Profile updated.');
      return true;
    } catch (err) {
      console.error('Failed to update gender\n Full Error:', err);
      setProfileError(err.response?.data?.message || 'Could not update your profile — please try again.');
      return false;
    }
  };

  // Persists a password change server-side. Separate error state from
  // profileError (gender) since both can be open/edited independently in
  // AccountModal and shouldn't stomp on each other's error messages.
  const [passwordError, setPasswordError] = useState(null);

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      /* POST /auth/change-password.php  (auth required — Bearer token)
       * Body: { current_password, new_password, confirm_password }
       * Returns: { success: true, message: "Password updated successfully." }
       * Failure cases: 400 or 401 { success:false, message } if current_password
       * is wrong, new_password is too short, or new_password/confirm_password
       * don't match. `skipAuthHandler: true` below opts this request out of the
       * global 401-logout interceptor in axiosConfig.js — a wrong current
       * password is a validation failure, not an expired/invalid session, and
       * shouldn't log the person out.
       */
      const response = await api.post('/auth/change-password.php', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }, { skipAuthHandler: true });
      const json = response.data;
      if (!json.success) {
        setPasswordError(json.message || 'Could not update your password.');
        return false;
      }
      setPasswordError(null);
      toast.success('Password updated.');
      return true;
    } catch (err) {
      console.error('Failed to change password\n Full Error:', err);
      const fallback = err.response?.status === 401
        ? 'Incorrect current password.'
        : 'Could not update your password — please try again.';
      setPasswordError(err.response?.data?.message || fallback);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    authLoading,
    login,
    register,
    logout,
    updateGender,
    error,
    clearError: () => setError(null),
    profileError,
    clearProfileError: () => setProfileError(null),
    changePassword,
    passwordError,
    clearPasswordError: () => setPasswordError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

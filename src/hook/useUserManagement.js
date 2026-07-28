import { useState, useCallback } from 'react';
import api from '../api/axiosConfig.js';
import { useToast } from '../context/ToastContext.jsx';

// Admin-only user management.
//   - fetchUsers(): GET /auth/users.php  (admin only)
//   - promote() / demote(): PATCH /auth/users.php { id, role: 'admin' | 'user' }
//   - setActive(): PATCH /auth/users.php { id, is_active: boolean }
// All three PATCH actions share patchUser() below, which merges whatever the server sends back for that user (mirrors the pattern in useRecommendations/useServiceCRUD).
export function useUserManagement() {
  const toast = useToast();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [actioningId, setActioningId] = useState(null); // user row currently being patched

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      /* GET /auth/users.php  (admin only)
       * No params.
       * Returns: { success: true, data: [{ id, name, email, role, gender, is_active, created_at }] }
       */
      const response = await api.get('/auth/users.php');
      const json = response.data;
      if (!json.success) throw new Error(json.message || 'API returned success: false');
      setUsers(json.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load users\n Full Error:', err);
      setError('Could not load the users list.');
    } finally {
      setLoading(false);
    }
  }, []);

  const patchUser = async (id, patch) => {
    setActioningId(id);
    try {
      /* PATCH /auth/users.php  (admin only)
       * Body: { id, role?: "admin" | "user", is_active?: boolean }
       * Returns: { success: true, message, user: {...} }  
       * (assumed json shape mirroring the rest of this API's PUT/PATCH endpoints, falls back to just applying `patch` locally below if `user` isn't present.)
       */
      const response = await api.patch('/auth/users.php', { id, ...patch });
      const json = response.data;
      if (!json.success) {
        toast.error(json.message || 'Could not update this user.');
        return false;
      }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch, ...(json.user ?? {}) } : u));
      return true;
    } catch (err) {
      console.error('Failed to update user\n Full Error:', err);
      toast.error(err.response?.data?.message || 'Could not update this user — please try again.');
      return false;
    } finally {
      setActioningId(null);
    }
  };

  const promote = async (id) => {
    const ok = await patchUser(id, { role: 'admin' });
    if (ok) toast.success('User promoted to admin.');
    return ok;
  };

  const demote = async (id) => {
    const ok = await patchUser(id, { role: 'user' });
    if (ok) toast.success('Admin demoted to member.');
    return ok;
  };

  const setActive = async (id, isActive) => {
    const ok = await patchUser(id, { is_active: isActive });
    if (ok) toast.success(isActive ? 'Account re-enabled.' : 'Account disabled.');
    return ok;
  };

  return { users, loading, error, actioningId, fetchUsers, promote, demote, setActive };
}

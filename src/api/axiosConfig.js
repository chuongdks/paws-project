import axios from 'axios';

export const BACKEND_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BACKEND_BASE_URL, 
  headers: { 'Content-Type': 'application/json' },
});

// Session Token Key. The AuthContext.jsx is the only place that should read/write this directly.
export const TOKEN_STORAGE_KEY = 'paws_auth_token';

// Attach the bearer token to every outgoing request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lets AuthContext react when a request comes back 401 (expired/invalid/revoked) Da flow: AuthContext -> api -> AuthContext
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => { onUnauthorized = handler; };

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

export const BACKEND_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: 'https://pawsinrecovery.ca/directory/api', 
  headers: { 'Content-Type': 'application/json' },
});

export default api;

import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor: Attach JWT ───────────────────
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Unwrap API Response ─────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError = error.response?.data;

    if (error.response?.status === 401) {
      // Token expired — force re-login
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return Promise.reject({
      status: error.response?.status || 500,
      message: apiError?.message || 'Something went wrong',
      errors: apiError?.errors || [],
    });
  }
);

export default api;

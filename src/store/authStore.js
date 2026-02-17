import { create } from 'zustand';
import api from '../services/api';

const ROLE_MAP = {
  1: 'admin',
  2: 'teamlead',
  3: 'coder',
  4: 'auditor',
};

function decodeJWT(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

function extractUser(decoded, attending) {
  const { tokenPayload } = decoded;
  return {
    email: tokenPayload.email,
    roleId: tokenPayload.RoleId,
    role: ROLE_MAP[tokenPayload.RoleId] || 'unknown',
    sourceSystem: tokenPayload.sourceSystem,
    requesterType: tokenPayload.requesterType,
    attending: attending ?? false,
  };
}

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      if (data.success && data.token) {
        const decoded = decodeJWT(data.token);
        const user = extractUser(decoded, data.attending);

        localStorage.setItem('token', data.token);
        set({ user, token: data.token, isAuthenticated: true, loading: false });
        return { success: true, user };
      }

      set({ error: 'Login failed', loading: false });
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  initialize: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = decodeJWT(token);
        if (decoded.exp * 1000 > Date.now()) {
          const user = extractUser(decoded);
          set({ user, token, isAuthenticated: true, loading: false });
          return;
        }
      } catch {
        // Invalid token, clear it
      }
      localStorage.removeItem('token');
    }
    set({ loading: false });
  },
}));

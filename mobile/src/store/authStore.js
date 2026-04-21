import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  socialLogin: async (token) => {
    set({ isLoading: true });
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      
      await SecureStore.setItemAsync('token', token);
      
      set({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      delete api.defaults.headers.common['Authorization'];
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      
      set({
        user: response.data.user,
        token,
        isAuthenticated: true
      });
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }
}));

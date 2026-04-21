import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/admin/login', { email, password })
          const { token, user } = response.data
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.error || 'Login failed'
          }
        }
      },
      loginWithToken: async (token) => {
        set({ isLoading: true })
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          delete api.defaults.headers.common['Authorization']
          return { success: false }
        }
      },
      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },
      checkAuth: async () => {
        const { token } = get()
        if (!token) return
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await api.get('/auth/me')
          set({ user: response.data.user, isAuthenticated: true })
        } catch (error) {
          get().logout()
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
)
// Initialize auth on app load
const token = useAuthStore.getState().token
if (token) {
  useAuthStore.getState().checkAuth()
}

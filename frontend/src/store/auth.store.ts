import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        console.log('Setting auth state:', { user, token });
        if (!token) {
          console.error('No token provided to setAuth');
          return;
        }
        localStorage.setItem('token', token);
        set({ 
          user, 
          token,
          isAuthenticated: true,
          isLoading: false
        });
      },

      logout: async () => {
        console.log('Logging out...');
        try {
          // First, clear all auth-related storage
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
          
          // Reset the auth state
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false,
            isLoading: false
          });

          // Then make the logout API call
          await authApi.logout().catch(error => {
            console.error('Error calling logout API:', error);
            // We don't throw here because we want to continue with the logout process
          });

          // Use replace to prevent back navigation after logout
          window.location.replace('/login');
        } catch (error) {
          console.error('Error during logout:', error);
          // Ensure user is logged out even if there's an error
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          window.location.replace('/login');
        }
      },

      refreshToken: async () => {
        try {
          console.log('Refreshing token...');
          const response = await authApi.refresh();
          if (response?.data?.token) {
            const { token } = response.data;
            localStorage.setItem('token', token);
            set({ token, isAuthenticated: true });
            return token;
          }
          throw new Error('No token in refresh response');
        } catch (error) {
          console.error('Error refreshing token:', error);
          get().logout();
          return null;
        }
      },

      checkAuth: async () => {
        try {
          console.log('Checking auth state...');
          set({ isLoading: true });
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.log('No token found in localStorage');
            set({ isAuthenticated: false, isLoading: false });
            return false;
          }

          // Try to get user profile to validate token
          const response = await authApi.getProfile();
          console.log('Profile response:', response);
          
          if (response?.data) {
            set({ 
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false
            });
            return true;
          }
          
          throw new Error('Invalid profile response');
        } catch (error) {
          console.error('Error checking auth:', error);
          // Try to refresh token
          const newToken = await get().refreshToken();
          if (!newToken) {
            get().logout();
            return false;
          }
          return true;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

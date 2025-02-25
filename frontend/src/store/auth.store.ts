import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';

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
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ token, user, isAuthenticated: true });
            return token;
          }
          throw new Error('No token in refresh response');
        } catch (error: any) {
          console.error('Error refreshing token:', error);
          const errorMessage = error?.response?.data?.message || 'Session expired';
          toast.error(errorMessage);
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
          try {
            const response = await authApi.getProfile();
            if (response?.data) {
              set({ 
                user: response.data,
                token,
                isAuthenticated: true,
                isLoading: false
              });
              return true;
            }
          } catch (error: any) {
            if (error?.response?.status === 401) {
              // Try token refresh on 401
              const newToken = await get().refreshToken();
              if (!newToken) {
                toast.error('Your session has expired. Please login again.');
                get().logout();
                return false;
              }
              return true;
            }
            throw error;
          }
          
          throw new Error('Invalid profile response');
        } catch (error: any) {
          console.error('Error checking auth:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed';
          toast.error(errorMessage);
          get().logout();
          return false;
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

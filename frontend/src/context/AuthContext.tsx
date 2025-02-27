import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'COMPANY';
  profile?: {
    fullName: string;
    bio?: string;
    avatar?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const response = await authApi.me();
      if (response.success) {
        // Handle the user data from the response - it might be in response.data or response.user
        const userData = response.user || response.data;
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        // Handle the user data from the response - it might be in response.data or response.user
        const userData = response.user || response.data;
        setUser(userData);
        toast.success('Login successful');
        
        // Redirect based on user role
        switch (userData.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'COMPANY':
            navigate('/company');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; name: string; role?: string }) => {
    try {
      const response = await authApi.register(data);
      if (response.success) {
        // Handle the user data from the response - it might be in response.data or response.user
        const userData = response.user || response.data;
        setUser(userData);
        toast.success('Registration successful');
        
        // Redirect based on user role
        switch (userData.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'COMPANY':
            navigate('/company');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await authApi.logout();
      if (response.success) {
        setUser(null);
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error logging out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { toast } from 'react-toastify';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, checkAuth, logout } = useAuthStore(); // Added logout

  const { 
    register, 
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      
      if (!response?.data) {
        throw new Error('No response received from server');
      }

      const { user, token } = response.data;
      
      if (!user || !token) {
        throw new Error('Invalid credentials or server response');
      }

      // Set auth state
      setAuth(user, token);
      
      // Verify auth state after login
      try {
        await checkAuth();
      } catch (authError) {
        logout(); // Use logout instead of setAuth(null, null)
        throw new Error('Failed to verify authentication status');
      }

      toast.success('Login successful!');
      const from = location.state?.from?.pathname || '/jobs';
      navigate(from, { replace: true });
      
    } catch (error: any) {
      console.error('Login Error:', error);
      
      logout(); // Use logout instead of setAuth(null, null)
      
      let errorMessage = 'Login failed. Please try again.';
      if (error?.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Authentication service unavailable';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Welcome Back</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className={`mt-1 block w-full rounded-md shadow-sm
              ${errors.email ? 'border-red-500' : 'border-gray-300'}
              focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            className={`mt-1 block w-full rounded-md shadow-sm
              ${errors.password ? 'border-red-500' : 'border-gray-300'}
              focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md
            shadow-sm text-sm font-medium text-white bg-indigo-600 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
};

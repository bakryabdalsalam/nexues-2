/// <reference types="vite/client" />

import axios from 'axios';
import { Job, PaginatedResponse, Application, ApplicationStatus, User } from '../types';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/auth.store';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse extends ApiResponse<User> {
  success: boolean;
  user?: User;  // Add user property to match backend response
  data?: User;  // Keep data for backward compatibility
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Keep track of refresh promise to prevent multiple refresh calls
let refreshPromise: Promise<AuthResponse> | null = null;

// Add a response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshEndpoint = originalRequest.url === 'auth/refresh';

    // Handle rate limit errors immediately
    if (error.response?.status === 429) {
      toast.error('Too many attempts. Please try again later.');
      // If we hit rate limit during refresh, logout the user
      if (isRefreshEndpoint) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }

    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. We haven't tried to refresh yet
    // 3. We're not already trying to refresh
    // 4. We're not on the login page
    // 5. Original request is not a refresh request
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !isRefreshEndpoint &&
      !window.location.pathname.includes('/login')
    ) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it instead of making a new request
        if (!refreshPromise) {
          refreshPromise = authApi.refresh();
        }

        const response = await refreshPromise;
        
        // Clear the refresh promise after it completes
        refreshPromise = null;

        if (response?.data?.token) {
          const { token } = response.data;
          // Update token in auth store
          useAuthStore.getState().setToken(token);
          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        refreshPromise = null;
        
        // Only logout and redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export const jobsApi = {
  getJobs: async (page = 1, filters: {
    search?: string;
    location?: string;
    category?: string;
    experienceLevel?: string;
    salary?: { min?: number; max?: number };
    employmentType?: string;
    remote?: boolean;
  } = {}) => {
    try {
      console.log('Fetching jobs with filters:', { page, filters });
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && { category: filters.category }),
        ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
        ...(filters.salary?.min && { salary_min: filters.salary.min.toString() }),
        ...(filters.salary?.max && { salary_max: filters.salary.max.toString() }),
        ...(filters.employmentType && { employmentType: filters.employmentType }),
        ...(filters.remote !== undefined && { remote: filters.remote.toString() })
      });

      const response = await api.get(`jobs?${queryParams}`);
      
      // Transform the response to match expected structure
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }

      console.log('Jobs fetched successfully:', response.data);

      return {
        success: true,
        data: {
          jobs: response.data.data.jobs || [],
          pagination: response.data.data.pagination || {
            total: 0,
            page: 1,
            totalPages: 1,
            hasMore: false
          }
        }
      };
    } catch (error: any) {
      console.error('Error in getJobs:', error.response || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch jobs');
    }
  },

  getJob: async (id: string) => {
    const response = await api.get(`jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`jobs/${id}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get<ApiResponse<Job[]>>('jobs/recommendations');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('admin/stats');
    return response.data;
  }
};

// Update the auth API methods
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post('auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Authentication failed');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw new Error('An error occurred during login');
      }
    }
  },
  register: async (userData: { email: string; password: string; name: string; role?: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post('auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        throw new Error('No response from server. Please try again.');
      } else {
        throw new Error('An error occurred during registration');
      }
    }
  },
  logout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post('auth/logout');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },
  me: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },
  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post('auth/refresh');
    return response.data;
  }
};

export const analyticsApi = {
  getStats: async () => {
    const response = await api.get('admin/stats');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('admin/analytics');
    return response.data;
  }
};

export const applicationApi = {
  createApplication: async (jobId: string, data: { coverLetter: string; resume: string }) => {
    const response = await api.post('applications', { jobId, ...data });
    return response.data;
  },

  getAllApplications: async () => {
    const response = await api.get('admin/applications');
    return response.data;
  },
  
  updateApplicationStatus: async (id: string, status: ApplicationStatus): Promise<ApiResponse<Application>> => {
    try {
      console.log('Updating application status:', { id, status });
      
      if (!id || !status) {
        throw new Error('Invalid application ID or status');
      }

      const response = await api.patch(`admin/applications/${id}/status`, { status });
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to update application status');
      }

      console.log('Update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update application status error:', {
        error,
        response: error.response,
        message: error.response?.data?.message,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please ensure you are logged in as an admin.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update application status.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to update application status. Please try again.');
    }
  },
  
  getUserApplications: async () => {
    const response = await api.get('applications/me');
    return response.data;
  }
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('users/profile', data);
    return response.data;
  }
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('admin/users');
    return response.data;
  },
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`admin/users/${userId}`, userData);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('admin/stats');
    return response.data;
  },
  
  updateUserRole: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' | 'COMPANY' }) => {
    const response = await api.patch(`admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  generateReport: async (type: string, config?: any) => {
    const response = await api.post(`admin/reports/${type}`, config, {
      responseType: 'blob'
    });
    return response.data;
  },

  getEmailTemplates: async () => {
    const response = await api.get('admin/email-templates');
    return response.data;
  },

  createEmailTemplate: async (template: any) => {
    const response = await api.post('admin/email-templates', template);
    return response.data;
  },

  getAnalytics: async (params?: any) => {
    const response = await api.get('admin/analytics', { params });
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('admin/jobs');
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('admin/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`admin/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`admin/jobs/${id}`);
    return response.data;
  }
};

export const companyApi = {
  getProfile: async () => {
    const response = await api.get('company/profile');
    return response.data;
  },
  
  getJobs: async () => {
    const response = await api.get('company/jobs');
    return response.data;
  }
};

export default api;

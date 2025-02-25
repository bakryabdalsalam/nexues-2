/// <reference types="vite/client" />

import axios from 'axios';
import { Job, AuthResponse, ApiResponse, PaginatedResponse, Application, ApplicationStatus, User } from '../types';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      originalUrl: originalRequest?.url,
      method: originalRequest?.method
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          toast.error('Your session has expired. Please login again.');
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        const response = await api.post('/api/auth/refresh');
        const { token } = response.data;
        
        if (!token) {
          throw new Error('No token received from refresh endpoint');
        }

        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        processQueue(null, token);
        console.log('Token refresh successful');
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        toast.error('Your session has expired. Please login again.');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors with user-friendly messages
    const message = error.response?.data?.message || 
                    error.response?.data?.error ||
                    'An unexpected error occurred';
    
    if (!error.config?.skipErrorToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export const jobsApi = {
  getJobs: async (page = 1, filters: {
    keyword?: string;
    location?: string;
    category?: string;
    experienceLevel?: string;
    salary?: { min?: number; max?: number };
    employmentType?: string;
    remote?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(filters.keyword && { keyword: filters.keyword }),
      ...(filters.location && { location: filters.location }),
      ...(filters.category && { category: filters.category }),
      ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
      ...(filters.salary?.min && { salary_min: filters.salary.min.toString() }),
      ...(filters.salary?.max && { salary_max: filters.salary.max.toString() }),
      ...(filters.employmentType && { employmentType: filters.employmentType }),
      ...(filters.remote !== undefined && { remote: filters.remote.toString() })
    });

    const response = await api.get(`/api/jobs?${queryParams}`);
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('/api/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/api/jobs/${id}`);
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get<ApiResponse<Job[]>>('/api/jobs/recommendations');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  }
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      if (!response.data?.success || !response.data?.data?.token) {
        throw new Error('Invalid response from server');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Invalid credentials';
        throw new Error(message);
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Logout failed');
      }
      // Clear the Authorization header
      delete api.defaults.headers.common['Authorization'];
      return response.data;
    } catch (error: any) {
      console.error('Logout API error:', error);
      // Still clear the Authorization header even if the API call fails
      delete api.defaults.headers.common['Authorization'];
      throw error;
    }
  },

  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  }
};

export const analyticsApi = {
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/api/admin/analytics');
    return response.data;
  }
};

export const applicationApi = {
  createApplication: async (jobId: string, data: { coverLetter: string; resume: string }) => {
    const response = await api.post('/api/applications', { jobId, ...data });
    return response.data;
  },

  getAllApplications: async () => {
    const response = await api.get('/api/admin/applications');
    return response.data;
  },
  
  updateApplicationStatus: async (id: string, status: ApplicationStatus): Promise<ApiResponse<Application>> => {
    try {
      console.log('Updating application status:', { id, status });
      
      if (!id || !status) {
        throw new Error('Invalid application ID or status');
      }

      const response = await api.patch(`/api/admin/applications/${id}/status`, { status });
      
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
    const response = await api.get('/api/applications/me');
    return response.data;
  }
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/api/users/profile', data);
    return response.data;
  }
};

export const adminApi = {
  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
  
  updateUserRole: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) => {
    const response = await api.patch(`/api/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  generateReport: async (type: string, config?: any) => {
    const response = await api.post(`/api/admin/reports/${type}`, config, {
      responseType: 'blob'
    });
    return response.data;
  },

  getEmailTemplates: async () => {
    const response = await api.get('/api/admin/email-templates');
    return response.data;
  },

  createEmailTemplate: async (template: any) => {
    const response = await api.post('/api/admin/email-templates', template);
    return response.data;
  },

  getAnalytics: async (params?: any) => {
    const response = await api.get('/api/admin/analytics', { params });
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/api/admin/jobs');
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('/api/admin/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`/api/admin/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/api/admin/jobs/${id}`);
    return response.data;
  }
};

export default api;

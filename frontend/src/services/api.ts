import axios from 'axios';
import { Job, AuthResponse, ApiResponse, PaginatedResponse } from '../types';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'https://automatic-space-broccoli-46w9jq6jg5wc775r-3000.app.github.dev/api',
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh');
        const { token } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || 
                    error.response?.data?.error ||
                    'An unexpected error occurred';
    
    // Log the full error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    throw error;
  }
);

export const jobsApi = {
  getJobs: async (page = 1, limit = 10) => {
    try {
      const response = await api.get<PaginatedResponse<Job[]>>('/jobs', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getJob: async (id: string) => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post<ApiResponse<Job>>('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, job: Partial<Job>) => {
    const response = await api.put<ApiResponse<Job>>(`/jobs/${id}`, job);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data;
  }
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  register: async (userData: { email: string; password: string; name: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
};

export const analyticsApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  }
};

export const applicationApi = {
  getAllApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },
  
  updateApplicationStatus: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },
  
  getUserApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  }
};

export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  }
};

export const adminApi = {
  getUsers: async ({ search = '' }) => {
    const response = await api.get('/admin/users', { params: { search } });
    return response.data;
  },
  
  updateUserRole: async ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  generateReport: async (type: string, config?: any) => {
    const response = await api.post(`/admin/reports/${type}`, config, {
      responseType: 'blob'
    });
    return response.data;
  },

  getEmailTemplates: async () => {
    const response = await api.get('/admin/email-templates');
    return response.data;
  },

  createEmailTemplate: async (template: any) => {
    const response = await api.post('/admin/email-templates', template);
    return response.data;
  },

  getAnalytics: async (params?: any) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  }
};

export default api;

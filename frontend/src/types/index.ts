export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  experienceLevel: string;
  category: string;
  salary: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  resume: string | null;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  job: Job;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'COMPANY';
  isActive: boolean;
  _count?: {
    applications: number;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface JobFilters {
  category?: string;
  location?: string;
  experienceLevel?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

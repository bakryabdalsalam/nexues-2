import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

interface TokenPayload {
  id: string;
  role: UserRole;
  email?: string;
  exp?: number;
}

export const generateToken = (userId: string, role: UserRole, expiresIn: string, isRefreshToken = false): string => {
  const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
  const options: SignOptions = { expiresIn };
  return jwt.sign({ id: userId, role }, secret, options);
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    if (!decoded || !decoded.id || !decoded.role) {
      throw new AppError(401, 'Invalid token payload');
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw new AppError(401, 'Token verification failed');
  }
};
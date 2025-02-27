import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyToken } from '../utils/jwt';
import { AppError } from './error.middleware';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role as UserRole
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    next();
  };
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== UserRole.ADMIN) {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
};

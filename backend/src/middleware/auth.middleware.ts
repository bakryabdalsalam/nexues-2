import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';
import { AppError } from './error.middleware';
import { AuthenticatedRequest, TokenPayload } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    let decoded: TokenPayload;

    try {
      decoded = verifyToken(token) as TokenPayload;
    } catch (error) {
      // If access token is expired, try to use refresh token
      const refreshToken = req.cookies['refresh_token'];
      if (!refreshToken) {
        throw new AppError(401, 'Access token expired and no refresh token provided');
      }

      // Verify refresh token
      const refreshDecoded = verifyToken(refreshToken, true) as TokenPayload;

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: refreshDecoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });

      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Add user info to request
      (req as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
      return;
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    // Add user info to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid or expired token'));
    }
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthenticatedRequest;
  if (authReq.user?.role !== 'ADMIN') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
};

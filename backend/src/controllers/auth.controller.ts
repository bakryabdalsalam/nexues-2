import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  comparePasswords, 
  generateAccessToken, 
  generateRefreshToken,
  validatePassword,
  verifyToken
} from '../utils/auth.utils';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
} as const;

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validate email
      if (!email || !email.includes('@')) {
        throw new AppError(400, 'Invalid email address');
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new AppError(400, passwordValidation.message);
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError(400, 'Email already registered');
      }

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          profile: {
            create: {} // Create empty profile
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

      res.status(201).json({ 
        success: true,
        data: {
          user,
          token: accessToken
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Error creating user' 
        });
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
      }

      const user = await prisma.user.findUnique({ 
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true
        }
      });

      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = user;
      const accessToken = generateAccessToken(userWithoutPassword);
      const refreshToken = generateRefreshToken(userWithoutPassword);

      // Set refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token: accessToken
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Error during login' 
        });
      }
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      
      if (!refreshToken) {
        throw new AppError(401, 'Refresh token required');
      }

      const decoded = verifyToken(refreshToken, true);
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

      const accessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.cookie('refresh_token', newRefreshToken, COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          user,
          token: accessToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.clearCookie('refresh_token', {
        ...COOKIE_OPTIONS,
        maxAge: 0
      });
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: 'Invalid refresh token' 
        });
      }
    }
  },

  async logout(req: Request, res: Response) {
    try {
      // Clear the refresh token cookie
      res.clearCookie('refresh_token', {
        ...COOKIE_OPTIONS,
        maxAge: 0
      });

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      // User is already verified and attached by the authenticate middleware
      const { user } = req;

      const userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profile: true
        }
      });

      if (!userWithProfile) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        success: true,
        data: userWithProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Error fetching profile' 
        });
      }
    }
  },

  async verifyToken(req: AuthenticatedRequest, res: Response) {
    try {
      // User is already verified and attached by the authenticate middleware
      const { user } = req;
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Verify token error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Error verifying token' 
        });
      }
    }
  }
};

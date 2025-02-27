import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
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
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
} as const;

const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role = UserRole.USER } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          profile: {
            create: {
              fullName: name
            }
          }
        },
        include: {
          profile: true
        }
      });

      // Generate tokens
      const accessToken = generateToken(user.id, user.role, '15m', false);
      const refreshToken = generateToken(user.id, user.role, '7d', true);

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const accessToken = generateToken(user.id, user.role, '15m', false);
      const refreshToken = generateToken(user.id, user.role, '7d', true);

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided'
        });
      }

      try {
        // Verify refresh token specifically
        const decoded = verifyToken(refreshToken, true);
        
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });

        if (!user) {
          res.clearCookie('access_token');
          res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        // Generate new tokens with proper flags
        const newAccessToken = generateToken(user.id, user.role, '15m', false);
        const newRefreshToken = generateToken(user.id, user.role, '7d', true);

        // Set new cookies
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return success with user data
        const userData = { ...user };
        delete userData.password;

        return res.status(200).json({
          success: true,
          data: {
            user: userData,
            token: newAccessToken
          }
        });

      } catch (tokenError: any) {
        // Clear cookies on token verification failure
        res.clearCookie('access_token');
        res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
        return res.status(401).json({
          success: false,
          message: tokenError.message || 'Invalid refresh token'
        });
      }
    } catch (error) {
      console.error('Refresh error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      // User is already verified and attached by the authenticate middleware
      const { user } = req;

      const userWithProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
          jobs: true
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
  },

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Me error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export default authController;

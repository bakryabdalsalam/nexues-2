import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';

export const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        totalJobs,
        totalApplications,
        pendingApplications
      ] = await Promise.all([
        prisma.user.count(),
        prisma.job.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: 'PENDING' } })
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalJobs,
          totalApplications,
          activeJobs: totalJobs, // Since we don't track active/inactive status
          pendingApplications
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics'
      });
    }
  },

  // Get all users with pagination
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          include: {
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.user.count()
      ]);

      const pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  },

  // Get all applications with pagination
  getAllApplications: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            job: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.application.count()
      ]);

      const pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: applications,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      });
    } catch (error) {
      console.error('Error getting applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applications'
      });
    }
  }
}; 
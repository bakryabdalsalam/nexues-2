import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { prisma } from '../config/prisma';
import { Application, Job, Prisma, User, UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { subDays, format } from 'date-fns';
import { validateJobCreation } from '../middleware/validation.middleware';
import { adminController } from '../controllers/admin.controller';

const router = Router();

interface ActivityWithRelations extends Application {
  user: User;
  job: Job;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Stats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         totalJobs:
 *           type: integer
 *         totalApplications:
 *           type: integer
 *         activeJobs:
 *           type: integer
 *         pendingApplications:
 *           type: integer
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authenticate, requireAdmin, adminController.getDashboardStats);

// Get analytics data
router.get('/analytics', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get applications by day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const applicationsByDay = await Promise.all(
      last7Days.map(async (date) => {
        const count = await prisma.application.count({
          where: {
            createdAt: {
              gte: new Date(date),
              lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
            },
          },
        });
        return { date, count };
      })
    );

    // Get jobs by category
    const jobs = await prisma.job.findMany({
      select: {
        category: true,
      },
    });

    const jobsByCategory = Object.entries(
      jobs.reduce((acc: { [key: string]: number }, job) => {
        const category = job.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    ).map(([category, count]) => ({ category, count }));

    // Get recent activity
    const recentActivity = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        applicationsByDay,
        jobsByCategory,
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          event: `${activity.user.name || activity.user.email} applied to ${activity.job.title} at ${activity.job.company}`,
          date: activity.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', authenticate, requireAdmin, adminController.getAllUsers);

// Update user
router.put('/users/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body as { role: UserRole; isActive: boolean };

    const updateData: Prisma.UserUpdateInput = {
      role,
      isActive
    };

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/applications', authenticate, requireAdmin, adminController.getAllApplications);

// Update application status
router.patch('/applications/:id/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});

// Get all jobs (admin)
router.get('/jobs', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// Create new job (admin)
router.post('/jobs', authenticate, requireAdmin, validateJobCreation, async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
    
    // Convert salary to number if provided
    const data = {
      ...jobData,
      salary: jobData.salary ? parseFloat(jobData.salary) : null
    };

    const job = await prisma.job.create({ data });

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
});

// Update job (admin)
router.put('/jobs/:id', authenticate, requireAdmin, validateJobCreation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobData = req.body;
    
    const job = await prisma.job.update({
      where: { id },
      data: jobData
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
});

// Delete job (admin)
router.delete('/jobs/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.job.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
});

export { router as adminRoutes }; 
import { Request, Response } from 'express';
import { db } from '../services/database.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const jobController = {
  getJobs: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract search filters from query params
      const {
        keyword,
        location,
        category,
        experienceLevel,
        salary_min,
        salary_max,
        employmentType,
        remote
      } = req.query;

      // Build where clause based on filters
      const where: any = {};

      if (keyword) {
        where.OR = [
          { title: { contains: keyword as string, mode: 'insensitive' } },
          { description: { contains: keyword as string, mode: 'insensitive' } },
          { company: { contains: keyword as string, mode: 'insensitive' } }
        ];
      }

      if (location) {
        where.location = { equals: location as string };
      }

      if (category) {
        where.category = { equals: category as string };
      }

      if (experienceLevel) {
        where.experienceLevel = { equals: experienceLevel as string };
      }

      if (salary_min || salary_max) {
        where.salary = {};
        if (salary_min) where.salary.gte = parseInt(salary_min as string);
        if (salary_max) where.salary.lte = parseInt(salary_max as string);
      }

      if (employmentType) {
        where.employmentType = { equals: employmentType as string };
      }

      if (remote !== undefined) {
        where.remote = remote === 'true';
      }

      const [jobs, total] = await Promise.all([
        db.job.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            company: true,
            location: true,
            experienceLevel: true,
            category: true,
            salary: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { applications: true }
            }
          }
        }),
        db.job.count({ where })
      ]);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching jobs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getJob: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await db.job.findUnique({
        where: { id },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job'
      });
    }
  },

  createJob: async (req: Request, res: Response) => {
    try {
      const job = await db.job.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          company: req.body.company,
          location: req.body.location,
          experienceLevel: req.body.experienceLevel,
          category: req.body.category,
          salary: req.body.salary ? parseFloat(req.body.salary) : null,
          remote: req.body.remote || false
        }
      });
      res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating job'
      });
    }
  },

  updateJob: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await db.job.update({
        where: { id },
        data: {
          title: req.body.title,
          description: req.body.description,
          company: req.body.company,
          location: req.body.location,
          experienceLevel: req.body.experienceLevel,
          category: req.body.category,
          salary: req.body.salary ? parseFloat(req.body.salary) : null,
          remote: req.body.remote || undefined
        }
      });
      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating job'
      });
    }
  },

  deleteJob: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.job.delete({
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
        message: 'Error deleting job'
      });
    }
  },

  async getRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;

      // Get user's profile and previous applications
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            include: {
              applications: {
                include: {
                  job: true
                }
              }
            }
          }
        }
      });

      if (!userProfile) {
        throw new AppError(404, 'User profile not found');
      }

      // Extract user's skills and previous job categories
      const userSkills = userProfile.skills || [];
      const previousCategories = userProfile.user.applications.map(app => app.job.category);

      // Find jobs matching user's skills and categories
      const recommendedJobs = await prisma.job.findMany({
        where: {
          OR: [
            // Match by skills (if any skills are specified)
            ...(userSkills.length > 0 ? [{
              description: {
                contains: userSkills.join(' '),
                mode: Prisma.QueryMode.insensitive
              }
            }] : []),
            // Match by previous job categories
            ...(previousCategories.length > 0 ? [{
              category: {
                in: previousCategories
              }
            }] : [])
          ] as Prisma.JobWhereInput[],
          // Exclude jobs user has already applied to
          NOT: {
            applications: {
              some: {
                userId
              }
            }
          }
        },
        take: 6,
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: recommendedJobs
      });
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Failed to get job recommendations');
    }
  }
};

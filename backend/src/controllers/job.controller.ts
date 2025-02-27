import { Request, Response } from 'express';
import { PrismaClient, UserRole, Prisma, JobCategory, ExperienceLevel, EmploymentType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

// Remove the local AuthRequest interface since we're importing it from types
export const jobController = {
  getAllJobs: async (req: Request, res: Response) => {
    try {
      console.log('Received job search request:', req.query);
      
      const {
        search,
        category,
        location,
        remote,
        experienceLevel,
        page = '1',
        limit = '10'
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      const conditions: any[] = [];

      if (search) {
        conditions.push({
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
          ]
        });
      }

      if (category) {
        conditions.push({ category: category as JobCategory });
      }

      if (location) {
        conditions.push({ location: { contains: location as string, mode: 'insensitive' } });
      }

      if (remote) {
        conditions.push({ remote: remote === 'true' });
      }

      if (experienceLevel) {
        conditions.push({ experienceLevel: experienceLevel as ExperienceLevel });
      }

      if (conditions.length > 0) {
        where.AND = conditions;
      }

      // Add status filter to only show active jobs
      where.status = 'OPEN';

      console.log('Executing query with params:', { where, skip, take: limitNum });

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatar: true,
                    address: true
                  }
                }
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          skip,
          take: limitNum
        }),
        prisma.job.count({ where })
      ]);

      console.log(`Found ${jobs.length} jobs out of ${total} total`);

      const totalPages = Math.ceil(total / limitNum);

      // Transform the jobs to include proper company information
      const transformedJobs = jobs.map(job => ({
        ...job,
        company: {
          ...job.company,
          companyName: job.company.name,
          location: job.company.profile?.address || 'Remote',
          logo: job.company.profile?.avatar
        }
      }));

      res.json({
        success: true,
        data: {
          jobs: transformedJobs,
          pagination: {
            total,
            page: pageNum,
            totalPages,
            hasMore: pageNum < totalPages
          }
        }
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching jobs'
      });
    }
  },

  getJobById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            include: {
              profile: true
            }
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
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job'
      });
    }
  },

  getSimilarJobs: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await prisma.job.findUnique({
        where: { id },
        select: {
          category: true,
          experienceLevel: true,
          company: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const similarJobs = await prisma.job.findMany({
        where: {
          OR: [
            { category: job.category },
            { experienceLevel: job.experienceLevel },
          ],
          id: { not: id }, // Exclude current job
          status: 'OPEN'   // Only include open jobs
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,       // This is the company name
              profile: {        // Get additional company info from profile
                select: {
                  avatar: true, // This will serve as the logo
                  address: true // This will serve as the location
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform the data to match the expected format
      const transformedJobs = similarJobs.map(job => ({
        ...job,
        company: {
          companyName: job.company.name,
          location: job.company.profile?.address || 'Remote',
          logo: job.company.profile?.avatar || null
        }
      }));

      res.json({
        success: true,
        data: transformedJobs
      });
    } catch (error) {
      console.error('Get similar jobs error:', error);
      res.status(500).json({ message: 'Error fetching similar jobs' });
    }
  },

  getJobStats: async (req: Request, res: Response) => {
    try {
      const [
        totalJobs,
        categoryStats,
        locationStats,
      ] = await Promise.all([
        prisma.job.count(),
        prisma.job.groupBy({
          by: ['category'],
          _count: true,
        }),
        prisma.job.groupBy({
          by: ['location'],
          _count: true,
        }),
      ]);

      res.json({
        totalJobs,
        categoryStats,
        locationStats,
      });
    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({ message: 'Error fetching job statistics' });
    }
  },

  createJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        title,
        description,
        location,
        experienceLevel,
        category,
        salary,
        remote,
        employmentType,
        requirements = [],
        benefits = []
      } = req.body;

      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          experienceLevel: experienceLevel as ExperienceLevel,
          category: category as JobCategory,
          salary: parseInt(salary),
          remote: remote || false,
          employmentType: employmentType as EmploymentType,
          requirements,
          benefits,
          companyId: req.user.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          salary: true,
          remote: true,
          experienceLevel: true,
          category: true,
          requirements: true,
          benefits: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatar: true
                }
              }
            }
          }
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

  updateJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        location,
        experienceLevel,
        category,
        salary,
        remote,
        employmentType
      } = req.body;

      const job = await prisma.job.update({
        where: { id },
        data: {
          title,
          description,
          location,
          experienceLevel,
          category,
          salary: parseInt(salary),
          remote,
          employmentType
        },
        include: {
          company: {
            include: {
              profile: true
            }
          }
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

  deleteJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.job.delete({
        where: { id },
      });

      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ message: 'Error deleting job' });
    }
  },

  getRecommendations: async (req: AuthenticatedRequest, res: Response) => {
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
      console.error('Get recommendations error:', error);
      res.status(500).json({ message: 'Error fetching job recommendations' });
    }
  }
};

import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiResponse } from '../types/api';

export const companyController = {
  getCompanyProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const company = await prisma.company.findUnique({
        where: { userId },
        select: {
          id: true,
          companyName: true,
          description: true,
          industry: true,
          size: true,
          website: true,
          location: true,
          logo: true,
        },
      });

      if (!company) {
        return res.status(404).json({ success: false, message: 'Company profile not found' });
      }

      return res.json({ success: true, data: company });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  updateCompanyProfile: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { companyName, description, industry, size, website, location } = req.body;

      const company = await prisma.company.update({
        where: { userId },
        data: {
          companyName,
          description,
          industry,
          size,
          website,
          location,
        },
      });

      return res.json({ success: true, data: company });
    } catch (error) {
      console.error('Error updating company profile:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  getCompanyJobs: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const company = await prisma.company.findUnique({
        where: { userId },
        include: {
          jobs: {
            include: {
              applications: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      return res.json({ success: true, data: company.jobs });
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  createJob: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const company = await prisma.company.findUnique({ where: { userId } });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      const { title, description, location, experienceLevel, category, salary, remote } = req.body;

      const job = await prisma.job.create({
        data: {
          companyId: company.id,
          title,
          description,
          location,
          experienceLevel,
          category,
          salary,
          remote,
          status: 'OPEN',
        },
      });

      return res.json({ success: true, data: job });
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  updateJob: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const jobId = req.params.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const company = await prisma.company.findUnique({ where: { userId } });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      const { title, description, location, experienceLevel, category, salary, remote, status } = req.body;

      const job = await prisma.job.update({
        where: { id: jobId, companyId: company.id },
        data: {
          title,
          description,
          location,
          experienceLevel,
          category,
          salary,
          remote,
          status,
        },
      });

      return res.json({ success: true, data: job });
    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  deleteJob: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const jobId = req.params.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const company = await prisma.company.findUnique({ where: { userId } });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      await prisma.job.delete({
        where: { id: jobId, companyId: company.id },
      });

      return res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
}; 
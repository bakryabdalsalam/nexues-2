import { Request, Response } from 'express';
import { db } from '../services/database.service';

export const jobController = {
  getJobs: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [jobs, total] = await Promise.all([
        db.job.findMany({
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
        db.job.count()
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
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
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
          salary: req.body.salary ? parseFloat(req.body.salary) : null
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
          salary: req.body.salary ? parseFloat(req.body.salary) : null
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
  }
};

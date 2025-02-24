import { Request, Response } from 'express';
import { db } from '../services/database.service';

export const applicationController = {
  async createApplication(req: Request, res: Response) {
    try {
      const { jobId, resume, coverLetter } = req.body;
      const userId = req.user!.id;

      // Check if user already applied
      const existingApplication = await db.application.findFirst({
        where: {
          jobId,
          userId
        }
      });

      if (existingApplication) {
        return res.status(400).json({ message: 'Already applied to this job' });
      }

      const application = await db.application.create({
        data: {
          jobId,
          userId,
          resume,
          coverLetter
        }
      });

      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: 'Error creating application' });
    }
  },

  async getUserApplications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const applications = await db.application.findMany({
        where: { userId },
        include: {
          job: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching applications' });
    }
  },

  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const application = await db.application.update({
        where: { id },
        data: { status }
      });

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: 'Error updating application status' });
    }
  }
};

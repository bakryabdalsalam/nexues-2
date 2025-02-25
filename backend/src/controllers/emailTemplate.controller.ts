import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Define TypeScript interface for the template
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Validation schemas
const templateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  variables: z.array(z.string()).min(1, 'At least one variable is required')
});

const idSchema = z.string().uuid('Invalid ID format');

export const emailTemplateController = {
  async getAll(req: Request, res: Response) {
    try {
      const templates = await prisma.emailTemplate.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: templates,
        count: templates.length
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email templates'
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const validation = templateSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template data',
          errors: validation.error.format()
        });
      }

      // Check for duplicate template name
      const existing = await prisma.emailTemplate.findFirst({
        where: { name: validation.data.name }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A template with this name already exists'
        });
      }

      const template = await prisma.emailTemplate.create({
        data: validation.data
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Email template created successfully'
      });
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create email template'
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      // Validate ID
      const idValidation = idSchema.safeParse(req.params.id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template ID',
          errors: idValidation.error.format()
        });
      }

      const validation = templateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template data',
          errors: validation.error.format()
        });
      }

      // Check if template exists
      const existing = await prisma.emailTemplate.findUnique({
        where: { id: req.params.id }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Email template not found'
        });
      }

      // Check for name duplication (excluding current template)
      const duplicate = await prisma.emailTemplate.findFirst({
        where: {
          name: validation.data.name,
          NOT: { id: req.params.id }
        }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'A template with this name already exists'
        });
      }

      const template = await prisma.emailTemplate.update({
        where: { id: req.params.id },
        data: validation.data
      });

      res.json({
        success: true,
        data: template,
        message: 'Email template updated successfully'
      });
    } catch (error) {
      console.error('Error updating email template:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            success: false,
            message: 'Email template not found'
          });
        }
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update email template'
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      // Validate ID
      const idValidation = idSchema.safeParse(req.params.id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template ID',
          errors: idValidation.error.format()
        });
      }

      // Check if template exists before deletion
      const existing = await prisma.emailTemplate.findUnique({
        where: { id: req.params.id }
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Email template not found'
        });
      }

      await prisma.emailTemplate.delete({
        where: { id: req.params.id }
      });

      res.json({
        success: true,
        message: 'Email template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting email template:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return res.status(404).json({
            success: false,
            message: 'Email template not found'
          });
        }
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete email template'
      });
    }
  }
};

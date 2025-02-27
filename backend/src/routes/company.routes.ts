import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get company profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const company = await prisma.user.findUnique({
      where: { 
        id: req.user.id,
      },
      include: {
        profile: true,
        jobs: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company profile'
    });
  }
});

// Get company jobs
router.get('/jobs', authenticate, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        companyId: req.user.id
      },
      include: {
        company: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company jobs'
    });
  }
});

export const companyRoutes = router; 
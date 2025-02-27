import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        id: req.user.id,
      },
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

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Get user applications
router.get('/applications', authenticate, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        job: {
          include: {
            company: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user applications'
    });
  }
});

export const userRoutes = router; 
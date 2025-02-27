import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authenticate);

// Upload routes
router.post('/resume', uploadController.uploadResume);
router.post('/logo', uploadController.uploadLogo);

export const uploadRoutes = router; 
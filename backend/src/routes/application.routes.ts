import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, applicationController.createApplication);
router.get('/my-applications', authenticateToken, applicationController.getUserApplications);
router.patch('/:id/status', authenticateToken, requireAdmin, applicationController.updateApplicationStatus);

export { router as applicationRoutes };

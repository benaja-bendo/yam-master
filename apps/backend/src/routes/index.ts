import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Routes de santé
router.get('/health', HealthController.check);

// Ajouter d'autres routes ici

export default router;
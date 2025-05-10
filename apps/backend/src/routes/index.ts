import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { GameController } from '../controllers/game.controller';

const router = Router();
const gameController = new GameController();

// Routes de santé
router.get('/health', HealthController.check);

// Routes de jeu
router.post('/games', gameController.startGame);
router.post('/games/:gameId/events', gameController.sendEvent);
router.get('/games/:gameId', gameController.getGameState);

export default router;
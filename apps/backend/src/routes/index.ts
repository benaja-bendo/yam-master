import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { GameController } from '../controllers/game.controller';
import { setupWebSocket } from '../config/websocket';
import { createServer } from 'http';

const router = Router();
const wsManager = setupWebSocket(createServer());
const gameController = new GameController(wsManager);

// Middleware pour gérer les CORS
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

// Routes de santé
router.get('/health', HealthController.check);

// Routes de jeu
router.post('/games', (req, res) => gameController.startGame(req, res));
router.post('/games/:gameId/events', (req, res) => gameController.sendEvent(req, res));
router.get('/games/:gameId', (req, res) => gameController.getGameState(req, res));

export default router;
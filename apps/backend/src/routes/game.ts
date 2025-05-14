import { Router } from 'express';
import * as gameService from '../services/gameService';

export const gameRouter = Router();

// POST /api/game/:gameId → crée une partie
gameRouter.post('/:gameId', (req, res) => {
  try {
    const state = gameService.createGame(req.params.gameId);
    res.status(201).json({ state });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/game/:gameId → récupère l'état courant
gameRouter.get('/:gameId', (req, res) => {
  try {
    const snapshot = gameService.getGameState(req.params.gameId);
    res.json({ state: snapshot.value, context: snapshot.context });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

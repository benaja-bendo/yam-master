import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { WebSocketManager } from '../src/config/websocket';
import { GameController } from '../src/controllers/game.controller';
import app from '../src/index';

// Mock WebSocketManager
vi.mock('../src/config/websocket', () => ({
  WebSocketManager: vi.fn().mockImplementation(() => ({
    notifyGameUpdate: vi.fn(),
  })),
}));

describe('GameController', () => {
  let gameController: GameController;
  let wsManager: WebSocketManager;

  beforeEach(() => {
    wsManager = new WebSocketManager();
    gameController = new GameController(wsManager);
  });

  describe('startGame', () => {
    it('devrait créer une nouvelle partie avec succès', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-1', diceCount: 5 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gameId', 'test-game-1');
      expect(res.body).toHaveProperty('state');
      expect(res.body).toHaveProperty('context');
    });

    it('devrait retourner une erreur si la partie existe déjà', async () => {
      // Créer une première partie
      await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-2', diceCount: 5 });

      // Tenter de créer une partie avec le même ID
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-2', diceCount: 5 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Game already exists');
    });
  });

  describe('getGameState', () => {
    it('devrait retourner l\'état de la partie', async () => {
      // Créer une partie d'abord
      await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-3', diceCount: 5 });

      // Récupérer l'état de la partie
      const res = await request(app).get('/api/games/test-game-3');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gameId', 'test-game-3');
      expect(res.body).toHaveProperty('state');
      expect(res.body).toHaveProperty('context');
    });

    it('devrait retourner 404 si la partie n\'existe pas', async () => {
      const res = await request(app).get('/api/games/nonexistent-game');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });
  });

  describe('sendEvent', () => {
    it('devrait traiter un événement de jeu avec succès', async () => {
      // Créer une partie d'abord
      await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-4', diceCount: 5 });

      // Envoyer un événement
      const res = await request(app)
        .post('/api/games/test-game-4/events')
        .send({ type: 'ROLL_DICE' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gameId', 'test-game-4');
      expect(res.body).toHaveProperty('state');
      expect(res.body).toHaveProperty('context');
    });

    it('devrait retourner 404 si la partie n\'existe pas', async () => {
      const res = await request(app)
        .post('/api/games/nonexistent-game/events')
        .send({ type: 'ROLL_DICE' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });

    it('devrait retourner 400 pour un événement invalide', async () => {
      // Créer une partie d'abord
      await request(app)
        .post('/api/games')
        .send({ gameId: 'test-game-5', diceCount: 5 });

      // Envoyer un événement invalide
      const res = await request(app)
        .post('/api/games/test-game-5/events')
        .send({ type: 'INVALID_EVENT' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid event');
    });
  });
});
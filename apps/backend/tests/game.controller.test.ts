import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import * as gameController from '../src/controllers/game.controller';
import app from '../src/index';
import * as gameService from '../src/services/gameService';

// Mock du service de jeu
vi.mock('../src/services/gameService', () => ({
  createGame: vi.fn(),
  joinGame: vi.fn(),
  getGameState: vi.fn(),
  sendEventToGame: vi.fn(),
}));

// Mock de l'UUID pour les tests
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid')
}));

describe('Game Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGame', () => {
    it('devrait créer une nouvelle partie en mode PVP avec succès', async () => {
      // Arrange
      const mockSnapshot = { value: 'waiting', context: { players: [] } };
      vi.mocked(gameService.createGame).mockReturnValue(mockSnapshot);
      
      // Act
      const res = await request(app)
        .post('/api/games')
        .send({ mode: 'pvp' });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('gameId', 'mocked-uuid');
      expect(res.body.state).toHaveProperty('value', 'waiting');
      expect(res.body.state).toHaveProperty('context');
      expect(gameService.createGame).toHaveBeenCalledWith('mocked-uuid', { mode: 'pvp' });
    });

    it('devrait créer une nouvelle partie en mode PVB avec succès', async () => {
      // Arrange
      const mockSnapshot = { value: 'waiting', context: { players: [] } };
      vi.mocked(gameService.createGame).mockReturnValue(mockSnapshot);
      
      // Act
      const res = await request(app)
        .post('/api/games')
        .send({ mode: 'pvb', botDifficulty: 'easy' });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('gameId', 'mocked-uuid');
      expect(gameService.createGame).toHaveBeenCalledWith('mocked-uuid', { 
        mode: 'pvb', 
        botDifficulty: 'easy' 
      });
    });

    it('devrait retourner une erreur 400 si le mode est invalide', async () => {
      // Act
      const res = await request(app)
        .post('/api/games')
        .send({ mode: 'invalid' });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', "mode must be 'pvp' or 'pvb'");
      expect(gameService.createGame).not.toHaveBeenCalled();
    });

    it('devrait retourner une erreur 400 si le mode est pvb sans botDifficulty', async () => {
      // Act
      const res = await request(app)
        .post('/api/games')
        .send({ mode: 'pvb' });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', "botDifficulty is required when mode is 'pvb'");
      expect(gameService.createGame).not.toHaveBeenCalled();
    });

    it('devrait retourner une erreur 400 si le service lance une exception', async () => {
      // Arrange
      vi.mocked(gameService.createGame).mockImplementation(() => {
        throw new Error('Game creation failed');
      });
      
      // Act
      const res = await request(app)
        .post('/api/games')
        .send({ mode: 'pvp' });

      // Assert
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Game creation failed');
    });
  });

  describe('joinGame', () => {
    it('devrait permettre à un joueur de rejoindre une partie existante', async () => {
      // Arrange
      const mockSnapshot = { value: 'playing', context: { players: [] } };
      vi.mocked(gameService.joinGame).mockReturnValue(mockSnapshot);
      
      // Act
      const res = await request(app)
        .post('/api/games/game-123/join')
        .send({ playerId: 'player2' });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('state', 'playing');
      expect(res.body).toHaveProperty('context');
      expect(gameService.joinGame).toHaveBeenCalledWith('game-123', 'player2');
    });

    it('devrait retourner une erreur 404 si la partie n\'existe pas', async () => {
      // Arrange
      vi.mocked(gameService.joinGame).mockImplementation(() => {
        throw new Error('Game not found');
      });
      
      // Act
      const res = await request(app)
        .post('/api/games/nonexistent-game/join')
        .send({ playerId: 'player2' });

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });
  });

  describe('getGameState', () => {
    it('devrait retourner l\'état d\'une partie existante', async () => {
      // Arrange
      const mockSnapshot = { value: 'playing', context: { players: [] } };
      vi.mocked(gameService.getGameState).mockReturnValue(mockSnapshot);
      
      // Act
      const res = await request(app).get('/api/games/game-123');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('state', 'playing');
      expect(res.body).toHaveProperty('context');
      expect(gameService.getGameState).toHaveBeenCalledWith('game-123');
    });

    it('devrait retourner une erreur 404 si la partie n\'existe pas', async () => {
      // Arrange
      vi.mocked(gameService.getGameState).mockImplementation(() => {
        throw new Error('Game not found');
      });
      
      // Act
      const res = await request(app).get('/api/games/nonexistent-game');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });
  });

  describe('postGameEvent', () => {
    it('devrait traiter un événement de jeu avec succès', async () => {
      // Arrange
      const mockSnapshot = { value: 'rolling', context: { players: [] } };
      vi.mocked(gameService.sendEventToGame).mockReturnValue(mockSnapshot);
      const event = { type: 'ROLL_DICE' };
      
      // Act
      const res = await request(app)
        .post('/api/games/game-123/events')
        .send(event);

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('state', 'rolling');
      expect(res.body).toHaveProperty('context');
      expect(gameService.sendEventToGame).toHaveBeenCalledWith('game-123', event);
    });

    it('devrait retourner une erreur 404 si la partie n\'existe pas', async () => {
      // Arrange
      vi.mocked(gameService.sendEventToGame).mockImplementation(() => {
        throw new Error('Game not found');
      });
      
      // Act
      const res = await request(app)
        .post('/api/games/nonexistent-game/events')
        .send({ type: 'ROLL_DICE' });

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Game not found');
    });
  });
});
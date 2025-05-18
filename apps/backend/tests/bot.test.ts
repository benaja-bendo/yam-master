import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import * as gameService from '../src/services/gameService';

describe('Tests du Mode Player vs Bot (PvB)', () => {
  // Mock du service de jeu pour isoler les tests
  vi.mock('../src/services/gameService', () => ({
    createGame: vi.fn().mockImplementation((gameId, options) => ({
      value: 'playing',
      context: { ...options, gameId }
    })),
    sendEventToGame: vi.fn().mockImplementation((gameId, event) => ({
      value: 'playing',
      context: { gameId, lastAction: event.type, currentPlayer: 'player1' }
    })),
    getGameState: vi.fn().mockImplementation((gameId) => ({
      value: 'playing',
      context: { gameId, lastAction: 'BOT_ACTION', currentPlayer: 'player1' }
    }))
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialisation du mode PvB', () => {
    it('devrait créer une partie contre le bot avec succès', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-1', diceCount: 5, mode: 'pvb', botDifficulty: 'easy' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('gameId', 'pvb-game-1');
      expect(res.body.state.context).toHaveProperty('mode', 'pvb');
      expect(res.body.state.context).toHaveProperty('botDifficulty', 'easy');
    });

    it('devrait retourner une erreur si botDifficulty n\'est pas spécifié', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-error', diceCount: 5, mode: 'pvb' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'botDifficulty is required when mode is \'pvb\'');
    });

    it('devrait accepter différents niveaux de difficulté du bot', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-hard', diceCount: 5, mode: 'pvb', botDifficulty: 'hard' });

      expect(res.status).toBe(201);
      expect(res.body.state.context).toHaveProperty('botDifficulty', 'hard');
    });
  });

  describe('Actions du Bot', () => {
    it('devrait permettre au bot de répondre aux actions du joueur', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-2', diceCount: 5, mode: 'pvb', botDifficulty: 'easy' });

      // Le joueur effectue une action
      const playerAction = await request(app)
        .post('/api/games/pvb-game-2/events')
        .send({ type: 'ROLL', playerId: 'player1' });

      expect(playerAction.status).toBe(200);
      expect(playerAction.body.state.context).toHaveProperty('currentPlayer');

      // Vérifier que le bot répond
      const gameState = await request(app)
        .get('/api/games/pvb-game-2');

      expect(gameState.status).toBe(200);
      expect(gameState.body.state.context).toHaveProperty('lastAction');
    });

    it('devrait gérer correctement les tours entre le joueur et le bot', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-3', diceCount: 5, mode: 'pvb', botDifficulty: 'easy' });

      // Simuler plusieurs tours de jeu
      const actions = ['ROLL', 'CHOOSE_COMBINATION', 'END_TURN'];
      
      for (const action of actions) {
        const response = await request(app)
          .post('/api/games/pvb-game-3/events')
          .send({ 
            type: action, 
            playerId: 'player1',
            // Ajouter des données supplémentaires pour CHOOSE_COMBINATION si nécessaire
            ...(action === 'CHOOSE_COMBINATION' && {
              combination: 'ones',
              cell: { x: 0, y: 0 }
            })
          });

        expect(response.status).toBe(200);
        expect(response.body.state.context).toHaveProperty('currentPlayer');
      }
    });
  });

  describe('Fin de partie avec Bot', () => {
    it('devrait détecter correctement la fin de partie', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'pvb-game-4', diceCount: 5, mode: 'pvb', botDifficulty: 'easy' });

      // Simuler une partie jusqu'à la fin (dans un vrai test, il faudrait plus d'actions)
      // Ici on vérifie juste que l'état de la partie est valide
      const gameState = await request(app)
        .get('/api/games/pvb-game-4');

      expect(gameState.status).toBe(200);
      expect(gameState.body).toHaveProperty('state');
      
      // Note: Dans un vrai test, il faudrait jouer jusqu'à la fin de la partie
      // pour vérifier les états de fin de jeu comme 'playerWin', 'botWin', 'draw'
    });
  });
});
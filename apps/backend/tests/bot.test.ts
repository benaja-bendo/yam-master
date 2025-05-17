import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { WebSocketManager } from '../src/websocket/websocket';
import { GameController } from '../src/controllers/game.controller';
import app from '../src/index';

describe('Tests du Mode Bot', () => {
  let gameController: GameController;
  let wsManager: WebSocketManager;

  beforeEach(() => {
    wsManager = new WebSocketManager(app);
    gameController = new GameController(wsManager);
  });

  describe('Initialisation du mode Bot', () => {
    it('devrait créer une partie contre le bot', async () => {
      const res = await request(app)
        .post('/api/games')
        .send({ gameId: 'bot-game-1', diceCount: 5, mode: 'bot' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('gameId', 'bot-game-1');
      expect(res.body.context).toHaveProperty('mode', 'bot');
    });
  });

  describe('Actions du Bot', () => {
    it('devrait permettre au bot de répondre aux actions du joueur', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'bot-game-2', diceCount: 5, mode: 'bot' });

      // Le joueur effectue une action
      const playerAction = await request(app)
        .post('/api/games/bot-game-2/events')
        .send({ type: 'ROLL_DICE', playerId: 'player1' });

      expect(playerAction.status).toBe(200);
      expect(playerAction.body.context).toHaveProperty('currentPlayer');

      // Vérifier que le bot répond
      const gameState = await request(app)
        .get('/api/games/bot-game-2');

      expect(gameState.status).toBe(200);
      expect(gameState.body.context).toHaveProperty('lastAction');
    });

    it('devrait gérer correctement les tours entre le joueur et le bot', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'bot-game-3', diceCount: 5, mode: 'bot' });

      // Simuler plusieurs tours de jeu
      const actions = ['ROLL_DICE', 'SELECT_DICE', 'END_TURN'];
      
      for (const action of actions) {
        const response = await request(app)
          .post('/api/games/bot-game-3/events')
          .send({ type: action, playerId: 'player1' });

        expect(response.status).toBe(200);
        expect(response.body.context).toHaveProperty('currentPlayer');
        expect(response.body.context).toHaveProperty('lastAction');
      }
    });
  });

  describe('Fin de partie avec Bot', () => {
    it('devrait détecter correctement la fin de partie', async () => {
      // Créer une partie contre le bot
      await request(app)
        .post('/api/games')
        .send({ gameId: 'bot-game-4', diceCount: 5, mode: 'bot' });

      // Simuler une partie jusqu'à la fin
      const gameState = await request(app)
        .get('/api/games/bot-game-4');

      expect(gameState.status).toBe(200);
      expect(gameState.body).toHaveProperty('state');
      expect(['playerWin', 'botWin', 'draw']).toContain(gameState.body.state);
    });
  });
});
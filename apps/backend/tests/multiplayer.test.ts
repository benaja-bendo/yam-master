import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WebSocket from 'ws';
import { WebSocketManager } from '../src/websocket/websocket';
import { GameController } from '../src/controllers/game.controller';
import { Server } from 'http';
import app from '../src/index';

describe('Tests Multijoueur', () => {
  let wsManager: WebSocketManager;
  let gameController: GameController;
  let server: Server;
  let wsClient1: WebSocket;
  let wsClient2: WebSocket;
  const TEST_PORT = 3002;
  const WS_URL = `ws://localhost:${TEST_PORT}`;

  beforeEach(() => {
    server = app.listen(TEST_PORT);
    wsManager = new WebSocketManager(server);
    gameController = new GameController(wsManager);
  });

  afterEach(() => {
    if (wsClient1 && wsClient1.readyState === WebSocket.OPEN) wsClient1.close();
    if (wsClient2 && wsClient2.readyState === WebSocket.OPEN) wsClient2.close();
    server.close();
  });

  describe('Connexion des joueurs', () => {
    it('devrait permettre à deux joueurs de rejoindre la même partie', (done) => {
      const gameId = 'test-multiplayer-1';
      
      wsClient1 = new WebSocket(WS_URL);
      wsClient2 = new WebSocket(WS_URL);

      let playersJoined = 0;
      const onPlayerJoined = () => {
        playersJoined++;
        if (playersJoined === 2) {
          expect(true).toBe(true);
          done();
        }
      };

      wsClient1.on('open', () => {
        wsClient1.send(JSON.stringify({
          type: 'join_game',
          gameId,
          playerId: 'player1'
        }));
      });

      wsClient2.on('open', () => {
        wsClient2.send(JSON.stringify({
          type: 'join_game',
          gameId,
          playerId: 'player2'
        }));
      });

      wsClient1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'joined') onPlayerJoined();
      });

      wsClient2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'joined') onPlayerJoined();
      });
    });

    it('devrait synchroniser l\'état du jeu entre les joueurs', (done) => {
      const gameId = 'test-multiplayer-2';
      let updateCount = 0;

      wsClient1 = new WebSocket(WS_URL);
      wsClient2 = new WebSocket(WS_URL);

      const checkGameSync = () => {
        updateCount++;
        if (updateCount === 2) {
          expect(true).toBe(true);
          done();
        }
      };

      wsClient1.on('open', () => {
        wsClient1.send(JSON.stringify({
          type: 'join_game',
          gameId,
          playerId: 'player1'
        }));
      });

      wsClient2.on('open', () => {
        wsClient2.send(JSON.stringify({
          type: 'join_game',
          gameId,
          playerId: 'player2'
        }));
      });

      wsClient1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'game_update') checkGameSync();
      });

      wsClient2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'game_update') checkGameSync();
      });

      // Déclencher une mise à jour du jeu
      setTimeout(() => {
        gameController.startGame({
          body: { gameId, diceCount: 5 }
        } as any, {
          status: () => ({ json: () => ({}) }),
          json: () => ({})
        } as any);
      }, 100);
    });
  });
});
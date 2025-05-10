import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WebSocket from 'ws';
import { WebSocketManager } from '../src/config/websocket';
import { Server } from 'http';
import app from '../src/index';

describe('WebSocketManager', () => {
  let wsManager: WebSocketManager;
  let server: Server;
  let wsClient: WebSocket;
  const TEST_PORT = 3001;
  const WS_URL = `ws://localhost:${TEST_PORT}`;

  beforeEach(() => {
    server = app.listen(TEST_PORT);
    wsManager = new WebSocketManager();
  });

  afterEach(() => {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close();
    }
    server.close();
  });

  describe('Connexion WebSocket', () => {
    it('devrait établir une connexion WebSocket avec succès', (done) => {
      wsClient = new WebSocket(WS_URL);

      wsClient.on('open', () => {
        expect(wsClient.readyState).toBe(WebSocket.OPEN);
        done();
      });
    });

    it('devrait recevoir les mises à jour de la partie', (done) => {
      wsClient = new WebSocket(WS_URL);

      wsClient.on('open', () => {
        // Simuler une mise à jour de partie
        const gameUpdate = {
          gameId: 'test-game',
          state: 'rolling',
          context: { diceCount: 5 }
        };

        wsClient.on('message', (data) => {
          const message = JSON.parse(data.toString());
          expect(message).toEqual(gameUpdate);
          done();
        });

        // Envoyer une mise à jour via le gestionnaire WebSocket
        wsManager.notifyGameUpdate('test-game', {
          getSnapshot: () => ({
            value: gameUpdate.state,
            context: gameUpdate.context
          })
        });
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer la fermeture de connexion proprement', (done) => {
      wsClient = new WebSocket(WS_URL);

      wsClient.on('open', () => {
        wsClient.close();
      });

      wsClient.on('close', () => {
        expect(wsClient.readyState).toBe(WebSocket.CLOSED);
        done();
      });
    });

    it('devrait gérer les erreurs de connexion', (done) => {
      const invalidWsClient = new WebSocket('ws://invalid-url');

      invalidWsClient.on('error', (error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
  });
});
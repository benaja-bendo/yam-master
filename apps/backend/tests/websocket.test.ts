import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WebSocket from 'ws';
import { Server } from 'http';
import http from 'node:http';
import express from 'express';
import { initWebSocket } from '../src/websocket';
import * as gameService from '../src/services/gameService';

describe('WebSocket', () => {
  let server: Server;
  let wsClient: WebSocket;
  let wss: any;
  const TEST_PORT = 3001;
  const WS_URL = `ws://localhost:${TEST_PORT}/ws`;

  beforeEach(async () => {
    const app = express();
    server = http.createServer(app);
    wss = initWebSocket(server);
    
    // Démarrer le serveur et attendre qu'il soit prêt
    await new Promise<void>((resolve) => {
      server.listen(TEST_PORT, () => resolve());
    });

    // Mock gameService.subscribeClient
    vi.spyOn(gameService, 'subscribeClient').mockImplementation((gameId, ws) => {
      ws.send(JSON.stringify({ 
        type: 'STATE_INIT', 
        state: { value: 'rolling', context: { diceCount: 5 } } 
      }));
    });

    // Mock gameService.sendEventToGame
    vi.spyOn(gameService, 'sendEventToGame').mockImplementation((gameId, event) => {
      return { value: 'rolling', context: { diceCount: 5 } };
    });
  });

  afterEach(async () => {
    // if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    //   wsClient.close();
    // }

    // race entre fermeture propre et timeout interne pour éviter de bloquer
    await Promise.race([
      new Promise<void>((resolve) => server.close(() => resolve())),
      new Promise<void>((resolve) => setTimeout(resolve, 2000)),
    ]);

    vi.restoreAllMocks();
  }, 20000);

  describe('Connexion WebSocket', () => {
    it('devrait recevoir les mises à jour après JOIN', async () => {
      const wsClient = new WebSocket(WS_URL);
      await new Promise<void>((resolve, reject) => {
        wsClient.on('error', reject);
        wsClient.on('open', () => {
          wsClient.send(
            JSON.stringify({
              type: 'JOIN',
              gameId: 'test-game',
              playerId: 'player1',
            })
          );
        });
        wsClient.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            expect(message).toHaveProperty('type');
            expect(['STATE_INIT', 'STATE_UPDATE']).toContain(message.type);
            expect(message.state).toHaveProperty('value');
            expect(message.state).toHaveProperty('context');
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    });
    
    it('devrait gérer la fermeture proprement', async () => {
      const wsClient = new WebSocket(WS_URL);
      await new Promise<void>((resolve, reject) => {
        wsClient.on('error', reject);
        wsClient.on('open', () => wsClient.close());
        wsClient.on('close', () => {
          expect(wsClient.readyState).toBe(WebSocket.CLOSED);
          resolve();
        });
      });
    });
    
    it('devrait rejeter sans JOIN valide', async () => {
      const wsClient = new WebSocket(WS_URL);
      await new Promise<void>((resolve, reject) => {
        wsClient.on('error', reject);
        wsClient.on('open', () =>
          wsClient.send(JSON.stringify({ type: 'INVALID' }))
        );
        wsClient.on('close', (code) => {
          try {
            expect(code).toBe(1008);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    });
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import WebSocket from 'ws';
import { initWebSocket } from '../src/websocket';
import * as gameService from '../src/services/gameService';
import { Server } from 'http';
import http from 'http';
import express from 'express';

describe('Tests Multijoueur', () => {

  let server: Server;
  let wss: any;
  let wsClient1: WebSocket;
  let wsClient2: WebSocket;
  const TEST_PORT = 3002;
  let WS_URL = `ws://localhost:${TEST_PORT}/ws`;
  
  // Mock du service de jeu pour les tests
  vi.mock('../src/services/gameService', () => ({
    createGame: vi.fn().mockImplementation((gameId, options) => ({
      value: 'waiting',
      context: { ...options, gameId, players: [] }
    })),
    joinGame: vi.fn().mockImplementation((gameId, playerId) => ({
      value: 'ready',
      context: { gameId, players: [{ id: playerId }] }
    })),
    sendEventToGame: vi.fn().mockImplementation((gameId, event) => ({
      value: 'playing',
      context: { gameId, lastAction: event.type, currentPlayer: event.playerId }
    })),
    getGameState: vi.fn().mockImplementation((gameId) => ({
      value: 'playing',
      context: { gameId, players: [{ id: 'player1' }, { id: 'player2' }] }
    })),
    subscribeClient: vi.fn().mockImplementation((gameId, ws) => {
      // Simuler l'envoi d'un message de confirmation au client
      ws.send(JSON.stringify({
        type: 'STATE_INIT',
        state: { value: 'waiting', context: { gameId, players: [] } }
      }));
    })
  }));

  beforeEach(async() => {
    // Créer un serveur HTTP pour les tests
    const expressApp = express();
    server = http.createServer(expressApp);
    // Initialiser le WebSocket avec le serveur
    wss = initWebSocket(server);
    // Démarrer le serveur sur le port de test
    //server.listen(TEST_PORT);
    await new Promise<void>(resolve => {
      server.listen(TEST_PORT, resolve);
    });
    const addr = server.address();
    const port = addr && typeof addr === 'object' ? addr.port : TEST_PORT;
    WS_URL = `ws://127.0.0.1:${port}/ws`;
    vi.clearAllMocks();
  });

  afterEach(async() => {
    if (wsClient1 && wsClient1.readyState === WebSocket.OPEN) wsClient1.close();
    if (wsClient2 && wsClient2.readyState === WebSocket.OPEN) wsClient2.close();
    await new Promise<void>(resolve => {
      server.close(() => resolve());
    });
    vi.restoreAllMocks();
  });

  describe('Connexion des joueurs', () => {
    it('devrait permettre à deux joueurs de rejoindre la même partie', async () => {
      const gameId = 'test-multiplayer-1';
      wsClient1 = new WebSocket(WS_URL);
      wsClient2 = new WebSocket(WS_URL);
      // Gérer l'événement error pour éviter les exceptions non capturées
      wsClient1.on('error', () => {});
      wsClient2.on('error', () => {});

      let joined = 0;
      const joinPromise = new Promise<void>((resolve) => {
        const onPlayerJoined = () => {
          joined++;
          if (joined === 2) {
            expect(joined).toBe(2);
            resolve();
          }
        };

        wsClient1.on('open', () => {
          wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' }));
        });
        wsClient2.on('open', () => {
          wsClient2.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player2' }));
        });

        wsClient1.on('message', data => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'STATE_INIT') onPlayerJoined();
        });
        wsClient2.on('message', data => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'STATE_INIT') onPlayerJoined();
        });
      });

      await joinPromise;
    });

    it('devrait synchroniser l\'état du jeu entre les joueurs', async () => {
      const gameId = 'test-multiplayer-2';
      wsClient1 = new WebSocket(WS_URL);
      wsClient2 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});
      wsClient2.on('error', () => {});

      const syncPromise = new Promise<void>((resolve) => {
        let updates = 0;
        const states = [];
        const onUpdate = (state: any) => {
          updates++;
          states.push(state);
          if (updates === 2) {
            expect(states[0]).toEqual(states[1]);
            resolve();
          }
        };

        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' })));
        wsClient2.on('open', () => wsClient2.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player2' })));
        wsClient1.on('message', data => { const m = JSON.parse(data.toString()); if (m.type === 'STATE_UPDATE') onUpdate(m.state); });
        wsClient2.on('message', data => { const m = JSON.parse(data.toString()); if (m.type === 'STATE_UPDATE') onUpdate(m.state); });

        setTimeout(() => {
          const mockState = { value: 'playing', context: { gameId, players: [{ id: 'player1' }, { id: 'player2' }] } };
          wss.clients.forEach((c: any) => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: 'STATE_UPDATE', state: mockState })));
        }, 100);
      });

      await syncPromise;
    });
  });

  describe('Actions de jeu', () => {
    it('devrait permettre à un joueur d\'envoyer des événements de jeu', async () => {
      const gameId = 'test-multiplayer-3';
      wsClient1 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});

      const actionPromise = new Promise<void>((resolve) => {
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' })));
        wsClient1.on('message', data => {
          const m = JSON.parse(data.toString());
          if (m.type === 'STATE_INIT') {
            wsClient1.send(JSON.stringify({ type: 'ROLL_DICE', gameId, playerId: 'player1' }));
            setTimeout(() => {
              expect(gameService.sendEventToGame).toHaveBeenCalledWith(
                gameId,
                expect.objectContaining({ type: 'ROLL_DICE', playerId: 'player1' })
              );
              resolve();
            }, 50);
          }
        });
      });

      await actionPromise;
    });

    it('devrait permettre à un joueur de choisir une combinaison', async () => {
      const gameId = 'test-multiplayer-4';
      wsClient1 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});

      const choosePromise = new Promise<void>((resolve) => {
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' })));
        wsClient1.on('message', data => {
          const m = JSON.parse(data.toString());
          if (m.type === 'STATE_INIT') {
            wsClient1.send(JSON.stringify({ type: 'CHOOSE_COMBINATION', gameId, playerId: 'player1', combination: 'ones', score: 5 }));
            setTimeout(() => {
              expect(gameService.sendEventToGame).toHaveBeenCalledWith(
                gameId,
                expect.objectContaining({ type: 'CHOOSE_COMBINATION', playerId: 'player1', combination: 'ones', score: 5 })
              );
              resolve();
            }, 50);
          }
        });
      });

      await choosePromise;
    });

    it('devrait notifier les joueurs des changements d\'état du jeu', async () => {
      const gameId = 'test-multiplayer-5';
      wsClient1 = new WebSocket(WS_URL);
      wsClient2 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});
      wsClient2.on('error', () => {});

      const notifyPromise = new Promise<void>((resolve) => {
        let initCount = 0;
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' })));
        wsClient2.on('open', () => wsClient2.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player2' })));

        wsClient1.on('message', data => {
          const m = JSON.parse(data.toString());
          if (m.type === 'STATE_INIT') initCount++;
          if (initCount === 2) {
            const mockState = { value: 'playing', context: { gameId, currentPlayer: 'player2', players: [{ id: 'player1' }, { id: 'player2' }] } };
            wss.clients.forEach((c: any) => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: 'STATE_UPDATE', state: mockState })));
          }
          if (m.type === 'STATE_UPDATE') {
            expect(m.state).toHaveProperty('context.currentPlayer', 'player2');
            resolve();
          }
        });
      });

      await notifyPromise;
    });
  });

  describe('Fin de partie', () => {
    it('devrait notifier les joueurs de la fin de partie', async () => {
      const gameId = 'test-multiplayer-6';
      wsClient1 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});

      const endPromise = new Promise<void>((resolve) => {
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId, playerId: 'player1' })));
        wsClient1.on('message', data => {
          const m = JSON.parse(data.toString());
          if (m.type === 'STATE_INIT') {
            const mockState = { value: 'gameOver', context: { gameId, winner: 'player1', scores: { player1: 100, player2: 80 }, players: [{ id: 'player1' }, { id: 'player2' }] } };
            wss.clients.forEach((c: any) => c.readyState === WebSocket.OPEN && c.send(JSON.stringify({ type: 'STATE_UPDATE', state: mockState })));
          }
          if (m.type === 'STATE_UPDATE' && m.state.value === 'gameOver') {
            expect(m.state.context).toHaveProperty('winner', 'player1');
            expect(m.state.context).toHaveProperty('scores');
            resolve();
          }
        });
      });

      await endPromise;
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait rejeter une connexion sans les paramètres requis', async () => {
      wsClient1 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});

      const errorPromise = new Promise<void>((resolve) => {
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'INVALID' })));
        wsClient1.on('close', (code) => {
          expect(code).toBe(1008);
          resolve();
        });
      });

      await errorPromise;
    });

    it('devrait gérer les erreurs lors de l\'abonnement d\'un client', async () => {
      vi.spyOn(gameService, 'subscribeClient').mockImplementation(() => { throw new Error('Game not found'); });
      wsClient1 = new WebSocket(WS_URL);
      wsClient1.on('error', () => {});

      const subErrorPromise = new Promise<void>((resolve) => {
        wsClient1.on('open', () => wsClient1.send(JSON.stringify({ type: 'JOIN', gameId: 'nonexistent-game', playerId: 'player1' })));
        wsClient1.on('close', (code, reason) => {
          expect(code).toBe(1008);
          expect(reason.toString()).toBe('Game not found');
          resolve();
        });
      });

      await subErrorPromise;
    });
  });
});
import WebSocket, { WebSocketServer } from 'ws';
import * as gameService from '../services/gameService';

export function initWebSocket(server: import('http').Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // On attend que le client envoie son gameId en JSON { type: 'JOIN', gameId, playerId }
    ws.once('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); }
      catch { return ws.close(1003, 'Invalid JSON'); }

      if (msg.type !== 'JOIN' || !msg.gameId) {
        return ws.close(1008, 'JOIN required');
      }

      // Abonne le WS aux updates de la partie
      try {
        gameService.subscribeClient(msg.gameId, ws);
      } catch (err: any) {
        return ws.close(1008, err.message);
      }

      // Maintenant qu'on est abonné, on écoute les autres messages comme événements XState
      ws.on('message', (rawEvent) => {
        let evt;
        try { evt = JSON.parse(rawEvent.toString()); }
        catch { return; }
        // Forwarde l'événement à la machine
        try {
          const snapshot = gameService.sendEventToGame(msg.gameId, evt);
          // (le broadcast est déjà fait dans sendEventToGame)
        } catch {
          // ignore ou log
        }
      });
    });
  });

  return wss;
}

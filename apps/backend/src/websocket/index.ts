import WebSocket, { WebSocketServer } from 'ws';
import * as gameService from '../services/gameService';

export function initWebSocket(server: import('http').Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, _) => {
    // On attend que le client envoie son gameId en JSON { type: 'JOIN', gameId, playerId }
    ws.once('message', (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'JOIN' || !msg.gameId || !msg.playerId) {
        return ws.close(1008, 'JOIN required');
      }
      try {
        gameService.subscribeClient(msg.gameId, ws);
        // si PvP, streamera STATE_INIT puis attendant JOIN
        // si PvB, déjà en playing
      } catch (err: any) {
        return ws.close(1008, err.message);
      }
      ws.on('message', (rawEvt) => {
        let evt;
        try {
          evt = JSON.parse(rawEvt.toString());
        } catch {
          return;
        }
        gameService.sendEventToGame(msg.gameId, evt);
      });
    });
  });

  return wss;
}
